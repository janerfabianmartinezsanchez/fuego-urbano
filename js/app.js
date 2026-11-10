// Aplicación Principal Fuego Urbano - UX/UI Master-Detail (2 Columnas en Todo Dispositivo)
let currentCategory = 'all';
let searchQuery = '';
let selectedProductId = PRODUCTS_DATA[0]?.id || null;
let selectedProductForModal = null;
let inspectorQty = 1;

document.addEventListener('DOMContentLoaded', () => {
  window.appCart = new ShoppingCart();
  window.appCheckout = new CheckoutManager(window.appCart);

  renderCategories();
  initProductsListEvents();
  renderMenu();
  initProductDetailModal();

  const searchInput = document.getElementById('search-products-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderMenu();
    });
  }

  // Soporte de teclado en tarjeta Plato Estrella del Hero
  const heroCard = document.querySelector('.hero-banner-img-wrapper[role="button"]');
  if (heroCard) {
    heroCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectFeaturedProduct('burger-brutal');
      }
    });
  }

  const directWaBtn = document.getElementById('direct-whatsapp-btn');
  if (directWaBtn) {
    directWaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = encodeURIComponent('¡Hola Fuego Urbano! Quisiera hacerles una pregunta sobre su menú.');
      window.open(`https://wa.me/573126292030?text=${text}`, '_blank');
    });
  }
});

function getFilteredProducts() {
  return PRODUCTS_DATA.filter((prod) => {
    const matchesCategory = currentCategory === 'all' || prod.category === currentCategory;
    const matchesSearch = !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery) ||
      prod.description.toLowerCase().includes(searchQuery) ||
      (prod.highlights && prod.highlights.some((h) => h.toLowerCase().includes(searchQuery)));
    return matchesCategory && matchesSearch;
  });
}

function renderCategories() {
  const categoryPills = document.querySelectorAll('.cat-pill');
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      renderMenu();
    });
  });
}

function resetMenuFilters() {
  currentCategory = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('search-products-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.cat-pill').forEach((pill) => {
    pill.classList.toggle('active', pill.dataset.category === 'all');
  });
  renderMenu();
}

function selectFeaturedProduct(productId) {
  if (currentCategory !== 'all' || searchQuery !== '') {
    resetMenuFilters();
  }
  selectProduct(productId);
  const menuSection = document.getElementById('menu-section');
  if (menuSection) {
    menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function initProductsListEvents() {
  const listEl = document.getElementById('products-list');
  if (!listEl) return;

  listEl.addEventListener('click', (e) => {
    const quickBtn = e.target.closest('.btn-row-quick-add');
    if (quickBtn) {
      e.stopPropagation();
      const productId = quickBtn.dataset.id;
      quickAddToCart(productId, quickBtn);
      return;
    }

    const rowCard = e.target.closest('.product-row-card');
    if (rowCard) {
      selectProduct(rowCard.dataset.id);
    }
  });

  listEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const rowCard = e.target.closest('.product-row-card');
    if (rowCard && !e.target.closest('.btn-row-quick-add')) {
      e.preventDefault();
      selectProduct(rowCard.dataset.id);
    }
  });
}

function renderMenu() {
  const filtered = getFilteredProducts();
  updateCatalogCount(filtered.length);

  if (filtered.length > 0 && !filtered.some((p) => p.id === selectedProductId)) {
    selectedProductId = filtered[0].id;
  } else if (filtered.length === 0) {
    selectedProductId = null;
  }

  renderProductsList(filtered);
  renderProductInspector();
}

function updateCatalogCount(count) {
  const countLabel = document.getElementById('catalog-count-label');
  if (!countLabel) return;
  countLabel.textContent = count === 1 ? '1 opción' : `${count} opciones`;
}

