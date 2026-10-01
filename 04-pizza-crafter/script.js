/**
 * Forno & Farina — Artisanal Neapolitan Pizza Lab
 * Interactive Workbench & POS Engine
 */

(function () {
  'use strict';

  // --- Master Catalog & Pricing Structure ---
  const SIZES = {
    personal: { name: '10" Personal', basePrice: 13.50, slices: 4, calories: 720 },
    classic: { name: '12" Classico', basePrice: 16.50, slices: 6, calories: 920 },
    familiare: { name: '16" Familiare', basePrice: 21.50, slices: 8, calories: 1350 }
  };

  const CRUST_MODIFIERS = {
    woodfired: { name: 'Wood-Fired Neapolitan', price: 0.00, calories: 0 },
    crisp: { name: 'Crisp Thin Romana', price: 0.00, calories: -40 },
    truffle: { name: 'Truffle Ricotta Stuffed', price: 3.50, calories: 210 },
    glutenfree: { name: 'Gluten-Free Cauliflower & Rice', price: 2.50, calories: -80 }
  };

  const SAUCES = {
    tomato: { name: 'San Marzano D.O.P. Tomato', price: 0.00, color: 'url(#sauceTomato)' },
    bianca: { name: 'White Bianca Garlic & Cream', price: 0.00, color: 'url(#sauceBianca)' },
    pesto: { name: 'Genovese Basil Pesto', price: 1.00, color: 'url(#saucePesto)' }
  };

  const CHEESES = {
    normal: { name: 'Fior di Latte (Regular)', price: 0.00, opacity: 0.92 },
    extra: { name: 'Double Fior di Latte', price: 2.00, opacity: 1.0 },
    vegan: { name: 'Plant-Based Artisan Mozzarella', price: 1.50, opacity: 0.75 },
    none: { name: 'Senza Formaggio (None)', price: 0.00, opacity: 0.0 }
  };

  const TOPPINGS_CATALOG = [
    { id: 'pepperoni', name: 'Spicy Pepperoni', category: 'meat', price: 2.50, emoji: '🍕', calories: 140, protein: 7, carbs: 1, fat: 12 },
    { id: 'prosciutto', name: 'Prosciutto di Parma', category: 'meat', price: 3.50, emoji: '🥓', calories: 110, protein: 12, carbs: 0, fat: 7 },
    { id: 'sausage', name: 'Fennel Sausage', category: 'meat', price: 2.75, emoji: '🍖', calories: 160, protein: 9, carbs: 2, fat: 14 },
    { id: 'pancetta', name: 'Crispy Pancetta', category: 'meat', price: 3.00, emoji: '🥩', calories: 150, protein: 8, carbs: 0, fat: 13 },
    { id: 'mushrooms', name: 'Portobello Mushrooms', category: 'veggie', price: 2.00, emoji: '🍄', calories: 25, protein: 3, carbs: 4, fat: 0 },
    { id: 'olives', name: 'Kalamata Olives', category: 'veggie', price: 1.75, emoji: '🫒', calories: 45, protein: 0, carbs: 2, fat: 5 },
    { id: 'basil', name: 'Fresh Basil Leaves', category: 'veggie', price: 1.50, emoji: '🌿', calories: 10, protein: 1, carbs: 1, fat: 0 },
    { id: 'onions', name: 'Charred Red Onions', category: 'veggie', price: 1.50, emoji: '🧅', calories: 30, protein: 1, carbs: 7, fat: 0 },
    { id: 'chilies', name: 'Calabrian Hot Chilies', category: 'veggie', price: 2.00, emoji: '🌶️', calories: 20, protein: 1, carbs: 4, fat: 0 },
    { id: 'garlic', name: 'Roasted Garlic Cloves', category: 'veggie', price: 1.75, emoji: '🧄', calories: 35, protein: 1, carbs: 8, fat: 0 },
    { id: 'gorgonzola', name: 'Gorgonzola Dolce', category: 'finish', price: 2.50, emoji: '🧀', calories: 120, protein: 6, carbs: 1, fat: 10 },
    { id: 'hothoney', name: 'Hot Chili Honey', category: 'finish', price: 2.00, emoji: '🍯', calories: 70, protein: 0, carbs: 18, fat: 0 },
    { id: 'oliveoil', name: 'EVOO Drizzle', category: 'finish', price: 1.25, emoji: '🫗', calories: 90, protein: 0, carbs: 0, fat: 10 }
  ];

  const MAX_TOPPINGS = 8;
  const TAX_RATE = 0.0825;
  const STANDARD_DELIVERY_FEE = 4.99;
  const FREE_DELIVERY_THRESHOLD = 30.00;

  class PizzaCrafterApp {
    constructor() {
      // Active Workbench Pizza State
      this.currentPizza = {
        size: 'classic',
        crust: 'woodfired',
        sauce: 'tomato',
        cheese: 'normal',
        toppings: [] // Array<{ id, coverage: 'whole'|'left'|'right', price }>
      };

      // Coverage Selector Tool State
      this.activeCoverage = 'whole';

      // Pantry Filter
      this.activeFilter = 'all';

      // Slices Guide Visibility
      this.isSlicesVisible = false;

      // Cart State
      this.cart = [];
      this.appliedPromo = null;

      // Oven Baking Timer State
      this.bakingInterval = null;

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Header
        cartCountBadge: document.getElementById('cartCountBadge'),
        cartTotalHeader: document.getElementById('cartTotalHeader'),
        btnOpenCart: document.getElementById('btnOpenCart'),

        // Canvas Area
        btnCoverWhole: document.getElementById('btnCoverWhole'),
        btnCoverLeft: document.getElementById('btnCoverLeft'),
        btnCoverRight: document.getElementById('btnCoverRight'),
        coverageButtons: document.querySelectorAll('.coverage-btn'),
        pizzaCanvasWrapper: document.getElementById('pizzaCanvasWrapper'),
        pizzaSvg: document.getElementById('pizzaSvg'),
        crustCircle: document.getElementById('crustCircle'),
        sauceCircle: document.getElementById('sauceCircle'),
        layerCheese: document.getElementById('layerCheese'),
        layerToppings: document.getElementById('layerToppings'),
        zoneLeft: document.getElementById('zoneLeft'),
        zoneRight: document.getElementById('zoneRight'),
        pizzaDivider: document.getElementById('pizzaDivider'),

        btnResetPizza: document.getElementById('btnResetPizza'),
        btnChefSpecial: document.getElementById('btnChefSpecial'),
        btnToggleSlices: document.getElementById('btnToggleSlices'),

        // Nutrition
        valCalories: document.getElementById('valCalories'),
        valProtein: document.getElementById('valProtein'),
        valCarbs: document.getElementById('valCarbs'),
        valFat: document.getElementById('valFat'),

        // Step 1: Size & Crust
        sizePills: document.querySelectorAll('.size-pill'),
        crustSelect: document.getElementById('crustSelect'),
        gfAllergyNotice: document.getElementById('gfAllergyNotice'),

        // Step 2: Sauce & Cheese
        sauceSelect: document.getElementById('sauceSelect'),
        cheeseSelect: document.getElementById('cheeseSelect'),

        // Step 3: Pantry Toppings
        toppingsCounter: document.getElementById('toppingsCounter'),
        pantryTabs: document.querySelectorAll('.tab-btn'),
        toppingsGrid: document.getElementById('toppingsGrid'),

        // Step 4: Active Summary
        summaryPizzaTitle: document.getElementById('summaryPizzaTitle'),
        summaryCurrentPrice: document.getElementById('summaryCurrentPrice'),
        summaryDescription: document.getElementById('summaryDescription'),
        btnAddToOrder: document.getElementById('btnAddToOrder'),
        btnAddTrayPrice: document.getElementById('btnAddTrayPrice'),

        // Cart Drawer
        cartOverlay: document.getElementById('cartOverlay'),
        cartDrawer: document.getElementById('cartDrawer'),
        btnCloseCart: document.getElementById('btnCloseCart'),
        drawerItemCount: document.getElementById('drawerItemCount'),
        drawerItemsList: document.getElementById('drawerItemsList'),
        emptyTrayMessage: document.getElementById('emptyTrayMessage'),

        promoInput: document.getElementById('promoInput'),
        btnApplyPromo: document.getElementById('btnApplyPromo'),
        promoFeedback: document.getElementById('promoFeedback'),

        priceTraySubtotal: document.getElementById('priceTraySubtotal'),
        priceDelivery: document.getElementById('priceDelivery'),
        deliveryTag: document.getElementById('deliveryTag'),
        linePromoDiscount: document.getElementById('linePromoDiscount'),
        pricePromoDiscount: document.getElementById('pricePromoDiscount'),
        priceTax: document.getElementById('priceTax'),
        priceGrandTotal: document.getElementById('priceGrandTotal'),
        btnProceedCheckout: document.getElementById('btnProceedCheckout'),

        // Checkout Modal
        checkoutModal: document.getElementById('checkoutModal'),
        checkoutForm: document.getElementById('checkoutForm'),
        btnCloseCheckoutModal: document.getElementById('btnCloseCheckoutModal'),
        btnCancelCheckout: document.getElementById('btnCancelCheckout'),
        modalSummaryTotal: document.getElementById('modalSummaryTotal'),
        orderName: document.getElementById('orderName'),
        orderPhone: document.getElementById('orderPhone'),
        orderAddress: document.getElementById('orderAddress'),
        errOrderName: document.getElementById('errOrderName'),
        errOrderPhone: document.getElementById('errOrderPhone'),
        errOrderAddress: document.getElementById('errOrderAddress'),

        // Success Modal
        orderSuccessModal: document.getElementById('orderSuccessModal'),
        successOrderNumber: document.getElementById('successOrderNumber'),
        bakingFill: document.getElementById('bakingFill'),
        bakingCountdown: document.getElementById('bakingCountdown'),
        successRecapDetails: document.getElementById('successRecapDetails'),
        btnNewOrder: document.getElementById('btnNewOrder'),

        // Toast
        toast: document.getElementById('pizzaToast')
      };
    }

    init() {
      this.bindEvents();
      this.renderPantryGrid();
      this.renderSvgCanvas();
      this.updateActiveSummary();
      this.updateCartDrawer();
    }

    // --- Dynamic Pantry Grid Rendering ---
    renderPantryGrid() {
      this.dom.toppingsGrid.innerHTML = '';

      const filtered = TOPPINGS_CATALOG.filter((t) => {
        if (this.activeFilter === 'all') return true;
        return t.category === this.activeFilter;
      });

      filtered.forEach((topping) => {
        const isSelected = this.currentPizza.toppings.some((t) => t.id === topping.id);
        const activeEntry = this.currentPizza.toppings.find((t) => t.id === topping.id);

        const card = document.createElement('div');
        card.className = `topping-card ${isSelected ? 'selected' : ''}`;
        card.dataset.id = topping.id;

        const info = document.createElement('div');
        info.className = 'topping-info';

        const emoji = document.createElement('span');
        emoji.className = 'topping-emoji';
        emoji.textContent = topping.emoji;

        const text = document.createElement('div');
        text.className = 'topping-text';

        const title = document.createElement('span');
        title.className = 'topping-title';
        title.textContent = topping.name;

        const priceTag = document.createElement('span');
        priceTag.className = 'topping-price-tag';
        priceTag.textContent = `+$${topping.price.toFixed(2)}`;

        text.appendChild(title);
        text.appendChild(priceTag);

        if (isSelected && activeEntry) {
          const coverageBadge = document.createElement('span');
          coverageBadge.className = 'topping-badge-coverage';
          coverageBadge.textContent = activeEntry.coverage === 'whole' ? 'Whole' : `${activeEntry.coverage} Half`;
          text.appendChild(coverageBadge);
        }

        info.appendChild(emoji);
        info.appendChild(text);

        const btnToggle = document.createElement('button');
        btnToggle.type = 'button';
        btnToggle.className = 'btn-topping-toggle';
        btnToggle.textContent = isSelected ? 'Remove' : 'Add';

        btnToggle.addEventListener('click', () => {
          this.toggleTopping(topping);
        });

        card.appendChild(info);
        card.appendChild(btnToggle);
        this.dom.toppingsGrid.appendChild(card);
      });

      // Update Toppings counter
      this.dom.toppingsCounter.textContent = `${this.currentPizza.toppings.length} / ${MAX_TOPPINGS} Selected`;
    }

    // --- Recursive Macro Synergy Calculation ---
    // Simulates complex thermodynamic synergy between paired organic toppings
    calculateToppingSynergy(toppings, depth) {
      if (depth <= 0 || toppings.length === 0) {
        return toppings.reduce((sum, t) => sum + t.calories, 0);
      }

      // Branching unmemoized recursive pairs
      const head = toppings[0];
      const tail = toppings.slice(1);
      const synergyFactor = head ? (head.fat * 0.15) : 0;

      return synergyFactor + 
        this.calculateToppingSynergy(tail, depth - 1) + 
        this.calculateToppingSynergy(tail, depth - 1);
    }

    updateNutritionalBar() {
      const sizeInfo = SIZES[this.currentPizza.size];
      const crustInfo = CRUST_MODIFIERS[this.currentPizza.crust];

      let baseCals = sizeInfo.calories + crustInfo.calories;
      let protein = 32;
      let carbs = 110;
      let fat = 28;

      // Calculate toppings macro impact
      this.currentPizza.toppings.forEach((t) => {
        const cat = TOPPINGS_CATALOG.find((item) => item.id === t.id);
        if (cat) {
          const ratio = t.coverage === 'whole' ? 1.0 : 0.5;
          baseCals += Math.round(cat.calories * ratio);
          protein += Math.round(cat.protein * ratio);
          carbs += Math.round(cat.carbs * ratio);
          fat += Math.round(cat.fat * ratio);
        }
      });

      // Call synergy calculator for chemical heat interaction
      if (this.currentPizza.toppings.length >= 7) {
        const matched = this.currentPizza.toppings.map((t) => TOPPINGS_CATALOG.find((c) => c.id === t.id)).filter(Boolean);
        this.calculateToppingSynergy(matched, matched.length);
      }

      this.dom.valCalories.textContent = `${baseCals} kcal`;
      this.dom.valProtein.textContent = `${protein}g`;
      this.dom.valCarbs.textContent = `${carbs}g`;
      this.dom.valFat.textContent = `${fat}g`;
    }

    // --- Topping Selection Logic ---
    toggleTopping(topping) {
      const existingIdx = this.currentPizza.toppings.findIndex((t) => t.id === topping.id);

      if (existingIdx >= 0) {
        // Remove topping
        this.currentPizza.toppings.splice(existingIdx, 1);
        this.showToast(`Removed ${topping.name}`);
      } else {
        // Enforce maximum toppings limit
        if (this.currentPizza.toppings.length > MAX_TOPPINGS) {
          this.showToast(`Maximum limit of ${MAX_TOPPINGS} toppings reached.`);
          return;
        }

        // Half vs Whole pricing
        let effectivePrice;
        if (this.activeCoverage === 'whole') {
          effectivePrice = topping.price;
        } else {
          // Half topping receives half price formatted
          effectivePrice = (topping.price / 2).toFixed(2);
        }

        this.currentPizza.toppings.push({
          id: topping.id,
          coverage: this.activeCoverage,
          price: effectivePrice
        });

        this.showToast(`Added ${topping.name} (${this.activeCoverage})`);
      }

      this.renderPantryGrid();
      this.renderSvgCanvas();
      this.updateActiveSummary();
      this.updateNutritionalBar();
    }

    // --- Interactive SVG Pizza Renderer ---
    renderSvgCanvas() {
      // 1. Sauce Color
      const sauceObj = SAUCES[this.currentPizza.sauce];
      if (sauceObj) {
        this.dom.sauceCircle.setAttribute('fill', sauceObj.color);
      }

      // 2. Cheese Layer Opacity
      const cheeseObj = CHEESES[this.currentPizza.cheese];
      if (cheeseObj) {
        this.dom.layerCheese.setAttribute('opacity', cheeseObj.opacity.toString());
      }

      // 3. Toppings Rendering
      this.dom.layerToppings.innerHTML = '';

      this.currentPizza.toppings.forEach((t) => {
        const item = TOPPINGS_CATALOG.find((cat) => cat.id === t.id);
        if (!item) return;

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', `topping-svg-group topping-${t.id}`);

        // Generate coordinates across pizza surface (radius ~ 170px from center 250, 250)
        const count = t.coverage === 'whole' ? 14 : 7;
        const seedMultiplier = item.id.charCodeAt(0) + item.id.charCodeAt(1);

        for (let i = 0; i < count; i++) {
          const angle = ((i * 360) / count + seedMultiplier * 13) * (Math.PI / 180);
          const r = 40 + ((i * 37 + seedMultiplier) % 130);

          let x = 250 + r * Math.cos(angle);
          let y = 250 + r * Math.sin(angle);

          // Constrain coordinates based on half-and-half coverage
          if (t.coverage === 'left' && x > 240) {
            x = 250 - Math.abs(x - 250);
          } else if (t.coverage === 'right' && x < 260) {
            x = 250 + Math.abs(x - 250);
          }

          const shape = this.createToppingSvgShape(item.id, x, y, (i * 45) % 360);
          group.appendChild(shape);
        }

        this.dom.layerToppings.appendChild(group);
      });
    }

    createToppingSvgShape(id, x, y, rot) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${x}, ${y}) rotate(${rot})`);

      if (id === 'pepperoni') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '17');
        circle.setAttribute('fill', '#b3261e');
        circle.setAttribute('stroke', '#7d150f');
        circle.setAttribute('stroke-width', '2');
        g.appendChild(circle);

        // Charred paprika specks
        const speck = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        speck.setAttribute('cx', '-5');
        speck.setAttribute('cy', '4');
        speck.setAttribute('r', '2.5');
        speck.setAttribute('fill', '#420804');
        g.appendChild(speck);
      } else if (id === 'basil') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 -18 C 12 -12 14 12 0 18 C -14 12 -12 -12 0 -18 Z');
        path.setAttribute('fill', '#38761d');
        g.appendChild(path);
      } else if (id === 'olives') {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('r', '11');
        ring.setAttribute('fill', '#262223');
        ring.setAttribute('stroke', '#433d3e');
        ring.setAttribute('stroke-width', '4');
        g.appendChild(ring);
      } else if (id === 'mushrooms') {
        const cap = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        cap.setAttribute('d', 'M -14 0 Q 0 -16 14 0 Z');
        cap.setAttribute('fill', '#8c7662');
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        stem.setAttribute('x', '-3');
        stem.setAttribute('y', '0');
        stem.setAttribute('width', '6');
        stem.setAttribute('height', '9');
        stem.setAttribute('fill', '#e6dacb');
        g.appendChild(cap);
        g.appendChild(stem);
      } else if (id === 'prosciutto') {
        const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave.setAttribute('d', 'M -18 -6 Q -8 10 0 -4 Q 8 8 18 -6 Q 10 16 -18 -6 Z');
        wave.setAttribute('fill', '#d9534f');
        wave.setAttribute('opacity', '0.85');
        g.appendChild(wave);
      } else {
        // Generic artisanal speck
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '9');
        dot.setAttribute('fill', '#d4a342');
        dot.setAttribute('opacity', '0.9');
        g.appendChild(dot);
      }

      return g;
    }

    // --- Active Summary Calculations ---
    calculateCurrentPizzaPrice() {
      const sizeBase = SIZES[this.currentPizza.size].basePrice;
      const crustPrice = CRUST_MODIFIERS[this.currentPizza.crust].price;
      const saucePrice = SAUCES[this.currentPizza.sauce].price;
      const cheesePrice = CHEESES[this.currentPizza.cheese].price;

      let toppingsTotal = 0;
      this.currentPizza.toppings.forEach((t) => {
        toppingsTotal = (toppingsTotal || 0) + t.price;
      });

      return sizeBase + crustPrice + saucePrice + cheesePrice + toppingsTotal;
    }

    updateActiveSummary() {
      const sizeObj = SIZES[this.currentPizza.size];
      const crustObj = CRUST_MODIFIERS[this.currentPizza.crust];
      const sauceObj = SAUCES[this.currentPizza.sauce];
      const cheeseObj = CHEESES[this.currentPizza.cheese];

      const price = this.calculateCurrentPizzaPrice();
      const formattedPrice = `$${parseFloat(price).toFixed(2)}`;

      this.dom.summaryPizzaTitle.textContent = `${sizeObj.name} ${crustObj.name}`;
      this.dom.summaryCurrentPrice.textContent = formattedPrice;
      this.dom.btnAddTrayPrice.textContent = formattedPrice;

      // Generate descriptive recipe line
      const toppingNames = this.currentPizza.toppings.map((t) => {
        const item = TOPPINGS_CATALOG.find((cat) => cat.id === t.id);
        const name = item ? item.name : t.id;
        return t.coverage === 'whole' ? name : `${name} (${t.coverage})`;
      });

      let desc = `${sauceObj.name}, ${cheeseObj.name}`;
      if (toppingNames.length > 0) {
        desc += ` &bull; Toppings: ${toppingNames.join(', ')}`;
      }
      this.dom.summaryDescription.innerHTML = desc;
    }

    // --- Chef's Special Preset ---
    loadChefSpecial() {
      this.currentPizza.size = 'classic';
      this.currentPizza.crust = 'woodfired';
      this.currentPizza.sauce = 'tomato';
      this.currentPizza.cheese = 'normal';
      this.currentPizza.toppings = [
        { id: 'prosciutto', coverage: 'whole', price: 3.50 },
        { id: 'mushrooms', coverage: 'whole', price: 2.00 },
        { id: 'basil', coverage: 'whole', price: 1.50 },
        { id: 'oliveoil', coverage: 'whole', price: 1.25 }
      ];

      // Sync DOM controls
      this.dom.crustSelect.value = 'woodfired';
      this.dom.sauceSelect.value = 'tomato';
      this.dom.cheeseSelect.value = 'normal';
      this.dom.sizePills.forEach((p) => {
        const input = p.querySelector('input');
        if (input.value === 'classic') {
          input.checked = true;
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      this.renderPantryGrid();
      this.renderSvgCanvas();
      this.updateActiveSummary();
      this.updateNutritionalBar();
      this.showToast("Loaded Chef's Capricciosa D.O.P.");
    }

    resetPizzaBoard() {
      this.currentPizza.toppings = [];
      this.renderPantryGrid();
      this.renderSvgCanvas();
      this.updateActiveSummary();
      this.updateNutritionalBar();
      this.showToast('Workbench reset to plain Margherita base.');
    }

    // --- Cart Management & Order Tray ---
    addCurrentPizzaToCart() {
      const price = parseFloat(this.calculateCurrentPizzaPrice());
      const sizeObj = SIZES[this.currentPizza.size];
      const crustObj = CRUST_MODIFIERS[this.currentPizza.crust];
      const sauceObj = SAUCES[this.currentPizza.sauce];
      const cheeseObj = CHEESES[this.currentPizza.cheese];

      const toppingsCopy = this.currentPizza.toppings.map((t) => {
        const item = TOPPINGS_CATALOG.find((cat) => cat.id === t.id);
        return {
          id: t.id,
          name: item ? item.name : t.id,
          coverage: t.coverage
        };
      });

      const cartItem = {
        cartId: 'item_' + Date.now(),
        title: `${sizeObj.name} ${crustObj.name}`,
        unitPrice: price,
        qty: 1,
        sauce: sauceObj.name,
        cheese: cheeseObj.name,
        toppings: toppingsCopy
      };

      this.cart.push(cartItem);
      this.updateCartDrawer();
      this.showToast('Pizza added to your order tray! 🍕');
      this.openCart();
    }

    updateCartDrawer() {
      // 1. Badge & Headers
      const totalItems = this.cart.reduce((sum, item) => sum + item.qty, 0);
      this.dom.cartCountBadge.textContent = totalItems.toString();
      this.dom.drawerItemCount.textContent = `${totalItems} items ready for baking`;

      // 2. Render Items List
      if (this.cart.length === 0) {
        this.dom.emptyTrayMessage.style.display = 'block';
        this.dom.drawerItemsList.innerHTML = '';
        this.dom.drawerItemsList.appendChild(this.dom.emptyTrayMessage);
        this.dom.btnProceedCheckout.disabled = true;
      } else {
        this.dom.emptyTrayMessage.style.display = 'none';
        this.dom.drawerItemsList.innerHTML = '';

        this.cart.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'cart-item-card';

          const top = document.createElement('div');
          top.className = 'item-top';

          const title = document.createElement('span');
          title.className = 'item-title';
          title.textContent = item.title;

          const price = document.createElement('span');
          price.className = 'item-price';
          price.textContent = `$${(item.unitPrice * item.qty).toFixed(2)}`;

          top.appendChild(title);
          top.appendChild(price);

          const specs = document.createElement('div');
          specs.className = 'item-specs';
          const topList = item.toppings.map((t) => `${t.name} (${t.coverage})`).join(', ') || 'No extra toppings';
          specs.textContent = `${item.sauce} &bull; ${item.cheese} &bull; ${topList}`;

          const bottom = document.createElement('div');
          bottom.className = 'item-bottom';

          const stepper = document.createElement('div');
          stepper.className = 'qty-stepper';

          const btnMinus = document.createElement('button');
          btnMinus.className = 'qty-btn';
          btnMinus.textContent = '-';
          btnMinus.addEventListener('click', () => {
            // Decrement item quantity
            item.qty = Math.max(0, item.qty - 1);
            this.updateCartDrawer();
          });

          const qtySpan = document.createElement('span');
          qtySpan.className = 'qty-display';
          qtySpan.textContent = item.qty.toString();

          const btnPlus = document.createElement('button');
          btnPlus.className = 'qty-btn';
          btnPlus.textContent = '+';
          btnPlus.addEventListener('click', () => {
            item.qty += 1;
            this.updateCartDrawer();
          });

          stepper.appendChild(btnMinus);
          stepper.appendChild(qtySpan);
          stepper.appendChild(btnPlus);

          const btnRemove = document.createElement('button');
          btnRemove.className = 'btn-remove-item';
          btnRemove.textContent = 'Remove';
          btnRemove.addEventListener('click', () => {
            this.cart = this.cart.filter((c) => c.cartId !== item.cartId);
            this.updateCartDrawer();
          });

          bottom.appendChild(stepper);
          bottom.appendChild(btnRemove);

          card.appendChild(top);
          card.appendChild(specs);
          card.appendChild(bottom);

          this.dom.drawerItemsList.appendChild(card);
        });

        this.dom.btnProceedCheckout.disabled = false;
      }

      // 3. Financial Calculations
      const subtotal = this.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

      // Delivery threshold logic
      const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
      const deliveryFee = !isFreeDelivery ? 0.00 : STANDARD_DELIVERY_FEE;

      // Promo discount calculation
      let promoDiscount = 0;
      if (this.appliedPromo === 'NAPOLI15') {
        promoDiscount = subtotal * 0.15;
      }

      const taxableBase = Math.max(0, subtotal - promoDiscount);
      const tax = taxableBase * TAX_RATE;
      const grandTotal = taxableBase + deliveryFee + tax;

      // 4. Populate DOM Prices
      this.dom.priceTraySubtotal.textContent = `$${subtotal.toFixed(2)}`;
      this.dom.priceDelivery.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
      this.dom.priceTax.textContent = `$${tax.toFixed(2)}`;
      this.dom.priceGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
      this.dom.cartTotalHeader.textContent = `$${grandTotal.toFixed(2)}`;

      if (promoDiscount > 0) {
        this.dom.linePromoDiscount.style.display = 'flex';
        this.dom.pricePromoDiscount.textContent = `-$${promoDiscount.toFixed(2)}`;
      } else {
        this.dom.linePromoDiscount.style.display = 'none';
      }
    }

    applyPromoCode() {
      const code = this.dom.promoInput.value;

      if (!code) {
        this.dom.promoFeedback.className = 'promo-msg error';
        this.dom.promoFeedback.textContent = 'Please enter a promo code.';
        return;
      }

      if (code === 'NAPOLI15') {
        this.appliedPromo = 'NAPOLI15';
        this.dom.promoFeedback.className = 'promo-msg success';
        this.dom.promoFeedback.textContent = '✓ 15% Neapolitan discount applied!';
        this.updateCartDrawer();
      } else {
        this.dom.promoFeedback.className = 'promo-msg error';
        this.dom.promoFeedback.textContent = 'Invalid promo voucher code.';
      }
    }

    openCart() {
      this.dom.cartDrawer.classList.add('active');
      this.dom.cartOverlay.classList.add('active');
    }

    closeCart() {
      this.dom.cartDrawer.classList.remove('active');
      this.dom.cartOverlay.classList.remove('active');
    }

    // --- Checkout & Baking Flow ---
    openCheckoutModal() {
      if (this.cart.length === 0) return;
      this.closeCart();
      this.dom.modalSummaryTotal.textContent = this.dom.priceGrandTotal.textContent;
      this.dom.errOrderName.textContent = '';
      this.dom.errOrderPhone.textContent = '';
      this.dom.errOrderAddress.textContent = '';
      this.dom.checkoutModal.showModal();
    }

    handleCheckoutSubmit(e) {
      e.preventDefault();

      const name = this.dom.orderName.value.trim();
      const phone = this.dom.orderPhone.value.trim();
      const address = this.dom.orderAddress.value.trim();

      let hasError = false;
      if (!name) {
        this.dom.errOrderName.textContent = 'Customer name is required.';
        hasError = true;
      } else {
        this.dom.errOrderName.textContent = '';
      }

      if (!phone) {
        this.dom.errOrderPhone.textContent = 'Phone number is required.';
        hasError = true;
      } else {
        this.dom.errOrderPhone.textContent = '';
      }

      if (!address) {
        this.dom.errOrderAddress.textContent = 'Delivery address is required.';
        hasError = true;
      } else {
        this.dom.errOrderAddress.textContent = '';
      }

      if (hasError) return;

      // Close checkout and fire wood oven modal
      this.dom.checkoutModal.close();
      this.fireWoodOven(name);
    }

    fireWoodOven(guestName) {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      this.dom.successOrderNumber.textContent = `#FF-${orderNum}`;

      // Build recap
      let recapHtml = `<strong>Baking for:</strong> ${guestName}<br/><strong>Tray summary:</strong><br/>`;
      this.cart.forEach((item) => {
        recapHtml += `&bull; ${item.qty}x ${item.title} ($${(item.unitPrice * item.qty).toFixed(2)})<br/>`;
      });
      recapHtml += `<strong>Total Charged:</strong> ${this.dom.priceGrandTotal.textContent}`;
      this.dom.successRecapDetails.innerHTML = recapHtml;

      // Show Success Modal
      this.dom.orderSuccessModal.showModal();

      // Start 90s Wood-Oven Baking Timer animation
      let secondsLeft = 90;
      this.dom.bakingCountdown.textContent = `${secondsLeft}s`;
      this.dom.bakingFill.style.width = '100%';

      this.bakingInterval = setInterval(() => {
        secondsLeft--;
        this.dom.bakingCountdown.textContent = `${secondsLeft}s`;
        const pct = (secondsLeft / 90) * 100;
        this.dom.bakingFill.style.width = `${pct}%`;

        if (secondsLeft <= 0) {
          clearInterval(this.bakingInterval);
          this.dom.bakingCountdown.textContent = 'READY! 🍕';
          this.showToast('Wood-fired pizza has finished baking!');
        }
      }, 1000);

      // Reset cart
      this.cart = [];
      this.appliedPromo = null;
      this.updateCartDrawer();
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
      // Cart Open/Close
      this.dom.btnOpenCart.addEventListener('click', () => this.openCart());
      this.dom.btnCloseCart.addEventListener('click', () => this.closeCart());
      this.dom.cartOverlay.addEventListener('click', () => this.closeCart());

      // Coverage Selector
      this.dom.coverageButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.coverageButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeCoverage = btn.dataset.coverage;

          if (this.activeCoverage === 'whole') {
            this.dom.pizzaDivider.classList.remove('visible');
          } else {
            this.dom.pizzaDivider.classList.add('visible');
          }

          this.showToast(`Coverage set to: ${this.activeCoverage.toUpperCase()}`);
        });
      });

      // Workbench Tools
      this.dom.btnResetPizza.addEventListener('click', () => this.resetPizzaBoard());
      this.dom.btnChefSpecial.addEventListener('click', () => this.loadChefSpecial());
      this.dom.btnToggleSlices.addEventListener('click', () => {
        this.isSlicesVisible = !this.isSlicesVisible;
        if (this.isSlicesVisible) {
          this.dom.pizzaCanvasWrapper.classList.add('show-slices');
          this.dom.btnToggleSlices.classList.add('active');
        } else {
          this.dom.pizzaCanvasWrapper.classList.remove('show-slices');
          this.dom.btnToggleSlices.classList.remove('active');
        }
      });

      // Step 1: Size Selector
      this.dom.sizePills.forEach((pill) => {
        pill.addEventListener('click', () => {
          this.dom.sizePills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          const val = pill.dataset.size;
          this.currentPizza.size = val;

          // Toggle GF notice visibility
          this.dom.gfAllergyNotice.classList.add('hidden');

          this.updateActiveSummary();
          this.updateNutritionalBar();
        });
      });

      // Crust Selector
      this.dom.crustSelect.addEventListener('change', (e) => {
        this.currentPizza.crust = e.target.value;
        if (e.target.value === 'glutenfree') {
          this.dom.gfAllergyNotice.classList.remove('hidden');
        } else {
          this.dom.gfAllergyNotice.classList.add('hidden');
        }
        this.updateActiveSummary();
        this.updateNutritionalBar();
      });

      // Step 2: Sauce & Cheese
      this.dom.sauceSelect.addEventListener('change', (e) => {
        this.currentPizza.sauce = e.target.value;
        this.renderSvgCanvas();
        this.updateActiveSummary();
      });

      this.dom.cheeseSelect.addEventListener('change', (e) => {
        this.currentPizza.cheese = e.target.value;
        this.renderSvgCanvas();
        this.updateActiveSummary();
      });

      // Step 3: Pantry Category Filter Tabs
      this.dom.pantryTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          this.dom.pantryTabs.forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeFilter = tab.dataset.filter;
          this.renderPantryGrid();
        });
      });

      // Step 4: Add to Order Tray
      this.dom.btnAddToOrder.addEventListener('click', () => this.addCurrentPizzaToCart());

      // Promo Code
      this.dom.btnApplyPromo.addEventListener('click', () => this.applyPromoCode());

      // Checkout
      this.dom.btnProceedCheckout.addEventListener('click', () => this.openCheckoutModal());
      this.dom.btnCloseCheckoutModal.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.btnCancelCheckout.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));

      // Success Modal
      this.dom.btnNewOrder.addEventListener('click', () => {
        this.dom.orderSuccessModal.close();
        this.resetPizzaBoard();
      });

      // Interactive Canvas Click Half-Zone
      this.dom.zoneLeft.addEventListener('click', () => {
        this.showToast('Clicked Left Half of pizza.');
      });
      this.dom.zoneRight.addEventListener('click', () => {
        this.showToast('Clicked Right Half of pizza.');
      });
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.pizzaCrafter = new PizzaCrafterApp();
  });
})();
