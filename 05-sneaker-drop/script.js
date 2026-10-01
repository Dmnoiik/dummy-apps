/**
 * KICKS // VAULT — Streetwear & Hypebeast Sneaker Drops
 * Interactive Release Terminal Engine
 */

(function () {
  'use strict';

  // --- Catalog Drop Allocation Database ---
  const CATALOG_DROPS = [
    {
      id: 'snk_01',
      sku: 'DZ4137-700',
      brand: 'nike',
      title: "Travis Scott x AJ1 Low OG 'Canary'",
      retailPrice: 150.00,
      resaleEst: 580.00,
      accentColor: '#ffd500',
      tag: 'GRAIL OF THE WEEK',
      stockRemaining: 12,
      sizes: [
        { size: 'US 7.5', stock: 2 },
        { size: 'US 8.0', stock: 4 },
        { size: 'US 8.5', stock: 3 },
        { size: 'US 9.0', stock: 8 },
        { size: 'US 9.5', stock: 6 },
        { size: 'US 10.0', stock: 5 },
        { size: 'US 10.5', stock: 4 },
        { size: 'US 11.0', stock: 2 },
        { size: 'US 11.5', stock: 1 },
        { size: 'US 12.0', stock: 0 }
      ]
    },
    {
      id: 'snk_02',
      sku: 'B75571',
      brand: 'yeezy',
      title: "Yeezy Boost 700 'Wave Runner'",
      retailPrice: 300.00,
      resaleEst: 420.00,
      accentColor: '#00e5ff',
      tag: 'RESTOCK TIER-1',
      stockRemaining: 6,
      sizes: [
        { size: 'US 8.0', stock: 2 },
        { size: 'US 9.0', stock: 3 },
        { size: 'US 10.0', stock: 1 },
        { size: 'US 11.0', stock: 0 }
      ]
    },
    {
      id: 'snk_03',
      sku: 'CU3244-100',
      brand: 'nike',
      title: "Nike SB Dunk Low 'Chunky Dunky'",
      retailPrice: 110.00,
      resaleEst: 1450.00,
      accentColor: '#00c853',
      tag: 'HYPER-ALLOCATION',
      stockRemaining: 3,
      sizes: [
        { size: 'US 8.5', stock: 1 },
        { size: 'US 9.0', stock: 1 },
        { size: 'US 10.0', stock: 1 }
      ]
    },
    {
      id: 'snk_04',
      sku: 'AO4606-700',
      brand: 'nike',
      title: "Off-White x Nike Air Force 1 'Volt'",
      retailPrice: 170.00,
      resaleEst: 890.00,
      accentColor: '#d4ff00',
      tag: 'VAULT ARCHIVE',
      stockRemaining: 4,
      sizes: [
        { size: 'US 9.0', stock: 2 },
        { size: 'US 9.5', stock: 1 },
        { size: 'US 10.5', stock: 1 }
      ]
    },
    {
      id: 'snk_05',
      sku: 'U990TO3',
      brand: 'new balance',
      title: "JJJJound x New Balance 990v3 'Olive'",
      retailPrice: 220.00,
      resaleEst: 460.00,
      accentColor: '#556b2f',
      tag: 'COLLAB RELEASE',
      stockRemaining: 7,
      sizes: [
        { size: 'US 8.0', stock: 2 },
        { size: 'US 9.0', stock: 3 },
        { size: 'US 10.0', stock: 2 }
      ]
    },
    {
      id: 'snk_06',
      sku: 'FD1437-030',
      brand: 'nike',
      title: "Tiffany & Co. x Nike Air Force 1 '1837'",
      retailPrice: 400.00,
      resaleEst: 1150.00,
      accentColor: '#00b2a9',
      tag: 'LUXURY DROP',
      stockRemaining: 2,
      sizes: [
        { size: 'US 9.0', stock: 1 },
        { size: 'US 10.0', stock: 1 }
      ]
    }
  ];

  const ANGLES = ['LATERAL', 'MEDIAL', 'HEEL', 'TOP-DOWN'];
  const MAX_PER_CUSTOMER = 2;
  const TAX_RATE = 0.085;
  const HOLD_DURATION_SECONDS = 600; // 10 minutes

  class SneakerDropTerminal {
    constructor() {
      // Hero Selection State
      this.heroSelectedSize = 'US 9.0';
      this.currentAngleIndex = 0;

      // Drop Catalog Filter
      this.activeFilter = 'all';

      // Shopping Cart State: Array<{ cartId, dropId, title, sku, size, unitPrice, qty, datasetHoldBuffer }>
      this.cart = [];
      this.appliedVoucher = null;

      // 10-Minute Cart Hold Countdown
      this.holdTimer = null;
      this.secondsRemaining = HOLD_DURATION_SECONDS;

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Nav
        cartCountBadge: document.getElementById('cartCountBadge'),
        cartTotalHeader: document.getElementById('cartTotalHeader'),
        btnOpenCart: document.getElementById('btnOpenCart'),

        // Hero Product
        heroSneakerSvg: document.getElementById('heroSneakerSvg'),
        heroColorAccent: document.getElementById('heroColorAccent'),
        angleButtons: document.querySelectorAll('.angle-btn'),
        btnNextAngle: document.getElementById('btnNextAngle'),
        heroSizesGrid: document.getElementById('heroSizesGrid'),
        liveStockNote: document.getElementById('liveStockNote'),
        btnHeroQuickBuy: document.getElementById('btnHeroQuickBuy'),
        btnResaleTool: document.getElementById('btnResaleTool'),

        // Catalog
        catalogFilters: document.getElementById('catalogFilters'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        catalogGrid: document.getElementById('catalogGrid'),

        // Cart Drawer
        cartOverlay: document.getElementById('cartOverlay'),
        cartDrawer: document.getElementById('cartDrawer'),
        btnCloseCart: document.getElementById('btnCloseCart'),
        cartTimerCountdown: document.getElementById('cartTimerCountdown'),
        cartTimerFill: document.getElementById('cartTimerFill'),
        cartItemsList: document.getElementById('cartItemsList'),
        emptyCartMessage: document.getElementById('emptyCartMessage'),

        voucherInput: document.getElementById('voucherInput'),
        btnApplyVoucher: document.getElementById('btnApplyVoucher'),
        voucherFeedback: document.getElementById('voucherFeedback'),
        checkInsurance: document.getElementById('checkInsurance'),

        priceCartSubtotal: document.getElementById('priceCartSubtotal'),
        rowVoucherDiscount: document.getElementById('rowVoucherDiscount'),
        priceVoucherDiscount: document.getElementById('priceVoucherDiscount'),
        priceShipping: document.getElementById('priceShipping'),
        priceTax: document.getElementById('priceTax'),
        priceGrandTotal: document.getElementById('priceGrandTotal'),
        btnTriggerCheckout: document.getElementById('btnTriggerCheckout'),

        // Checkout Modal
        checkoutModal: document.getElementById('checkoutModal'),
        checkoutForm: document.getElementById('checkoutForm'),
        btnCloseCheckoutModal: document.getElementById('btnCloseCheckoutModal'),
        btnCancelCheckout: document.getElementById('btnCancelCheckout'),
        inputCaptcha: document.getElementById('inputCaptcha'),
        captchaChallenge: document.getElementById('captchaChallenge'),
        errCaptcha: document.getElementById('errCaptcha'),
        custName: document.getElementById('custName'),
        errCustName: document.getElementById('errCustName'),
        custEmail: document.getElementById('custEmail'),
        errCustEmail: document.getElementById('errCustEmail'),
        custAddress: document.getElementById('custAddress'),
        errCustAddress: document.getElementById('errCustAddress'),
        modalAuthorizeAmount: document.getElementById('modalAuthorizeAmount'),

        // Arbitrage Modal
        arbitrageModal: document.getElementById('arbitrageModal'),
        btnCloseArbitrageModal: document.getElementById('btnCloseArbitrageModal'),
        btnRunSimulation: document.getElementById('btnRunSimulation'),
        arbRetailVal: document.getElementById('arbRetailVal'),
        arbPeakVal: document.getElementById('arbPeakVal'),
        arbProfitVal: document.getElementById('arbProfitVal'),

        // Success Modal
        successModal: document.getElementById('successModal'),
        successOrderRef: document.getElementById('successOrderRef'),
        successReceiptDetails: document.getElementById('successReceiptDetails'),
        btnDismissSuccess: document.getElementById('btnDismissSuccess'),

        // Toast
        toast: document.getElementById('vaultToast')
      };
    }

    init() {
      this.bindEvents();
      this.renderCatalog();
      this.updateCart();
    }

    // --- 360 Angle View Renderer ---
    setAngleView(index) {
      this.currentAngleIndex = index;

      this.dom.angleButtons.forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      const currentAngle = ANGLES[index];
      const g = document.getElementById('sneakerGraphicGroup');

      if (currentAngle === 'LATERAL') {
        g.setAttribute('transform', 'translate(0, 0) scale(1, 1)');
        g.style.opacity = '1';
      } else if (currentAngle === 'MEDIAL') {
        g.setAttribute('transform', 'translate(600, 0) scale(-1, 1)');
        g.style.opacity = '1';
      } else if (currentAngle === 'HEEL') {
        g.setAttribute('transform', 'translate(200, 20) scale(0.65, 0.9)');
        g.style.opacity = '1';
      } else if (currentAngle === 'TOP-DOWN') {
        g.setAttribute('transform', 'translate(80, 50) rotate(-20 300 180) scale(0.85, 0.85)');
        g.style.opacity = '1';
      } else {
        // Out of bounds state
        g.style.opacity = '0';
      }
    }

    stepNextAngle() {
      // Step sequentially through views
      this.currentAngleIndex = (this.currentAngleIndex + 1) % 5;
      this.setAngleView(this.currentAngleIndex);
    }

    // --- Catalog Grid Rendering ---
    renderCatalog() {
      this.dom.catalogGrid.innerHTML = '';

      const filtered = CATALOG_DROPS.filter((drop) => {
        if (this.activeFilter === 'all') return true;
        return drop.brand === this.activeFilter;
      });

      filtered.forEach((drop) => {
        const card = document.createElement('article');
        card.className = 'drop-card';
        card.dataset.id = drop.id;
        card.dataset.brand = drop.brand;
        card.dataset.selectedSize = drop.sizes[0].size;

        // Heat Tag
        const heatTag = document.createElement('div');
        heatTag.className = 'card-heat-tag';
        heatTag.textContent = drop.tag;
        card.appendChild(heatTag);

        // Graphic Stage
        const imgBox = document.createElement('div');
        imgBox.className = 'card-image-box';
        imgBox.innerHTML = `
          <svg viewBox="0 0 400 240" class="card-sneaker-svg">
            <g transform="translate(10, 20) scale(0.65)">
              <path d="M 60 270 Q 140 285 280 280 Q 420 275 520 260 Q 540 255 535 240 Q 510 238 480 235 Q 360 235 220 240 Q 120 245 70 240 Q 50 240 55 258 Z" fill="#1f1f1f" />
              <path d="M 65 255 Q 160 262 290 258 Q 420 252 510 240 Q 520 230 500 220 Q 370 222 230 228 Q 130 230 80 235 Z" fill="#ffffff" />
              <path d="M 85 235 Q 140 233 210 230 Q 280 200 350 150 Q 400 120 440 100 Q 460 110 470 140 Q 480 180 500 220 Q 440 225 350 225 Q 230 228 120 232 Z" fill="#181818" />
              <path d="M 120 232 Q 200 230 290 200 Q 370 150 440 100 Q 420 90 380 105 Q 310 140 230 180 Q 170 205 110 220 Z" fill="${drop.accentColor}" />
              <path d="M 160 215 Q 260 190 380 140 Q 440 110 470 115 Q 450 140 370 185 Q 280 220 180 225 Z" fill="#ffffff" opacity="0.9" />
            </g>
          </svg>
        `;
        card.appendChild(imgBox);

        // Content
        const content = document.createElement('div');
        content.className = 'card-content';

        const brand = document.createElement('span');
        brand.className = 'card-brand';
        brand.textContent = drop.brand.toUpperCase();

        const title = document.createElement('h4');
        title.className = 'card-title';
        title.textContent = drop.title;

        // Size choices
        const sizeRow = document.createElement('div');
        sizeRow.className = 'card-sizes-row';

        drop.sizes.forEach((s, idx) => {
          const sizeBtn = document.createElement('button');
          sizeBtn.type = 'button';
          sizeBtn.className = `mini-size-btn ${idx === 0 ? 'active' : ''}`;
          sizeBtn.dataset.size = s.size;
          sizeBtn.textContent = s.size;

          if (s.stock === 0) {
            sizeBtn.disabled = true;
            sizeBtn.style.opacity = '0.3';
          }

          sizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sizeRow.querySelectorAll('.mini-size-btn').forEach((b) => b.classList.remove('active'));
            sizeBtn.classList.add('active');
          });

          sizeRow.appendChild(sizeBtn);
        });

        // Price & Stock
        const priceRow = document.createElement('div');
        priceRow.className = 'card-price-row';
        priceRow.innerHTML = `
          <span class="card-price">$${drop.retailPrice.toFixed(2)}</span>
          <span class="card-stock">${drop.stockRemaining} LEFT</span>
        `;

        // Quick Add Button
        const btnAdd = document.createElement('button');
        btnAdd.type = 'button';
        btnAdd.className = 'btn-card-add';
        btnAdd.textContent = 'SECURE PAIR';
        btnAdd.dataset.holdBuffer = '60';

        btnAdd.addEventListener('click', () => {
          const selectedSize = card.dataset.selectedSize || 'US 9.0';
          this.addToCart(drop, selectedSize, btnAdd.dataset.holdBuffer);
        });

        content.appendChild(brand);
        content.appendChild(title);
        content.appendChild(sizeRow);
        content.appendChild(priceRow);
        content.appendChild(btnAdd);

        card.appendChild(content);
        this.dom.catalogGrid.appendChild(card);
      });
    }

    // --- Cart & Drop Allocation Tray ---
    addToCart(drop, size, holdBuffer) {
      const existing = this.cart.find((c) => c.dropId === drop.id && c.size === size);

      if (existing) {
        if (existing.qty > MAX_PER_CUSTOMER) {
          this.showToast(`Limit reached: maximum ${MAX_PER_CUSTOMER} pairs per customer.`);
          return;
        }
        existing.qty += 1;
      } else {
        this.cart.push({
          cartId: 'item_' + Date.now(),
          dropId: drop.id,
          sku: drop.sku,
          title: drop.title,
          size: size,
          unitPrice: drop.retailPrice,
          qty: 1,
          datasetHoldBuffer: holdBuffer || '60'
        });
      }

      // Extend hold countdown
      this.secondsRemaining = (this.secondsRemaining || 0) + (holdBuffer || 60);
      this.startHoldTimer();

      this.updateCart();
      this.showToast(`Reserved ${drop.title} (${size}) in your SNKRS Bag`);
      this.openCart();
    }

    updateCart() {
      // 1. Badge & Counts
      const totalUnits = this.cart.reduce((sum, item) => sum + item.qty, 0);
      this.dom.cartCountBadge.textContent = totalUnits.toString();

      // 2. Render Items
      if (this.cart.length === 0) {
        this.dom.emptyCartMessage.style.display = 'block';
        this.dom.cartItemsList.innerHTML = '';
        this.dom.cartItemsList.appendChild(this.dom.emptyCartMessage);
        this.dom.btnTriggerCheckout.disabled = true;
      } else {
        this.dom.emptyCartMessage.style.display = 'none';
        this.dom.cartItemsList.innerHTML = '';

        this.cart.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'cart-item-card';

          const top = document.createElement('div');
          top.className = 'cart-item-top';
          top.innerHTML = `
            <div>
              <span class="item-sku">SKU: ${item.sku}</span>
              <h4 class="cart-item-name">${item.title}</h4>
            </div>
            <span class="cart-item-price">$${(item.unitPrice * item.qty).toFixed(2)}</span>
          `;

          const meta = document.createElement('div');
          meta.className = 'cart-item-meta';
          meta.textContent = `SIZE: ${item.size} &bull; TIER-1 DEADSTOCK`;

          const bottom = document.createElement('div');
          bottom.className = 'cart-item-bottom';

          const qtyBox = document.createElement('div');
          qtyBox.className = 'qty-control';

          const btnMinus = document.createElement('button');
          btnMinus.className = 'qty-btn';
          btnMinus.textContent = '-';
          btnMinus.addEventListener('click', () => {
            if (item.qty > 1) {
              item.qty -= 1;
            } else {
              this.cart = this.cart.filter((c) => c.cartId !== item.cartId);
            }
            this.updateCart();
          });

          const qtyDisplay = document.createElement('span');
          qtyDisplay.className = 'qty-num';
          qtyDisplay.textContent = item.qty.toString();

          const btnPlus = document.createElement('button');
          btnPlus.className = 'qty-btn';
          btnPlus.textContent = '+';
          btnPlus.addEventListener('click', () => {
            if (item.qty > MAX_PER_CUSTOMER) {
              this.showToast(`Allocation cap: max ${MAX_PER_CUSTOMER} per customer.`);
              return;
            }
            item.qty += 1;
            this.updateCart();
          });

          qtyBox.appendChild(btnMinus);
          qtyBox.appendChild(qtyDisplay);
          qtyBox.appendChild(btnPlus);

          const btnRemove = document.createElement('button');
          btnRemove.className = 'btn-remove';
          btnRemove.textContent = 'RELEASE ALLOCATION';
          btnRemove.addEventListener('click', () => {
            this.cart = this.cart.filter((c) => c.cartId !== item.cartId);
            this.updateCart();
          });

          bottom.appendChild(qtyBox);
          bottom.appendChild(btnRemove);

          card.appendChild(top);
          card.appendChild(meta);
          card.appendChild(bottom);

          this.dom.cartItemsList.appendChild(card);
        });

        this.dom.btnTriggerCheckout.disabled = false;
      }

      // 3. Financial Calculation
      const subtotal = this.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

      // Voucher discount check
      let voucherDiscount = 0;
      if (this.appliedVoucher === 'KICKS50') {
        voucherDiscount = 50.00;
      }

      // Insurance fee toggle calculation
      const isInsured = this.dom.checkInsurance.checked;
      const shippingFee = !isInsured ? 15.00 : 0.00;

      const taxableBase = Math.max(0, subtotal - voucherDiscount);
      const tax = taxableBase * TAX_RATE;
      const grandTotal = taxableBase + shippingFee + tax;

      // 4. Update UI Displays
      this.dom.priceCartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      this.dom.priceShipping.textContent = shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`;
      this.dom.priceTax.textContent = `$${tax.toFixed(2)}`;
      this.dom.priceGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
      this.dom.cartTotalHeader.textContent = `$${grandTotal.toFixed(2)}`;

      if (voucherDiscount > 0) {
        this.dom.rowVoucherDiscount.style.display = 'flex';
        this.dom.priceVoucherDiscount.textContent = `-$${voucherDiscount.toFixed(2)}`;
      } else {
        this.dom.rowVoucherDiscount.style.display = 'none';
      }
    }

    applyVoucher() {
      const code = this.dom.voucherInput.value;
      const subtotal = this.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

      if (!code) {
        this.dom.voucherFeedback.className = 'voucher-message error';
        this.dom.voucherFeedback.textContent = 'Please enter a VIP drop code.';
        return;
      }

      if (code === 'KICKS50') {
        if (subtotal < 300) {
          this.dom.voucherFeedback.className = 'voucher-message error';
          this.dom.voucherFeedback.textContent = 'Voucher requires minimum order of $300.';
          return;
        }

        this.appliedVoucher = 'KICKS50';
        this.dom.voucherFeedback.className = 'voucher-message success';
        this.dom.voucherFeedback.textContent = '✓ $50.00 VIP Allocation discount applied!';
        this.updateCart();
      } else {
        this.dom.voucherFeedback.className = 'voucher-message error';
        this.dom.voucherFeedback.textContent = 'Invalid or expired VIP drop pass.';
      }
    }

    // --- 10-Minute Cart Hold Timer ---
    startHoldTimer() {
      if (this.holdTimer) return;

      this.updateTimerDisplay();
      this.holdTimer = setInterval(() => {
        this.secondsRemaining--;
        this.updateTimerDisplay();

        if (this.secondsRemaining <= 0) {
          clearInterval(this.holdTimer);
          this.holdTimer = null;
          this.cart = [];
          this.updateCart();
          this.showToast('Drop allocation reservation expired. Items released to queue.');
        }
      }, 1000);
    }

    updateTimerDisplay() {
      const mins = Math.floor(this.secondsRemaining / 60);
      const secs = this.secondsRemaining % 60;
      this.dom.cartTimerCountdown.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      const pct = Math.min(100, Math.max(0, (this.secondsRemaining / HOLD_DURATION_SECONDS) * 100));
      this.dom.cartTimerFill.style.width = `${pct}%`;
    }

    openCart() {
      this.dom.cartDrawer.classList.add('active');
      this.dom.cartOverlay.classList.add('active');
    }

    closeCart() {
      this.dom.cartDrawer.classList.remove('active');
      this.dom.cartOverlay.classList.remove('active');
    }

    // --- Unmemoized Resale Arbitrage Simulator ---
    simulateVolatilityTree(events, depth) {
      if (depth <= 0 || events.length === 0) {
        return events.reduce((sum, e) => sum + e.drift, 0);
      }

      const head = events[0];
      const tail = events.slice(1);
      const headFactor = head ? head.drift * 0.12 : 0;

      return headFactor +
        this.simulateVolatilityTree(tail, depth - 1) +
        this.simulateVolatilityTree(tail, depth - 1);
    }

    runArbitrageSimulation() {
      const events = [
        { name: 'StockX Spike', drift: 120 },
        { name: 'GOAT Sold Out', drift: 80 },
        { name: 'SNKRS L Batch', drift: 150 },
        { name: 'Celebrity Fit Pic', drift: 210 },
        { name: 'Asia Restock Delay', drift: 75 },
        { name: 'Deadstock Scarcity', drift: 90 },
        { name: 'Euro Vault Allocation', drift: 65 },
        { name: 'Hype Index High', drift: 140 }
      ];

      // Exponential binary call tree
      const computed = this.simulateVolatilityTree(events, events.length);
      const retail = 150.00;
      const peak = retail + Math.round(computed % 500) + 340;
      const profit = peak - retail;

      this.dom.arbRetailVal.textContent = `$${retail.toFixed(2)}`;
      this.dom.arbPeakVal.textContent = `$${peak.toFixed(2)}`;
      this.dom.arbProfitVal.textContent = `+$${profit.toFixed(2)}`;
      this.showToast('Volatility spread simulated across secondary exchanges.');
    }

    // --- Checkout Flow & Anti-Bot Captcha ---
    openCheckout() {
      if (this.cart.length === 0) return;
      this.closeCart();
      this.dom.modalAuthorizeAmount.textContent = this.dom.priceGrandTotal.textContent;
      this.dom.errCaptcha.textContent = '';
      this.dom.errCustName.textContent = '';
      this.dom.errCustEmail.textContent = '';
      this.dom.errCustAddress.textContent = '';
      this.dom.inputCaptcha.value = '';
      this.dom.checkoutModal.showModal();
    }

    handleCheckoutSubmit(e) {
      e.preventDefault();

      const captchaInput = this.dom.inputCaptcha.value;
      const name = this.dom.custName.value.trim();
      const email = this.dom.custEmail.value.trim();
      const address = this.dom.custAddress.value.trim();

      let hasError = false;

      // Strict uppercase captcha verification
      if (captchaInput !== 'KICKS2026') {
        this.dom.errCaptcha.textContent = 'Security passkey incorrect. Please enter exact code.';
        hasError = true;
      } else {
        this.dom.errCaptcha.textContent = '';
      }

      if (!name) {
        this.dom.errCustName.textContent = 'Customer name is required.';
        hasError = true;
      } else {
        this.dom.errCustName.textContent = '';
      }

      if (!email || !email.includes('@')) {
        this.dom.errCustEmail.textContent = 'Valid email required for priority dispatch.';
        hasError = true;
      } else {
        this.dom.errCustEmail.textContent = '';
      }

      if (!address) {
        this.dom.errCustAddress.textContent = 'Shipping destination address required.';
        hasError = true;
      } else {
        this.dom.errCustAddress.textContent = '';
      }

      if (hasError) return;

      // Complete order
      this.dom.checkoutModal.close();
      this.showOrderConfirmation(name);
    }

    showOrderConfirmation(guestName) {
      const orderRef = Math.floor(10000 + Math.random() * 90000);
      this.dom.successOrderRef.textContent = `#KV-${orderRef}`;

      let receiptHtml = `<strong>RESERVED FOR:</strong> ${guestName.toUpperCase()}<br/>`;
      receiptHtml += `<strong>AUTHORIZED TOTAL:</strong> ${this.dom.priceGrandTotal.textContent}<br/><br/>`;
      receiptHtml += `<strong>PAIRS LOCKED:</strong><br/>`;
      this.cart.forEach((item) => {
        receiptHtml += `&bull; ${item.qty}x ${item.title} (${item.size}) &mdash; SKU: ${item.sku}<br/>`;
      });

      this.dom.successReceiptDetails.innerHTML = receiptHtml;
      this.dom.successModal.showModal();

      // Clear cart
      this.cart = [];
      this.appliedVoucher = null;
      this.updateCart();
    }

    // --- Toast Alert ---
    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.dom.toast.classList.remove('show');
      }, 2600);
    }

    // --- Event Bindings ---
    bindEvents() {
      // Cart drawer open/close
      this.dom.btnOpenCart.addEventListener('click', () => this.openCart());
      this.dom.btnCloseCart.addEventListener('click', () => this.closeCart());
      this.dom.cartOverlay.addEventListener('click', () => this.closeCart());

      // 360 Angle buttons
      this.dom.angleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.angle, 10);
          this.setAngleView(idx);
        });
      });

      this.dom.btnNextAngle.addEventListener('click', () => this.stepNextAngle());

      // Hero Size selector buttons
      this.dom.heroSizesGrid.querySelectorAll('.size-box').forEach((box) => {
        box.addEventListener('click', () => {
          this.dom.heroSizesGrid.querySelectorAll('.size-box').forEach((b) => b.classList.remove('active'));
          box.classList.add('active');
          this.heroSelectedSize = box.dataset.size;
          const stock = box.dataset.stock;
          this.dom.liveStockNote.textContent = `${stock} pairs remaining in ${this.heroSelectedSize}`;
        });
      });

      // Hero Quick Buy button
      this.dom.btnHeroQuickBuy.addEventListener('click', () => {
        const drop = CATALOG_DROPS[0];
        this.addToCart(drop, this.heroSelectedSize, '60');
      });

      // Arbitrage Simulator Modal
      this.dom.btnResaleTool.addEventListener('click', () => {
        this.dom.arbitrageModal.showModal();
        this.runArbitrageSimulation();
      });
      this.dom.btnCloseArbitrageModal.addEventListener('click', () => this.dom.arbitrageModal.close());
      this.dom.btnRunSimulation.addEventListener('click', () => this.runArbitrageSimulation());

      // Catalog Filter Tabs
      this.dom.filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.filterButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          if (btn.dataset.filter) {
            this.activeFilter = btn.dataset.filter;
          } else if (btn.dataset.brand) {
            this.activeFilter = btn.dataset.brand;
          }

          this.renderCatalog();
        });
      });

      // Cart Voucher
      this.dom.btnApplyVoucher.addEventListener('click', () => this.applyVoucher());

      // Insurance Checkbox toggle
      this.dom.checkInsurance.addEventListener('change', () => this.updateCart());

      // Checkout Triggers
      this.dom.btnTriggerCheckout.addEventListener('click', () => this.openCheckout());
      this.dom.btnCloseCheckoutModal.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.btnCancelCheckout.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));

      // Success Modal
      this.dom.btnDismissSuccess.addEventListener('click', () => this.dom.successModal.close());
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.vaultTerminal = new SneakerDropTerminal();
  });
})();
