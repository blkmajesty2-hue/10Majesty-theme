// Renders sections/coverless-duvet.liquid into a static preview page (preview/index.html)
// using the schema defaults and the store's "Majesty EasyRest™ Duvet" product data.
// Checkout is disabled in the preview (data-demo="true").
//
//   cd preview && npm install && npm run build

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Liquid, Hash } from 'liquidjs';

const here = dirname(fileURLToPath(import.meta.url));
const sectionPath = join(here, '..', 'sections', 'coverless-duvet.liquid');
const source = readFileSync(sectionPath, 'utf8');

/* ── Product data (from the Shopify store) ── */
const CDN = 'https://cdn.shopify.com/s/files/1/0764/2696/9312/files/';
const mediaFiles = [
  [46416840294624, 'hf_20260606_091141_1a894939-d499-44b6-b51d-5203212869e0.png?v=1792699007', ''],
  [46416840327392, 'hf_20260903_072041_8f7fa525-e7d7-4754-b66c-2fccf3e38e30_min.webp?v=1792699007', ''],
  [46416840360160, 'hf_20260625_170758_3fed2d98-36c6-410b-8506-ea0a3ef5127a.png?v=1792699008', ''],
  [46416840392928, 'hf_20260525_111302_e8d79ba1-84c4-48fb-84fe-9f179de45697.jpg?v=1792699007', ''],
  [46416840425696, 'hf_20260625_170826_25818e94-1c06-42e8-a265-af1cc14f638c.png?v=1792699009', ''],
  [46416840458464, 'hf_20260625_171755_45ca50b3-4cf8-4ad1-83c8-7ab669c7d538.png?v=1792699009', ''],
  [46416840491232, 'hf_20260625_170846_85a23c64-f14d-4751-b784-2e57d5d60be0.png?v=1792699008', ''],
  [46416840524000, '12.webp?v=1792699008', ''],
  [46416840556768, 'hf_20260606_091134_ff0dc19a-9c5c-4316-bb94-123b94c60001.png?v=1792699008', ''],
  [46416840589536, '14.webp?v=1792699008', ''],
  [46416840622304, '16.webp?v=1792699007', ''],
  [46416840655072, '20.webp?v=1792699008', ''],
  [46416840687840, '22.webp?v=1792699008', ''],
  [46416840720608, 'WhatsApp_Image_2026-08-03_at_10.03.04_PM_1_7708b21e-c912-4a16-8c96-5430979e5de3.jpg?v=1792699008', 'Pleene EasyRest Comforter in Cloud White, overhead view on a made bed'],
  [46416840753376, '1_a9ae8f24-16fd-4b68-8476-05b5d42cbeed.jpg?v=1792699007', 'Pleene EasyRest Comforter in Cocoa Brown, overhead view on a made bed'],
  [46416840786144, 'hf_20260830_091859_min_b3ceb675-c311-4cc5-9cd2-e4c1f5c774eb.webp?v=1792699008', 'Pleene EasyRest Comforter in Lavender Mist, overhead view on a made bed'],
  [46416781017312, 'hf_20260625_170733_538ae0ce-dde8-4b45-b10b-dd65325377c9.webp?v=1792698614', '']
];
const media = mediaFiles.map(([id, file, alt]) => {
  const image = { src: CDN + file, alt, width: 1600, height: 1600 };
  return { id, alt, media_type: 'image', preview_image: image };
});
const mediaById = Object.fromEntries(media.map((m) => [m.id, m]));

const colors = [
  ['Coastal Blue', 46416840294624], ['Hearth Red', 46416840655072], ['Sunset Glow', 46416840687840],
  ['Soft Mint Green', 46416840556768], ['Cream Beige', 46416840524000], ['Midnight Black', 46416840589536],
  ['Moonstone Gray', 46416840622304], ['Cloud White', 46416840720608], ['Cocoa Brown', 46416840753376],
  ['Lavender Mist', 46416840786144]
];
const sizes = ['Single (55 × 79 in)', 'Twin (63 × 83 in)', 'Full (79 × 79 in)', 'Queen (91 × 91 in)', 'King (102 × 86 in)'];

let variantId = 68103732855008;
const variants = [];
for (const [color, mediaId] of colors) {
  for (const size of sizes) {
    const fm = mediaById[mediaId];
    variants.push({
      id: variantId,
      title: `${color} / ${size}`,
      option1: color,
      option2: size,
      option3: null,
      options: [color, size],
      price: 11999,
      compare_at_price: 13999,
      available: true,
      featured_media: { id: fm.id, alt: fm.alt, preview_image: fm.preview_image }
    });
    variantId += 32768;
  }
}

const queen = variants.find((v) => v.title === 'Coastal Blue / Queen (91 × 91 in)');
const product = {
  id: 15487164252384,
  title: 'Majesty EasyRest™ Duvet',
  handle: 'pleene-easyrest™-duvet',
  url: '/products/pleene-easyrest-duvet',
  media,
  featured_media: media[0],
  variants,
  has_only_default_variant: false,
  selected_or_first_available_variant: queen,
  options_with_values: [
    { name: 'Color', position: 1, values: colors.map((c) => c[0]) },
    { name: 'Size', position: 2, values: sizes }
  ],
  metafields: { reviews: {} }
};

