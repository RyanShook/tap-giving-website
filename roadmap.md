# Tap.Giving Roadmap

*Updated March 26, 2026*

---

## Where We Are Today (March 2026)

5 orders shipped (~750 plates), 4 paying customers outside our own church. Revenue ~$4,125, cost ~$1,560, gross margin ~62%. All operations are manual — Ryan handles lead follow-up, order placement with ZBTech, artwork coordination, and customer communication solo. Site is live at tap.giving with 36 blog posts, Stripe Payment Links for checkout, and Formspree for lead capture.

Conversion rate from lead to customer is approximately 44% (4 of 9 tracked leads), but sample size is small and most customers came through personal network, not inbound.

---

## Now (March-April 2026) — Fix the Bottlenecks

**Goal:** Stop losing leads and reduce manual work per order.

- **Follow up on stale leads.** New Covenant Worship Center (submitted February 25, 2026) has had zero follow-up. Alena Johnson at Engaging Heaven (Madeira Beach, FL) went cold after asking for a mockup in February 2026. Both are recoverable.
- **Standardize the order intake process.** Every order currently requires Ryan to manually relay artwork, URLs, shipping addresses, and invoice numbers between the customer and ZBTech. Document a repeatable checklist so nothing gets missed.
- **Solve the vector artwork problem.** Every single order has had friction around file formats. ZBTech needs vectors; churches send PNGs. Options: create a Canva template customers can use, offer to convert artwork for a fee, or build a simple design tool into the site.
- **Set up email automation.** At minimum, an auto-reply after Formspree submission confirming receipt and setting expectations. Ideally a 3-email nurture sequence: acknowledgment, follow-up with pricing/FAQ, and a check-in if no response after 7 days.
- **CRM discipline.** Use the CRM spreadsheet (Tap.Giving CRM.xlsx) to track every lead, order, and customer. Update it after every interaction.

---

## Q2 2026 (April-June) — Get to 10 Paying Customers

**Goal:** Prove repeatable demand beyond personal network.

- **Ask for referrals.** David Dyck at Encounter the Lord is a happy customer with install photos. Ask him to refer other churches in the Lubbock area. Same with Josh Honeycutt and Nathan Ayala once their orders deliver.
- **Collect and publish testimonials.** David already sent install photos and video. Get a written quote. Add real customer proof to the homepage — this is the single highest-leverage site change.
- **Solve Canada shipping.** We lost the Unionville Alliance Church lead because the site didn't support Canadian addresses. ZBTech charges $50 extra for Canada. Either add a Canada surcharge to pricing or explicitly support it on the order form.
- **Launch 2-3 more competitor landing pages.** Pushpay and Tithely pages exist. Add pages for Givelify, Subsplash, and Donorbox — these are high-intent SEO targets.
- **Improve the checkout flow.** Current flow redirects to Stripe Payment Links which is clunky. Reference CHECKOUT-PLAN.md and build embedded Stripe Elements checkout so customers don't leave the site.
- **Canva artwork template.** Create a branded Canva template (4" circle, 3mm bleed) that churches can customize themselves. Reduces back-and-forth and vector conversion issues.
- **Track where leads come from.** Add UTM parameters to all links. Set up GA4 goals for form submissions. Need to know if blog SEO is actually driving leads.

---

## Q3 2026 (July-September) — Scale Acquisition

**Goal:** Consistent inbound leads without relying on personal network.

- **Church conference presence.** Identify 2-3 regional church tech or leadership conferences to attend or sponsor. Even a small booth with demo plates and a QR code to the site.
- **Paid ads (test).** Small budget Google Ads campaign targeting "NFC giving for churches," "tap to give plates," and competitor brand terms. Test with $500-$1,000 to see if unit economics work.
- **Referral program.** Formalize it — offer a discount or credit for churches that refer another church that orders. Track in CRM.
- **Case studies.** Write up 2-3 detailed case studies with real numbers (if customers consent). Encounter the Lord is the best candidate — they went from inquiry to installed in under 3 weeks.
- **Automated onboarding emails.** After payment, automatically send: order confirmation with timeline, artwork requirements and Canva template link, mounting guide, and follow-up check-in 2 weeks after delivery.
- **Re-engage cold leads.** Build an email campaign specifically for leads that went cold. New angle, new social proof, maybe a limited-time offer.

---

## Q4 2026 (October-December) — Operational Maturity

**Goal:** Ryan should not be the bottleneck on every order.

- **Order management system.** Whether it's a simple dashboard, Airtable, or a lightweight app — need a way to track orders from payment through delivery without manual WhatsApp coordination.
- **Customer portal (basic).** Even a simple page where customers can check order status, view their proof, and access mounting guides.
- **Analytics dashboard for churches.** This was on the original roadmap and it's a real differentiator. Even basic tap counts per plate would be valuable.
- **Evaluate pricing.** With more data, revisit whether $4.50/$4.00/$3.50 per plate is optimal. Current margins are healthy (50-67%). Could we charge more? Should we offer a smaller minimum order (50 plates) for small churches?
- **Holiday push.** Christmas Eve and Easter are the two biggest giving Sundays. Run a targeted campaign in October for churches to order plates in time for Christmas Eve services.

---

## 2027 — Growth

**Goal:** Get to $50K+ in annual revenue and explore recurring revenue.

- **Recurring revenue model.** Consider a "reorder" or "replenishment" service. Plates wear out, churches grow, new campuses open. Make reordering frictionless.
- **Managed landing pages.** The my.tap.giving/@church landing pages are a potential recurring revenue stream. Charge a small monthly fee for hosted, customizable giving pages.
- **Second supplier.** ZBTech is great but having a single supplier in Shenzhen is a risk. Identify a backup manufacturer, ideally domestic for faster turnaround.
- **Partnerships.** Approach Tithely, Planning Center, or Breeze about a co-marketing partnership. We send them users, they recommend our hardware.
- **Hire help.** If volume justifies it, bring on a part-time person to handle order coordination and customer support.

---

## What We Are NOT Doing

Keeping this list explicit so we don't get distracted:

- **Building a payment processing platform.** We sell hardware. We are not competing with Stripe, Tithely, or Pushpay on payments.
- **Building a mobile app.** Not justified at this scale.
- **Offering free samples.** Margins don't support it, and it attracted tire-kickers (see Canada lead). The product sells itself once installed.
- **Chasing enterprise deals.** Focus on churches with 100-500 seats. Megachurches have procurement processes we can't support yet.
- **Over-engineering the site.** Static HTML works. It's fast, it converts. No React, no CMS, no database until there's a real reason.

---

## Success Metrics

| Metric | Current (March 2026) | Q2 Target | Q4 Target |
|--------|---------------------|-----------|-----------|
| Total customers | 4 | 10 | 25 |
| Total plates sold | 750 | 2,000 | 5,000 |
| Revenue (cumulative) | ~$4,125 | $10,000 | $25,000 |
| Leads per month | ~2 | 5 | 10 |
| Lead-to-customer conversion | ~44% | 30%+ | 30%+ |
| Avg order value | ~$550 | $600 | $600 |
| Time from lead to order | varies | <7 days | <5 days |

*Note: Conversion rate will likely drop as we move beyond personal network to inbound leads. 30% is a realistic target for warm inbound.*

---

*Last updated: March 26, 2026*
