// Stripe webhook receiver: activates user_plans on checkout.session.completed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secretKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400, headers: corsHeaders });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed", e);
    return new Response(`Bad signature: ${(e as Error).message}`, { status: 400, headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata?.user_id ?? session.client_reference_id) as string | undefined;
      const planId = session.metadata?.plan_id as string | undefined;

      if (userId && planId) {
        // Resolve plan interval to compute expires_at
        const { data: plan } = await admin
          .from("plans")
          .select("interval")
          .eq("id", planId)
          .maybeSingle();

        const now = new Date();
        const expires = new Date(now);
        switch (plan?.interval) {
          case "year": expires.setFullYear(expires.getFullYear() + 1); break;
          case "week": expires.setDate(expires.getDate() + 7); break;
          case "day":  expires.setDate(expires.getDate() + 1); break;
          default:     expires.setMonth(expires.getMonth() + 1);
        }

        await admin.from("user_plans").insert({
          user_id: userId,
          plan_id: planId,
          status: "active",
          starts_at: now.toISOString(),
          expires_at: expires.toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stripe-webhook handler error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
