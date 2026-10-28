# Market Finder run: coverless duvet (28 Oct 2026)

The Market Finder prompt, run on BLK_MAJESTY's coverless 2-in-1 duvet.
Sources: Shopify Admin (blkmajesty.shop) and the Brandsearch ad-spy tool (EU/UK ad transparency data).
All revenue and spend numbers are **estimates** from Brandsearch. Exchange rates are the tool's own conversions
(about 1 GBP = 1.27 USD, 1 EUR = 1.08 USD, 1 SEK = 0.095 USD).

---

## 0. Restated inputs (from Shopify)

| Item | Value | Source |
|---|---|---|
| Product | "Majesty EasyRest™ Duvet": coverless, machine-washable 2-in-1 duvet, 5 colours × 5 sizes | Shopify, product 15487164252384 (ACTIVE) |
| Price now | $79.89 (Single) to $114.17 (King); compare-at $102.74–$137.03 | Shopify |
| NL version | "Majesty CloudRest 2-in-1 Dekbed", $69.99–$119.99, **DRAFT** | Shopify |
| Landed cost per unit | **not found** (unit cost is empty on every variant) | Shopify |
| Shipping charged | Free, or "Standard" $5.99, in every zone | Shopify delivery profiles |
| Real shipping cost per order | **not found** | n/a |
| Markets live | US, CA, AU, NZ, UK (GBP), Sweden (SEK, `/se`, Swedish locale), Netherlands (EUR, `/nl`, Dutch locale), Europe (EUR: BE, DE, IE, FR, NL, ES, IT, AT, PT, LU, FI) | Shopify markets |

Margin math cannot be finished until landed cost and real shipping cost are known (see section 5).

---

## 1. Summary

1. **United Kingdom: 46/70.** The strongest proof. Pleene.com has run 1,297 Meta ads, all targeting GB (EU spend estimate about €95K). There is no translation work. It is also the most crowded market, and **our live listings use the Pleene name** (see blockers).
2. **Sweden: 45/70.** The leading country by reach for the clone "EasySleep 2-in-1" market (39% of reach). Sellers there are small dropship stores with no strong local brand. The Swedish storefront is already set up. Market ad spend fell sharply in the last week.
3. **Netherlands: 44/70.** Easy to launch: the Dutch page is built and nobody dominates. But proof is weak: the multi-seller market reaches NL at 0.0%, and local sellers sell cheap velvet versions at €20–70. It fails the "proof ≥ 3" rule.

France (37) has strong demand, but one brand (Les Dormeurs) dominates it at a low price. Germany (35) is unproven.

**Pick: UK first, Sweden as backup**, but only after the two blockers below are fixed.

### Blockers found in the live store (fix before any test)

- **Brand name.** 5 active products carry vendor "Pleene" and titles such as "Pleene EasyRest™ 2in1 Duvet". The main product's URL handle is `pleene-easyrest™-duvet`. Pleene is a real competitor with ad pages and stores (pleene.com, pleene.uk), and it advertises heavily in the UK. Selling under its name is a trademark and passing-off risk, and it can get ads rejected. Rename the products, the vendor and the handle (with a redirect), and archive the duplicate Pleene listings.
- **Compare-at prices.** The main product shows $102.74–$137.03 as a "was" price. UK (DMCC Act / CPRs) and EU (Omnibus price rule: lowest price in the last 30 days) rules only allow a "was" price you actually charged. Remove it unless you can prove it.

---

## 2. Scorecard

Score 0–5, multiplied by the weight. Max 70.

| Criterion (weight) | UK | Sweden | Netherlands | France | Germany |
|---|---|---|---|---|---|
| Proof of demand (×3) | 5 → **15** | 4 → **12** | 2 → **6** | 5 → **15** | 1 → **3** |
| Gap in competition (×3) | 2 → **6** | 3 → **9** | 4 → **12** | 2 → **6** | 4 → **12** |
| Price room (×2) | 3 → **6** | 3 → **6** | 2 → **4** | 2 → **4** | 3 → **6** |
| Effort to launch (×2) | 5 → **10** | 3 → **6** | 5 → **10** | 2 → **4** | 2 → **4** |
| Delivery and risk (×2) | 2 → **4** | 3 → **6** | 3 → **6** | 2 → **4** | 2 → **4** |
| Audience fit (×1) | 3 → **3** | 3 → **3** | 2 → **2** | 3 → **3** | 2 → **2** |
| Ad cost and saturation (×1) | 2 → **2** | 3 → **3** | 4 → **4** | 1 → **1** | 4 → **4** |
| **Total** | **46** | **45** | **44** | **37** | **35** |
| Class | CROWDED / PROVEN | PROVEN | UNPROVEN | CROWDED | UNPROVEN |
| Confidence | Medium | Medium-low | Medium | Medium | Low |

Why each score:

