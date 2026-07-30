// Stripe webhook: ativa/cancela o plano Premium automaticamente em user_plans.
// Suporta Payment Links (sem metadata) casando o usuário pelo e-mail do checkout.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

  // ---- helpers -------------------------------------------------------------

  const findUserIdByEmail = async (email?: string | null) => {
    if (!email) return null;
    const { data } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();
    return (data?.id as string | undefined) ?? null;
  };

  /** Resolve o plano pago: metadata.plan_id, senão o Premium ativo, senão o pago mais barato. */
  const resolvePlanId = async (metaPlanId?: string | null) => {
    if (metaPlanId) return metaPlanId;
    const { data: premium } = await admin
      .from("plans")
      .select("id")
      .eq("is_active", true)
      .ilike("name", "premium")
      .maybeSingle();
    if (premium?.id) return premium.id as string;

    const { data: paid } = await admin
      .from("plans")
      .select("id")
      .eq("is_active", true)
      .gt("price", 0)
      .order("price", { ascending: true })
      .limit(1)
      .maybeSingle();
    return (paid?.id as string | undefined) ?? null;
  };

  const findUserIdBySubscription = async (subscriptionId?: string | null, customerId?: string | null) => {
    if (subscriptionId) {
      const { data } = await admin
        .from("user_plans")
        .select("user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.user_id) return data.user_id as string;
    }
    if (customerId) {
      const { data } = await admin
        .from("user_plans")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.user_id) return data.user_id as string;
    }
    return null;
  };

  const activatePlan = async (opts: {
    userId: string;
    planId: string;
    customerId?: string | null;
    subscriptionId?: string | null;
    email?: string | null;
    expiresAt?: string | null;
  }) => {
    // encerra planos ativos anteriores (ex.: gratuito) para useCurrentPlan pegar o novo
    await admin
      .from("user_plans")
      .update({ status: "replaced" })
      .eq("user_id", opts.userId)
      .eq("status", "active");

    await admin.from("user_plans").insert({
      user_id: opts.userId,
      plan_id: opts.planId,
      status: "active",
      starts_at: new Date().toISOString(),
      expires_at: opts.expiresAt ?? null,
      stripe_customer_id: opts.customerId ?? null,
      stripe_subscription_id: opts.subscriptionId ?? null,
      stripe_email: opts.email ?? null,
    });
  };

  // ---- handlers ------------------------------------------------------------

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
        const email =
          session.customer_details?.email ?? (session.customer_email as string | null) ?? null;

        const userId =
          (session.metadata?.user_id as string | undefined) ??
          (session.client_reference_id as string | undefined) ??
          (await findUserIdByEmail(email));

        if (!userId) {
          console.warn("stripe-webhook: no matching user for checkout", { email, customerId });
          return json({ received: true, matched: false });
        }

        const planId = await resolvePlanId(session.metadata?.plan_id as string | undefined);
        if (!planId) {
          console.error("stripe-webhook: no paid plan configured");
          return json({ received: true, matched: false });
        }

        // assinatura ativa => sem data de expiração; pagamento avulso => +1 mês
        let expiresAt: string | null = null;
        if (session.mode !== "subscription") {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          expiresAt = d.toISOString();
        }

        await activatePlan({ userId, planId, customerId, subscriptionId, email, expiresAt });
        console.log("stripe-webhook: premium ativado", { userId, subscriptionId });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        const userId =
          (sub.metadata?.user_id as string | undefined) ??
          (await findUserIdBySubscription(sub.id, customerId));
        if (!userId) break;

        await admin
          .from("user_plans")
          .update({ status: "cancelled", expires_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("status", "active");
        console.log("stripe-webhook: premium cancelado", { userId });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null;
        const userId =
          (await findUserIdBySubscription(subscriptionId, customerId)) ??
          (await findUserIdByEmail(invoice.customer_email));
        if (!userId) break;

        await admin
          .from("user_plans")
          .update({ status: "past_due" })
          .eq("user_id", userId)
          .eq("status", "active");
        console.log("stripe-webhook: assinatura inadimplente", { userId });
        break;
      }

      default:
        break;
    }

    return json({ received: true });
  } catch (e) {
    console.error("stripe-webhook handler error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
