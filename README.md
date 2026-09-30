# BLK_MAJESTY Shopify theme

Black-and-white Shopify theme for BLK_MAJESTY, with a bundle-picker product page for the High-Waist Shaping Briefs.

## Install

Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub** → pick this repository and branch.
Shopify creates an unpublished theme that stays in sync with the branch. Preview it with **Customize**, then **Publish**.

## Templates

- `product.json` — standard product page (all products by default): gallery, option pickers, add to bag.
- `product.shapewear.json` — shaping-briefs page: bundle picker (2/4/6 items, a size and color per item),
  image strip, detail sections, reviews and FAQ. Assign it to a product under **Theme template** on the product page in admin.
- `index.json` — home page: hero, featured collection, detail sections, contact form.
- Collection, cart, search, pages, contact page, blog, article, 404, password and gift card templates.

## Bundle prices

The bundle blocks show price **labels** (for example "$39.90"); they don't change the checkout price.
Create matching **automatic discounts** in Shopify admin → Discounts so checkout charges the same amount.

## Editing

Everything visible is editable in the theme editor: announcement bar, header menu (`main-menu`), footer menu (`footer`),
hero text and image, bundle blocks, FAQ questions, reviews (add one block per real review — the section is hidden until then).
Built-in product photos in `assets/blkm-*.webp` are used as fallbacks until you pick images in the editor or add product media.

## Files

- `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/` — the theme.
- `assets/blkm.css`, `assets/blkm.js` — styles and behavior (cart drawer uses Shopify's Ajax cart API).
- `sections/blk-majesty-storefront.liquid` — earlier streetwear storefront section; add it from the theme editor if wanted.
- `.preview/` — the original static HTML mock-up (open `.preview/index.html` locally). Not part of the theme.