- **UK.** Proof is 5: Pleene.com has 1,297 ads, all GB, and Dolcenida has 643 ads, mostly GB. Gap is 2: Pleene is scaling and dominant, and 7 new sellers joined the market in 30 days. Delivery is 2: real UK delivery time is not known, and a non-UK seller needs UK VAT registration for orders of £135 or less.
- **Sweden.** Proof is 4: Sweden takes 39% of market reach, nordiskafilthuset.se has 33 active ads, and sister stores run in FI, DK and NO. Gap is 3: the sellers are clones of the same product with no real brand. Effort is 3: the `/se` site exists, but the product page has not been checked for Swedish text.
- **Netherlands.** Proof is 2: dekbed-delivery.nl has 0 active ads, Zumea has 4, and the market reaches NL at 0.0%. Price room is 2: local sellers charge €19.95–€69.99 and we sit at the top of that range.
- **France.** Les Dormeurs has 734 ads (385 active), about $1,100/day estimated spend and $130–180K/month estimated revenue, all since 24 Aug. Its €69.90 price sets a low anchor. A French page is needed.
- **Germany.** Only soft-clouds.de is visible (15 active ads), and the market reaches DE at 0.0%. German text, the LUCID packaging registration and German price rules all add effort.

---

## 3. Evidence

### The 2-in-1 "quick-dry" duvet market (one product, many stores)

Brandsearch market `cosylanehome.com_15856989536581`: 35–39 sellers, 657 active / 1,500 total ads, stage **scaling**, median price $87.57, estimated $75–100K/month for the whole market.
Reach by country (1,110 ads): **SE 39.0%, FR 23.2%, FI 18.6%, DK 9.7%, GB 7.1%**, CZ 1.3%, others under 1%.
Audience: 62.4% women; 65+ = 61%, 55–64 = 24%.
Trend (estimate): advertisers went from 13 to 15 over 60 days. Daily spend fell from about $560 to about $120 on 22 Oct. One week of data is not yet a trend.

| Store | Country focus | Price (USD) | Active / total ads | Since |
|---|---|---|---|---|
| pleene.com | GB (all 1,297 brand ads) | $88.89–95.24 | 75 / 75 on this listing | Aug–Sep 2026 |
| dolcenida.com | GB (449 of 471 geo-tagged ads) | $101.59 | 334 / 642 | 8 Aug 2026 |
| cosylanehome.com | FR ("la couette 2 en 1") | $87.89 | 146 / 351 | 13 May 2026 |
| cozily-shop.com | n/a | $69.99 | 46 / 91 | 15 Jun 2026 |
| nordiskafilthuset.se | SE | 999 (the tool says USD; this is almost certainly 999 SEK ≈ $95) | 33 / 55 | 13 Jul 2026 |
| zayro.fr | FR | $82.99 | 33 / 35 | 1 Sep 2026 |
| nordiskteppehus.no | NO | $101.11 | 31 / 31 | 1 Aug 2026 |
| pohjolanpeittotalo.fi | FI | $97.15 | 24 / 41 | 25 Aug 2026 |
| soft-clouds.de | DE | $80.99 | 15 / 53 | 19 Sep 2026 |
| nordisketaeppehus.dk | DK | $101.35 | 10 / 26 | 24 Jul 2026 |
| pleene.uk | GB | £74.99 ($95.24) | 5 / 5 | 19 Oct 2026 |
| veloryaparis, mama-pop, pratikae (FR) | FR | $80–95 | **0** / 107–273 | stopped |

### Single-brand leaders

| Brand | Product | Price | Ads | Est. revenue | Stage | Audience |
|---|---|---|---|---|---|---|
| lesdormeurs.com (FR) | Couette 2-en-1, entièrement lavable | €69.90 | 734 (385 active), about $1,100/day | $130–180K/mo | emerging (1 seller) | FR 84%, BE 16%; 68% women; 65+ = 49% |
| cloudpillo.com | Coverless Duvet | €125 | 321 (60 active), about $870/day | $100–140K/mo | **declining** | 9 countries |
| finebedding.co.uk (Night Lark) | Coverless duvet sets | £49–90 | 1–3 each, almost none active | under $1K/mo | emerging/declining | UK |
| dekbed-delivery.nl | Dekbed zonder overtrek | €19.95–69.99 | 1–25 each, **0 active** | n/a | declining | NL |
| zumea.nl / sleeptime.nl / ynot-dreambig.nl | Dekbed zonder overtrek | €40–99 | 0–4 active | under $1K/mo | emerging/declining | NL |

Les Dormeurs' offer (from the screenshot of its page): 100-night trial, 2 free pillowcases ("worth €40"), 9 colours, a 4.6 review score and "17,000+ customers". These are their claims, not verified. **Use them for research only. Do not copy the text, images, reviews or numbers.**

---

## 4. What the data cannot tell us

