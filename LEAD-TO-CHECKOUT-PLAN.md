# Lead → Checkout Plan

Goal: after someone fills out the lead form, take them to a single `/checkout.html` page on tap.giving where they pick a design, set a destination URL, and pay — without ever leaving the site. Stripe Checkout is **embedded**, not a redirect. If they drop off, the lead was already captured on the previous step so Ryan can still follow up manually.

Supersedes the earlier `CHECKOUT-PLAN.md`.

## The flow (two pages)

```
Page 1: Lead form                  Page 2: /checkout.html
(home, blog, /order)         →     everything happens here
                                   (design + destination + Stripe embedded)

name, church, plates,              → if user drops off, lead is already
email, phone                         captured from Page 1 submit
```

Success page after Stripe succeeds → `/order-confirmed.html` (already exists).

## Page 1 — Lead form (small tweaks)

Form lives in `order.html` (and homepage/blog embeds). Submit logic is in `order.html:472` (`handleCheckout`).

Changes:
1. Add a separate `name` field (currently missing; only `church_name`, `email`, `phone`, `quantity`).
2. Keep the existing Formspree `sendBeacon` and `/api/autoreply` calls exactly as they are — that's how we preserve the lead if they abandon checkout.
3. Replace `window.location.href = '/thank-you.html'` with a redirect to `/checkout.html`, passing the lead data via `sessionStorage`.

```js
sessionStorage.setItem('leadData', JSON.stringify({
  name, church, email, phone, quantity
}));
window.location.href = '/checkout.html';
```

## Page 2 — `/checkout.html`

Single page, single scroll, single "Checkout" button at the bottom. Layout:

```
─────────────────────────────────────────────────────────────
  One more step to complete your tap plate order!
─────────────────────────────────────────────────────────────

  Select design
  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────┐
  │ Opt A  │  │ Opt B  │  │ Opt C  │  │ Upload my own  │
  │ image  │  │ image  │  │ image  │  │    artwork     │
  └────────┘  └────────┘  └────────┘  └────────────────┘

  Select Tap Plate destination
  ( ) Enter URL        [ newlifechurch.org/tap        ]
  ( ) Use Tap.Giving landing page  (view example)

  ─── Payment ────────────────────────────────────────────
  Quantity:  [ − ]  200  [ + ]    @ $4.00/plate = $800.00
             (min 100, max 1000 — tier breaks shown below)

  ┌───────────────────────────────────────────────────┐
  │  Stripe Embedded Checkout iframe                  │
  │  - Email (prefilled)                              │
  │  - Card / Apple Pay / Google Pay                  │
  │  - Shipping address                               │
  │  - "Add promotion code" link (discount field)     │
  └───────────────────────────────────────────────────┘

  [ Checkout ]
─────────────────────────────────────────────────────────────
```

### Section 1 — Select design
Four tiles in a responsive grid. Click-to-select, selected tile gets a highlighted ring, value stored in a hidden field. No file upload on this page — if they pick "Upload my own artwork" we just record the intent and collect the file later (post-checkout email).

### Section 2 — Select Tap Plate destination
Radio with two options:
- **Enter URL** → text input with placeholder `newlifechurch.org/tap`.
- **Use Tap.Giving landing page** → shows "view example" link (opens a sample landing page in a new tab) plus a slug input that previews `tap.giving/yourslug`.

Helper copy: "You can change this later."

### Section 3 — Quantity + Stripe Embedded Checkout

Quantity stepper above the Stripe iframe:
- Prefilled from the lead form.
- Min 100, max 1000.
- Live display of unit price and total, using these tiers (from `pricing.html`):

| Quantity    | Price / plate |
|-------------|---------------|
| 100 – 199   | $4.50         |
| 200 – 399   | $4.00         |
| 400 – 1000  | $3.50         |

Free shipping always.

Stripe **Embedded Checkout** mounts below the stepper. That iframe handles card / Apple Pay / Google Pay / shipping address / promo code entry — we don't need to build any of it. The "Add promotion code" field inside embedded Checkout is the discount-code spot (enable via `allow_promotion_codes: true` on the session).

The page's own **Checkout** button is just the Stripe submit button inside the embedded iframe — no separate button needed. We can keep a sticky "Complete order" CTA label above or around the iframe for clarity.

### Behavior when quantity / design / destination changes

Stripe Checkout Sessions are **immutable** once created. When the user changes quantity, design, or destination, we need to recreate the session and remount embedded Checkout. Flow:

