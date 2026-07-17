# Environment Variables Reference

Every variable the application reads at runtime. All are **required** in production unless marked optional. The env schema (`src/lib/env.ts`) validates all values at server startup and throws a descriptive error if any are missing or malformed.

---

## Quick-copy template

Copy this block into Vercel → Project → Settings → Environment Variables (paste as bulk edit):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_AGENCY_MONTHLY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ANTHROPIC_API_KEY=
```

---

## Supabase

### `NEXT_PUBLIC_SUPABASE_URL`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Supabase |
| Example format | `https://abcdefghijklmnop.supabase.co` |
| Vercel environment | Production, Preview, Development |

**Where to find it:**
1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings → API**
4. Copy **Project URL**

---

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Supabase |
| Example format | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT) |
| Vercel environment | Production, Preview, Development |

**Where to find it:**
1. **Project Settings → API**
2. Under **Project API keys**, copy **anon public**

---

### `SUPABASE_SERVICE_ROLE_KEY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Supabase |
| Example format | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (different long JWT) |
| Vercel environment | Production only (never expose to browser) |

**Where to find it:**
1. **Project Settings → API**
2. Under **Project API keys**, copy **service_role secret**

> ⚠️ This key bypasses Row-Level Security. It is only used server-side in `src/lib/supabase/admin.ts` (webhook route). Never set it as a `NEXT_PUBLIC_` variable.

---

## App

### `NEXT_PUBLIC_APP_URL`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Your deployment |
| Example format | `https://your-project.vercel.app` or `https://yourdomain.com` |
| Vercel environment | Production, Preview |

Set this to your production domain once it is known. Used to build absolute URLs in emails and Stripe redirect URLs. For preview deployments you can use Vercel's auto-generated URL.

---

## Stripe

### `STRIPE_SECRET_KEY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Stripe |
| Example format | `sk_live_...` (production) or `sk_test_...` (test) |
| Vercel environment | Production only |

**Where to find it:**
1. Open [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers → API keys**
3. Copy **Secret key** (click "Reveal live key" for production)

---

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Stripe |
| Example format | `pk_live_...` or `pk_test_...` |
| Vercel environment | Production, Preview, Development |

**Where to find it:**
1. Same page: **Developers → API keys**
2. Copy **Publishable key** (visible without revealing)

---

### `STRIPE_WEBHOOK_SECRET`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Stripe |
| Example format | `whsec_...` |
| Vercel environment | Production only |

**How to create it:**
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/billing/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. On the webhook detail page, click **Reveal** under **Signing secret**
7. Copy the `whsec_...` value

---

### `STRIPE_PRICE_PRO_MONTHLY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Stripe |
| Example format | `price_1ABC...` |
| Vercel environment | Production only |

**How to create it:**
1. Go to **Product catalog → Add product**
2. Name: `Pro`, Price: `$29/month`, recurring monthly
3. After saving, click the product → click the price row
4. Copy the **Price ID** (`price_...`)

---

### `STRIPE_PRICE_AGENCY_MONTHLY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Stripe |
| Example format | `price_1DEF...` |
| Vercel environment | Production only |

**How to create it:**
Same as above but Name: `Agency`, Price: `$99/month`.

---

## Resend

### `RESEND_API_KEY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Resend |
| Example format | `re_...` |
| Vercel environment | Production only |

**How to create it:**
1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys → Create API Key**
3. Name it (e.g. `bookforge-production`), full access
4. Copy the key immediately — it is shown only once

---

### `RESEND_FROM_EMAIL`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Resend |
| Example format | `noreply@yourdomain.com` |
| Vercel environment | Production only |

Must be from a domain you have verified in Resend (**Domains → Add Domain**). Using an unverified domain causes emails to bounce.

---

## Anthropic

### `ANTHROPIC_API_KEY`
| Field | Value |
|---|---|
| Required | Yes |
| Service | Anthropic |
| Example format | `sk-ant-api03-...` |
| Vercel environment | Production only |

**How to obtain:**
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to **API Keys → Create Key**
3. Copy the key — shown only once

The application uses `claude-sonnet-5` by default. Ensure your account has access to that model.
