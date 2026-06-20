// get-license — lets the post-checkout "success" page show the customer their key.
// Stripe redirects to:  /success?session_id={CHECKOUT_SESSION_ID}
// The page then calls this with that id. We only return the key for a paid session,
// so the session id (a Stripe-issued secret) acts as the access token.
//
//   GET ?session_id=cs_test_...
//   200 { license_key, email, plan }   |   404 { error }

import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/license.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return json({ error: "missing_session_id" }, 400);

  // Confirm the session is real and actually paid before revealing anything.
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return json({ error: "session_not_found" }, 404);
  }
  if (session.payment_status !== "paid") {
    return json({ error: "not_paid" }, 402);
  }

  const db = adminClient();

  // The webhook may land a moment after the redirect; retry briefly.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await db
      .from("licenses")
      .select("license_key, email, plan")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();
    if (data) {
      return json({ license_key: data.license_key, email: data.email, plan: data.plan });
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  return json({ error: "license_pending" }, 202);
});
