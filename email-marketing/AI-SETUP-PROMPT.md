# Prompt for an AI assistant: set up the BLK Majesty welcome email automation

Copy everything below the line and give it to the AI (for example Shopify Sidekick). Fill the 4 items marked **FILL IN** first.

---

You are helping me set up an automated welcome email series in my Shopify store (blkmajesty.shop, store handle e8bp1v-5b). Work step by step. After each step, tell me what you did and wait for me to say "next". Do not turn anything on or send anything to customers until I explicitly say so.

## Facts
- Store: BLK_Majesty, Shopify Basic, currency USD. The store also has a Swedish version (/sv-se/).
- Hero product: High-Waist Shaping Briefs, URL https://blkmajesty.shop/products/culotte-post-patrum, price $39.99, sizes S to 6XL, 7 colors (black, beige, navy blue, royal blue, plum, fuchsia pink, lilac).
- Discount code WELCOME15 already exists: 15% off, one use per customer, no end date. Do not create another one.
- Sender email: contact@blkmajesty.com (domain is authenticated). DMARC is not set up yet.
- Existing segment "Email subscribers" (email_subscription_status = SUBSCRIBED) exists. Use it.
- Brand look: black (#101010), white, light grey (#f3f3f3), Poppins font. Simple, bold, minimal.
- **FILL IN** Sender name: [e.g. BLK Majesty]
- **FILL IN** One-line brand description: [one sentence]
- **FILL IN** Shipping and returns policy: [e.g. free shipping over $60, 30-day returns]
- **FILL IN** Code expiry date: [date or "none"]

## Rules
1. Do not claim medical, health or post-partum recovery benefits. The product is a shaping garment worn under clothes, not a medical or post-surgical garment.
2. Do not invent reviews, ratings, shipping or returns facts. Use only what I gave above.
3. Do not use Growth > Autopilot. It spends money on ads. I do not want it.
4. Do not click "Turn on workflow" or send any campaign until I say so.
5. Do not email existing customers. Only new subscribers should receive this series.

## Step 1: Find or install Shopify Email
- Search the admin for "Shopify Email". If it is not installed, install the free Shopify Email app from the Shopify App Store.
- Open it and confirm I can create an email. Tell me what you see.

## Step 2: Check sender settings
- Settings > Notifications: confirm the sender email is contact@blkmajesty.com and domain authentication shows "Authenticated".
- Open "DMARC record setup > View steps" and tell me the DNS record I need to add. Do not change DNS yourself.
- In Shopify Email settings, check the sender name, logo and the footer address. Report anything missing.

## Step 3: Create the three emails in Shopify Email (save each as a draft, do not send)
Use a simple template: white background, black headline block, one black button, Poppins if available.

### Email 1 (name: "Welcome 1 – 2h")
Subject: Welcome to the family, here's 15% off
Preview text: Your code is inside.
Body:
- Headline: Welcome to BLK Majesty.
- Text: You're in. [one-line brand description]
- Text: Here's 15% off your first order: WELCOME15
- Product block: High-Waist Shaping Briefs, $39.99 (add the product from the store).
- Button: SHOP THE BRIEFS, link https://blkmajesty.shop/products/culotte-post-patrum
- Text: [shipping and returns policy]
- Sign-off: The BLK Majesty team

### Email 2 (name: "Welcome 2 – day 2")
Subject: Shaping you stop noticing
Preview text: Seamless, high-waisted, S to 6XL.
Body:
- Headline: Meet the High-Waist Shaping Briefs
- Bullets:
  - Crossed X-band: 360 degree support, not just across the front
  - Doesn't roll: the crossover holds the waistband flat all day
  - Lifted shape: the high-rise back panel rounds and lifts
  - Invisible: seamless edges and nude tones, no visible lines under clothes
  - Breathable cotton gusset: comfortable all day, sizes S to 6XL
- Text: Your 15% off code WELCOME15 is still waiting.
- Button: FIND YOUR SIZE, link to the size guide page if one exists, otherwise the product page.

### Email 3 (name: "Welcome 3 – day 5")
Subject: Your 15% off ends soon (if there is no expiry date, use: Your 15% off is still waiting)
Preview text: Last call for WELCOME15.
Body:
- Text: Quick reminder: WELCOME15 [expires on <date>, or just "is still waiting for you"].
- Text: Sizes S to 6XL. 7 colors: black, beige, navy blue, royal blue, plum, fuchsia pink, lilac.
- Button: USE WELCOME15, link https://blkmajesty.shop/products/culotte-post-patrum
- Text: Questions? Just reply to this email.

For each email: send a test to my own email address only, and confirm the code, product link and button link look right.

## Step 4: Build the Shopify Flow workflow
A draft workflow already exists in Apps > Flow: "New Workflow". Open it and continue (do not create a duplicate).
1. Trigger: "Customer joined segment", segment "Email subscribers" (already set).
2. Wait 2 hours (already set).
3. Action: "Send marketing email" > Welcome 1.
4. Wait 2 days.
5. Action: "Send marketing email" > Welcome 2.
6. Wait 3 days.
7. Condition: the customer has not placed an order. If true, Action: "Send marketing email" > Welcome 3. If false, end.
8. Rename the workflow "Welcome series – WELCOME15".
Save the draft. Do NOT turn it on yet.

## Step 5: Signup form check
- Find which form or popup collects emails on the store. There is an "Ecomsend" segment (tag "EcomSend Popups"), which suggests a popup app may exist. Report which app collects signups.
- Confirm it asks for email marketing consent and adds people to "Email subscribers". Report any problem.

## Step 6: Test before launch
- Use a spare email address to subscribe through the store's signup form.
- Confirm the customer appears in the "Email subscribers" segment and that the workflow run shows in Flow's run history.
- For a quick test only, temporarily set Wait 1 to 1 minute, confirm Email 1 arrives with the right code and links, then set it back to 2 hours.

## Step 7: Go live (only when I say "go live")
- Confirm: all three emails have no [placeholders], links work, code works at checkout, test emails look right on mobile.
- Then click "Turn on workflow".
- A week later, report: emails sent, opens, clicks, and orders that used WELCOME15.

## Final report format
After each step, reply with: what you did, what you could not do, anything I must do myself (for example DNS), and what you need from me.
