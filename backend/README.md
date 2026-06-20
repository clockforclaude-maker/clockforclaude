# ClockForClaude — License Backend (Supabase)

Issues and verifies **Pro license keys** so the extension, mobile app and (optionally)
MCP server can unlock Pro only for customers who actually paid on Stripe.

```
Stripe Checkout ──(webhook)──▶ stripe-webhook ──▶ licenses table (Postgres)
                                                      ▲          ▲
 success page ──(session_id)──▶ get-license ──────────┘          │
 extension / app ──(license_key)──▶ verify-license ──────────────┘
```

A purchase creates a row with a unique key `CFC-XXXX-XXXX-XXXX`. Clients store the key
locally and re-check it against `verify-license`; if the subscription is canceled or
unpaid, the key stops validating and Pro locks itself.

## Endpoints

| Function | Method | Input | Output |
|---|---|---|---|
| `stripe-webhook` | POST | Stripe event (signed) | `{received:true}` |
| `verify-license` | POST | `{license_key}` | `{valid, plan, status, email, current_period_end}` |
| `get-license` | GET | `?session_id=cs_...` | `{license_key, email, plan}` |

## One-time setup

### 1. Link the project & push the schema
```bash
cd backend
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push          # applies migrations/0001_licenses.sql
```

### 2. Set secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx   # from step 4
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
```

### 3. Deploy the functions
```bash
supabase functions deploy stripe-webhook
supabase functions deploy verify-license
supabase functions deploy get-license
```
Function URL pattern: `https://<PROJECT_REF>.supabase.co/functions/v1/<name>`

### 4. Point Stripe at the webhook
Stripe Dashboard → Developers → Webhooks → **Add endpoint**
`https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
Events to send:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` (step 2) and redeploy
the webhook function.

### 5. Configure the Checkout success URL
On your Payment Link / Checkout Session set:
`https://clockforclaude.com/success?session_id={CHECKOUT_SESSION_ID}`
That page calls `get-license` to show the customer their key.

## Local testing
```bash
supabase start
supabase functions serve --env-file ./supabase/.env.local
# In another shell, replay a real event:
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

Verify a key:
```bash
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/verify-license \
  -H "Content-Type: application/json" \
  -d '{"license_key":"CFC-7K3M-9PQR-2WX4"}'
```

## Notes
- `licenses` has RLS enabled with **no policies** → only the service-role key (used inside
  the Edge Functions) can touch it. Anon/public clients cannot read the table directly.
- `verify-license` masks the email (`ma***@domain`) so the endpoint can't harvest addresses.
- Optional next step: email the key automatically on purchase (Resend/Postmark) instead of
  only showing it on the success page.