function renderProductsList(filtered) {
  const container = document.getElementById('products-list');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-products">
        <span class="empty-icon">🔍</span>
        <h3>No encontramos productos</h3>
        <p>Intenta buscando con otro ingrediente o explora todas las categorías.</p>
        <button class="btn-reset-filters" onclick="resetMenuFilters()">Ver todo el menú</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((product) => {
    const isActive = product.id === selectedProductId;
    const categoryLabel = CATEGORY_LABELS[product.category] || '';
    return `
      <article
        class="product-row-card ${isActive ? 'active' : ''}"
        data-id="${product.id}"
        role="button"
        tabindex="0"
        aria-selected="${isActive ? 'true' : 'false'}"
      >
        <div class="product-row-thumb">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          ${product.popular ? '<span class="thumb-fire-dot" title="Popular">🔥</span>' : ''}
        </div>

        <div class="product-row-content">
          <div class="product-row-top">
            <span class="row-category-tag">${categoryLabel}</span>
            ${product.badge ? `<span class="row-badge">${product.badge}</span>` : ''}
          </div>

          <h4 class="product-row-title">${product.name}</h4>
          <p class="product-row-preview">${product.description}</p>

          <div class="product-row-bottom">
            <div class="row-price-group">
              <span class="product-price">${formatCOP(product.price)}</span>
              <span class="row-inspect-hint">Ver descripción →</span>
            </div>
            <button
              type="button"
              class="btn-row-quick-add"
              data-id="${product.id}"
              title="Agregar rápido al carrito"
              aria-label="Agregar ${product.name} al carrito"
            >
              <span>+</span> <span class="btn-add-text">Agregar</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function selectProduct(productId) {
  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (!product) return;

  selectedProductId = productId;

  // Actualizar selección activa en la columna izquierda sin perder scroll
  document.querySelectorAll('.product-row-card').forEach((card) => {
    const isMatch = card.dataset.id === productId;
    card.classList.toggle('active', isMatch);
    card.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });

  renderProductInspector();
}

// Helper compartido para generar HTML de badges de ingredientes y extras
function buildHighlightsHtml(highlights = []) {
  if (!highlights || highlights.length === 0) return '';
  return highlights.map((item) => `<span class="highlight-chip">✓ ${item}</span>`).join('');
}

function buildExtrasHtml(extras = [], inputClass = 'extra-input') {
  if (!extras || extras.length === 0) return '';
  return extras.map((extra) => `
    <label class="extra-checkbox-item">
      <input type="checkbox" class="${inputClass}" value="${extra.id}" data-name="${extra.name}" data-price="${extra.price}" />
      <span class="extra-name">${extra.name}</span>
      <span class="extra-price">+${formatCOP(extra.price)}</span>
    </label>
  `).join('');
}

function buildMetaPillsHtml(product) {
  const pills = [];
  if (product.prepTime) pills.push(`<span class="meta-pill">⏱️ ${product.prepTime}</span>`);
  if (product.portion) pills.push(`<span class="meta-pill">🍽️ ${product.portion}</span>`);
  return pills.join('');
}

function calculateSelectedTotal(basePrice, checkboxSelector, qty) {
  let extrasSum = 0;
  document.querySelectorAll(`${checkboxSelector}:checked`).forEach((input) => {
    extrasSum += parseInt(input.dataset.price, 10) || 0;
  });
  return (basePrice + extrasSum) * qty;
}

function collectSelectedExtras(checkboxSelector) {
  const selectedExtras = [];
  document.querySelectorAll(`${checkboxSelector}:checked`).forEach((input) => {
    selectedExtras.push({
      id: input.value,
      name: input.dataset.name,
      price: parseInt(input.dataset.price, 10) || 0
    });
  });
  return selectedExtras;
}

// Renderizar Columna Derecha (Descripción Completa & Personalización)
function renderProductInspector() {
  const inspector = document.getElementById('product-inspector');
  if (!inspector) return;

  const product = PRODUCTS_DATA.find((p) => p.id === selectedProductId);
  if (!product) {
    inspector.innerHTML = `
      <div class="inspector-empty">
        <span class="empty-icon">🍔</span>
        <h4>Selecciona un producto</h4>
        <p>Elige cualquier plato de la columna izquierda para descubrir sus ingredientes, descripción y adiciones.</p>
      </div>
    `;
    return;
  }

  inspectorQty = 1;
  const categoryLabel = CATEGORY_LABELS[product.category] || 'Menú';
  const hasExtras = product.availableExtras && product.availableExtras.length > 0;

  inspector.innerHTML = `
    <div class="inspector-animated-wrap">
      <div class="inspector-scroll-body">
        <div class="inspector-media" onclick="openProductDetail('${product.id}')" title="Tocar para ampliar">
          <img src="${product.image}" alt="${product.name}" />
          <div class="inspector-media-overlay"></div>
          <span class="inspector-cat-pill">${categoryLabel}</span>
          ${product.badge ? `<span class="inspector-badge">${product.badge}</span>` : ''}
        </div>

        <div class="inspector-body">
          <div class="inspector-header">
            <h3 class="inspector-title">${product.name}</h3>
            <div class="inspector-price">${formatCOP(product.price)}</div>
          </div>

          <div class="inspector-meta-pills">
            ${buildMetaPillsHtml(product)}
          </div>

          <div class="inspector-desc-block">
            <h4 class="inspector-section-label">Descripción del Plato</h4>
            <p class="inspector-description">${product.description}</p>
          </div>

          ${product.highlights && product.highlights.length > 0 ? `
            <div class="inspector-highlights">
              ${buildHighlightsHtml(product.highlights)}
            </div>
          ` : ''}

          ${hasExtras ? `
            <div class="inspector-extras-block">
              <div class="inspector-section-head">
                <h4 class="inspector-section-label">Personaliza con Adiciones</h4>
                <span class="optional-tag">Opcional</span>
              </div>
              <div class="extras-list">
                ${buildExtrasHtml(product.availableExtras, 'inspector-extra-input')}
              </div>
            </div>
          ` : ''}

          <div class="inspector-notes-block">
            <label for="inspector-notes-input" class="inspector-section-label">Notas para cocina (opcional)</label>
            <input
              type="text"
              id="inspector-notes-input"
              class="inspector-notes-input"
              placeholder="Ej: Sin cebolla, salsas aparte, bien asada..."
            />
          </div>
        </div>
      </div>

      <div class="inspector-footer">
        <div class="qty-control inspector-qty-control">
          <button type="button" id="inspector-qty-minus" aria-label="Disminuir cantidad">-</button>
          <span id="inspector-qty-val" class="qty-display">1</span>
          <button type="button" id="inspector-qty-plus" aria-label="Aumentar cantidad">+</button>
        </div>
        <button type="button" id="btn-inspector-add" class="btn-add-modal-cart">
          <span id="inspector-add-label">🛒 Agregar al Carrito</span>
          <span id="inspector-add-total">${formatCOP(product.price)}</span>
        </button>
      </div>
    </div>
  `;

  bindInspectorEvents(product);
}

function bindInspectorEvents(product) {
  const updateTotal = () => {
    const totalEl = document.getElementById('inspector-add-total');
    if (totalEl) {
      totalEl.textContent = formatCOP(
        calculateSelectedTotal(product.price, '.inspector-extra-input', inspectorQty)
      );
    }
  };

  document.querySelectorAll('.inspector-extra-input').forEach((input) => {
    input.addEventListener('change', updateTotal);
  });

  const minusBtn = document.getElementById('inspector-qty-minus');
  const plusBtn = document.getElementById('inspector-qty-plus');
  const qtyVal = document.getElementById('inspector-qty-val');

  if (minusBtn && plusBtn && qtyVal) {
    minusBtn.addEventListener('click', () => {
      if (inspectorQty > 1) {
        inspectorQty -= 1;
        qtyVal.textContent = inspectorQty;
        updateTotal();
      }
    });

    plusBtn.addEventListener('click', () => {
      inspectorQty += 1;
      qtyVal.textContent = inspectorQty;
      updateTotal();
    });
  }

  const addBtn = document.getElementById('btn-inspector-add');
  const addLabel = document.getElementById('inspector-add-label');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const notesInput = document.getElementById('inspector-notes-input');
      const notes = notesInput ? notesInput.value.trim() : '';
      const selectedExtras = collectSelectedExtras('.inspector-extra-input');

      window.appCart.addItem(product.id, inspectorQty, selectedExtras, notes);

      // Reset inputs tras agregar y mostrar feedback táctil breve
      inspectorQty = 1;
      if (qtyVal) qtyVal.textContent = '1';
      if (notesInput) notesInput.value = '';
      document.querySelectorAll('.inspector-extra-input').forEach((cb) => {
        cb.checked = false;
      });
      updateTotal();

      if (addLabel) {
        addLabel.textContent = '✓ ¡Agregado al Pedido!';
        addBtn.classList.add('added-feedback');
        setTimeout(() => {
          addLabel.textContent = '🛒 Agregar al Carrito';
          addBtn.classList.remove('added-feedback');
        }, 1200);
      }
    });
  }
}

function quickAddToCart(productId, btnEl) {
  window.appCart.addItem(productId, 1, [], '');
  if (btnEl) {
    const originalHtml = btnEl.innerHTML;
    btnEl.innerHTML = '<span>✓</span> Listo';
    btnEl.classList.add('added');
    setTimeout(() => {
      btnEl.innerHTML = originalHtml;
      btnEl.classList.remove('added');
    }, 900);
  }
}

// Modal de Detalle para Móvil (<= 820px)
function openProductDetail(productId) {
  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (!product) return;
  selectedProductForModal = product;

  const modal = document.getElementById('product-detail-modal');
  const backdrop = document.getElementById('product-modal-backdrop');

  document.getElementById('modal-detail-img').src = product.image;
  document.getElementById('modal-detail-title').textContent = product.name;
  document.getElementById('modal-detail-desc').textContent = product.description;
  document.getElementById('modal-detail-price').textContent = formatCOP(product.price);

  const metaEl = document.getElementById('modal-detail-meta');
  if (metaEl) metaEl.innerHTML = buildMetaPillsHtml(product);

  const highlightsEl = document.getElementById('modal-detail-highlights');
  if (highlightsEl) {
    highlightsEl.innerHTML = buildHighlightsHtml(product.highlights);
    highlightsEl.style.display = product.highlights && product.highlights.length > 0 ? 'flex' : 'none';
  }

  document.getElementById('detail-qty-val').textContent = '1';
  document.getElementById('detail-notes-input').value = '';

  const extrasContainer = document.getElementById('detail-extras-list');
  const extrasSection = document.getElementById('detail-extras-section');

  if (product.availableExtras && product.availableExtras.length > 0) {
    extrasSection.style.display = 'block';
    extrasContainer.innerHTML = buildExtrasHtml(product.availableExtras, 'extra-input');
  } else {
    extrasSection.style.display = 'none';
    extrasContainer.innerHTML = '';
  }

  updateDetailModalTotal();

  document.querySelectorAll('.extra-input').forEach((input) => {
    input.addEventListener('change', updateDetailModalTotal);
  });

  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.classList.add('modal-open');
}

function updateDetailModalTotal() {
  if (!selectedProductForModal) return;
  const qty = parseInt(document.getElementById('detail-qty-val').textContent, 10) || 1;
  const total = calculateSelectedTotal(selectedProductForModal.price, '.extra-input', qty);
  const totalBtnSpan = document.getElementById('modal-add-btn-total');
  if (totalBtnSpan) {
    totalBtnSpan.textContent = formatCOP(total);
  }
}

function initProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  const backdrop = document.getElementById('product-modal-backdrop');
  const closeBtn = document.getElementById('close-product-modal');

  const closeDetail = () => {
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
  if (backdrop) backdrop.addEventListener('click', closeDetail);

  const minusBtn = document.getElementById('detail-qty-minus');
  const plusBtn = document.getElementById('detail-qty-plus');
  const qtySpan = document.getElementById('detail-qty-val');

  if (minusBtn && plusBtn && qtySpan) {
    minusBtn.addEventListener('click', () => {
      const current = parseInt(qtySpan.textContent, 10);
      if (current > 1) {
        qtySpan.textContent = current - 1;
        updateDetailModalTotal();
      }
    });

    plusBtn.addEventListener('click', () => {
      const current = parseInt(qtySpan.textContent, 10);
      qtySpan.textContent = current + 1;
      updateDetailModalTotal();
    });
  }

  const addBtn = document.getElementById('btn-add-from-modal');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!selectedProductForModal) return;
      const qty = parseInt(document.getElementById('detail-qty-val').textContent, 10) || 1;
      const notes = document.getElementById('detail-notes-input').value.trim();
      const selectedExtras = collectSelectedExtras('.extra-input');

      window.appCart.addItem(selectedProductForModal.id, qty, selectedExtras, notes);
      closeDetail();
    });
  }
}
