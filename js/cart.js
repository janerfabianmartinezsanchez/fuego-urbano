// Gestor del Carrito de Compras para Fuego Urbano
const DELIVERY_FEE = 5000;
const FREE_DELIVERY_THRESHOLD = 80000;

class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.initEventListeners();
    this.updateUI();
  }

  loadCart() {
    try {
      const stored = localStorage.getItem('fuego_urbano_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error cargando carrito:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('fuego_urbano_cart', JSON.stringify(this.items));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  }

  // Genera un ID único para un item considerando sus extras seleccionados
  generateItemKey(productId, selectedExtras = []) {
    const sortedExtras = [...selectedExtras].map(e => e.id).sort().join('-');
    return `${productId}_${sortedExtras}`;
  }

  addItem(productId, quantity = 1, selectedExtras = [], specialNotes = '') {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const itemKey = this.generateItemKey(productId, selectedExtras);
    const existingIndex = this.items.findIndex(item => item.key === itemKey);

    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.price + extrasTotal;

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
      if (specialNotes) {
        this.items[existingIndex].notes = specialNotes;
      }
    } else {
      this.items.push({
        key: itemKey,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        unitPrice: unitPrice,
        image: product.image,
        quantity: quantity,
        extras: selectedExtras,
        notes: specialNotes
      });
    }

    this.saveCart();
    this.updateUI();
    this.triggerCartBounce();
    this.showToast(`¡"${product.name}" agregado al carrito! 🛒`);
  }

  updateQuantity(itemKey, delta) {
    const itemIndex = this.items.findIndex(item => item.key === itemKey);
    if (itemIndex === -1) return;

    this.items[itemIndex].quantity += delta;

    if (this.items[itemIndex].quantity <= 0) {
      this.items.splice(itemIndex, 1);
      this.showToast('Producto eliminado del pedido');
    }

    this.saveCart();
    this.updateUI();
  }

  removeItem(itemKey) {
    const itemIndex = this.items.findIndex(item => item.key === itemKey);
    if (itemIndex !== -1) {
      const removed = this.items.splice(itemIndex, 1);
      this.saveCart();
      this.updateUI();
      this.showToast(`Eliminado del pedido: ${removed[0].name}`);
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateUI();
  }

  getTotalCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getDeliveryFee(deliveryType = 'delivery') {
    if (deliveryType === 'pickup') return 0;
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  }

  getTotal(deliveryType = 'delivery') {
    return this.getSubtotal() + this.getDeliveryFee(deliveryType);
  }

  triggerCartBounce() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.classList.remove('bounce-badge');
      void b.offsetWidth; // re-flow
      b.classList.add('bounce-badge');
    });
  }

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<span>🔥</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  updateUI() {
    const count = this.getTotalCount();
    const subtotal = this.getSubtotal();
    const delivery = this.getDeliveryFee();
    const total = this.getTotal();

    // Actualizar contadores
    document.querySelectorAll('.cart-count-val').forEach(el => {
      el.textContent = count;
    });

    const floatingBtn = document.getElementById('floating-cart-btn');
    if (floatingBtn) {
      if (count > 0) {
        floatingBtn.classList.remove('hidden');
      } else {
        floatingBtn.classList.add('hidden');
      }
    }

    // Actualizar resumen en el drawer
    const cartItemsList = document.getElementById('cart-items-list');
    const cartEmptyState = document.getElementById('cart-empty-state');
    const cartFooter = document.getElementById('cart-drawer-footer');

    if (!cartItemsList) return;

    if (this.items.length === 0) {
      cartItemsList.innerHTML = '';
      if (cartEmptyState) cartEmptyState.style.display = 'flex';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    cartItemsList.innerHTML = this.items.map(item => {
      const extrasHtml = item.extras && item.extras.length > 0 
        ? `<div class="cart-item-extras">
            ${item.extras.map(e => `<span>+ ${e.name} (${formatCOP(e.price)})</span>`).join('')}
           </div>`
        : '';
        
      const notesHtml = item.notes 
        ? `<div class="cart-item-note">📝 "${item.notes}"</div>` 
        : '';

      return `
        <div class="cart-item-card" data-key="${item.key}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">${formatCOP(item.unitPrice)} c/u</div>
            ${extrasHtml}
            ${notesHtml}
            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="btn-qty-minus" onclick="window.appCart.updateQuantity('${item.key}', -1)">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="btn-qty-plus" onclick="window.appCart.updateQuantity('${item.key}', 1)">+</button>
              </div>
              <div class="cart-item-subtotal">${formatCOP(item.unitPrice * item.quantity)}</div>
              <button class="btn-item-delete" onclick="window.appCart.removeItem('${item.key}')" title="Eliminar">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Actualizar totales numéricos en drawer
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const deliveryEl = document.getElementById('cart-delivery-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
    if (deliveryEl) {
      deliveryEl.textContent = delivery === 0 ? 'GRATIS 🎉' : formatCOP(delivery);
    }
    if (totalEl) totalEl.textContent = formatCOP(total);
  }

  initEventListeners() {
    // Abrir drawer
    const openButtons = document.querySelectorAll('.btn-open-cart');
    openButtons.forEach(btn => {
      btn.addEventListener('click', () => this.openCartDrawer());
    });

    // Cerrar drawer
    const closeBtn = document.getElementById('close-cart-btn');
    const backdrop = document.getElementById('cart-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCartDrawer());
    if (backdrop) backdrop.addEventListener('click', () => this.closeCartDrawer());

    // Botón vaciar carrito
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Deseas vaciar todos los productos del carrito?')) {
          this.clearCart();
        }
      });
    }
  }

  openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('modal-open');
  }

  closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}
