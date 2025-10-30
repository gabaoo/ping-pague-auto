-- Add recurrence fields to charges table
ALTER TABLE public.charges 
ADD COLUMN is_recurrent BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_interval TEXT CHECK (recurrence_interval IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN recurrence_day INTEGER CHECK (recurrence_day BETWEEN 1 AND 31),
ADD COLUMN next_charge_date DATE,
ADD COLUMN last_notification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN parent_charge_id UUID REFERENCES public.charges(id) ON DELETE SET NULL;

-- Add index for performance on date queries
CREATE INDEX idx_charges_due_date ON public.charges(due_date);
CREATE INDEX idx_charges_status ON public.charges(status);
CREATE INDEX idx_charges_next_charge_date ON public.charges(next_charge_date) WHERE is_recurrent = TRUE;

-- Add clients metadata for better history tracking
ALTER TABLE public.clients
ADD COLUMN total_charged NUMERIC DEFAULT 0,
ADD COLUMN total_paid NUMERIC DEFAULT 0,
ADD COLUMN last_payment_date DATE,
ADD COLUMN overdue_count INTEGER DEFAULT 0;

-- Create function to update client stats
CREATE OR REPLACE FUNCTION public.update_client_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update client stats when charge status changes
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.clients
    SET 
      total_charged = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.charges 
        WHERE client_id = NEW.client_id
      ),
      total_paid = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.charges 
        WHERE client_id = NEW.client_id AND status = 'paid'
      ),
      last_payment_date = (
        SELECT MAX(paid_at::DATE) 
        FROM public.charges 
        WHERE client_id = NEW.client_id AND status = 'paid'
      ),
      overdue_count = (
        SELECT COUNT(*) 
        FROM public.charges 
        WHERE client_id = NEW.client_id AND status = 'overdue'
      )
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update client stats
CREATE TRIGGER trigger_update_client_stats
AFTER INSERT OR UPDATE ON public.charges
FOR EACH ROW
EXECUTE FUNCTION public.update_client_stats();

-- Create function to check and update overdue charges
CREATE OR REPLACE FUNCTION public.update_overdue_charges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.charges
  SET status = 'overdue'
  WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$;

-- Create notifications table for tracking sent alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id UUID REFERENCES public.charges(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'overdue', 'payment_confirmed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  message_content TEXT
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for notifications
CREATE INDEX idx_notifications_charge_id ON public.notifications(charge_id);
CREATE INDEX idx_notifications_sent_at ON public.notifications(sent_at);