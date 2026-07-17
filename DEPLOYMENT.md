# Deployment Guide — FrogeFlow AI (BookForge AI)

## Repository

**GitHub repository to deploy:** `jkrj29vy8r-dev/frogeflow-ai`  
**Branch to deploy:** `main` (or `claude/bookforge-ai-setup-iyw64p` if not yet merged)  
**Framework:** Next.js (auto-detected by Vercel)

---

## Prerequisites

You need accounts on five services before deploying:

| Service | Free tier available | Sign-up URL |
|---|---|---|
| Vercel | Yes | vercel.com |
| Supabase | Yes | supabase.com |
| Stripe | Yes (test mode) | stripe.com |
| Anthropic | Pay-as-you-go | console.anthropic.com |
| Resend | Yes (100 emails/day) | resend.com |

---

## Step 1 — Supabase Setup

### 1.1 Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Choose an organisation, name the project (e.g. `frogeflow-ai`), set a strong database password, pick the region closest to your users
4. Wait ~2 minutes for the project to provision

### 1.2 Run migrations

The `supabase/migrations/` directory contains 11 ordered SQL files that create the entire schema.

**Option A — Supabase CLI (recommended):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # found in Project Settings → General
supabase db push
```

**Option B — SQL editor (manual):**
1. Open your project → **SQL Editor**
2. Run each file in order, from `20240101...` to `20240111...`

> ⚠️ The migrations must be run in order. `20240111000000_rename_enterprise_to_agency.sql` is critical — it adds the `agency` enum value that the application writes to the database. Skipping it will cause webhook errors.

### 1.3 Enable Email Auth

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. Optionally enable **Google** or **GitHub** OAuth if desired

### 1.4 Collect credentials

From **Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role secret key

---

## Step 2 — Stripe Setup

### 2.1 Create an account
Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign up. Start in **test mode**.

### 2.2 Create products

Go to **Product catalog → Add product** and create two products:

| Product name | Price | Billing | What to copy |
|---|---|---|---|
| Pro | $29.00 USD | Monthly recurring | Price ID (`price_...`) |
| Agency | $99.00 USD | Monthly recurring | Price ID (`price_...`) |

### 2.3 Create a webhook

1. Go to **Developers → Webhooks → Add endpoint**
2. **Endpoint URL:** `https://YOUR_DOMAIN/api/billing/webhook`
3. **Listen to events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Click **Add endpoint**
5. On the webhook detail page click **Reveal** next to Signing secret → copy `whsec_...`

> ⚠️ The webhook URL uses your production domain. You can temporarily use a placeholder URL and update it after deploying to Vercel.

### 2.4 Collect credentials

From **Developers → API keys**:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Publishable key
- `STRIPE_SECRET_KEY` → Secret key (click Reveal)
- `STRIPE_WEBHOOK_SECRET` → from step 2.3
- `STRIPE_PRICE_PRO_MONTHLY` → Price ID of the Pro product
- `STRIPE_PRICE_AGENCY_MONTHLY` → Price ID of the Agency product

---

## Step 3 — Anthropic Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up and add a payment method (pay-as-you-go)
3. Go to **API Keys → Create Key**
4. Copy the key → `ANTHROPIC_API_KEY`

The application uses **claude-sonnet-5**. Ensure your account has access to this model.

---

## Step 4 — Resend Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **Domains → Add Domain** and add your sending domain (e.g. `mail.yourdomain.com`)
3. Follow the DNS verification steps (adds MX, SPF, DKIM records at your DNS provider)
4. Go to **API Keys → Create API Key**, copy it → `RESEND_API_KEY`
5. Set `RESEND_FROM_EMAIL` to an address at your verified domain (e.g. `noreply@yourdomain.com`)

---

## Step 5 — Deploy to Vercel

### 5.1 Import the repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select `jkrj29vy8r-dev/frogeflow-ai`
4. Framework will auto-detect as **Next.js** — leave all build settings at defaults

### 5.2 Add environment variables

Before clicking Deploy, expand **Environment Variables** and add every variable from the table below. You can also do this after first deploy via **Project → Settings → Environment Variables**.

