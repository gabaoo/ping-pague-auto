import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log("Webhook payload received:", payload);

    // Extract payment information (adapt based on your payment provider)
    const {
      charge_id,
      status,
      paid_at,
      transaction_id,
    } = payload;

    if (!charge_id) {
      throw new Error("Missing charge_id in webhook payload");
    }

    // Update charge status
    const updateData: any = {
      status: status === "approved" || status === "paid" ? "paid" : status,
    };

    if (paid_at) {
      updateData.paid_at = paid_at;
    }

    const { data: charge, error: updateError } = await supabase
      .from("charges")
      .update(updateData)
      .eq("id", charge_id)
      .select("*, clients(name, phone)")
      .single();

    if (updateError) throw updateError;

    console.log("Charge updated successfully:", charge);

    // If payment confirmed, create notification
    if (updateData.status === "paid") {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          charge_id: charge.id,
          client_id: charge.client_id,
          user_id: charge.user_id,
          notification_type: "payment_confirmed",
          channel: "whatsapp",
          message_content: `Pagamento confirmado! Obrigado, ${charge.clients?.name}! Recebemos seu pagamento de R$ ${Number(charge.amount).toFixed(2)}.`,
        });

      if (notifError) {
        console.error("Error creating notification:", notifError);
      }

      // If it's a recurrent charge, create the next one
      if (charge.is_recurrent && charge.next_charge_date) {
        const nextDueDate = new Date(charge.next_charge_date);
        
        // Calculate the next charge date after this one
        let futureDate = new Date(nextDueDate);
        switch (charge.recurrence_interval) {
          case "weekly":
            futureDate.setDate(futureDate.getDate() + 7);
            break;
          case "biweekly":
            futureDate.setDate(futureDate.getDate() + 14);
            break;
          case "monthly":
            futureDate.setMonth(futureDate.getMonth() + 1);
            break;
          case "quarterly":
            futureDate.setMonth(futureDate.getMonth() + 3);
            break;
          case "yearly":
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            break;
        }

        const { error: insertError } = await supabase
          .from("charges")
          .insert({
            user_id: charge.user_id,
            client_id: charge.client_id,
            amount: charge.amount,
            due_date: nextDueDate.toISOString().split('T')[0],
            notes: charge.notes,
            payment_link: charge.payment_link,
            is_recurrent: true,
            recurrence_interval: charge.recurrence_interval,
            recurrence_day: charge.recurrence_day,
            next_charge_date: futureDate.toISOString().split('T')[0],
            parent_charge_id: charge.id,
          });

        if (insertError) {
          console.error("Error creating next recurrent charge:", insertError);
        } else {
          console.log("Next recurrent charge created successfully");
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        charge_id,
        status: updateData.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
