// stripe-webhook — receives Stripe events, issues & maintains license keys.
//
// Configure in Stripe Dashboard → Developers → Webhooks, listening to:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
//   invoice.payment_failed
//
// Required env (supabase secrets set ...):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (injected automatically)

import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient, generateLicenseKey } from "../_shared/license.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing stripe-signature" }, 400);

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Signature verification failed:", err instanceof Error ? err.message : err);
    return json({ error: "Invalid signature" }, 400);
  }

  const db = adminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const email =
          session.customer_details?.email ?? session.customer_email ?? null;
        const subscriptionId = (session.subscription as string) ?? null;
        const customerId = (session.customer as string) ?? null;
        if (!email || !subscriptionId) {
          console.error("checkout.session.completed missing email/subscription");
          break;
        }

        // Idempotency: if this subscription already has a key, reuse it.
        const { data: existing } = await db
          .from("licenses")
          .select("license_key")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        const licenseKey = existing?.license_key ?? generateLicenseKey();

        let periodEnd: string | null = null;
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          if (sub.current_period_end) {
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
        } catch (_e) { /* non-fatal */ }

        const { error } = await db.from("licenses").upsert(
          {
            license_key: licenseKey,
            email,
            status: "active",
            plan: "pro_monthly",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_checkout_session_id: session.id,
            current_period_end: periodEnd,
          },
          { onConflict: "stripe_subscription_id" },
        );
        if (error) throw error;
        console.log(`Issued/updated license for ${email} (${subscriptionId})`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status === "past_due" || sub.status === "unpaid"
          ? "past_due"
          : "canceled";
        await db
          .from("licenses")
          .update({
            status,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.from("licenses").update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db.from("licenses").update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);
        }
        break;
      }

      default:
        // Ignore everything else.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err instanceof Error ? err.message : err);
    return json({ error: "Handler error" }, 500);
  }

  return json({ received: true });
});