| Variable | Required | Service | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase | service_role key — Production env only |
| `NEXT_PUBLIC_APP_URL` | Yes | App | Your Vercel domain, e.g. `https://frogeflow.vercel.app` |
| `STRIPE_SECRET_KEY` | Yes | Stripe | `sk_live_...` — Production env only |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe | `whsec_...` — Production env only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe | `pk_live_...` |
| `STRIPE_PRICE_PRO_MONTHLY` | Yes | Stripe | `price_...` for Pro plan |
| `STRIPE_PRICE_AGENCY_MONTHLY` | Yes | Stripe | `price_...` for Agency plan |
| `RESEND_API_KEY` | Yes | Resend | `re_...` — Production env only |
| `RESEND_FROM_EMAIL` | Yes | Resend | Verified sender address |
| `ANTHROPIC_API_KEY` | Yes | Anthropic | `sk-ant-...` — Production env only |

### 5.3 Deploy

Click **Deploy**. Vercel runs `npm install && npm run build`. The build skips env validation (controlled by `NEXT_PHASE=phase-production-build` in `src/lib/env.ts`) so missing vars won't fail the build — they fail at runtime instead.

### 5.4 Update Stripe webhook URL

After deploying, go back to **Stripe → Developers → Webhooks**, edit the endpoint, and update the URL to your real Vercel domain.

### 5.5 Update NEXT_PUBLIC_APP_URL

If Vercel assigned a domain different from what you set, update `NEXT_PUBLIC_APP_URL` in Vercel env vars and redeploy (or trigger a new deployment).

### 5.6 Add a custom domain (optional)

**Vercel → Project → Settings → Domains → Add** your domain. Vercel provisions a TLS certificate automatically.

---

## Step 6 — Supabase Auth Redirect URLs

Supabase needs to know which URLs are allowed for email-confirmation redirects.

1. Go to **Supabase → Authentication → URL Configuration**
2. Set **Site URL** to `https://your-domain.com`
3. Under **Redirect URLs**, add:
   - `https://your-domain.com/**`
   - `https://your-project.vercel.app/**` (if using Vercel preview URLs)

---

## Step 7 — Verify the Deployment

Check these URLs after deploying:

| URL | Expected result |
|---|---|
| `/` | Marketing homepage loads |
| `/sign-up` | Registration form renders |
| `/sign-in` | Login form renders |
| `/pricing` | Three plan cards with correct prices |
| `/api/billing/webhook` | Returns 400 (no signature) — means the route is reachable |
| `/dashboard` | Redirects to `/sign-in` if not authenticated |

---

## Troubleshooting

### Build passes but the app crashes on first request
The env schema validates at runtime, not build time. Check Vercel Function logs (**Project → Deployments → Functions**) for the error message — it will list exactly which env var is missing or malformed.

### Stripe webhooks not triggering
- Confirm the endpoint URL in Stripe matches the deployed URL exactly
- Check **Stripe → Developers → Webhooks → your endpoint → Recent deliveries** for errors
- Verify `STRIPE_WEBHOOK_SECRET` is the signing secret from that specific endpoint (each endpoint has its own secret)

### Email not sending
- Verify your domain in Resend (**Domains** tab must show green checkmarks for MX, SPF, DKIM)
- Confirm `RESEND_FROM_EMAIL` is at the verified domain, not a personal Gmail/Outlook address

### AI generation returns 500
- Check that `ANTHROPIC_API_KEY` is set and valid
- Confirm your Anthropic account has sufficient credits
- Verify the account has access to `claude-sonnet-5`

### Plan not updating after Stripe checkout
- The webhook must fire and be verified. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`
- Ensure `checkout.session.completed` is in the webhook's subscribed events list

---

## Production Checklist

- [ ] All 11 Supabase migrations applied (including `20240111` enum migration)
- [ ] Supabase Auth redirect URLs configured
- [ ] Both Stripe products created with correct prices
- [ ] Stripe webhook pointing to production URL with correct events
- [ ] All 12 environment variables set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` matches the live domain
- [ ] Resend domain verified (DNS records active)
- [ ] Anthropic API key valid and account has credits
- [ ] Test sign-up → email confirmation → dashboard flow end-to-end
- [ ] Test Stripe checkout for Pro plan
- [ ] Test PDF export (requires AI credits)