1. On page load, if leadData is present, request a session immediately with the prefilled quantity.
2. Whenever the user changes quantity, design, or destination, debounce ~400 ms, then:
   - Call the Worker to create a new Checkout Session with updated line-item quantity + metadata.
   - Destroy the existing embedded-checkout instance, mount a new one with the new `client_secret`.
3. Show a subtle loading state over the payment area while the new session loads.

This is the main tradeoff of embedded vs hosted: we pay the cost of re-creating sessions, but the user never leaves tap.giving.

## Stripe integration

Use **Stripe Embedded Checkout** — the drop-in JS embed, not Stripe Elements/Payment Element. Load Stripe.js, call `stripe.initEmbeddedCheckout({ clientSecret })`, mount to a div.

Server side (Cloudflare Worker) creates the session:

```
POST /api/create-checkout-session
Body: { quantity, name, church, email, phone, designChoice, destinationType, destinationValue }

Worker:
  - Validate quantity 100..1000
  - Look up unit price from tier table
  - Create Checkout Session:
      ui_mode: 'embedded'
      line_items: [{
        price_data: { currency: 'usd', product: <PRODUCT_ID>, unit_amount: <cents> },
        quantity: <quantity>
      }]
      mode: 'payment'
      allow_promotion_codes: true
      customer_email: <email>
      shipping_address_collection: { allowed_countries: ['US'] }
      metadata: { name, church, phone, designChoice, destinationType, destinationValue }
      return_url: 'https://tap.giving/order-confirmed.html?session_id={CHECKOUT_SESSION_ID}'

Response: { client_secret, unit_amount_cents, total_cents }
```

Webhook stays the same as before — `checkout.session.completed` emails Ryan a full order summary with all metadata.

Secrets to add to the Worker: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRODUCT_ID`.

## Lead capture resilience

- Formspree `sendBeacon` + `/api/autoreply` still fire on Page 1 submit, before the redirect. Any drop-off on `/checkout.html` still leaves a real lead to follow up.
- Fire GA events: `lead_submitted`, `design_selected`, `destination_set`, `checkout_session_created`, `checkout_completed`. Lets us see where people fall off.

## Files to create / modify

| File | Action |
|---|---|
| `order.html` (+ any other lead form embeds) | Add `name` input; redirect to `/checkout.html`; keep Formspree + autoreply |
| `index.html` | Same form changes if embedded on home |
| `blog/*.html` | Same changes where the form is embedded (or convert to shared snippet) |
| `/checkout.html` | **New** — design + destination + quantity stepper + Stripe Embedded Checkout |
| `/thank-you.html` | Keep as fallback for users with JS disabled |
| `/order-confirmed.html` | Already exists; reads `session_id` from URL and shows a summary |
| `worker/tap-autoreply/src/index.ts` | Add `/api/create-checkout-session` + `/api/stripe-webhook` routes |
| `.env.example` | Document new Stripe env vars |

## Build order (smallest useful slices first)

1. Add `name` field to lead form; redirect to a stub `/checkout.html`.
2. Build `/checkout.html` UI only (design tiles, destination, quantity stepper with live total). No Stripe yet.
3. Create Stripe product in the dashboard; grab the product ID.
4. Add Worker route `/api/create-checkout-session`; return `client_secret`.
5. Mount Stripe Embedded Checkout on `/checkout.html`; hook up session creation on load.
6. Add the debounced "recreate session on change" handler for quantity / design / destination.
7. Add Worker route `/api/stripe-webhook`; email Ryan on `checkout.session.completed`.
8. Update `/order-confirmed.html` to read `session_id` from the URL and render a summary.
9. (Later) artwork upload page/flow for users who picked "Upload my own artwork" — send them a post-checkout email with an upload link.
10. (Later) explainer video block on `/checkout.html`.

## Open questions

- [ ] Final art / filenames for Option A, B, C.
- [ ] Is there a preloaded discount on every session, or just the manual "Add promotion code" field? (Plan assumes manual — simpler. Can also auto-apply a coupon via `discounts: [{ coupon }]` if we want every lead to get one.)
- [ ] Giving URL required, or optional and collected later?
- [ ] Artwork upload — on this page or post-checkout email link? (Plan: later.)
- [ ] Shipping countries — US only at launch?
- [ ] Cap above 1000 ever needed, or hard stop there?
