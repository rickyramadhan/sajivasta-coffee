/* Sajivasta v2 — dependency-free interactions. No messages are sent automatically. */
'use strict';
(() => {
  const products = window.SAJIVASTA_PRODUCTS;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const whatsapp = message => `https://wa.me/6281522721290?text=${encodeURIComponent(message)}`;

  // Cross-page continuity: animate only local document navigation.
  if (!reduced.matches) {
    addEventListener('pageshow', () => document.body.classList.remove('page-leaving'));
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => { location.href = url.href; }, 280);
    });
  }
  const productById = id => products.find(product => product.id === id);
  const weights = ['200 g', '500 g', '1 kg'];
  let toastTimer;
  function notify(message) {
    $('#toast').textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast').textContent = ''; }, 4200);
  }

  // Mobile navigation: accessible state, outside click and Escape dismissal.
  const menuButton = $('.menu-toggle');
  const navigation = $('#main-nav');
  function setMenu(open) {
    navigation.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', event => { if (!event.target.closest('.header')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });

  // Lightweight scroll feedback; no scroll hijacking.
  let scrollQueued = false;
  function updateScroll() {
    $('.header').classList.toggle('scrolled', window.scrollY > 30);
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    $('.scroll-progress').style.transform = `scaleX(${distance > 0 ? Math.min(1, window.scrollY / distance) : 0})`;
    scrollQueued = false;
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    $$('.reveal').forEach(element => observer.observe(element));
  }

  // Original roasting video, shortened and compressed. Static poster on reduced motion/data saver.
  const video = $('#hero-video');
  if (video) {
    const toggle = $('#video-toggle');
    toggle.hidden = false;
    const loadVideo = () => { if (!video.getAttribute('src')) video.src = video.dataset.src; };
    const setLabel = () => { toggle.textContent = video.paused ? 'Putar video' : 'Jeda video'; };
    toggle.addEventListener('click', async () => {
      if (!video.paused) video.pause();
      else { loadVideo(); try { await video.play(); } catch { notify('Video belum dapat diputar. Foto tetap tersedia.'); } }
      setLabel();
    });
    video.addEventListener('play', setLabel);
    video.addEventListener('pause', setLabel);
    video.addEventListener('error', () => { toggle.hidden = true; video.hidden = true; });
    if (!reduced.matches && !navigator.connection?.saveData) {
      loadVideo(); video.play().catch(setLabel);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
    reduced.addEventListener?.('change', () => { if (reduced.matches) video.pause(); });
  }

  // Taste explorer uses published tasting descriptions, not invented scoring.
  const tasteResult = $('#taste-result');
  function chooseTaste(index) {
    const product = products[index];
    if (!product || !tasteResult) return;
    $$('.taste-choice').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.taste) === index)));
    tasteResult.innerHTML = `<img src="assets/${product.image}.webp" alt="Kemasan ${product.name}"><div><span class="eyebrow">${product.origin}</span><h3>${product.name}</h3><p>${product.short}</p><a class="link" href="${product.id}.html">Kenali kopinya <span class="arrow" aria-hidden="true">↗</span></a></div>`;
  }
  $$('.taste-choice').forEach(button => button.addEventListener('click', () => chooseTaste(Number(button.dataset.taste))));
  chooseTaste(0);

  // Catalog filtering and sorting preserve real product links and keyboard focus.
  const catalog = $('#catalog-grid');
  let activeFilter = 'all';
  const catalogCards = catalog ? [...catalog.children] : [];
  function filterCatalog(filter) {
    if (!['all', 'Natural', 'Full Wash'].includes(filter)) throw new Error('Proses kopi tidak dikenal.');
    activeFilter = filter;
    $$('.filter').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    const sortByName = $('#coffee-sort')?.value === 'name';
    const cards = [...catalogCards];
    if (sortByName) cards.sort((a, b) => $('h3', a).textContent.localeCompare($('h3', b).textContent));
    cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.process !== filter; catalog.append(card); });
    const count = cards.filter(card => !card.hidden).length;
    $('#catalog-status').textContent = `${count} kopi dalam koleksi${filter !== 'all' ? ` · ${filter}` : ''}`;
    return cards.filter(card => !card.hidden).map(card => $('h3', card).textContent);
  }
  $$('.filter').forEach(button => button.addEventListener('click', () => filterCatalog(button.dataset.filter)));
  $('#coffee-sort')?.addEventListener('change', () => filterCatalog(activeFilter));

  // A local session shortlist, not an order or checkout. Validate persisted data before rendering.
  let cart = [];
  try {
    const stored = JSON.parse(sessionStorage.getItem('sajivasta-shortlist-v2') || '[]');
    if (Array.isArray(stored)) cart = stored.filter(item => item && productById(item.id) && weights.includes(item.weight) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99).slice(0, 9);
  } catch { /* Disabled storage never blocks shopping interactions. */ }
  const cartDialog = $('#cart-dialog');
  function cartMessage() {
    return 'Halo Sajivasta, saya ingin menanyakan harga dan ketersediaan kopi berikut:\n\n' + cart.map(item => `• ${productById(item.id).name} — ${item.weight} × ${item.quantity}`).join('\n') + '\n\nMohon informasi total harga dan cara pemesanannya. Terima kasih.';
  }
  function renderCart() {
    try { sessionStorage.setItem('sajivasta-shortlist-v2', JSON.stringify(cart)); } catch { /* In-memory fallback. */ }
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    $('.cart-count').textContent = String(count);
    $('.cart-toggle').setAttribute('aria-label', `Buka daftar pilihan, ${count} kemasan`);
    $('#cart-bottom').hidden = !cart.length;
    $('#cart-items').innerHTML = cart.length ? cart.map((item, index) => {
      const product = productById(item.id);
      return `<article class="cart-item"><img src="assets/${product.image}.webp" alt="${product.name}"><div><h3>${product.name}</h3><p>${item.weight} · Biji kopi utuh</p><div class="quantity"><button data-cart-action="decrease" data-index="${index}" aria-label="Kurangi ${product.name}">−</button><output aria-label="Jumlah ${product.name}">${item.quantity}</output><button data-cart-action="increase" data-index="${index}" aria-label="Tambah ${product.name}">+</button></div><button class="remove-item" data-cart-action="remove" data-index="${index}">Hapus</button></div></article>`;
    }).join('') : '<div class="cart-empty"><h3>Belum ada pilihan kopi.</h3><p class="muted" style="margin:18px 0 25px">Kenali koleksi dan tambahkan kopi yang ingin Anda tanyakan.</p><a class="button" href="coffee.html">Jelajahi kopi ↗</a></div>';
    $('#cart-whatsapp').href = whatsapp(cartMessage());
  }
  function openCart() { renderCart(); cartDialog.showModal(); document.body.classList.add('locked'); }
  $('.cart-toggle').addEventListener('click', openCart);
  $('#close-cart').addEventListener('click', () => cartDialog.close());
  cartDialog.addEventListener('close', () => document.body.classList.remove('locked'));
  cartDialog.addEventListener('click', event => {
    const action = event.target.closest('[data-cart-action]');
    if (action) {
      const index = Number(action.dataset.index);
      const item = cart[index];
      if (!item) return;
      if (action.dataset.cartAction === 'remove') cart.splice(index, 1);
      else if (action.dataset.cartAction === 'increase') item.quantity = Math.min(99, item.quantity + 1);
      else item.quantity = Math.max(1, item.quantity - 1);
      const previousAction = action.dataset.cartAction;
      renderCart();
      const next = $(`[data-index="${Math.min(index, cart.length - 1)}"][data-cart-action="${previousAction}"]`, cartDialog);
      (next || $('#close-cart')).focus();
    } else if (event.target === cartDialog && event.clientX < cartDialog.getBoundingClientRect().left) cartDialog.close();
  });
  renderCart();

  const productLayout = $('[data-product]');
  if (productLayout) {
    const product = productById(productLayout.dataset.product);
    let selectedWeight = '200 g';
    let quantity = 1;
    $$('.weight').forEach(button => button.addEventListener('click', () => {
      selectedWeight = button.dataset.weight;
      $$('.weight').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
    $('#increase').addEventListener('click', () => { quantity = Math.min(99, quantity + 1); $('#quantity').textContent = String(quantity); });
    $('#decrease').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); $('#quantity').textContent = String(quantity); });
    $('#add-to-cart').addEventListener('click', () => {
      const existing = cart.find(item => item.id === product.id && item.weight === selectedWeight);
      if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
      else cart.push({ id: product.id, weight: selectedWeight, quantity });
      openCart();
      notify(`${product.name} ditambahkan ke pilihan.`);
    });
  }

  const form = $('#inquiry-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const message = `Halo Sajivasta, saya ingin berdiskusi tentang kebutuhan kopi.\n\nNama: ${data.get('name').trim()}\nKontak: ${data.get('contact').trim()}\nUsaha: ${data.get('business').trim() || '—'}\nKebutuhan: ${data.get('type')}\n\n${data.get('message').trim()}\n\nTerima kasih.`;
      $('#inquiry-text').textContent = message;
      $('#inquiry-whatsapp').href = whatsapp(message);
      $('#inquiry-result').hidden = false;
      $('#inquiry-title').focus({ preventScroll: true });
      $('#inquiry-result').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
    });
    $('#copy-inquiry').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#inquiry-text').textContent); notify('Pesan disalin.'); }
      catch {
        const range = document.createRange(); range.selectNodeContents($('#inquiry-text'));
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        notify('Pesan dipilih. Gunakan perintah Salin pada browser Anda.');
      }
    });
    $('#download-inquiry').addEventListener('click', () => {
      const blob = new Blob([$('#inquiry-text').textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = 'sajivasta-inquiry.txt'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  // Keep existing optional browser-agent catalog access; unsupported browsers are unaffected.
  if (catalog && document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    try {
      Promise.resolve(document.modelContext.registerTool({
        name: 'filter_coffee_collection',
        description: 'Filter the visible Sajivasta coffee collection by processing method.',
        inputSchema: { type: 'object', properties: { filter: { type: 'string', enum: ['all', 'Natural', 'Full Wash'] } }, required: ['filter'], additionalProperties: false },
        annotations: { readOnlyHint: false },
        execute(input) { return { filter: input?.filter, coffees: filterCatalog(input?.filter) }; }
      }, { signal: lifecycle.signal })).catch(() => {});
      addEventListener('pagehide', () => lifecycle.abort(), { once: true });
    } catch { /* Browser extension support is optional. */ }
  }
})();
