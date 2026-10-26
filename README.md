# Coverless duvet page

| File | What it is |
| --- | --- |
| `sections/coverless-duvet.liquid` | Shopify section. Add it to your theme's `sections/` folder, then add **Coverless Duvet Page** to your product template in the theme editor. Uses your real variants, prices and cart. Everything is editable in the editor. |
| `site/index.html` | Standalone website (one file: HTML, CSS and JavaScript). Open it or host it anywhere. **Add to Bag** sends shoppers to your store's cart at blkmajesty.shop. |
| `preview/index.html` | Design preview with checkout disabled. |
| `preview/render.mjs` | Rebuilds `site/` and `preview/` from the section: `cd preview && npm install && npm run build`. |

Reviews and videos marked “Sample” in `site/` and `preview/` are placeholders. On the
Shopify section, review and video areas appear only once real Review / Customer video
blocks or a review app block are added.

`index.html` at the repository root is the earlier BLK_MAJESTY streetwear section.