- **US, CA, AU, NZ: unknown.** Brandsearch has no ad-transparency data there. They are not scored.
- Ad-reach shares come from the **market of clone stores**. Pleene.com's brand ads (all GB) do not appear to be fully counted in that market, which is why GB reads only 7.1% there. Treat both numbers as directional.
- Revenue and spend are modelled **estimates**. Read them as big, medium or small.
- The spend drop on 22 Oct (about $560 to about $120/day) could be data noise or a real slowdown. Check again in 1–2 weeks.
- **Finland (18.6% of reach) and Denmark (9.7%)** look proven too. FI is already in your Europe market. They were not scored because they were not on the list, but they are the natural next step after Sweden.
- Landed cost, real shipping cost and supplier delivery time to each country are **not in Shopify**, so margin and "delivery" scores are provisional.
- Meta Ad Library was not browsed by hand in this run. Search interest (Google Trends) was not checked.

---

## 5. Margin check (UK, provisional)

| Line | At £74.99 (match Pleene) | At £64.99 (undercut) |
|---|---|---|
| Price incl. VAT | £74.99 | £64.99 |
| Less UK VAT 20% | −£12.50 | −£10.83 |
| Less payment fees (estimate 5%: cross-border card + currency) | −£3.75 | −£3.25 |
| Less 10% return/refund allowance | −£7.50 | −£6.50 |
| **Left to pay landed cost + shipping + ads** | **£51.24** | **£44.41** |
| Landed cost per unit | **not found** | **not found** |
| Shipping cost per order | **not found** | **not found** |
| **Break-even cost per purchase** | £51.24 − cost − shipping | £44.41 − cost − shipping |

Example only (not your numbers): with a £22 landed cost and £8 shipping, break-even CPA at £74.99 is about £21. Most cold-traffic tests on a £75 product land above that, so the bundle and order value matter.

For Sweden at 999 SEK: 999 / 1.25 VAT = 799 SEK, less about 50 SEK fees and 100 SEK returns, leaves **about 649 SEK (≈ $62)** before cost, shipping and ads.

---

## 6. Launch checklist (UK)

- [ ] **Rename** all "Pleene" products, the vendor and the URL handle. Add a 301 redirect. Archive the 4 duplicate Pleene listings.
- [ ] Remove or justify the compare-at prices.
- [ ] Set the UK price list in GBP. A suggested test price is £69.99–£74.99 for a Double (check against your cost first).
- [ ] Use UK sizes: Single 135×200, Double 200×200, King 225×220, Super King 260×220 (check with the supplier). The live product shows US sizes in inches.
- [ ] UK VAT: register (a non-UK seller must charge UK VAT on orders of £135 or less) and show prices VAT-inclusive.
- [ ] Shipping: set an honest UK delivery time from the supplier's real data. Do not promise faster.
- [ ] Returns: UK law gives a 14-day cancellation right. Any trial (for example 90 nights) must have written, workable terms.
- [ ] Legal pages: refund policy, shipping policy, terms, privacy, and the business identity and address.
- [ ] Reviews: no reviews until real customers leave them. Any placeholder is clearly marked TEST and stays on the draft theme only.
- [ ] Work on a **draft theme** and publish only after checking.

---

## 7. Test plan (UK)

- **Budget and length:** you need to set these. A suggested shape is 7 days with an equal split across 3 angles.
- **Audience:** UK, women and men 45+ (the market skews 55+ and 62–68% women). Broad targeting, no interest stacking.
- **Three angles** (our own wording, no competitor copy):
  1. *The chore:* "No more wrestling a duvet cover. Take it off, wash it, put it back."
  2. *Fresh bed, less work:* the whole duvet goes in the washing machine (only if you have checked the washing instructions and drum size with the supplier).
  3. *Easier for older hands:* no cover means no lifting and stuffing corners. Keep it to what the product does, with no health claims.
- **Measure:** click-through rate, cost per click, add-to-cart rate, checkout rate, cost per purchase.
- **Stop rule:** stop an angle when spend reaches 2× the break-even cost per purchase with no purchase. Stop the whole test if cost per purchase is still above break-even after the fixed budget.
- **Backup:** if the UK fails or the rename can't be done fast, test **Sweden** next (the `/se` storefront exists, and it needs a Swedish product page and a SEK price of about 899–999).

---

## 8. Next question

**What is your landed cost per duvet (by size) and your real shipping cost and delivery time to the UK and Sweden?**
Without these, break-even cost per purchase and the "Go" decision cannot be finished.

---

## Change from the 27 Oct run

The 27 Oct note said Sweden had "nothing relevant found". This run found Sweden is the **top country by ad reach** for the multi-seller 2-in-1 duvet market. The earlier keyword searches in Swedish missed it because the stores use the product name "EasySleep täcke", not "täcke utan påslakan".
The "about 600 active ads" figure for Pleene matches the whole market (657 active), not Pleene UK alone (5 active on pleene.uk; 75 active on the pleene.com comforter listing).
