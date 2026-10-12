# BLK Majesty – Welcome Flow (Shopify Email + Shopify Flow)

Brand palette (from the site): black `#090909`, off-white `#f1f1ee`, lime accent `#d8ff36`, red `#ff3038`.
Discount code: `WELCOME15` (15% off, already created in Shopify, all customers, no end date).

## Flow setup (Shopify admin → Apps → Flow → Create workflow)

Flow workflows cannot be created through the API, so build this once in the admin:

1. **Trigger:** Customer joined segment / "Customer marketing consent updated" (email → subscribed). Easiest: *Customer created* + condition `email marketing state = subscribed`.
2. **Condition (optional):** customer has 0 orders (keeps this to new leads).
3. **Wait:** 2 hours.
4. **Action:** Send marketing email → *Email 1*.
5. **Wait:** 2 days → Send marketing email → *Email 2*.
6. **Wait:** 3 days → Send marketing email → *Email 3* (add a condition first: skip if customer already ordered).

Create each email in Shopify Email (Marketing → Automations/Campaigns → Shopify Email), save as template, then pick it in the Flow action. The Shopify Email editor is block-based, so paste the copy below into text/button blocks and use the palette above.

## Email 1 – sent 2 hours after signup
**Subject:** Welcome to the family, here's 15% off
**Preview:** Your code is inside.

> Welcome to BLK Majesty.
>
> You're in. We make [one line about the brand/products] and we're glad you're here.
>
> Here's 15% off your first order: **WELCOME15**
>
> [Button: SHOP NEW ARRIVALS → /collections/all]
>
> Free shipping details / returns line here.
>
> – The BLK Majesty team

## Email 2 – sent 2 days later
**Subject:** What everyone's wearing right now
**Preview:** Our best sellers, picked for you.

> Our best sellers
>
> [Product block: 3 best-selling products]
>
> Your 15% off code **WELCOME15** is still waiting.
>
> [Button: SHOP BEST SELLERS → /collections/all?sort_by=best-selling]

## Email 3 – sent 3 days after Email 2 (skip if they ordered)
**Subject:** Your 15% off ends soon
**Preview:** Last call for WELCOME15.

> Quick reminder: **WELCOME15** expires on [date].
>
> [Product block: 1–2 featured products]
>
> [Button: USE MY 15% OFF → /]
>
> Questions? Just reply to this email.

## Before launch checklist
- [x] Discount WELCOME15 created in Shopify.
- [ ] Fill in the brand one-liner, shipping/returns line, and sender name/address in Shopify Email settings.
- [ ] Send a test to yourself from Flow before turning it on.
- [ ] Signup form (newsletter section/popup) on the site collects consent – required for marketing emails.
