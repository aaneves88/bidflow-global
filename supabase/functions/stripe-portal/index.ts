// Cria uma sessão do Stripe Billing Portal para o usuário logado gerenciar
// (cancelar, trocar cartão, ver faturas) a assinatura Premium.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const RETURN_URL = "https://orca-mento.app/account";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) return json({ error: "Stripe not configured" }, 500);

  // --- auth (verify_jwt em código) -----------------------------------------
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await anon.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
  const userId = claimsData.claims.sub as string;
  const userEmail = (claimsData.claims.email as string | undefined) ?? null;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

  try {
    // customer id salvo em qualquer plano do usuário (mais recente primeiro)
    const { data: rows } = await admin
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    let customerId = rows?.[0]?.stripe_customer_id as string | undefined;

    // fallback: procura pelo e-mail no Stripe
    if (!customerId && userEmail) {
      const found = await stripe.customers.list({ email: userEmail, limit: 1 });
      customerId = found.data[0]?.id;
    }

    if (!customerId) {
      return json({ error: "no_customer" }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: RETURN_URL,
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("stripe-portal error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
