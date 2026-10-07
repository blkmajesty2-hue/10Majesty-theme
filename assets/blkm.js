// BLK_MAJESTY theme behavior: dialogs, gallery, product forms, bundle picker and the cart drawer.
// Loaded with `defer`; every feature checks for its elements first so it is safe on every page.
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const config = window.blkm || {};
  const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
  // Shopify HTML-escapes translated strings (e.g. ' becomes &#39;); decode them once for use as plain text.
  const decodeEntities = str => { const el = document.createElement('textarea'); el.innerHTML = str; return el.value; };
  const t = Object.fromEntries(Object.entries(config.strings || {}).map(([k, v]) => [k, typeof v === 'string' ? decodeEntities(v) : v]));

  // ---------- Money ----------
  function formatMoney(cents) {
    // Shop format when the shopper pays in the store currency; otherwise their currency's symbol (e.g. £, €).
    const format = config.moneyFormat || ((config.currencySymbol || '$') + '{{amount}}');
    const value = Number(cents) / 100;
    const withDelimiters = (n, decimals, thousands, decimal) => {
      const [whole, frac] = n.toFixed(decimals).split('.');
      return whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + (frac ? decimal + frac : '');
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals': return withDelimiters(value, 0, ',', '.');
        case 'amount_with_comma_separator': return withDelimiters(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return withDelimiters(value, 0, '.', ',');
        case 'amount_with_apostrophe_separator': return withDelimiters(value, 2, "'", '.');
        default: return withDelimiters(value, 2, ',', '.');
      }
    });
  }

  // ---------- Dialogs ----------
  function bindDialogs(scope = document) {
    $$('[data-dialog]', scope).forEach(b => {
      b.addEventListener('click', e => {
        const d = document.getElementById(b.dataset.dialog);
        if (!d) return;
        e.preventDefault();
        if (b.dataset.dialog === 'bag') refreshCart();
        d.showModal();
      });
    });
  }
  bindDialogs();
  $$('dialog').forEach(d => {
    const close = $('.close', d);
    if (close) close.addEventListener('click', () => d.close());
    d.addEventListener('click', e => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('.close-dialog');
    if (b) b.closest('dialog').close();
  });

  // ---------- Gallery ----------
  $$('[data-gallery]').forEach(gallery => {
    const main = $('.main-picture img', gallery);
    const zoom = document.getElementById(gallery.dataset.zoom);
    $$('[data-image]', gallery).forEach(b => {
      b.addEventListener('click', () => {
        main.src = b.dataset.image;
        main.srcset = b.dataset.srcset || '';
        main.alt = b.dataset.alt || main.alt;
        if (zoom) $('img', zoom).src = b.dataset.image;
        $$('[data-image]', gallery).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  });
  function showMedia(gallery, mediaId) {
    if (!gallery || !mediaId) return;
    const thumb = $(`[data-media-id="${mediaId}"]`, gallery);
    if (thumb) thumb.click();
  }

  // ---------- Cart ----------
  const bag = document.getElementById('bag');
  async function fetchCart() {
    const res = await fetch(root + 'cart.js', { headers: { Accept: 'application/json' } });
    return res.json();
  }
  function renderCount(cart) {
    const pid = Number(config.protectionVariant) || null;
    const count = cart.items.reduce((a, i) => a + (pid && i.variant_id === pid ? 0 : i.quantity), 0);
    $$('[data-cart-count]').forEach(el => { el.textContent = count; });
  }
  const protectionId = Number(config.protectionVariant) || null;
  const isProtection = item => protectionId && item.variant_id === protectionId;
  let giftBusy = false, giftBroken = false;
  function renderBag(cart) {
    renderCount(cart);
    // Included mode: protection is free, so a paid protection line (left over from optional
    // mode or added elsewhere) is removed and never charged.
    const paidProtection = cart.items.find(isProtection);
    if (paidProtection && config.protectionMode === 'included') { changeLine(paidProtection.key, 0); return; }
    // Gift mode: keep exactly one protection line in any cart with products; the FREE GIFT automatic
    // discount makes it $0. If that discount is ever missing, remove it rather than charge for it.
    if (config.protectionMode === 'gift' && protectionId && !giftBusy) {
      const hasProducts = cart.items.some(i => !isProtection(i));
      const line = paidProtection;
      if (line && (!hasProducts || line.final_line_price > 0)) {
        if (hasProducts) giftBroken = true;
        giftBusy = true; changeLine(line.key, 0).finally(() => { giftBusy = false; }); return;
      }
      if (line && line.quantity > 1) { giftBusy = true; changeLine(line.key, 1).finally(() => { giftBusy = false; }); return; }
      if (!line && hasProducts && !giftBroken) {
        giftBusy = true;
        fetch(root + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: [{ id: protectionId, quantity: 1 }] }) })
          .then(() => { if (document.body.classList.contains('template-cart')) location.reload(); })
          .catch(() => {}).finally(() => { giftBusy = false; refreshCart(); });
        return;
      }
    }
    if (!bag) return;
    const products = cart.items.filter(i => !isProtection(i));
    const protectionLine = cart.items.find(isProtection);
    // Opt-in only: if the shopper removed every product, drop the protection too.
    if (protectionLine && !products.length) { changeLine(protectionLine.key, 0); return; }
    const toggle = $('[data-protection-toggle]', bag);
    if (toggle) { toggle.checked = !!protectionLine; toggle.disabled = false; }
    const productCount = products.reduce((a, i) => a + i.quantity, 0);
    const list = $('#bag-items', bag);
    const total = $('#bag-total', bag);
    const actions = $('.cart-actions', bag);
    const cols = $('[data-cart-cols]', bag);
    const countLabel = $('[data-cart-count-label]', bag);
    const ship = $('[data-free-ship]', bag);
    if (countLabel) countLabel.textContent = productCount ? `(${productCount} ${productCount === 1 ? (t.item || 'item') : (t.items || 'items')})` : '';
    if (ship) {
      const goal = Number(config.freeShipping) || 0;
      ship.hidden = !goal || !productCount;
      const left = goal - cart.total_price;
      const text = $('p', ship);
      if (left > 0) {
        const parts = (t.freeShipRemaining || 'Only [amount] away from free shipping.').split('[amount]');
        const b = document.createElement('b');
        b.textContent = formatMoney(left);
        text.replaceChildren(parts[0], b, parts[1] || '');
      } else {
        text.textContent = t.freeShipReached || "You've unlocked free shipping!";
      }
      $('.cart-drawer__bar span', ship).style.width = Math.min(100, goal ? cart.total_price / goal * 100 : 0) + '%';
    }
    list.replaceChildren();
    if (!productCount) {
      const p = document.createElement('p');
      p.className = 'empty-bag';
      p.textContent = t.empty || 'Your cart is empty.';
      list.append(p);
      if (cols) cols.hidden = true;
      actions.hidden = true;
      return;
    }
    if (cols) cols.hidden = false;
    const trashSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
    const mediaFor = item => {
      const media = document.createElement('a');
      media.href = item.url;
      media.className = 'drawer-line__media';
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image + (item.image.includes('?') ? '&' : '?') + 'width=260';
        img.alt = item.product_title;
        img.width = 100; img.height = 125;
        media.append(img);
      }
      return media;
    };
    const priceFor = (final, original) => {
      const price = document.createElement('div');
      price.className = 'drawer-line__price';
      if (original > final) {
        const s = document.createElement('s');
        s.textContent = formatMoney(original);
        price.append(s);
      }
      price.append(formatMoney(final));
      return price;
    };
    const metaLine = (text, cls = 'drawer-line__meta') => {
      const p = document.createElement('p');
      p.className = cls;
      p.textContent = text;
      return p;
    };
    // Group lines that belong to one bundle. Shopify splits a bundle into paid and free lines
    // when the Buy X get Y discount applies; the shared _bundle_id puts them back together.
    const units = [];
    const groups = new Map();
    products.forEach(item => {
      const id = item.properties && item.properties._bundle_id;
      if (id) {
        if (!groups.has(id)) { const g = { bundle: true, id, items: [] }; groups.set(id, g); units.push(g); }
        groups.get(id).items.push(item);
      } else {
        units.push({ bundle: false, item });
      }
    });
    units.forEach(unit => {
      const line = document.createElement('div');
      line.className = 'drawer-line';
      const info = document.createElement('div');
      info.className = 'drawer-line__info';
      const controls = document.createElement('div');
      controls.className = 'drawer-line__controls';
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'drawer-line__remove';
      remove.innerHTML = trashSvg;
      if (unit.bundle) {
        const first = unit.items[0];
        const props = first.properties || {};
        const count = unit.items.reduce((a, i) => a + i.quantity, 0);
        const title = document.createElement('a');
        title.href = first.url;
        title.className = 'drawer-line__title';
        title.textContent = first.product_title;
        info.append(title);
        info.append(metaLine(`${props._bundle_title || t.bundle || 'Bundle'} · ${count} ${count === 1 ? (t.item || 'item') : (t.items || 'items')}`, 'drawer-line__bundle'));
        // One line per size/color with its total quantity across the paid and free lines.
        const perVariant = new Map();
        unit.items.forEach(i => {
          const label = i.product_has_only_default_variant ? i.product_title : (i.options_with_values || []).map(o => o.value).join(' / ');
          perVariant.set(label, (perVariant.get(label) || 0) + i.quantity);
        });
        perVariant.forEach((q, label) => info.append(metaLine(`${q} × ${label}`)));
        remove.setAttribute('aria-label', (t.remove || 'Remove') + ' ' + (props._bundle_title || 'bundle'));
        remove.addEventListener('click', () => removeLines(unit.items.map(i => i.key)));
        controls.append(remove);
        info.append(controls);
        const final = unit.items.reduce((a, i) => a + i.final_line_price, 0);
        const original = unit.items.reduce((a, i) => a + i.original_line_price, 0);
        line.append(mediaFor(first), info, priceFor(final, original));
      } else {
        const item = unit.item;
        const title = document.createElement('a');
        title.href = item.url;
        title.className = 'drawer-line__title';
        title.textContent = item.product_title;
        info.append(title);
        if (!item.product_has_only_default_variant) {
          (item.options_with_values || []).forEach(o => info.append(metaLine(`${o.name}: ${o.value}`)));
        }
        (item.line_level_discount_allocations || []).filter(d => d.amount > 0).forEach(d => {
          info.append(metaLine(`${d.discount_application.title} (−${formatMoney(d.amount)})`, 'drawer-line__discount'));
        });
        const stepper = document.createElement('div');
        stepper.className = 'qty-stepper';
        const minus = document.createElement('button');
        minus.type = 'button'; minus.textContent = '−';
        minus.setAttribute('aria-label', t.decrease || 'Decrease quantity');
        minus.addEventListener('click', () => changeLine(item.key, Math.max(0, item.quantity - 1)));
        const qty = document.createElement('span');
        qty.textContent = item.quantity;
        qty.setAttribute('aria-label', (t.quantity || 'Quantity') + ' ' + item.quantity);
        const plus = document.createElement('button');
        plus.type = 'button'; plus.textContent = '+';
        plus.setAttribute('aria-label', t.increase || 'Increase quantity');
        plus.addEventListener('click', () => changeLine(item.key, item.quantity + 1));
        stepper.append(minus, qty, plus);
        remove.setAttribute('aria-label', (t.remove || 'Remove') + ' ' + item.product_title);
        remove.addEventListener('click', () => changeLine(item.key, 0));
        controls.append(stepper, remove);
        info.append(controls);
        line.append(mediaFor(item), info, priceFor(item.final_line_price, item.original_line_price));
      }
      list.append(line);
    });
    total.textContent = formatMoney(cart.total_price) + (config.currency && config.currency !== 'SEK' ? ' ' + config.currency : '');
    actions.hidden = false;
  }
  if (bag && protectionId && config.protectionMode === 'optional') {
    const toggle = $('[data-protection-toggle]', bag);
    if (toggle) toggle.addEventListener('change', async () => {
      toggle.disabled = true;
      try {
        const cart = await fetchCart();
        const line = cart.items.find(isProtection);
        if (toggle.checked && !line) {
          await fetch(root + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: [{ id: protectionId, quantity: 1 }] }) });
          await refreshCart();
        } else if (!toggle.checked && line) {
          await changeLine(line.key, 0);
        } else {
          renderBag(cart);
        }
      } catch (e) { toggle.disabled = false; }
    });
  }
  async function refreshCart() {
    try { renderBag(await fetchCart()); } catch (e) { /* offline or blocked: leave server-rendered state */ }
  }
  async function changeLine(key, quantity) {
    const res = await fetch(root + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity })
    });
    if (res.ok) {
      const cart = await res.json();
      renderBag(cart);
      if (document.body.classList.contains('template-cart')) location.reload();
    }
  }
  async function removeLines(keys) {
    const updates = Object.fromEntries(keys.map(k => [k, 0]));
    const res = await fetch(root + 'cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ updates })
    });
    if (res.ok) {
      renderBag(await res.json());
      if (document.body.classList.contains('template-cart')) location.reload();
    }
  }
  async function addItems(items) {
    const res = await fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.description || data.message || t.error || 'Error');
    await refreshCart();
    if (bag) bag.showModal();
    return data;
  }

  // ---------- Standard product form ----------
  $$('[data-product-form]').forEach(section => {
    const product = JSON.parse($('[data-product-json]', section).textContent);
    const form = $('form[action*="/cart/add"]', section);
    const idInput = $('input[name="id"]', form);
    const selects = $$('[data-option-index]', section);
    const button = $('[type=submit]', form);
    const status = $('[data-form-status]', section);
    const price = $('[data-price]', section);
    const gallery = $('[data-gallery]', section);
    function current() {
      const values = selects.map(s => s.value);
      return product.variants.find(v => v.options.every((o, i) => o === values[i]));
    }
    function update() {
      const v = current();
      if (!v) {
        button.disabled = true;
        button.textContent = t.unavailable || 'Unavailable';
        return;
      }
      idInput.value = v.id;
      button.disabled = !v.available;
      button.textContent = v.available ? (t.addToCart || 'Add to bag') : (t.soldOut || 'Sold out');
      if (price) {
        price.replaceChildren(formatMoney(v.price));
        if (v.compare_at_price > v.price) {
          const s = document.createElement('s');
          s.textContent = formatMoney(v.compare_at_price);
          price.append(s);
        }
      }
      if (v.featured_media) showMedia(gallery, v.featured_media.id);
      const url = new URL(location.href);
      url.searchParams.set('variant', v.id);
      history.replaceState({}, '', url);
    }
    selects.forEach(s => s.addEventListener('change', update));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const label = button.textContent;
      button.disabled = true;
      button.textContent = t.adding || 'Adding…';
      try {
        const qty = parseInt((form.querySelector('[name=quantity]') || {}).value, 10) || 1;
        await addItems([{ id: Number(idInput.value), quantity: qty }]);
        if (status) { status.textContent = t.added || 'Added to your bag.'; status.classList.remove('error'); }
      } catch (err) {
        if (status) { status.textContent = err.message; status.classList.add('error'); }
      } finally {
        button.disabled = false;
        button.textContent = label;
        update();
      }
    });
  });

  // ---------- Bundle picker ----------
  $$('[data-bundle-form]').forEach(section => {
    const product = JSON.parse($('[data-product-json]', section).textContent);
    const status = $('[data-form-status]', section);
    const addButton = $('[data-bundle-add]', section);
    const gallery = $('[data-gallery]', section);
    const opts = product.options;
    const valuesFor = i => [...new Set(product.variants.map(v => v.options[i]))];
    const findVariant = values => product.variants.find(v => v.options.every((o, i) => o === values[i]));
    // Small photo of the chosen color on each bundle row; a color dot when the variant has no photo.
    const swatchColors = { black: '#111', beige: '#e3cfa9', 'navy blue': '#1c2a55', navy: '#1c2a55', 'royal blue': '#1f4fd6', blue: '#1f4fd6', plum: '#5a1840', purple: '#6b2b8f', 'dark purple': '#4a1d5e', 'fuchsia pink': '#e5187c', pink: '#e5187c', fuchsia: '#e5187c', lilac: '#cbb2ef', white: '#fff', nude: '#d9b99b', svart: '#111', 'marinblå': '#1c2a55', 'kungsblå': '#1f4fd6', plommon: '#5a1840', 'fuchsiarosa': '#e5187c', lila: '#cbb2ef' };
    const colorIndex = opts.findIndex(o => /colou?r|färg/i.test(o));
    // Preselect the size from the size quiz (or ?size=) and the color from ?color=.
    const sizeIndex = opts.findIndex(o => /size|taglia|storlek/i.test(o));
    const params = new URLSearchParams(location.search);
    let preferredSize = params.get('size');
    try { preferredSize = preferredSize || localStorage.getItem('blkm_size'); } catch (e) { /* private mode */ }
    const preferredColor = params.get('color');
    function updateThumb(row) {
      const thumb = $('.variant-thumb', row);
      if (!thumb) return;
      const v = rowVariant(row);
      const img = v && (v.featured_image || (v.featured_media && v.featured_media.preview_image));
      const src = img && (img.src || img.url);
      const colorName = colorIndex >= 0 ? $$('select', row)[colorIndex].value : '';
      thumb.replaceChildren();
      thumb.title = colorName;
      if (src) {
        const el = document.createElement('img');
        el.src = src + (src.includes('?') ? '&' : '?') + 'width=90';
        el.alt = '';
        el.width = 34; el.height = 34;
        thumb.append(el);
        thumb.style.background = '';
      } else {
        thumb.style.background = swatchColors[colorName.toLowerCase()] || '#ddd';
      }
    }

    $$('.variant-rows', section).forEach(container => {
      const count = Number(container.dataset.count);
      for (let n = 0; n < count; n++) {
        const row = document.createElement('div');
        row.className = 'variant-row';
        row.style.gridTemplateColumns = `24px 34px repeat(${Math.max(opts.length, 1)}, minmax(0, 1fr))`;
        const label = document.createElement('span');
        label.textContent = '#' + (n + 1);
        const thumb = document.createElement('span');
        thumb.className = 'variant-thumb';
        thumb.setAttribute('aria-hidden', 'true');
        row.append(label, thumb);
        opts.forEach((name, i) => {
          const s = document.createElement('select');
          s.dataset.index = i;
          s.setAttribute('aria-label', (t.itemOf || '[name] — item [n] of [count]').replace('[name]', name).replace('[n]', n + 1).replace('[count]', count));
          valuesFor(i).forEach(v => {
            const o = document.createElement('option');
            o.value = v; o.textContent = v;
            s.append(o);
          });
          const first = product.variants.find(v => v.available) || product.variants[0];
          s.value = first.options[i];
          const wanted = i === sizeIndex ? preferredSize : i === colorIndex ? preferredColor : null;
          if (wanted && [...s.options].some(o => o.value === wanted)) s.value = wanted;
          s.addEventListener('change', () => {
            updateThumb(row);
            validate(row);
            const v = rowVariant(row);
            if (v && v.featured_media) showMedia(gallery, v.featured_media.id);
          });
          row.append(s);
        });
        container.append(row);
        updateThumb(row);
      }
    });
    function rowVariant(row) {
      return findVariant($$('select', row).map(s => s.value));
    }
    function validate(row) {
      const v = rowVariant(row);
      $$('select', row).forEach(s => s.classList.toggle('unavailable', !v || !v.available));
      return v && v.available;
    }
    const selectBundle = r => {
      $$('.bundle', section).forEach(x => x.classList.toggle('selected', x.contains(r)));
      if (!addButton.disabled) addButton.textContent = addButton.dataset.label + ' — ' + r.dataset.priceLabel;
    };
    $$('input[type=radio]', section).forEach(r => r.addEventListener('change', () => selectBundle(r)));
    // Always open on the bundle marked "Selected by default", even if the browser restored an older choice.
    const defaultBundle = $$('input[type=radio]', section).find(r => r.defaultChecked);
    if (defaultBundle) { defaultBundle.checked = true; selectBundle(defaultBundle); }
    window.addEventListener('pageshow', e => { if (e.persisted && defaultBundle) { defaultBundle.checked = true; selectBundle(defaultBundle); } });
    addButton.addEventListener('click', async () => {
      const chosen = $('input[type=radio]:checked', section);
      const bundle = chosen.closest('.bundle');
      const rows = $$('.variant-row', bundle);
      if (!rows.length) {
        const only = product.variants.find(v => v.available) || product.variants[0];
        rows.fake = [{ id: only.id, quantity: Number(bundle.dataset.quantity || chosen.value) }];
      }
      if (rows.length && !rows.every(validate)) {
        status.textContent = t.comboUnavailable || 'One or more selected combinations are unavailable.';
        status.classList.add('error');
        return;
      }
      const counts = new Map();
      rows.forEach(row => { const id = rowVariant(row).id; counts.set(id, (counts.get(id) || 0) + 1); });
      const bundleId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const bundleProps = { _bundle: chosen.value + '-pack', _bundle_id: bundleId, _bundle_title: chosen.dataset.title || '' };
      const items = (rows.fake || [...counts].map(([id, quantity]) => ({ id, quantity }))).map(i => ({ ...i, properties: bundleProps }));
      const label = addButton.textContent;
      addButton.disabled = true;
      addButton.textContent = t.adding || 'Adding…';
      try {
        await addItems(items);
        status.textContent = t.added || 'Added to your bag.';
        status.classList.remove('error');
      } catch (err) {
        status.textContent = err.message;
        status.classList.add('error');
      } finally {
        addButton.disabled = false;
        addButton.textContent = label;
      }
    });
  });

  // ---------- Countdown to a real offer end date ----------
  $$('[data-countdown]').forEach(box => {
    const raw = box.dataset.countdown.trim();
    const end = new Date(/T/.test(raw) ? raw : raw.replace(' ', 'T'));
    if (isNaN(end)) return;
    const pad = n => String(n).padStart(2, '0');
    const days = $('[data-days]', box);
    const tick = () => {
      const left = end - Date.now();
      if (left <= 0) { box.hidden = true; clearInterval(timer); return; }
      const s = Math.floor(left / 1000);
      const d = Math.floor(s / 86400);
      days.hidden = d === 0;
      $('b', days).textContent = pad(d);
      $('[data-h]', box).textContent = pad(Math.floor(s % 86400 / 3600));
      $('[data-m]', box).textContent = pad(Math.floor(s % 3600 / 60));
      $('[data-s]', box).textContent = pad(s % 60);
      box.hidden = false;
    };
    const timer = setInterval(tick, 1000);
    tick();
  });

  // ---------- 3D color showcase ----------
  $$('[data-c3d]').forEach(section => {
    const stage = $('[data-c3d-stage]', section);
    const ring = $('[data-c3d-ring]', section);
    const cards = $$('[data-c3d-card]', section);
    const chips = $$('[data-c3d-chip]', section);
    const nameEl = $('[data-c3d-name]', section);
    const shop = $('[data-c3d-shop]', section);
    const n = cards.length;
    if (!n) return;
    const step = 360 / n;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const auto = section.dataset.auto === 'true' && !reduce;
    const speed = Number(section.dataset.speed || 4) * 0.035;
    let angle = 0, target = null, dragging = false, lastX = 0, velocity = 0, hover = false, idleUntil = 0, front = -1;
    const layout = () => {
      const w = cards[0].offsetWidth;
      const radius = Math.round((w / 2) / Math.tan(Math.PI / Math.max(n, 3)) + w * 0.12);
      cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`; });
      ring.style.setProperty('--r', radius);
      ring.dataset.radius = radius;
    };
    const frontIndex = () => ((Math.round(-angle / step) % n) + n) % n;
    const paint = () => {
      const r = Number(ring.dataset.radius || 300);
      ring.style.transform = `translateZ(${-r}px) rotateY(${angle}deg)`;
      cards.forEach((c, i) => {
        const a = (((i * step + angle) % 360) + 540) % 360 - 180;
        const t = Math.abs(a) / 180;
        c.style.filter = `brightness(${1 - t * 0.45})`;
        c.style.opacity = String(1 - t * 0.35);
      });
      const f = frontIndex();
      if (f !== front) {
        front = f;
        cards.forEach((c, i) => c.classList.toggle('is-front', i === f));
        chips.forEach((c, i) => c.setAttribute('aria-selected', String(i === f)));
        if (nameEl) nameEl.textContent = cards[f].dataset.color;
      }
    };
    const goTo = i => { let d = -i * step - angle; d = ((d % 360) + 540) % 360 - 180; target = angle + d; idleUntil = performance.now() + 4000; };
    const loop = now => {
      if (target !== null) {
        angle += (target - angle) * 0.12;
        if (Math.abs(target - angle) < 0.05) { angle = target; target = null; }
      } else if (!dragging) {
        if (Math.abs(velocity) > 0.02) { angle += velocity; velocity *= 0.93; }
        else if (velocity !== 0) { velocity = 0; goTo(frontIndex()); }
        else if (auto && !hover && now > idleUntil) angle -= speed;
      }
      paint();
      requestAnimationFrame(loop);
    };
    stage.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; velocity = 0; target = null; stage.classList.add('dragging'); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; angle += dx * 0.35; velocity = dx * 0.35; });
    const end = () => { if (!dragging) return; dragging = false; stage.classList.remove('dragging'); idleUntil = performance.now() + 4000; if (Math.abs(velocity) < 0.5) { velocity = 0; goTo(frontIndex()); } };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('mouseenter', () => { hover = true; });
    stage.addEventListener('mouseleave', () => { hover = false; });
    chips.forEach((c, i) => c.addEventListener('click', () => goTo(i)));
    const prev = $('[data-c3d-prev]', section), next = $('[data-c3d-next]', section);
    if (prev) prev.addEventListener('click', () => goTo((frontIndex() - 1 + n) % n));
    if (next) next.addEventListener('click', () => goTo((frontIndex() + 1) % n));
    section.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') goTo((frontIndex() - 1 + n) % n); if (e.key === 'ArrowRight') goTo((frontIndex() + 1) % n); });
    // "Shop this color": on a product page, set every bundle row to this color and jump to the buy box.
    if (shop) shop.addEventListener('click', e => {
      const color = cards[frontIndex()].dataset.color;
      if (shop.hasAttribute('data-on-product')) {
        const selects = $$('.variant-row select').filter(s => [...s.options].some(o => o.value === color));
        if (selects.length) {
          e.preventDefault();
          selects.forEach(s => { s.value = color; s.dispatchEvent(new Event('change')); });
          const buy = document.getElementById('buy');
          if (buy) buy.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      const url = new URL(shop.href, location.href);
      url.searchParams.set('color', color);
      shop.href = url.toString();
    });
    layout();
    window.addEventListener('resize', layout);
    requestAnimationFrame(loop);
  });

  // ---------- Sticky buy bar ----------
  const sticky = $('.sticky-buy');
  const buy = document.getElementById('buy');
  if (sticky && buy && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle('visible', !entries[0].isIntersecting && window.scrollY > 700);
    }).observe(buy);
  }

  // ---------- Video strip ----------
  // Clips autoplay muted; only those on screen keep playing. The speaker button turns sound on for one clip.
  $$('[data-film]').forEach(film => {
    const videos = $$('.film-video video', film);
    if (!videos.length) return;
    videos.forEach(v => { v.muted = true; v.playsInline = true; });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
      }), { threshold: 0.25 });
      videos.forEach(v => io.observe(v));
    }
    $$('[data-film-sound]', film).forEach(btn => btn.addEventListener('click', () => {
      const video = $('video', btn.closest('.film-video'));
      const turnOn = video.muted;
      $$('[data-film-sound]', film).forEach(b => { $('video', b.closest('.film-video')).muted = true; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', t.soundOn || 'Turn sound on'); });
      if (turnOn) {
        video.muted = false;
        video.play().catch(() => {});
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', t.soundOff || 'Turn sound off');
      }
    }));
  });

  // ---------- Size quiz pop-up ----------
  // Waist/hips (or jeans size) → recommended size; subscribers get a welcome code. Shown once per
  // visitor; a better leaving offer can appear once on desktop for visitors without a code.
  $$('[data-quiz]').forEach(pop => {
    const KEY = 'blkm_quiz';
    const store = {
      get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
      set(v) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(store.get(), v))); } catch (e) { /* private mode */ } }
    };
    const design = pop.dataset.design === 'true';
    const isPhone = window.matchMedia('(max-width: 760px)').matches;
    if (!design && isPhone && pop.dataset.mobile !== 'true') return;
    let sizes = [];
    try { sizes = JSON.parse($('[data-quiz-sizes]', pop).textContent); } catch (e) { return; }
    if (!sizes.length) return;
    const heading = $('[data-quiz-heading]', pop), text = $('[data-quiz-text]', pop);
    const base = { offer: pop.dataset.offer, code: pop.dataset.code, heading: heading.textContent, text: text.textContent };
    let mode = base, open = false, lastFocus = null, result = null;

    const step = name => {
      $$('[data-quiz-step]', pop).forEach(s => { s.hidden = s.dataset.quizStep !== name; });
      const first = $(`[data-quiz-step="${name}"] input:not([type=radio]):not([type=hidden]), [data-quiz-step="${name}"] select`, pop);
      if (first && !isPhone) first.focus({ preventScroll: true });
    };
    const arts = $$('[data-quiz-art]', pop);
    const setMode = m => {
      mode = m;
      const art = m === base ? 'welcome' : 'leave';
      if (arts.some(a => a.dataset.quizArt === art)) arts.forEach(a => { a.hidden = a.dataset.quizArt !== art; });
      heading.textContent = m.heading;
      text.textContent = m.text;
      $$('[data-quiz-offer]', pop).forEach(el => { el.textContent = m.offer; });
    };
    const show = m => {
      if (open) return;
      setMode(m);
      step('start');
      pop.hidden = false;
      open = true;
      lastFocus = document.activeElement;
      document.documentElement.classList.add('spin-open');
      requestAnimationFrame(() => pop.classList.add('is-open'));
    };
    const close = () => {
      if (!open) return;
      pop.classList.remove('is-open');
      document.documentElement.classList.remove('spin-open');
      open = false;
      setTimeout(() => { pop.hidden = true; }, 250);
      if (!design) store.set({ seen: true });
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    $$('[data-quiz-close]', pop).forEach(b => b.addEventListener('click', close));
    $$('[data-quiz-go]', pop).forEach(b => b.addEventListener('click', () => step(b.dataset.quizGo)));
    pop.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // A measurement between two sizes gets the larger one; waist and hips use the larger of the two.
    const indexFor = (cm, key) => {
      if (!cm) return null;
      const i = sizes.findIndex(s => s[key] && cm <= s[key]);
      return i === -1 ? sizes.length : i;
    };
    const measure = $('[data-quiz-step="measure"]', pop);
    measure.addEventListener('submit', e => {
      e.preventDefault();
      const err = $('[data-quiz-error]', pop);
      const unit = measure.unit.value;
      const toCm = v => { const n = parseFloat(String(v).replace(',', '.')); return n > 0 ? (unit === 'in' ? n * 2.54 : n) : 0; };
      const waist = toCm(measure.waist.value), hips = toCm(measure.hips.value);
      const ok = v => !v || (v >= 45 && v <= 200);
      if ((!waist && !hips) || !ok(waist) || !ok(hips)) {
        err.textContent = unit === 'in' ? (t.quizErrorIn || 'Please enter your waist and/or hips in inches (e.g. 32).') : (t.quizErrorCm || 'Please enter your waist and/or hips in cm (e.g. 81).');
        err.hidden = false;
        return;
      }
      err.hidden = true;
      const iw = indexFor(waist, 'waist'), ih = indexFor(hips, 'hips');
      const i = Math.max(iw ?? -1, ih ?? -1);
      result = { index: i, split: iw !== null && ih !== null && iw !== ih };
      step('email');
    });
    measure.addEventListener('change', e => {
      if (e.target.name !== 'unit') return;
      const ex = v => (t.quizExample || 'e.g. [value]').replace('[value]', v);
      measure.waist.placeholder = ex(e.target.value === 'in' ? 32 : 81);
      measure.hips.placeholder = ex(e.target.value === 'in' ? 40 : 102);
    });
    $('[data-quiz-step="jeans"]', pop).addEventListener('submit', e => {
      e.preventDefault();
      result = { index: Number(e.target.jeans.value), split: false, jeans: true };
      step('email');
    });

    const showResult = withCode => {
      const over = result.index >= sizes.length;
      const size = sizes[Math.min(result.index, sizes.length - 1)].name;
      $('[data-quiz-size]', pop).textContent = size;
      const note = $('[data-quiz-note]', pop);
      if (over) note.textContent = (t.quizOver || 'Your measurements are above our largest size ([size]), so it may feel too firm. Message us before ordering and we\'ll help you decide.').replace('[size]', size);
      else if (result.split) note.textContent = t.quizSplit || 'Your waist and hips point to different sizes — we recommend the larger one for all-day comfort.';
      else if (result.jeans) note.textContent = t.quizJeans || 'Based on your jeans size. Between sizes? Choose the larger one.';
      else note.textContent = t.quizBetween || 'Between sizes? Choose the larger one.';
      $('[data-quiz-code-wrap]', pop).hidden = !withCode;
      $('[data-quiz-code]', pop).textContent = mode.code;
      const shop = $('[data-quiz-shop]', pop);
      const url = new URL(pop.dataset.shopUrl || shop.href, location.href);
      url.searchParams.set('size', size);
      shop.href = url.toString();
      shop.textContent = (t.quizShopSize || 'Shop size [size]').replace('[size]', size);
      try { localStorage.setItem('blkm_size', size); } catch (e) { /* private mode */ }
      step('result');
    };
    const emailForm = $('.quiz__form', pop);
    emailForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!emailForm.reportValidity()) return;
      // Save the email as a Shopify customer who agreed to marketing, and keep the code for checkout.
      fetch(emailForm.action, { method: 'POST', body: new FormData(emailForm), credentials: 'same-origin' }).catch(() => {});
      fetch(root + 'discount/' + encodeURIComponent(mode.code), { credentials: 'same-origin' }).catch(() => {});
      store.set({ claimed: mode.code });
      showResult(true);
    });
    $('[data-quiz-skip-email]', pop).addEventListener('click', () => showResult(false));
    $('[data-quiz-copy]', pop).addEventListener('click', e => {
      if (navigator.clipboard) navigator.clipboard.writeText(mode.code).then(() => { e.target.textContent = t.copied || 'Copied'; }).catch(() => {});
    });
    $('[data-quiz-shop]', pop).addEventListener('click', () => store.set({ seen: true }));

    if (design) {
      document.addEventListener('shopify:section:select', e => { if (pop.closest('#shopify-section-' + e.detail.sectionId)) show(base); });
      document.addEventListener('shopify:section:deselect', e => { if (pop.closest('#shopify-section-' + e.detail.sectionId)) close(); });
      return;
    }
    // Testing aid: ?popup=1 opens the welcome pop-up right away, ?popup=leave the leaving offer,
    // even if this browser has already seen or claimed it.
    const force = new URLSearchParams(location.search).get('popup');
    if (force) {
      const leaveMode = { offer: pop.dataset.leaveOffer, code: pop.dataset.leaveCode, heading: pop.dataset.leaveHeading, text: pop.dataset.leaveText };
      setTimeout(() => show(force === 'leave' && pop.dataset.leaveCode ? leaveMode : base), 300);
      return;
    }
    const state = store.get();
    if (state.claimed) return;
    if (!state.seen) setTimeout(() => { const st = store.get(); if (!st.claimed && !st.seen) show(base); }, Number(pop.dataset.delay || 8) * 1000);
    if (pop.dataset.leave === 'true' && pop.dataset.leaveCode && !state.leaveSeen) {
      const leave = { offer: pop.dataset.leaveOffer, code: pop.dataset.leaveCode, heading: pop.dataset.leaveHeading, text: pop.dataset.leaveText };
      const offerLeave = () => {
        const st = store.get();
        if (open || st.claimed || st.leaveSeen) return false;
        store.set({ leaveSeen: true });
        show(leave);
        return true;
      };
      if (window.matchMedia('(pointer: fine)').matches) {
        // Desktop: the mouse leaves through the top of the window (towards the tabs or address bar).
        const onLeave = e => {
          if (e.clientY > 0 || e.relatedTarget) return;
          if (offerLeave()) document.removeEventListener('mouseout', onLeave);
        };
        setTimeout(() => document.addEventListener('mouseout', onLeave), 5000);
      } else {
        // Phones have no exit signal, so after 20s on the page use the closest ones: a fast scroll back
        // up (often right before Back or the address bar), or returning from another tab or app.
        let armed = false, lastY = window.scrollY, lastT = performance.now(), hiddenAt = 0;
        setTimeout(() => { armed = true; lastY = window.scrollY; lastT = performance.now(); }, 20000);
        const stop = () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibility); };
        const onScroll = () => {
          const y = window.scrollY, t = performance.now();
          if (armed && lastY - y > 250 && t - lastT < 400 && y > 150 && offerLeave()) return stop();
          if (t - lastT >= 400 || y > lastY) { lastY = y; lastT = t; }
        };
        const onVisibility = () => {
          if (document.hidden) { hiddenAt = performance.now(); return; }
          if (armed && hiddenAt && performance.now() - hiddenAt > 3000) setTimeout(() => { if (offerLeave()) stop(); }, 600);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
      }
    }
  });

  // Keep the header count in sync when the page is restored from the back/forward cache.
  window.addEventListener('pageshow', e => { if (e.persisted) refreshCart(); });
  // Clear any paid protection line on load so it is never charged while protection is included.
  if ((config.protectionMode === 'included' || config.protectionMode === 'gift') && protectionId) refreshCart();
})();
