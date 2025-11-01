-- Add 'canceled' status to payment_status enum
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'canceled';

-- Add canceled_at column to charges table
ALTER TABLE public.charges 
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

-- Update the update_client_stats function to exclude canceled charges
CREATE OR REPLACE FUNCTION public.update_client_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update client stats when charge status changes (excluding canceled charges)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.clients
    SET 
      total_charged = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.charges 
        WHERE client_id = NEW.client_id AND status != 'canceled'
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
$function$;