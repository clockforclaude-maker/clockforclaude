// verify-license — clients send a license key, get back its validity.
// Public endpoint (no auth) called by the Chrome extension popup and mobile app.
//
//   POST { "license_key": "CFC-XXXX-XXXX-XXXX" }
//   200  { valid: true,  plan, status, email, current_period_end }
//   200  { valid: false, reason }

import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient, normalizeLicenseKey } from "../_shared/license.ts";

const KEY_RE = /^CFC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ valid: false, reason: "method_not_allowed" }, 405);

  let key = "";
  try {
    const body = await req.json();
    key = normalizeLicenseKey(body.license_key ?? body.key ?? "");
  } catch {
    return json({ valid: false, reason: "bad_request" }, 400);
  }

  if (!KEY_RE.test(key)) {
    return json({ valid: false, reason: "invalid_format" });
  }

  const db = adminClient();
  const { data, error } = await db
    .from("licenses")
    .select("email, plan, status, current_period_end")
    .eq("license_key", key)
    .maybeSingle();

  if (error) {
    console.error("verify-license db error:", error.message);
    return json({ valid: false, reason: "server_error" }, 500);
  }
  if (!data) return json({ valid: false, reason: "not_found" });
  if (data.status !== "active") {
    return json({ valid: false, reason: data.status }); // past_due | canceled
  }

  // Mask the email a little so the endpoint can't be used to harvest addresses.
  const [user, domain] = data.email.split("@");
  const maskedEmail = domain
    ? `${user.slice(0, 2)}***@${domain}`
    : undefined;

  return json({
    valid: true,
    plan: data.plan,
    status: data.status,
    email: maskedEmail,
    current_period_end: data.current_period_end,
  });
});