/* ── Section settings & blocks from the schema ── */
const schema = JSON.parse(source.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/)[1]);
const settings = {};
for (const s of schema.settings) if (s.id) settings[s.id] = s.default ?? null;
const blockDefaults = Object.fromEntries(
  schema.blocks.map((b) => [b.type, Object.fromEntries((b.settings || []).filter((s) => s.id).map((s) => [s.id, s.default ?? null]))])
);
const blocks = schema.presets[0].blocks.map((b, i) => ({
  id: `block-${i}`,
  type: b.type,
  shopify_attributes: '',
  settings: { ...blockDefaults[b.type], ...b.settings }
}));

/* ── Liquid engine with the Shopify pieces this section uses ── */
const engine = new Liquid({ strictFilters: true, ownPropertyOnly: false });

const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

engine.registerFilter('image_url', (img, ...args) => {
  if (!img) return '';
  const src = typeof img === 'string' ? img : img.src;
  const { width } = kw(args);
  return width ? `${src}${src.includes('?') ? '&' : '?'}width=${width}` : src;
});
engine.registerFilter('image_tag', (url, ...args) => {
  const o = kw(args);
  const base = String(url).replace(/[?&]width=\d+/, '');
  const join = base.includes('?') ? '&' : '?';
  const srcset = o.widths
    ? String(o.widths).split(',').map((w) => `${base}${join}width=${w.trim()} ${w.trim()}w`).join(', ')
    : '';
  const attrs = [
    `src="${esc(url)}"`,
    srcset && `srcset="${esc(srcset)}"`,
    o.sizes && `sizes="${esc(o.sizes)}"`,
    `alt="${esc(o.alt ?? '')}"`,
    o.class && `class="${esc(o.class)}"`,
    o.id && `id="${esc(o.id)}"`,
    `loading="${esc(o.loading || 'lazy')}"`,
    o.fetchpriority && `fetchpriority="${esc(o.fetchpriority)}"`
  ].filter(Boolean);
  return `<img ${attrs.join(' ')}>`;
});
engine.registerFilter('money', (cents) => '$' + (Number(cents || 0) / 100).toFixed(2));
engine.registerFilter('handleize', (s) =>
  String(s ?? '').toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
);
engine.registerFilter('placeholder_svg_tag', (name, cls) =>
  `<svg class="${esc(cls)}" viewBox="0 0 525 525" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="525" height="525" fill="none"/></svg>`
);
engine.registerFilter('payment_type_svg_tag', (type) => `<span class="cdv-payment-icon">${esc(type)}</span>`);
engine.registerFilter('default_errors', (e) => String(e ?? ''));

engine.registerTag('schema', {
  parse(token, remainTokens) {
    while (remainTokens.length) {
      const t = remainTokens.shift();
      if (t.name === 'endschema') return;
    }
    throw new Error('schema not closed');
  },
  render() { return ''; }
});

engine.registerTag('form', {
  parse(token, remainTokens) {
    const m = token.args.match(/^\s*'(\w+)'\s*(?:,\s*([\w.]+))?\s*(?:,\s*([\s\S]*))?$/);
    this.formType = m[1];
    const rest = m[3] ?? (m[2] && m[2].includes(':') ? m[2] : '');
    this.hash = new Hash(rest || '');
    this.tpls = [];
    const stream = this.liquid.parser.parseStream(remainTokens)
      .on('tag:endform', () => stream.stop())
      .on('template', (tpl) => this.tpls.push(tpl))
      .on('end', () => { throw new Error('form not closed'); });
    stream.start();
  },
  *render(ctx, emitter) {
    const attrs = yield this.hash.render(ctx);
    const action = this.formType === 'product' ? '/cart/add' : '/contact#contact_form';
    const extra = Object.entries(attrs)
      .map(([k, v]) => (v === '' || v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
      .join('');
    emitter.write(`<form method="post" action="${action}" accept-charset="UTF-8"${extra}>`);
    emitter.write(`<input type="hidden" name="form_type" value="${this.formType}"><input type="hidden" name="utf8" value="✓">`);
    ctx.push({ form: { 'posted_successfully?': false, errors: null } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
    emitter.write('</form>');
  }
});

const context = {
  section: { id: 'preview', settings, blocks },
  product,
  shop: {
    name: 'BLK_Majesty',
    currency: 'USD',
    money_format: '${{amount}}',
    enabled_payment_types: [],
    refund_policy: { url: '/policies/refund-policy' },
    shipping_policy: { url: '/policies/shipping-policy' },
    privacy_policy: { url: '/policies/privacy-policy' },
    terms_of_service: { url: '/policies/terms-of-service' }
  },
  cart: { item_count: 0, currency: { iso_code: 'USD' } },
  routes: {
    root_url: '#', cart_url: '#', cart_add_url: '#', search_url: '#', all_products_collection_url: '#'
  },
  request: { design_mode: false, locale: { iso_code: 'en' } },
  linklists: {}
};

let html = await engine.parseAndRender(source, context);
html = html.replace('class="cdv"', 'class="cdv" data-demo="true"');

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Coverless Duvet — Preview</title>
<meta name="robots" content="noindex">
<style>
  body{margin:0;background:#FAF8F4}
  .cdv-preview-flag{margin:0;padding:8px 16px;background:#292929;color:#fff;font:500 13px/1.4 system-ui,sans-serif;text-align:center}
</style>
</head>
<body>
<p class="cdv-preview-flag">Design preview with your store’s product data — checkout is a demo and nothing can be purchased here.</p>
${html}
</body>
</html>
`;
writeFileSync(join(here, 'index.html'), page);
console.log(`Wrote preview/index.html (${(page.length / 1024).toFixed(0)} KB)`);
