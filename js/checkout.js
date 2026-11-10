// Manejador del Checkout y Envío Directo a WhatsApp
// Número de WhatsApp configurado por el usuario: 3126292030 (Colombia +57)
const WHATSAPP_PHONE_NUMBER = '573126292030';

class CheckoutManager {
  constructor(cart) {
    this.cart = cart;
    this.initEventListeners();
  }

  initEventListeners() {
    // Botón para proceder al checkout desde el carrito
    const proceedBtn = document.getElementById('btn-proceed-checkout');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (this.cart.items.length === 0) {
          alert('Tu carrito está vacío. Agrega deliciosos productos antes de continuar.');
          return;
        }
        this.cart.closeCartDrawer();
        this.openCheckoutModal();
      });
    }

    // Cerrar modal de checkout
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const checkoutBackdrop = document.getElementById('checkout-backdrop');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', () => this.closeCheckoutModal());
    if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', () => this.closeCheckoutModal());

    // Cambio en tipo de pedido (domicilio vs recoger)
    const deliveryRadio = document.getElementsByName('delivery-type');
    deliveryRadio.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const addressGroup = document.getElementById('address-group');
        const deliveryFeeRow = document.getElementById('checkout-delivery-fee-row');
        if (e.target.value === 'pickup') {
          if (addressGroup) addressGroup.style.display = 'none';
          if (deliveryFeeRow) deliveryFeeRow.style.display = 'none';
        } else {
          if (addressGroup) addressGroup.style.display = 'block';
          if (deliveryFeeRow) deliveryFeeRow.style.display = 'flex';
        }
        this.updateCheckoutTotals();
      });
    });

    // Envío del formulario
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processWhatsAppOrder();
      });
    }
  }

  openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const backdrop = document.getElementById('checkout-backdrop');
    this.updateCheckoutTotals();
    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('modal-open');
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const backdrop = document.getElementById('checkout-backdrop');
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  getDeliveryType() {
    const checked = document.querySelector('input[name="delivery-type"]:checked');
    return checked ? checked.value : 'delivery';
  }

  updateCheckoutTotals() {
    const deliveryType = this.getDeliveryType();
    const subtotal = this.cart.getSubtotal();
    const deliveryFee = this.cart.getDeliveryFee(deliveryType);
    const total = this.cart.getTotal(deliveryType);

    const subtotalEl = document.getElementById('modal-subtotal-val');
    const deliveryEl = document.getElementById('modal-delivery-val');
    const totalEl = document.getElementById('modal-total-val');

    if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
    if (deliveryEl) {
      deliveryEl.textContent = deliveryFee === 0 ? (deliveryType === 'pickup' ? 'No aplica ($0)' : 'GRATIS 🎉') : formatCOP(deliveryFee);
    }
    if (totalEl) totalEl.textContent = formatCOP(total);
  }

  processWhatsAppOrder() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const deliveryType = this.getDeliveryType();
    const address = document.getElementById('cust-address') ? document.getElementById('cust-address').value.trim() : '';
    const neighborhood = document.getElementById('cust-neighborhood') ? document.getElementById('cust-neighborhood').value.trim() : '';
    const paymentMethod = document.getElementById('cust-payment').value;
    const paymentChange = document.getElementById('cust-change').value.trim();
    const orderNotes = document.getElementById('cust-notes').value.trim();

    if (!name) {
      alert('Por favor ingresa tu nombre.');
      return;
    }
    if (deliveryType === 'delivery' && !address) {
      alert('Por favor ingresa la dirección de entrega.');
      return;
    }

    const subtotal = this.cart.getSubtotal();
    const deliveryFee = this.cart.getDeliveryFee(deliveryType);
    const total = this.cart.getTotal(deliveryType);

    // Formatear mensaje para WhatsApp con diseño limpio y profesional
    let message = `🔥 *NUEVO PEDIDO - FUEGO URBANO* 🔥\n`;
    message += `═══════════════════════════\n`;
    message += `👤 *Cliente:* ${name}\n`;
    if (phone) message += `📱 *Teléfono de contacto:* ${phone}\n`;
    message += `🛵 *Modalidad:* ${deliveryType === 'delivery' ? 'Domicilio a Dirección' : 'Recoger en el Local'}\n`;
    
    if (deliveryType === 'delivery') {
      message += `📍 *Dirección:* ${address}\n`;
      if (neighborhood) message += `🏘️ *Barrio / Referencia:* ${neighborhood}\n`;
    }

    message += `💳 *Método de Pago:* ${paymentMethod}\n`;
    if (paymentChange && paymentMethod.toLowerCase().includes('efectivo')) {
      message += `💵 *Paga con:* $${paymentChange} (requiere cambio)\n`;
    }

    message += `═══════════════════════════\n`;
    message += `📋 *DETALLE DEL PEDIDO:*\n`;

    this.cart.items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.quantity}x ${item.name}* — ${formatCOP(item.unitPrice * item.quantity)}\n`;
      if (item.extras && item.extras.length > 0) {
        item.extras.forEach(extra => {
          message += `   └ ➕ ${extra.name} (${formatCOP(extra.price)})\n`;
        });
      }
      if (item.notes) {
        message += `   └ 📝 Nota: "${item.notes}"\n`;
      }
    });

    message += `\n═══════════════════════════\n`;
    message += `📊 *Subtotal:* ${formatCOP(subtotal)}\n`;
    message += `🛵 *Costo Domicilio:* ${deliveryFee === 0 ? 'GRATIS' : formatCOP(deliveryFee)}\n`;
    message += `💰 *TOTAL A PAGAR:* ${formatCOP(total)}\n`;
    message += `═══════════════════════════\n`;

    if (orderNotes) {
      message += `📌 *Observaciones adicionales:* ${orderNotes}\n\n`;
    }

    message += `¡Muchas gracias! Quedo a la espera de la confirmación de mi pedido. 🍔✨`;

    // Codificar para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;

    // Abrir WhatsApp en nueva pestaña o app
    window.open(whatsappUrl, '_blank');

    // Cerrar modal y felicitar
    this.closeCheckoutModal();
    this.cart.clearCart();
    
    this.cart.showToast('¡Pedido generado! Abriendo WhatsApp... 💬');
  }
}
