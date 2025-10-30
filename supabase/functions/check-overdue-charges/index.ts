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

    console.log("Starting overdue charges check...");

    // Update overdue charges
    const { error: updateError } = await supabase.rpc("update_overdue_charges");
    
    if (updateError) {
      console.error("Error updating overdue charges:", updateError);
      throw updateError;
    }

    // Get charges that need reminders (due in 2 days)
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 2);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];

    const { data: reminderCharges, error: reminderError } = await supabase
      .from("charges")
      .select(`
        id,
        amount,
        due_date,
        client_id,
        user_id,
        clients (name, phone)
      `)
      .eq("status", "pending")
      .eq("due_date", reminderDateStr)
      .is("last_notification_sent_at", null);

    if (reminderError) throw reminderError;

    // Get overdue charges that need alerts
    const { data: overdueCharges, error: overdueError } = await supabase
      .from("charges")
      .select(`
        id,
        amount,
        due_date,
        client_id,
        user_id,
        clients (name, phone)
      `)
      .eq("status", "overdue");

    if (overdueError) throw overdueError;

    console.log(`Found ${reminderCharges?.length || 0} charges needing reminders`);
    console.log(`Found ${overdueCharges?.length || 0} overdue charges`);

    // Log notifications that should be sent
    const notificationsToSend = [
      ...(reminderCharges || []).map(charge => {
        const client = Array.isArray(charge.clients) ? charge.clients[0] : charge.clients;
        return {
          charge_id: charge.id,
          client_id: charge.client_id,
          user_id: charge.user_id,
          notification_type: "reminder",
          channel: "whatsapp",
          message_content: `Olá ${client?.name || 'Cliente'}! Lembrete: sua cobrança de R$ ${Number(charge.amount).toFixed(2)} vence em 2 dias (${new Date(charge.due_date).toLocaleDateString("pt-BR")}).`
        };
      }),
      ...(overdueCharges || []).map(charge => {
        const client = Array.isArray(charge.clients) ? charge.clients[0] : charge.clients;
        return {
          charge_id: charge.id,
          client_id: charge.client_id,
          user_id: charge.user_id,
          notification_type: "overdue",
          channel: "whatsapp",
          message_content: `Olá ${client?.name || 'Cliente'}! Sua cobrança de R$ ${Number(charge.amount).toFixed(2)} está vencida desde ${new Date(charge.due_date).toLocaleDateString("pt-BR")}. Por favor, regularize seu pagamento.`
        };
      })
    ];

    // Save notifications to database
    if (notificationsToSend.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notificationsToSend);

      if (notifError) {
        console.error("Error saving notifications:", notifError);
      } else {
        // Update last_notification_sent_at for reminder charges
        for (const charge of reminderCharges || []) {
          await supabase
            .from("charges")
            .update({ last_notification_sent_at: new Date().toISOString() })
            .eq("id", charge.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        overdueUpdated: true,
        remindersSent: reminderCharges?.length || 0,
        overdueAlerts: overdueCharges?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-overdue-charges:", error);
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
