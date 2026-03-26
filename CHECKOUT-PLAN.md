# Checkout Flow Plan

## Current Flow
1. User fills out lead form on homepage (church name, email, phone, quantity)
2. Form submits to Formspree → you get the lead via email
3. User sees a success message. Dead end.

## Proposed Flow
1. User fills out lead form on homepage (church name, email, phone, quantity)
2. Form submits to Formspree (you still get the lead)
3. User is redirected to `/checkout.html` with their info passed via sessionStorage
4. Checkout page shows:
   - **Order summary** with quantity selector (pre-filled from lead form, editable)
   - **Live price calculation** (auto-updates as quantity changes)
   - **Giving URL field** (the URL they want their plates to link to)
   - **Shipping address fields**
   - **Stripe Elements payment form** (card, Apple Pay, Google Pay — embedded on your page)
5. User clicks "Place Order" → JS calls Cloudflare Worker → Worker creates Stripe PaymentIntent → payment processes
6. On success → redirect to `/order-confirmed.html`
7. Stripe webhook (on Worker) notifies you of completed order

## Pricing Tiers
| Quantity | Price/Plate |
|----------|-------------|
| 100–199  | $4.50       |
| 200–399  | $4.00       |
| 400+     | $3.50       |

Shipping: Always free.
Minimum order: 100 plates.

## Architecture

```
Static Site (tap.giving)          Cloudflare Worker (api.tap.giving or similar)
┌──────────────────────┐          ┌──────────────────────────────┐
│                      │          │                              │
│  /index.html         │          │  POST /create-payment-intent │
│  (lead form)         │          │  - Receives: quantity, email │
│       │              │          │  - Calculates price tier     │
│       ▼              │          │  - Creates Stripe            │
│  /checkout.html      │─────────▶│    PaymentIntent             │
│  (Stripe Elements)   │◀─────────│  - Returns: client_secret   │
│       │              │          │                              │
│       ▼              │          │  POST /webhook               │
│  /order-confirmed    │          │  - Stripe sends event        │
│                      │          │  - You get notified          │
└──────────────────────┘          └──────────────────────────────┘
```

## Implementation Steps

### Step 1: Set Up Stripe Products
Create one product with a unit price (we'll calculate total server-side):
```bash
stripe products create --name="NFC Tap-to-Give Plates"
# Note the product ID (prod_XXXX)
```
No need for separate price objects — the Worker calculates the amount dynamically based on quantity tier.

### Step 2: Create Cloudflare Worker
Free tier (100K requests/day). One worker with two routes:

**`POST /create-payment-intent`**
```
Input:  { quantity: 200, email: "pastor@church.com", churchName: "Grace Church" }
Logic:  quantity 200 → $4.00/plate → $800 total → amount_cents = 80000
Output: { clientSecret: "pi_xxx_secret_xxx", amount: 80000, pricePerPlate: 400 }
```

**`POST /webhook`**
```
Receives Stripe checkout.session.completed events.
Forwards order details to your email or Slack.
```

### Step 3: Build /checkout.html
Static page on your site, styled to match. Contains:

- **Order summary card** (top)
  - Quantity input (number field, min 100, pre-filled from lead form)
  - Price per plate (updates live as quantity changes)
  - Total price (updates live)
  - "Free shipping included" badge

- **Church details**
  - Church name (pre-filled from lead form)
  - Giving URL (text input — "What URL should the plates link to?")

- **Shipping address**
  - Name, Address line 1, Address line 2, City, State, ZIP

- **Payment section**
  - Stripe Payment Element (handles card, Apple Pay, Google Pay)
  - "Place Order" button

- **Trust indicators**
  - "Secured by Stripe" badge
  - "No monthly fees" reminder
  - "Free shipping" reminder

### Step 4: Modify Lead Form Submit
Current: POST to Formspree, show success message.
New: POST to Formspree via fetch(), then save form data to sessionStorage, then redirect to /checkout.html.

```js
// On form submit:
// 1. Send to Formspree (async, don't wait)
fetch(formspreeURL, { method: 'POST', body: formData });

// 2. Save to sessionStorage for checkout page
sessionStorage.setItem('checkoutData', JSON.stringify({
  quantity: selectedQuantity,
  email: emailValue,
  churchName: churchNameValue,
  phone: phoneValue
}));

// 3. Redirect to checkout
window.location.href = '/checkout.html';
```

### Step 5: Build /order-confirmed.html
Simple thank-you page:
- "Your order is confirmed!"
- Order summary (pulled from URL params or sessionStorage)
- What to expect next (3-5 week timeline)
- Contact info for questions
- Link back to homepage

### Step 6: Stripe Webhook on Worker
- Verify webhook signature
- On `payment_intent.succeeded`:
  - Extract: amount, email, shipping address, metadata (church name, quantity, giving URL)
  - Send notification email to hello@tap.giving (via Mailgun, SendGrid, or Resend — all have free tiers)
  - Or post to a Slack webhook

## Files to Create/Modify
| File | Action |
|------|--------|
| `/checkout.html` | **Create** — checkout page with Stripe Elements |
| `/order-confirmed.html` | **Create** — thank-you page |
| `/index.html` | **Modify** — change form submit to redirect to checkout |
| Cloudflare Worker | **Create** — API for PaymentIntent + webhook |

## Environment / Keys Needed
- Stripe publishable key (for checkout.html)
- Stripe secret key (for Worker — stored as Worker secret)
- Stripe webhook signing secret (for Worker)
- Cloudflare account (free tier is fine)

## Open Questions
- [ ] What Cloudflare account/subdomain to use for the Worker? (e.g., api.tap.giving)
- [ ] Do you want email notifications on new orders, Slack, or both?
- [ ] Should the giving URL be required at checkout, or can they provide it later?
- [ ] Any quantity cap? (e.g., max 1000 plates per order)
