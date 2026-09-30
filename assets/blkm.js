// BLK_MAJESTY theme behavior: dialogs, gallery, product forms, bundle picker and the cart drawer.
// Loaded with `defer`; every feature checks for its elements first so it is safe on every page.
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const config = window.blkm || {};
  const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
  const t = config.strings || {};

  // ---------- Money ----------
  function formatMoney(cents) {
    const format = config.moneyFormat || '${{amount}}';
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
    $$('[data-cart-count]').forEach(el => { el.textContent = cart.item_count; });
  }
  function renderBag(cart) {
    renderCount(cart);
    if (!bag) return;
    const list = $('#bag-items', bag);
    const total = $('#bag-total', bag);
    const actions = $('.cart-actions', bag);
    list.replaceChildren();
    if (!cart.item_count) {
      const p = document.createElement('p');
      p.className = 'empty-bag';
      p.textContent = t.empty || 'Your bag is empty.';
      list.append(p);
      total.textContent = '';
      actions.hidden = true;
      return;
    }
    cart.items.forEach(item => {
      const line = document.createElement('div');
      line.className = 'cart-line';
      const img = document.createElement('img');
      img.alt = item.product_title;
      img.width = 70; img.height = 70;
      if (item.image) img.src = item.image.replace(/(\.[a-z]+)(\?|$)/i, '_140x140_crop_center$1$2');
      const info = document.createElement('div');
      const title = document.createElement('a');
      title.href = item.url;
      title.innerHTML = '<b></b>';
      title.firstChild.textContent = item.product_title;
      info.append(title);
      if (!item.product_has_only_default_variant && item.variant_title) {
        const meta = document.createElement('p');
        meta.className = 'meta';
        meta.textContent = item.variant_title;
        info.append(meta);
      }
      const qty = document.createElement('input');
      qty.type = 'number'; qty.min = '0'; qty.value = item.quantity;
      qty.setAttribute('aria-label', (t.quantity || 'Quantity') + ' — ' + item.product_title);
      qty.addEventListener('change', () => changeLine(item.key, Math.max(0, parseInt(qty.value, 10) || 0)));
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'remove';
      remove.textContent = t.remove || 'Remove';
      remove.addEventListener('click', () => changeLine(item.key, 0));
      const controls = document.createElement('div');
      controls.append(qty, document.createElement('br'), remove);
      info.append(controls);
      const price = document.createElement('div');
      price.className = 'line-price';
      if (item.original_line_price > item.final_line_price) {
        const s = document.createElement('s');
        s.textContent = formatMoney(item.original_line_price);
        price.append(s);
      }
      price.append(formatMoney(item.final_line_price));
      line.append(img, info, price);
      list.append(line);
    });
    let text = (t.subtotal || 'Subtotal') + ' ' + formatMoney(cart.total_price);
    if (cart.total_discount > 0) text = (t.discounts || 'Discounts') + ' −' + formatMoney(cart.total_discount) + ' · ' + text;
    total.textContent = text;
    actions.hidden = false;
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
    const swatchColors = { black: '#111', beige: '#e3cfa9', 'navy blue': '#1c2a55', navy: '#1c2a55', 'royal blue': '#1f4fd6', blue: '#1f4fd6', plum: '#5a1840', purple: '#6b2b8f', 'dark purple': '#4a1d5e', 'fuchsia pink': '#e5187c', pink: '#e5187c', fuchsia: '#e5187c', lilac: '#cbb2ef', white: '#fff', nude: '#d9b99b' };
    const colorIndex = opts.findIndex(o => /colou?r/i.test(o));
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
          s.setAttribute('aria-label', `${name} — item ${n + 1} of ${count}`);
          valuesFor(i).forEach(v => {
            const o = document.createElement('option');
            o.value = v; o.textContent = v;
            s.append(o);
          });
          const first = product.variants.find(v => v.available) || product.variants[0];
          s.value = first.options[i];
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
      const items = (rows.fake || [...counts].map(([id, quantity]) => ({ id, quantity }))).map(i => ({ ...i, properties: { _bundle: chosen.value + '-pack' } }));
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

  // ---------- Sticky buy bar ----------
  const sticky = $('.sticky-buy');
  const buy = document.getElementById('buy');
  if (sticky && buy && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle('visible', !entries[0].isIntersecting && window.scrollY > 700);
    }).observe(buy);
  }

  // Keep the header count in sync when the page is restored from the back/forward cache.
  window.addEventListener('pageshow', e => { if (e.persisted) refreshCart(); });
})();
