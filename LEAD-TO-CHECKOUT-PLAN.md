# Lead → Checkout Plan

Goal: after someone fills out the lead form, guide them into a self-serve Stripe checkout. They should be able to place a real order without emailing Ryan. Whoever drops off still gets followed up manually — nothing about the current lead capture breaks.

Supersedes the earlier `CHECKOUT-PLAN.md` (which jumps straight from the lead form to a Stripe Elements page). This version adds a design + destination-URL step in between.

## The new flow (three pages)

```
Page 1: Lead form          Page 2: Design + Destination        Page 3: Stripe Checkout
(home, blog, /order)   →   (replaces /thank-you.html)    →     (Stripe-hosted)

name, church,              pick 1 of 3 designs or "upload       preloaded quantity
plates, email,             my own" + enter giving URL or        preloaded discount
phone                      use tap.giving landing page          card / Apple Pay / G Pay
                                                                shipping address
                                                                place order

                           → if user drops off here,
                             lead is already captured
                             from Page 1 submit
```

Success page after Stripe → `/order-confirmed.html` (already exists).

## Page 1 — Lead form (small tweaks)

Form already lives in `order.html` (and homepage/blog embeds) and submits via `handleCheckout()` around `order.html:472`.

Changes:
1. Add a separate `name` field (currently only `church_name`, `email`, `phone`, `quantity`). User confirmed name should be collected.
2. Keep the existing Formspree `sendBeacon` + `/api/autoreply` calls exactly as they are — that's how we still get the lead if the user abandons later.
3. Replace `window.location.href = '/thank-you.html'` with a redirect to the new Page 2 (e.g. `/design.html`), passing the lead data via `sessionStorage` (primary) and URL query params (fallback, useful if they share the link).

```js
sessionStorage.setItem('leadData', JSON.stringify({
  name, church, email, phone, quantity
}));
window.location.href = '/design.html';
```

## Page 2 — Design + Destination (`/design.html`)

New page that replaces the "we'll follow up" dead-end. Single scroll, two sections, one Continue button.

Section A — **Pick your design**
- Four tiles in a responsive grid:
  1. Design 1 (image in `/assets/`)
  2. Design 2
  3. Design 3
  4. "Upload my own artwork" (no upload widget here — we collect the file later; selecting this just records their intent)
- Click-to-select behavior, selected tile highlighted, value stored in a hidden input.

Section B — **Where should the plate link to?**
- Radio choice:
  - "Use my own giving URL" → reveals a text input for the URL.
  - "Use a tap.giving landing page" → shows a one-line example (e.g. `tap.giving/yourchurch`) and a slug input that previews the final URL. Validation: lowercase, no spaces.
- Short helper copy: "You can change this later."

Footer:
- Order summary chip on the right (quantity + name prefilled, read-only).
- "Continue to checkout" button → calls our Worker to create a Stripe Checkout Session, then `window.location.href = session.url`.
- Optional explainer video slot at the top ("Watch a 60-second overview") — leave a div + TODO, don't block launch on it.

Data carried forward: everything from Page 1 plus `designChoice` (`design-1` | `design-2` | `design-3` | `custom-upload`) and `destination` (either `{type: 'own', url}` or `{type: 'landing', slug}`).

## Page 3 — Stripe Checkout (hosted)

Recommendation: use **Stripe Checkout Sessions** (Stripe-hosted page), not embedded Elements. Simpler for a static site, handles card + Apple Pay + Google Pay + shipping address collection out of the box, and accepts a coupon for the preloaded discount.

Flow:
1. Page 2's Continue button `POST`s to our Cloudflare Worker at `/api/create-checkout-session`.
2. Worker creates a `checkout.session` with:
   - `line_items`: one item, our NFC Plate price, `quantity` from the lead form.
   - `discounts`: `[{ coupon: LEAD_DISCOUNT_COUPON_ID }]` for the preloaded discount (create one coupon in Stripe, store its ID as a Worker secret).
   - `customer_email`: prefilled from Page 1.
   - `shipping_address_collection`: US only to start.
   - `metadata`: `{ name, church, phone, quantity, designChoice, destinationType, destinationValue }` so everything needed to fulfill lands in Stripe.
   - `success_url`: `https://tap.giving/order-confirmed.html?session_id={CHECKOUT_SESSION_ID}`.
   - `cancel_url`: `https://tap.giving/design.html` (so they land back where they were).
3. Worker returns `{ url }`. Page 2 redirects to it.
4. Stripe hosts the card / address / Apple-Pay / Google-Pay UI. No Stripe keys touch our static site.

Pricing: reuse the tiers already in `CHECKOUT-PLAN.md` (100–199 @ $4.50, 200–399 @ $4.00, 400+ @ $3.50). The Worker computes the unit amount from the quantity and builds the line item with that price in cents.

## Lead capture resilience

- Formspree beacon + `/api/autoreply` email fire on Page 1 submit, before any redirect. So any drop-off from Page 2 or Page 3 still leaves Ryan with a real lead to follow up on.
- Add a GA event on each step (`lead_submitted`, `design_selected`, `checkout_started`, `checkout_completed`) so we can see where people fall off.

## Worker endpoints to add

Extend the existing Cloudflare Worker at `worker/tap-autoreply/` (or split into a second worker — either is fine):

| Route | Method | Purpose |
|---|---|---|
| `/api/create-checkout-session` | POST | Creates Stripe Checkout Session, returns `url` |
| `/api/stripe-webhook` | POST | Handles `checkout.session.completed` → email Ryan the full order details (metadata included) |

Secrets to add to the Worker: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LEAD_DISCOUNT_COUPON_ID`.

## Files to create / modify

| File | Action |
|---|---|
| `order.html` (and any other lead form embeds) | Add `name` input; change redirect target to `/design.html`; keep existing Formspree + autoreply calls |
| `index.html` | Same form changes if the form is embedded on home |
| `blog/*.html` | If the form is embedded in blog posts, same changes (or make it a shared snippet) |
| `/design.html` | **New** — design picker + destination URL + continue button |
| `/thank-you.html` | Keep as fallback for users who complete the form but have JS disabled |
| `/order-confirmed.html` | Already exists; reads `session_id` from URL and shows a confirmation summary |
| `worker/tap-autoreply/src/index.ts` | Add `/api/create-checkout-session` and `/api/stripe-webhook` routes |
| `.env.example` | Document new Stripe env vars |

## Build order (smallest useful slices first)

1. Add `name` field to lead form and redirect to a placeholder `/design.html`.
2. Build `/design.html` UI (design tiles + destination section) with data read from `sessionStorage`. Continue button is a no-op.
3. Create the Stripe product + coupon in the Stripe dashboard.
4. Add Worker route `/api/create-checkout-session`; wire Page 2's Continue button to it.
5. Add Worker route `/api/stripe-webhook`; hook up email notification on `checkout.session.completed`.
6. Update `/order-confirmed.html` to fetch and show the completed session summary by `session_id`.
7. (Later) artwork upload flow for users who picked "upload my own artwork" — can be a post-checkout email link to a simple upload page.
8. (Later) explainer video on `/design.html`.

## Open questions

- [ ] What are the three stock designs? Need final art assets + filenames.
- [ ] Exact discount amount / type for the preloaded coupon (percent vs flat, expires?).
- [ ] Is the giving URL required at checkout or can it stay blank and be collected later?
- [ ] Artwork upload — do it now on Page 2, or email them a link after checkout? (Plan assumes: later.)
- [ ] Shipping: US-only at launch, or international?
- [ ] Max plate quantity cap?
