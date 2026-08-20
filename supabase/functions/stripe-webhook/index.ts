// Stripe webhook: ativa/renova/cancela o plano Premium automaticamente em user_plans.
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

  // ---- idempotência ---------------------------------------------------------
  // Insere o event.id primeiro: se já existe (conflito de PK), o evento já foi
  // processado e devolvemos 200 sem reprocessar.
  {
    const { error } = await admin.from("stripe_events").insert({ id: event.id });
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        console.log("stripe-webhook: evento duplicado ignorado", { id: event.id, type: event.type });
        return json({ received: true, duplicate: true });
      }
      console.error("stripe-webhook: falha ao registrar evento", error);
    }
  }

  // ---- helpers -------------------------------------------------------------

  const ACTIVE_LIKE = ["active", "past_due"];

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

  /** Atualiza a assinatura vigente do usuário (active ou past_due). */
  const patchCurrentPlan = async (userId: string, patch: Record<string, unknown>) => {
    const { error } = await admin
      .from("user_plans")
      .update(patch)
      .eq("user_id", userId)
      .in("status", ACTIVE_LIKE);
    if (error) console.error("stripe-webhook: falha ao atualizar user_plans", error);
  };

  /** Encerra planos gratuitos ativos do usuário (evita duas linhas ativas). */
  const expireFreePlans = async (userId: string) => {
    const { data: freePlans } = await admin.from("plans").select("id").eq("price", 0);
    const freeIds = (freePlans ?? []).map((p) => p.id as string);
    if (!freeIds.length) return;
    const { error } = await admin
      .from("user_plans")
      .update({ status: "expired", expires_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("plan_id", freeIds)
      .in("status", ACTIVE_LIKE);
    if (error) console.error("stripe-webhook: falha ao expirar plano gratuito", error);
  };

  /** Extrai o código do cupom/promotion code usado na sessão de checkout. */
  const resolveCouponCodes = async (session: Stripe.Checkout.Session): Promise<string[]> => {
    const codes = new Set<string>();
    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["total_details.breakdown.discounts", "discounts.promotion_code", "discounts.coupon"],
      });

      const pushDiscount = (d: unknown) => {
        const disc = d as {
          promotion_code?: string | { code?: string; id?: string } | null;
          coupon?: string | { name?: string | null; id?: string } | null;
          discount?: unknown;
        } | null;
        if (!disc) return;
        const pc = disc.promotion_code;
        if (typeof pc === "string") codes.add(pc);
        else if (pc?.code) codes.add(pc.code);
        const c = disc.coupon;
        if (typeof c === "string") codes.add(c);
        else if (c) {
          if (c.name) codes.add(c.name);
          if (c.id) codes.add(c.id);
        }
      };

      for (const d of (full.discounts ?? []) as unknown[]) pushDiscount(d);
      for (const line of (full.total_details?.breakdown?.discounts ?? []) as unknown[]) {
        pushDiscount((line as { discount?: unknown }).discount);
      }
    } catch (e) {
      console.warn("stripe-webhook: não foi possível ler descontos da sessão", (e as Error).message);
    }
    return [...codes].filter(Boolean);
  };

  /** Casa o código do cupom com um parceiro de indicação ativo (case-insensitive). */
  const findReferralPartnerId = async (codes: string[]): Promise<string | null> => {
    if (!codes.length) return null;
    for (const code of codes) {
      const { data, error } = await admin
        .from("referral_partners")
        .select("id")
        .eq("is_active", true)
        .ilike("coupon_code", code)
        .maybeSingle();
      if (error) {
        console.warn("stripe-webhook: falha ao buscar parceiro por cupom", error.message);
        continue;
      }
      if (data?.id) return data.id as string;
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
    referralPartnerId?: string | null;
  }) => {
    // 1) planos gratuitos anteriores viram "expired" (fonte do bug de duas linhas ativas)
    await expireFreePlans(opts.userId);

    // 2) demais planos ativos (pagos) viram "replaced"
    await admin
      .from("user_plans")
      .update({ status: "replaced" })
      .eq("user_id", opts.userId)
      .in("status", ACTIVE_LIKE);

    await admin.from("user_plans").insert({
      user_id: opts.userId,
      plan_id: opts.planId,
      status: "active",
      starts_at: new Date().toISOString(),
      expires_at: opts.expiresAt ?? null,
      stripe_customer_id: opts.customerId ?? null,
      stripe_subscription_id: opts.subscriptionId ?? null,
      stripe_email: opts.email ?? null,
      referral_partner_id: opts.referralPartnerId ?? null,
    });
  };



  // Funil: assinatura paga (evento único, atribuído pela origem do cadastro).
  const logSubscriptionPaid = async (
    userId: string,
    properties: Record<string, unknown>,
  ) => {
    try {
      const { data: existing } = await admin
        .from("product_events")
        .select("id")
        .eq("user_id", userId)
        .eq("event_name", "subscription_paid")
        .limit(1);
      if (existing && existing.length > 0) return;

      const { data: profile } = await admin
        .from("profiles")
        .select(
          "signup_utm_source, signup_utm_medium, signup_utm_campaign, signup_utm_content, signup_referrer",
        )
        .eq("id", userId)
        .maybeSingle();

      await admin.from("product_events").insert({
        user_id: userId,
        event_name: "subscription_paid",
        properties,
        utm_source: profile?.signup_utm_source ?? null,
        utm_medium: profile?.signup_utm_medium ?? null,
        utm_campaign: profile?.signup_utm_campaign ?? null,
        utm_content: profile?.signup_utm_content ?? null,
        referrer: profile?.signup_referrer ?? null,
      });
    } catch (e) {
      console.warn("stripe-webhook: falha ao registrar subscription_paid", e);
    }
  };

  const toIso = (seconds?: number | null) =>
    typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;

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

        const couponCodes = await resolveCouponCodes(session);
        const referralPartnerId = await findReferralPartnerId(couponCodes);

        await activatePlan({ userId, planId, customerId, subscriptionId, email, expiresAt, referralPartnerId });
        console.log("stripe-webhook: premium ativado", { userId, subscriptionId, couponCodes, referralPartnerId });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        const userId =
          (sub.metadata?.user_id as string | undefined) ??
          (await findUserIdBySubscription(sub.id, customerId));
        if (!userId) {
          console.warn("stripe-webhook: subscription.updated sem usuário", { sub: sub.id });
          break;
        }

        const periodEnd = toIso((sub as unknown as { current_period_end?: number }).current_period_end);
        const patch: Record<string, unknown> = {
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
        };

        switch (sub.status) {
          case "active":
          case "trialing":
            // reativa após inadimplência e confirma o período vigente
            patch.status = "active";
            // cancel_at_period_end: segue ativo até o fim do período pago
            patch.expires_at = sub.cancel_at_period_end ? periodEnd : null;
            break;
          case "past_due":
          case "unpaid":
            patch.status = "past_due";
            break;
          case "canceled":
          case "incomplete_expired":
            patch.status = "cancelled";
            patch.expires_at = periodEnd ?? new Date().toISOString();
            break;
          default:
            break;
        }

        await patchCurrentPlan(userId, patch);
        console.log("stripe-webhook: subscription atualizada", {
          userId,
          stripeStatus: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null;
        const userId =
          (await findUserIdBySubscription(subscriptionId, customerId)) ??
          (await findUserIdByEmail(invoice.customer_email));
        if (!userId) {
          console.warn("stripe-webhook: invoice.paid sem usuário", { subscriptionId, customerId });
          break;
        }

        // Renovação paga => volta a ficar ativo (mesmo se estava past_due)
        const patch: Record<string, unknown> = { status: "active", expires_at: null };
        if (customerId) patch.stripe_customer_id = customerId;
        if (subscriptionId) patch.stripe_subscription_id = subscriptionId;

        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            if (sub.cancel_at_period_end) {
              patch.expires_at = toIso((sub as unknown as { current_period_end?: number }).current_period_end);
            }
          } catch (e) {
            console.warn("stripe-webhook: não foi possível ler a subscription", (e as Error).message);
          }
        } else {
          const periodEnd = toIso(invoice.lines?.data?.[0]?.period?.end);
          if (periodEnd) patch.expires_at = periodEnd;
        }

        await patchCurrentPlan(userId, patch);
        console.log("stripe-webhook: renovação confirmada", { userId, subscriptionId });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        const userId =
          (sub.metadata?.user_id as string | undefined) ??
          (await findUserIdBySubscription(sub.id, customerId));
        if (!userId) break;

        await patchCurrentPlan(userId, {
          status: "cancelled",
          expires_at: new Date().toISOString(),
        });
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
