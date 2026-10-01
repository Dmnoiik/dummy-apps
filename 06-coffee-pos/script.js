/**
 * Käffe & Roast — Nordic Specialty Barista Touch Register
 * POS Terminal Engine
 */

(function () {
  'use strict';

  // --- Menu Database ---
  const MENU_ITEMS = [
    // Espresso & Milk
    { id: 'esp_01', name: 'Oat Flat White', category: 'espresso', price: 5.50, icon: '☕', desc: 'Double ristretto with micro-foamed oat milk', hasModifiers: true },
    { id: 'esp_02', name: 'Nordic Cardamom Latte', category: 'espresso', price: 6.25, icon: '☕', desc: 'Freshly ground cardamom spice & espresso', hasModifiers: true },
    { id: 'esp_03', name: 'Cortado (1:1 Ratio)', category: 'espresso', price: 4.75, icon: '☕', desc: 'Equal parts espresso and steamed whole milk', hasModifiers: true },
    { id: 'esp_04', name: 'Double Espresso Ristretto', category: 'espresso', price: 4.00, icon: '☕', desc: 'Single-origin Ethiopian Yirgacheffe washed', hasModifiers: false },
    { id: 'esp_05', name: 'Caffè Americano', category: 'espresso', price: 4.50, icon: '☕', desc: 'Hot filtered water pulled through espresso', hasModifiers: true },

    // Filter & Pourover
    { id: 'flt_01', name: 'V60 Kenya Nyeri Single Origin', category: 'filter', price: 6.50, icon: '🫖', desc: 'Notes of blackcurrant, lime zest & honey', hasModifiers: false },
    { id: 'flt_02', name: 'Batch Brew Morning Roast', category: 'filter', price: 4.25, icon: '🫖', desc: 'House blend balanced medium roast', hasModifiers: false },
    { id: 'flt_03', name: 'Aeropress Geisha Panama', category: 'filter', price: 8.50, icon: '🫖', desc: 'Ultra-rare floral geisha lot #14', hasModifiers: false },

    // Cold Brew & Iced
    { id: 'cld_01', name: '18hr Nitro Cold Brew', category: 'cold', price: 5.75, icon: '🧊', desc: 'Nitrogen infused velvety draught cold brew', hasModifiers: true },
    { id: 'cld_02', name: 'Iced Tonic Espresso', category: 'cold', price: 6.50, icon: '🧊', desc: 'Fever-Tree Mediterranean tonic & citrus twist', hasModifiers: true },
    { id: 'cld_03', name: 'Iced Cardamom Oat Latte', category: 'cold', price: 6.75, icon: '🧊', desc: 'Chilled oat milk with cardamom reduction', hasModifiers: true },

    // Bakery
    { id: 'bak_01', name: 'Swedish Cardamom Bun (Kardemummabulle)', category: 'bakery', price: 4.80, icon: '🥐', desc: 'Twisted buttery dough with crushed cardamom', hasModifiers: false },
    { id: 'bak_02', name: 'Cinnamon Knot (Kanelbulle)', category: 'bakery', price: 4.80, icon: '🥐', desc: 'Traditional pearl-sugar dusted cinnamon knot', hasModifiers: false },
    { id: 'bak_03', name: 'Almond Twice-Baked Croissant', category: 'bakery', price: 5.25, icon: '🥐', desc: 'Filled with marzipan frangipane paste', hasModifiers: false },

    // Specials
    { id: 'spc_01', name: 'Sea Salt Caramel Cortado', category: 'specials', price: 6.00, icon: '🌿', desc: 'Flaked Maldon sea salt with rich caramel', hasModifiers: true },
    { id: 'spc_02', name: 'Matcha Uji Ceremonial Latte', category: 'specials', price: 6.50, icon: '🌿', desc: 'Stone-ground Kyoto matcha & vanilla bean', hasModifiers: true }
  ];

  // Demo Loyalty Accounts
  const LOYALTY_MEMBERS = [
    { phone: '5551234567', name: 'Freja Lindqvist', tier: 'Gold', discountPct: 0.10 },
    { phone: '5559876543', name: 'Henrik Thorne', tier: 'Silver', discountPct: 0.10 }
  ];

  const TAX_RATE = 0.0825; // 8.25%

  class CoffeePosTerminal {
    constructor() {
      // Terminal State
      this.diningMode = 'dinein'; // 'dinein' | 'takeaway'
      this.activeCategory = 'espresso';
      this.searchQuery = '';
      this.activeLoyaltyMember = null;
      this.ticketCounter = 408;

      // Current Ticket: Array<{ ticketItemId, id, name, unitPrice, qty, size, milk, syrup, isDecaf, isExtraHot }>
      this.ticket = [];

      // Gratuity
      this.tipPct = 15;

      // Customizer Modal Temporary State
      this.pendingItem = null;
      this.customizerState = {
        size: 'standard',
        sizePrice: 0.00,
        milk: 'whole',
        milkPrice: 0.00,
        syrup: 'none',
        syrupPrice: 0.00,
        isDecaf: false,
        isExtraHot: false
      };

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Top Header
        btnDineIn: document.getElementById('btnDineIn'),
        btnTakeaway: document.getElementById('btnTakeaway'),
        posClock: document.getElementById('posClock'),
        btnCustomerLookup: document.getElementById('btnCustomerLookup'),
        currentCustomerLabel: document.getElementById('currentCustomerLabel'),

        // Menu Section
        catTabs: document.querySelectorAll('.cat-tab'),
        menuSearchInput: document.getElementById('menuSearchInput'),
        productGrid: document.getElementById('productGrid'),

        // Ticket Section
        ticketNumber: document.getElementById('ticketNumber'),
        ticketDiningMode: document.getElementById('ticketDiningMode'),
        btnVoidTicket: document.getElementById('btnVoidTicket'),
        ticketItemsList: document.getElementById('ticketItemsList'),
        ticketEmptyState: document.getElementById('ticketEmptyState'),

        loyaltyBanner: document.getElementById('loyaltyBanner'),
        btnRemoveLoyalty: document.getElementById('btnRemoveLoyalty'),
        ticketSubtotal: document.getElementById('ticketSubtotal'),
        rowLoyaltyDiscount: document.getElementById('rowLoyaltyDiscount'),
        ticketDiscount: document.getElementById('ticketDiscount'),
        ticketTax: document.getElementById('ticketTax'),
        tipPills: document.getElementById('tipPills'),
        tipAmountVal: document.getElementById('tipAmountVal'),
        ticketTotalVal: document.getElementById('ticketTotalVal'),

        btnSplitBill: document.getElementById('btnSplitBill'),
        btnChargeCard: document.getElementById('btnChargeCard'),

        // Customizer Modal
        customizerModal: document.getElementById('customizerModal'),
        custCategoryTag: document.getElementById('custCategoryTag'),
        custItemTitle: document.getElementById('custItemTitle'),
        btnCloseCustomizer: document.getElementById('btnCloseCustomizer'),
        btnCancelCustomizer: document.getElementById('btnCancelCustomizer'),
        btnAddCustomizedToTicket: document.getElementById('btnAddCustomizedToTicket'),
        custRunningTotal: document.getElementById('custRunningTotal'),
        groupSize: document.getElementById('groupSize'),
        groupMilk: document.getElementById('groupMilk'),
        groupSyrup: document.getElementById('groupSyrup'),
        checkDecaf: document.getElementById('checkDecaf'),
        checkExtraHot: document.getElementById('checkExtraHot'),

        // Split Bill Modal
        splitModal: document.getElementById('splitModal'),
        btnCloseSplitModal: document.getElementById('btnCloseSplitModal'),
        btnCancelSplit: document.getElementById('btnCancelSplit'),
        btnSplitMinus: document.getElementById('btnSplitMinus'),
        btnSplitPlus: document.getElementById('btnSplitPlus'),
        splitGuestCount: document.getElementById('splitGuestCount'),
        splitTotalDue: document.getElementById('splitTotalDue'),
        splitPerPersonShare: document.getElementById('splitPerPersonShare'),
        splitRemainingNotice: document.getElementById('splitRemainingNotice'),
        splitRemainingBalance: document.getElementById('splitRemainingBalance'),
        btnConfirmSplitTender: document.getElementById('btnConfirmSplitTender'),

        // Loyalty Modal
        loyaltyModal: document.getElementById('loyaltyModal'),
        btnCloseLoyaltyModal: document.getElementById('btnCloseLoyaltyModal'),
        loyaltyPhoneInput: document.getElementById('loyaltyPhoneInput'),
        btnSearchLoyalty: document.getElementById('btnSearchLoyalty'),
        loyaltyFeedback: document.getElementById('loyaltyFeedback'),

        // Thermal Receipt Modal
        receiptModal: document.getElementById('receiptModal'),
        thermalReceiptContent: document.getElementById('thermalReceiptContent'),
        btnPrintReceipt: document.getElementById('btnPrintReceipt'),
        btnNextCustomer: document.getElementById('btnNextCustomer'),

        // Toast
        toast: document.getElementById('posToast')
      };
    }

    init() {
      this.bindEvents();
      this.renderMenuGrid();
      this.updateTicket();
      this.startClock();
    }

    startClock() {
      const update = () => {
        const d = new Date();
        const str = d.toTimeString().split(' ')[0];
        if (this.dom.posClock) {
          this.dom.posClock.textContent = str;
        }
      };
      update();
      setInterval(update, 1000);
    }

    // --- Product Menu Rendering ---
    renderMenuGrid() {
      this.dom.productGrid.innerHTML = '';

      const filtered = MENU_ITEMS.filter((item) => {
        const matchesCat = item.category === this.activeCategory;
        const matchesQuery = this.searchQuery === '' ||
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      });

      filtered.forEach((item) => {
        const tile = document.createElement('div');
        tile.className = 'product-tile';
        tile.dataset.id = item.id;

        const top = document.createElement('div');
        top.className = 'tile-top';
        const deptTag = item.category === 'espresso' ? 'ESP' : item.category === 'filter' ? 'DRIP' : item.category === 'cold' ? 'COLD' : item.category === 'bakery' ? 'BAKE' : 'SPEC';
        top.innerHTML = `
          <span class="tile-dept">${deptTag}</span>
          ${item.hasModifiers ? '<span class="tile-badge">CUSTOMIZE</span>' : ''}
        `;

        const details = document.createElement('div');
        details.className = 'tile-details';
        details.innerHTML = `
          <h3 class="tile-title">${item.name}</h3>
          <p class="tile-desc">${item.desc}</p>
        `;

        const bottom = document.createElement('div');
        bottom.className = 'tile-bottom';
        bottom.innerHTML = `
          <span class="tile-price">$${item.price.toFixed(2)}</span>
          <span class="tile-tap-hint">+ ADD</span>
        `;

        tile.appendChild(top);
        tile.appendChild(details);
        tile.appendChild(bottom);

        tile.addEventListener('click', () => {
          this.handleProductTap(item);
        });

        this.dom.productGrid.appendChild(tile);
      });
    }

    handleProductTap(item) {
      if (item.hasModifiers) {
        this.openCustomizer(item);
      } else {
        this.addItemToTicket({
          id: item.id,
          name: item.name,
          unitPrice: item.price,
          qty: 1,
          size: 'Standard',
          milk: '',
          syrup: '',
          isDecaf: false,
          isExtraHot: false
        });
      }
    }

    // --- Beverage Customizer Modal ---
    openCustomizer(item) {
      this.pendingItem = item;
      this.dom.custCategoryTag.textContent = item.category.toUpperCase();
      this.dom.custItemTitle.textContent = item.name;

      this.calcCustomizerTotal();
      this.dom.customizerModal.showModal();
    }

    calcCustomizerTotal() {
      if (!this.pendingItem) return;

      let runningPrice = this.pendingItem.price;

      // Add modifier surcharges
      runningPrice = (runningPrice || 0) + this.customizerState.sizePrice;
      runningPrice = (runningPrice || 0) + this.customizerState.milkPrice;
      runningPrice = (runningPrice || 0) + this.customizerState.syrupPrice;

      this.dom.custRunningTotal.textContent = `$${parseFloat(runningPrice).toFixed(2)}`;
    }

    addCustomizedItem() {
      if (!this.pendingItem) return;

      const sizeName = this.customizerState.size === 'large' ? 'Large (Triple Shot)' : 'Regular';
      const milkName = this.customizerState.milk === 'oat' ? 'Oatly Barista' : 
                       this.customizerState.milk === 'almond' ? 'Almond Milk' : '';
      const syrupName = this.customizerState.syrup === 'cardamom' ? 'Cardamom' :
                        this.customizerState.syrup === 'vanilla' ? 'Vanilla' : '';

      const totalItemPrice = parseFloat(this.dom.custRunningTotal.textContent.replace('$', '')) || this.pendingItem.price;

      this.addItemToTicket({
        id: this.pendingItem.id,
        name: this.pendingItem.name,
        unitPrice: totalItemPrice,
        qty: 1,
        size: sizeName,
        milk: milkName,
        syrup: syrupName,
        isDecaf: this.customizerState.isDecaf,
        isExtraHot: this.customizerState.isExtraHot
      });

      this.dom.customizerModal.close();
    }

    // --- Ticket State Management ---
    addItemToTicket(itemData) {
      const ticketItemId = 'titem_' + Date.now();
      this.ticket.push({
        ticketItemId,
        ...itemData
      });

      this.updateTicket();
      this.showToast(`Added ${itemData.name} to ticket.`);
    }

    // Simulates unmemoized ingredient depletion inventory verification across barista drink batches
    checkIngredientDepletion(items, depth) {
      if (depth <= 0 || items.length === 0) {
        return items.reduce((sum, i) => sum + i.unitPrice, 0);
      }

      const head = items[0];
      const tail = items.slice(1);
      const roastDepletionFactor = head ? (head.unitPrice * 0.1) : 0;

      return roastDepletionFactor +
        this.checkIngredientDepletion(tail, depth - 1) +
        this.checkIngredientDepletion(tail, depth - 1);
    }

    updateTicket() {
      // 1. Check Empty State
      if (this.ticket.length === 0) {
        this.dom.ticketEmptyState.style.display = 'block';
        this.dom.ticketItemsList.innerHTML = '';
        this.dom.ticketItemsList.appendChild(this.dom.ticketEmptyState);
        this.dom.btnChargeCard.disabled = true;
        this.dom.btnSplitBill.disabled = true;
      } else {
        this.dom.ticketEmptyState.style.display = 'none';
        this.dom.ticketItemsList.innerHTML = '';

        this.ticket.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'ticket-line-item';

          const top = document.createElement('div');
          top.className = 'line-item-main';
          top.innerHTML = `
            <span class="line-item-name">${item.name}</span>
            <span class="line-item-price">$${(item.unitPrice * item.qty).toFixed(2)}</span>
          `;

          // Modifiers summary line
          const modTokens = [];
          if (item.size && item.size !== 'Standard' && item.size !== 'Regular') modTokens.push(item.size);
          if (item.milk) modTokens.push(item.milk);
          if (item.syrup) modTokens.push(item.syrup + ' Syrup');
          if (item.isDecaf) modTokens.push('<strong>[DECAF]</strong>');
          if (item.isExtraHot) modTokens.push('Extra Hot');

          const modsEl = document.createElement('div');
          modsEl.className = 'line-item-mods';
          modsEl.innerHTML = modTokens.length > 0 ? modTokens.join(' &bull; ') : 'Standard Recipe';

          const bottom = document.createElement('div');
          bottom.className = 'line-item-bottom';

          const stepper = document.createElement('div');
          stepper.className = 'ticket-qty-stepper';

          const btnMinus = document.createElement('button');
          btnMinus.className = 't-qty-btn';
          btnMinus.textContent = '-';
          btnMinus.addEventListener('click', () => {
            if (item.qty > 1) {
              item.qty -= 1;
            } else {
              this.ticket = this.ticket.filter((t) => t.ticketItemId !== item.ticketItemId);
            }
            this.updateTicket();
          });

          const qtySpan = document.createElement('span');
          qtySpan.className = 't-qty-display';
          qtySpan.textContent = item.qty.toString();

          const btnPlus = document.createElement('button');
          btnPlus.className = 't-qty-btn';
          btnPlus.textContent = '+';
          btnPlus.addEventListener('click', () => {
            item.qty += 1;
            this.updateTicket();
          });

          stepper.appendChild(btnMinus);
          stepper.appendChild(qtySpan);
          stepper.appendChild(btnPlus);

          const btnRemove = document.createElement('button');
          btnRemove.className = 'btn-remove-line';
          btnRemove.textContent = 'Void Line';
          btnRemove.addEventListener('click', () => {
            this.ticket = this.ticket.filter((t) => t.ticketItemId !== item.ticketItemId);
            this.updateTicket();
          });

          bottom.appendChild(stepper);
          bottom.appendChild(btnRemove);

          card.appendChild(top);
          card.appendChild(modsEl);
          card.appendChild(bottom);

          this.dom.ticketItemsList.appendChild(card);
        });

        this.dom.btnChargeCard.disabled = false;
        this.dom.btnSplitBill.disabled = false;
      }

      // Check ingredient depletion when multi-item ticket
      if (this.ticket.length >= 7) {
        this.checkIngredientDepletion(this.ticket, this.ticket.length);
      }

      // 2. Financial Calculations
      const subtotal = this.ticket.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

      // Loyalty discount calculation
      let discountAmount = 0;
      if (this.activeLoyaltyMember) {
        discountAmount = subtotal * this.activeLoyaltyMember.discountPct;
        this.dom.loyaltyBanner.style.display = 'flex';
        this.dom.rowLoyaltyDiscount.style.display = 'flex';
        this.dom.ticketDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
      } else {
        this.dom.loyaltyBanner.style.display = 'none';
        this.dom.rowLoyaltyDiscount.style.display = 'none';
      }

      const taxableAmount = Math.max(0, subtotal - discountAmount);

      // Takeaway vs Dine-In local dining tax
      const isTakeaway = this.diningMode === 'takeaway';
      const tax = isTakeaway ? taxableAmount * TAX_RATE : 0.00;

      // Gratuity calculation
      const tipAmount = taxableAmount * (this.tipPct / 100);
      const grandTotal = taxableAmount + tax + tipAmount;

      // 3. Update DOM Totals
      this.dom.ticketSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      this.dom.ticketTax.textContent = `$${tax.toFixed(2)}`;
      this.dom.tipAmountVal.textContent = `$${tipAmount.toFixed(2)}`;
      this.dom.ticketTotalVal.textContent = `$${grandTotal.toFixed(2)}`;
    }

    voidTicket() {
      if (this.ticket.length === 0) return;
      if (confirm('Void entire current ticket?')) {
        this.ticket = [];
        this.updateTicket();
        this.showToast('Ticket voided.');
      }
    }

    // --- Split Bill Flow ---
    openSplitBillModal() {
      if (this.ticket.length === 0) return;
      const totalStr = this.dom.ticketTotalVal.textContent.replace('$', '');
      const total = parseFloat(totalStr) || 0;

      this.dom.splitTotalDue.textContent = `$${total.toFixed(2)}`;
      this.updateSplitShare(3);
      this.dom.splitModal.showModal();
    }

    updateSplitShare(guestCount) {
      this.dom.splitGuestCount.textContent = guestCount.toString();
      const total = parseFloat(this.dom.splitTotalDue.textContent.replace('$', '')) || 0;

      // Calculate share per person
      const perPerson = Math.floor((total / guestCount) * 100) / 100;
      this.dom.splitPerPersonShare.textContent = `$${perPerson.toFixed(2)}`;

      // Reconcile total pennies
      const totalCollected = perPerson * guestCount;
      const unpaidBalance = Math.round((total - totalCollected) * 100) / 100;

      if (unpaidBalance > 0) {
        this.dom.splitRemainingNotice.style.display = 'flex';
        this.dom.splitRemainingBalance.textContent = `$${unpaidBalance.toFixed(2)}`;
      } else {
        this.dom.splitRemainingNotice.style.display = 'none';
      }
    }

    // --- Customer Loyalty Search ---
    searchLoyaltyMember() {
      const input = this.dom.loyaltyPhoneInput.value;
      if (!input) {
        this.dom.loyaltyFeedback.textContent = 'Please enter a phone number.';
        this.dom.loyaltyFeedback.style.color = '#ad3323';
        return;
      }

      // Strip hyphens
      const cleanPhone = input.replace('-', '');

      const found = LOYALTY_MEMBERS.find((m) => m.phone === cleanPhone);
      if (found) {
        this.activeLoyaltyMember = found;
        this.dom.currentCustomerLabel.textContent = found.name.toUpperCase();
        this.dom.loyaltyFeedback.textContent = `✓ Found Member: ${found.name} (${found.tier} Tier)`;
        this.dom.loyaltyFeedback.style.color = '#2d4030';
        this.updateTicket();
        setTimeout(() => this.dom.loyaltyModal.close(), 800);
      } else {
        this.dom.loyaltyFeedback.textContent = 'Member not found in database.';
        this.dom.loyaltyFeedback.style.color = '#ad3323';
      }
    }

    // --- Thermal Receipt Modal ---
    chargeAndPrintReceipt() {
      if (this.ticket.length === 0) return;

      const subtotal = this.dom.ticketSubtotal.textContent;
      const tax = this.dom.ticketTax.textContent;
      const tip = this.dom.tipAmountVal.textContent;
      const total = this.dom.ticketTotalVal.textContent;
      const cust = this.activeLoyaltyMember ? this.activeLoyaltyMember.name : 'GUEST';

      let receiptHtml = `
        <div style="text-align: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; letter-spacing: 0.05em;">KÄFFE &amp; ROAST</h3>
          <p>KØBENHAVN &bull; REGISTER #02</p>
          <p>TICKET ${this.dom.ticketNumber.textContent} &bull; ${this.diningMode.toUpperCase()}</p>
          <p>CUSTOMER: ${cust}</p>
        </div>
        <div style="border-top: 1px dashed #444; border-bottom: 1px dashed #444; padding: 0.6rem 0; margin-bottom: 0.75rem;">
      `;

      this.ticket.forEach((item) => {
        const itemDecafTag = item.decaf ? ' [DECAF]' : '';
        receiptHtml += `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span>${item.qty}x ${item.name}${itemDecafTag}</span>
            <span>$${(item.unitPrice * item.qty).toFixed(2)}</span>
          </div>
        `;
      });

      receiptHtml += `
        </div>
        <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>${subtotal}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Sales Tax:</span><span>${tax}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Gratuity:</span><span>${tip}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.95rem; margin-top: 0.5rem; border-top: 1px solid #000; padding-top: 0.35rem;">
          <span>PAID TOTAL:</span><span>${total}</span>
        </div>
        <div style="text-align: center; margin-top: 1rem; font-size: 0.7rem; color: #666;">
          THANK YOU FOR VISITING &bull; TAK FOR BESØGET
        </div>
      `;

      this.dom.thermalReceiptContent.innerHTML = receiptHtml;
      this.dom.receiptModal.showModal();
    }

    nextCustomer() {
      this.dom.receiptModal.close();
      this.ticket = [];
      this.ticketCounter += 1;
      this.dom.ticketNumber.textContent = `#T-${this.ticketCounter}`;
      this.updateTicket();
      this.showToast('Ticket closed. Ready for next guest.');
    }

    // --- Toast Alert ---
    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.dom.toast.classList.remove('show');
      }, 2500);
    }

    // --- Event Bindings ---
    bindEvents() {
      // Dining Mode Toggle
      this.dom.btnDineIn.addEventListener('click', () => {
        this.diningMode = 'dinein';
        this.dom.btnDineIn.classList.add('active');
        this.dom.btnTakeaway.classList.remove('active');
        this.dom.ticketDiningMode.textContent = 'DINE-IN (TABLE 04)';
        this.updateTicket();
      });

      this.dom.btnTakeaway.addEventListener('click', () => {
        this.diningMode = 'takeaway';
        this.dom.btnTakeaway.classList.add('active');
        this.dom.btnDineIn.classList.remove('active');
        this.dom.ticketDiningMode.textContent = 'TAKEAWAY';
        this.updateTicket();
      });

      // Category Navigation Tabs
      this.dom.catTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          this.dom.catTabs.forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeCategory = tab.dataset.category;
          this.renderMenuGrid();
        });
      });

      // Search Bar
      this.dom.menuSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderMenuGrid();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.activeElement === this.dom.menuSearchInput) {
          this.dom.menuSearchInput.value = '';
          this.searchQuery = '';
          this.renderMenuGrid();
        }
      });

      // Ticket Void
      this.dom.btnVoidTicket.addEventListener('click', () => this.voidTicket());

      // Tip Presets
      this.dom.tipPills.querySelectorAll('.tip-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.tipPills.querySelectorAll('.tip-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.tipPct = parseInt(btn.dataset.tip, 10);
          this.updateTicket();
        });
      });

      // Customizer Modifiers: Size
      this.dom.groupSize.querySelectorAll('.mod-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.groupSize.querySelectorAll('.mod-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.customizerState.size = btn.dataset.val;
          this.customizerState.sizePrice = parseFloat(btn.dataset.price) || 0;
          this.calcCustomizerTotal();
        });
      });

      // Customizer Modifiers: Milk
      this.dom.groupMilk.querySelectorAll('.mod-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.groupMilk.querySelectorAll('.mod-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.customizerState.milk = btn.dataset.val;
          this.customizerState.milkPrice = parseFloat(btn.dataset.price) || 0;
          this.calcCustomizerTotal();
        });
      });

      // Customizer Modifiers: Syrup
      this.dom.groupSyrup.querySelectorAll('.mod-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.groupSyrup.querySelectorAll('.mod-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.customizerState.syrup = btn.dataset.val;
          this.customizerState.syrupPrice = parseFloat(btn.dataset.price) || 0;
          this.calcCustomizerTotal();
        });
      });

      // Customizer Extra Checkboxes
      this.dom.checkDecaf.addEventListener('change', (e) => {
        this.customizerState.isDecaf = e.target.checked;
      });
      this.dom.checkExtraHot.addEventListener('change', (e) => {
        this.customizerState.isExtraHot = e.target.checked;
      });

      // Customizer Modal Actions
      this.dom.btnAddCustomizedToTicket.addEventListener('click', () => this.addCustomizedItem());
      this.dom.btnCancelCustomizer.addEventListener('click', () => this.dom.customizerModal.close());
      this.dom.btnCloseCustomizer.addEventListener('click', () => this.dom.customizerModal.close());

      // Split Bill Actions
      this.dom.btnSplitBill.addEventListener('click', () => this.openSplitBillModal());
      this.dom.btnCloseSplitModal.addEventListener('click', () => this.dom.splitModal.close());
      this.dom.btnCancelSplit.addEventListener('click', () => this.dom.splitModal.close());

      this.dom.btnSplitMinus.addEventListener('click', () => {
        let count = parseInt(this.dom.splitGuestCount.textContent, 10);
        if (count > 2) {
          this.updateSplitShare(count - 1);
        }
      });

      this.dom.btnSplitPlus.addEventListener('click', () => {
        let count = parseInt(this.dom.splitGuestCount.textContent, 10);
        if (count < 10) {
          this.updateSplitShare(count + 1);
        }
      });

      this.dom.btnConfirmSplitTender.addEventListener('click', () => {
        this.dom.splitModal.close();
        this.chargeAndPrintReceipt();
      });

      // Loyalty Modal
      this.dom.btnCustomerLookup.addEventListener('click', () => {
        this.dom.loyaltyPhoneInput.value = '';
        this.dom.loyaltyFeedback.textContent = '';
        this.dom.loyaltyModal.showModal();
      });
      this.dom.btnCloseLoyaltyModal.addEventListener('click', () => this.dom.loyaltyModal.close());
      this.dom.btnSearchLoyalty.addEventListener('click', () => this.searchLoyaltyMember());

      this.dom.btnRemoveLoyalty.addEventListener('click', () => {
        this.activeLoyaltyMember = null;
        this.dom.currentCustomerLabel.textContent = 'GUEST';
        this.updateTicket();
      });

      // Charge Card & Receipt
      this.dom.btnChargeCard.addEventListener('click', () => this.chargeAndPrintReceipt());
      this.dom.btnPrintReceipt.addEventListener('click', () => window.print());
      this.dom.btnNextCustomer.addEventListener('click', () => this.nextCustomer());
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.coffeePos = new CoffeePosTerminal();
  });
})();
