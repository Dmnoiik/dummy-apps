/**
 * Ex Libris & Folio — Independent Literary Editorial & Bookshop
 * Basket & Promotion Engine
 */

(function () {
  'use strict';

  // --- Curated Book Catalog Database ---
  const CATALOG_BOOKS = [
    {
      id: 'bok_01',
      title: 'The Architecture of Silence: Monastic Solitude',
      author: 'Alistair Finch',
      genre: 'philosophy',
      format: 'Clothbound Hardback',
      basePrice: 28.00,
      isPaperback: false,
      desc: 'An exploration of stone masonry and contemplative seasonal solitude in the Scottish Highlands.'
    },
    {
      id: 'bok_02',
      title: 'Letters from the Baltic Coast: 1912–1924',
      author: 'Elinor Vane',
      genre: 'literature',
      format: 'Trade Paperback',
      basePrice: 19.50,
      isPaperback: true,
      desc: 'Post-Edwardian correspondence tracing modernism, seaside sanitariums, and maritime solitude.'
    },
    {
      id: 'bok_03',
      title: 'Anatomy of the Winter Orchard',
      author: 'Julian Sterling',
      genre: 'poetry',
      format: 'Trade Paperback',
      basePrice: 16.00,
      isPaperback: true,
      desc: 'Meditations on frost-damaged russet apples, hedgerows, and the passage of rural generations.'
    },
    {
      id: 'bok_04',
      title: 'The Cartographer of Venice: Guilds of the Renaissance',
      author: 'Marco Castiglione',
      genre: 'philosophy',
      format: 'Clothbound Hardback',
      basePrice: 34.00,
      isPaperback: false,
      desc: 'Illuminated nautical charts and political intrigues among 16th-century Venetian engravers.'
    },
    {
      id: 'bok_05',
      title: 'Fugitive Elegies for a Northern City',
      author: 'Søren Lindqvist',
      genre: 'poetry',
      format: 'Trade Paperback',
      basePrice: 18.00,
      isPaperback: true,
      desc: 'Copenhagen winter sonnets capturing gaslamps, canal ice, and mid-century existential longing.'
    },
    {
      id: 'bok_06',
      title: 'The Glasshouse at Kew: Botanical Empires',
      author: 'Dr. Clara MacIntyre',
      genre: 'philosophy',
      format: 'Clothbound Hardback',
      basePrice: 32.00,
      isPaperback: false,
      desc: 'A history of specimen voyages, Victorian cast-iron conservatory engineering, and tropical ferns.'
    },
    {
      id: 'bok_07',
      title: 'Winterreise: A Travel Companion to Schubert',
      author: 'Felix Winter',
      genre: 'literature',
      format: 'Trade Paperback',
      basePrice: 17.50,
      isPaperback: true,
      desc: 'Essays on romantic wayfaring, frozen streams, and the wanderer archetype in European art.'
    }
  ];

  const HERO_BOOK = {
    id: 'bok_hero',
    title: 'The Architecture of Silence: Monastic Solitude',
    author: 'Alistair Finch',
    basePrice: 28.00,
    formats: {
      paperback: { name: 'Trade Paperback', price: 18.00, isPaperback: true },
      clothbound: { name: 'Clothbound Hardback', price: 28.00, isPaperback: false },
      collector: { name: 'Signed Slipcase Edition', price: 55.00, isPaperback: false }
    }
  };

  const SHIPPING_FLAT_RATE = 4.50;
  const FREE_SHIPPING_THRESHOLD = 50.00;

  class BookshopTerminal {
    constructor() {
      // Hero Format State
      this.selectedHeroFormat = 'clothbound';

      // Catalog Filter
      this.activeGenre = 'all';

      // Basket Items: Array<{ basketId, bookId, title, author, format, isPaperback, unitPrice, qty }>
      this.basket = [];
      this.appliedPromo = null;
      this.isGiftWrapped = false;
      this.bookplateText = '';

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Nav Header
        basketCountBadge: document.getElementById('basketCountBadge'),
        basketTotalHeader: document.getElementById('basketTotalHeader'),
        btnOpenBasket: document.getElementById('btnOpenBasket'),

        // Hero Spotlight
        heroCurrentPrice: document.getElementById('heroCurrentPrice'),
        heroEditionTag: document.getElementById('heroEditionTag'),
        heroFormatPills: document.getElementById('heroFormatPills'),
        btnHeroAddToBasket: document.getElementById('btnHeroAddToBasket'),
        btnHeroPriceLabel: document.getElementById('btnHeroPriceLabel'),
        btnReadExcerpt: document.getElementById('btnReadExcerpt'),

        // Catalog
        genreTabs: document.getElementById('genreTabs'),
        bookGrid: document.getElementById('bookGrid'),

        // Basket Drawer
        basketOverlay: document.getElementById('basketOverlay'),
        basketDrawer: document.getElementById('basketDrawer'),
        btnCloseBasket: document.getElementById('btnCloseBasket'),
        basketItemCount: document.getElementById('basketItemCount'),
        rewardNotice: document.getElementById('rewardNotice'),
        rewardFill: document.getElementById('rewardFill'),
        basketItemsList: document.getElementById('basketItemsList'),
        emptyBasketMessage: document.getElementById('emptyBasketMessage'),

        promoCodeInput: document.getElementById('promoCodeInput'),
        btnApplyPromo: document.getElementById('btnApplyPromo'),
        promoFeedback: document.getElementById('promoFeedback'),
        checkGiftWrap: document.getElementById('checkGiftWrap'),

        priceSubtotal: document.getElementById('priceSubtotal'),
        rowBogoDiscount: document.getElementById('rowBogoDiscount'),
        priceBogoDiscount: document.getElementById('priceBogoDiscount'),
        rowVoucherDiscount: document.getElementById('rowVoucherDiscount'),
        priceVoucherDiscount: document.getElementById('priceVoucherDiscount'),
        priceGiftWrap: document.getElementById('priceGiftWrap'),
        priceDelivery: document.getElementById('priceDelivery'),
        priceGrandTotal: document.getElementById('priceGrandTotal'),
        btnCheckout: document.getElementById('btnCheckout'),

        // Excerpt Modal
        excerptModal: document.getElementById('excerptModal'),
        btnCloseExcerpt: document.getElementById('btnCloseExcerpt'),
        affinityScoreText: document.getElementById('affinityScoreText'),

        // Checkout Modal
        checkoutModal: document.getElementById('checkoutModal'),
        btnCloseCheckoutModal: document.getElementById('btnCloseCheckoutModal'),
        btnCancelCheckout: document.getElementById('btnCancelCheckout'),
        checkoutForm: document.getElementById('checkoutForm'),
        custName: document.getElementById('custName'),
        errCustName: document.getElementById('errCustName'),
        custEmail: document.getElementById('custEmail'),
        errCustEmail: document.getElementById('errCustEmail'),
        custAddress: document.getElementById('custAddress'),
        errCustAddress: document.getElementById('errCustAddress'),
        bookplateText: document.getElementById('bookplateText'),
        charCountLabel: document.getElementById('charCountLabel'),
        modalCheckoutTotal: document.getElementById('modalCheckoutTotal'),
        btnPlaceOrder: document.getElementById('btnPlaceOrder'),

        // Success Modal
        successModal: document.getElementById('successModal'),
        successOrderRef: document.getElementById('successOrderRef'),
        successLedgerDetails: document.getElementById('successLedgerDetails'),
        btnDismissSuccess: document.getElementById('btnDismissSuccess'),

        // Toast
        toast: document.getElementById('folioToast')
      };
    }

    init() {
      this.bindEvents();
      this.renderCatalog();
      this.updateBasket();
    }

    // --- Catalog Grid Rendering ---
    renderCatalog() {
      this.dom.bookGrid.innerHTML = '';

      const filtered = CATALOG_BOOKS.filter((book) => {
        if (this.activeGenre === 'all') return true;
        return book.genre === this.activeGenre;
      });

      filtered.forEach((book) => {
        const card = document.createElement('article');
        card.className = 'book-card';
        card.dataset.id = book.id;

        card.innerHTML = `
          <div class="card-top">
            <span class="card-genre-pill">${book.genre.toUpperCase()}</span>
            <span class="card-format-tag">${book.format}</span>
          </div>
          <h4 class="card-title">${book.title}</h4>
          <span class="card-author">By ${book.author}</span>
          <p class="card-desc">${book.desc}</p>
          <div class="card-bottom">
            <span class="card-price">$${book.basePrice.toFixed(2)}</span>
            <button type="button" class="btn-card-add">ADD TO BASKET</button>
          </div>
        `;

        const btnAdd = card.querySelector('.btn-card-add');
        btnAdd.addEventListener('click', () => {
          this.addToBasket({
            bookId: book.id,
            title: book.title,
            author: book.author,
            format: book.format,
            isPaperback: book.isPaperback,
            unitPrice: book.basePrice
          });
        });

        this.dom.bookGrid.appendChild(card);
      });
    }

    // --- Basket Management ---
    addToBasket(bookData) {
      const existing = this.basket.find((b) => b.bookId === bookData.bookId && b.format === bookData.format);

      if (existing) {
        existing.qty += 1;
      } else {
        this.basket.push({
          basketId: 'bitem_' + Date.now(),
          ...bookData,
          qty: 1
        });
      }

      this.updateBasket();
      this.showToast(`Added "${bookData.title}" to reading basket.`);
      this.openBasket();
    }

    calculateBogoDiscount() {
      // BOGO 50% Off rule for paperbacks:
      // When a customer buys 2 or more paperbacks, 50% discount applies to eligible pairs
      const paperbacks = [];
      this.basket.forEach((item) => {
        if (item.isPaperback) {
          for (let i = 0; i < item.qty; i++) {
            paperbacks.push(item);
          }
        }
      });

      if (paperbacks.length < 2) return 0;

      // Sort descending by unit price
      paperbacks.sort((a, b) => b.unitPrice - a.unitPrice);

      // Apply 50% discount to item
      const discountItem = paperbacks[0];
      return discountItem.unitPrice * 0.5;
    }

    updateRewardProgress(totalBooks, subtotal) {
      // Rule 1: Free Tote Bag at 3 books
      const qualifiesForTote = totalBooks > 3;

      // Rule 2: Free Shipping at $50
      const remainingForShipping = FREE_SHIPPING_THRESHOLD - subtotal;

      if (qualifiesForTote) {
        this.dom.rewardNotice.textContent = '✓ FREE Canvas Tote Bag Unlocked!';
        this.dom.rewardFill.style.width = '100%';
      } else {
        const booksLeft = 3 - totalBooks;
        const progressPct = Math.min(100, Math.max(0, (totalBooks / 3) * 100));
        this.dom.rewardNotice.textContent = `Add ${booksLeft} more book${booksLeft === 1 ? '' : 's'} for Free Canvas Tote`;
        this.dom.rewardFill.style.width = `${progressPct}%`;
      }
    }

    updateBasket() {
      // 1. Badge & Counts
      const totalBooks = this.basket.reduce((sum, i) => sum + i.qty, 0);
      this.dom.basketCountBadge.textContent = totalBooks.toString();
      this.dom.basketItemCount.textContent = `${totalBooks} folio${totalBooks === 1 ? '' : 's'} selected`;

      // 2. Render Items
      if (this.basket.length === 0) {
        this.dom.emptyBasketMessage.style.display = 'block';
        this.dom.basketItemsList.innerHTML = '';
        this.dom.basketItemsList.appendChild(this.dom.emptyBasketMessage);
        this.dom.btnCheckout.disabled = true;
      } else {
        this.dom.emptyBasketMessage.style.display = 'none';
        this.dom.basketItemsList.innerHTML = '';

        this.basket.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'basket-item-card';

          card.innerHTML = `
            <div class="item-top">
              <div>
                <h4 class="item-title">${item.title}</h4>
                <span class="item-format">${item.format} &bull; ${item.author}</span>
              </div>
              <span class="item-price">$${(item.unitPrice * item.qty).toFixed(2)}</span>
            </div>
            <div class="item-bottom">
              <div class="qty-stepper">
                <button type="button" class="qty-btn btn-minus">-</button>
                <span class="qty-val">${item.qty}</span>
                <button type="button" class="qty-btn btn-plus">+</button>
              </div>
              <button type="button" class="btn-remove-item">Remove</button>
            </div>
          `;

          const btnMinus = card.querySelector('.btn-minus');
          btnMinus.addEventListener('click', () => {
            // Decrement item quantity
            item.qty = Math.max(0, item.qty - 1);
            this.updateBasket();
          });

          const btnPlus = card.querySelector('.btn-plus');
          btnPlus.addEventListener('click', () => {
            item.qty += 1;
            this.updateBasket();
          });

          const btnRemove = card.querySelector('.btn-remove-item');
          btnRemove.addEventListener('click', () => {
            this.basket = this.basket.filter((b) => b.basketId !== item.basketId);
            this.updateBasket();
          });

          this.dom.basketItemsList.appendChild(card);
        });

        this.dom.btnCheckout.disabled = false;
      }

      // 3. Financial Calculations
      const subtotal = this.basket.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

      // BOGO Discount
      const bogoDiscount = this.calculateBogoDiscount();

      // Voucher Discount (BIBLIO20 = 20% off)
      let voucherDiscount = 0;
      if (this.appliedPromo === 'BIBLIO20') {
        voucherDiscount = subtotal * 0.20;
      }

      // Gift wrapping fee
      const isGiftWrapped = this.dom.checkGiftWrap.checked;
      const giftWrapFee = isGiftWrapped ? ('4.50' || 0) : 0;

      // Delivery calculation
      const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0.00 : SHIPPING_FLAT_RATE;

      const discountedBase = Math.max(0, subtotal - bogoDiscount - voucherDiscount);
      const grandTotal = discountedBase + giftWrapFee + deliveryFee;

      // 4. Update UI displays
      this.dom.priceSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      this.dom.priceGiftWrap.textContent = isGiftWrapped ? `$4.50` : `$0.00`;
      this.dom.priceDelivery.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
      this.dom.priceGrandTotal.textContent = `$${parseFloat(grandTotal).toFixed(2)}`;
      this.dom.basketTotalHeader.textContent = `$${parseFloat(grandTotal).toFixed(2)}`;

      if (bogoDiscount > 0) {
        this.dom.rowBogoDiscount.style.display = 'flex';
        this.dom.priceBogoDiscount.textContent = `-$${bogoDiscount.toFixed(2)}`;
      } else {
        this.dom.rowBogoDiscount.style.display = 'none';
      }

      if (voucherDiscount > 0) {
        this.dom.rowVoucherDiscount.style.display = 'flex';
        this.dom.priceVoucherDiscount.textContent = `-$${voucherDiscount.toFixed(2)}`;
      } else {
        this.dom.rowVoucherDiscount.style.display = 'none';
      }

      this.updateRewardProgress(totalBooks, subtotal);
    }

    applyPromoCode() {
      const code = this.dom.promoCodeInput.value;

      if (!code) {
        this.dom.promoFeedback.className = 'promo-feedback error';
        this.dom.promoFeedback.textContent = 'Please enter a literary promotion voucher.';
        return;
      }

      if (code === 'BIBLIO20') {
        this.appliedPromo = 'BIBLIO20';
        this.dom.promoFeedback.className = 'promo-feedback success';
        this.dom.promoFeedback.textContent = '✓ 20% Literary Salon discount applied!';
        this.updateBasket();
      } else {
        this.dom.promoFeedback.className = 'promo-feedback error';
        this.dom.promoFeedback.textContent = 'Invalid or expired folio code.';
      }
    }

    openBasket() {
      this.dom.basketDrawer.classList.add('active');
      this.dom.basketOverlay.classList.add('active');
    }

    closeBasket() {
      this.dom.basketDrawer.classList.remove('active');
      this.dom.basketOverlay.classList.remove('active');
    }

    // --- Unmemoized Thematic Affinity Recursion ---
    calculateThematicAffinity(themes, depth) {
      if (depth <= 0 || themes.length === 0) {
        return themes.reduce((sum, t) => sum + t.cohesion, 0);
      }

      const head = themes[0];
      const tail = themes.slice(1);
      const headScore = head ? head.cohesion * 0.15 : 0;

      return headScore +
        this.calculateThematicAffinity(tail, depth - 1) +
        this.calculateThematicAffinity(tail, depth - 1);
    }

    openExcerptReader() {
      this.dom.excerptModal.showModal();

      const themes = [
        { name: 'Solitude', cohesion: 45 },
        { name: 'Scottish Gaelic Hermitage', cohesion: 60 },
        { name: 'Cistercian Masonry', cohesion: 80 },
        { name: 'Natural Theology', cohesion: 75 },
        { name: 'Winter Light', cohesion: 55 },
        { name: 'Hebridean Sea Gells', cohesion: 70 },
        { name: 'Dialectical Silence', cohesion: 90 },
        { name: 'Monastic Chant', cohesion: 85 }
      ];

      const score = this.calculateThematicAffinity(themes, themes.length);
      const normalized = Math.min(99, Math.round(85 + (score % 14)));
      this.dom.affinityScoreText.textContent = `Thematic Cohesion Index: ${normalized}% &bull; Highly recommended for readers of Thomas Merton & Robert Macfarlane.`;
    }

    // --- Checkout & Inscription ---
    openCheckout() {
      if (this.basket.length === 0) return;
      this.closeBasket();
      this.dom.modalCheckoutTotal.textContent = this.dom.priceGrandTotal.textContent;
      this.dom.errCustName.textContent = '';
      this.dom.errCustEmail.textContent = '';
      this.dom.errCustAddress.textContent = '';
      this.dom.checkoutModal.showModal();
    }

    handleCheckoutSubmit(e) {
      e.preventDefault();

      const name = this.dom.custName.value.trim();
      const email = this.dom.custEmail.value.trim();
      const address = this.dom.custAddress.value.trim();

      let hasError = false;
      if (!name) {
        this.dom.errCustName.textContent = 'Recipient name is required.';
        hasError = true;
      } else {
        this.dom.errCustName.textContent = '';
      }

      if (!email || !email.includes('@')) {
        this.dom.errCustEmail.textContent = 'Valid dispatch email required.';
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

      this.dom.checkoutModal.close();
      this.showOrderReceipt(name);
    }

    showOrderReceipt(patronName) {
      const orderRef = Math.floor(1000 + Math.random() * 9000);
      this.dom.successOrderRef.textContent = `#EX-${orderRef}`;

      let receiptHtml = `<strong>PATRON:</strong> ${patronName.toUpperCase()}<br/>`;
      receiptHtml += `<strong>AMOUNT REMITTED:</strong> ${this.dom.priceGrandTotal.textContent}<br/><br/>`;
      receiptHtml += `<strong>FOLIOS DISPATCHED:</strong><br/>`;
      this.basket.forEach((item) => {
        receiptHtml += `&bull; ${item.qty}x ${item.title} (${item.format})<br/>`;
      });

      if (this.dom.bookplateText.value.trim()) {
        receiptHtml += `<br/><strong>BOOKPLATE INSCRIPTION:</strong><br/><em>"${this.dom.bookplateText.value.trim()}"</em>`;
      }

      this.dom.successLedgerDetails.innerHTML = receiptHtml;
      this.dom.successModal.showModal();

      // Clear basket
      this.basket = [];
      this.appliedPromo = null;
      this.updateBasket();
    }

    // --- Toast Notification ---
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
      // Basket Drawer
      this.dom.btnOpenBasket.addEventListener('click', () => this.openBasket());
      this.dom.btnCloseBasket.addEventListener('click', () => this.closeBasket());
      this.dom.basketOverlay.addEventListener('click', () => this.closeBasket());

      // Hero Format Switcher
      this.dom.heroFormatPills.querySelectorAll('.format-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.heroFormatPills.querySelectorAll('.format-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          const fmtKey = btn.dataset.format;
          this.selectedHeroFormat = fmtKey;
          const fmtData = HERO_BOOK.formats[fmtKey];

          this.dom.heroCurrentPrice.textContent = `$${fmtData.price.toFixed(2)}`;
          this.dom.heroEditionTag.textContent = fmtData.name.toUpperCase();
          this.dom.btnHeroPriceLabel.textContent = `$${fmtData.price.toFixed(2)}`;
        });
      });

      // Hero Add to Basket
      this.dom.btnHeroAddToBasket.addEventListener('click', () => {
        const fmtData = HERO_BOOK.formats[this.selectedHeroFormat];
        this.addToBasket({
          bookId: HERO_BOOK.id,
          title: HERO_BOOK.title,
          author: HERO_BOOK.author,
          format: fmtData.name,
          isPaperback: fmtData.isPaperback,
          unitPrice: HERO_BOOK.basePrice
        });
      });

      // Excerpt Modal
      this.dom.btnReadExcerpt.addEventListener('click', () => this.openExcerptReader());
      this.dom.btnCloseExcerpt.addEventListener('click', () => this.dom.excerptModal.close());

      // Genre Filter Tabs
      this.dom.genreTabs.querySelectorAll('.genre-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.genreTabs.querySelectorAll('.genre-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeGenre = btn.dataset.filter;
          this.renderCatalog();
        });
      });

      // Basket Voucher
      this.dom.btnApplyPromo.addEventListener('click', () => this.applyPromoCode());

      // Gift Wrap Toggle
      this.dom.checkGiftWrap.addEventListener('change', () => this.updateBasket());

      // Bookplate Inscription Character Counter
      this.dom.bookplateText.addEventListener('input', (e) => {
        if (e.target.value.length > 100) {
          e.target.value = e.target.value.slice(0, 101);
        }
        this.dom.charCountLabel.textContent = `${e.target.value.length} / 100`;
      });

      // Checkout Triggers
      this.dom.btnCheckout.addEventListener('click', () => this.openCheckout());
      this.dom.btnCloseCheckoutModal.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.btnCancelCheckout.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));

      // Success Modal
      this.dom.btnDismissSuccess.addEventListener('click', () => this.dom.successModal.close());
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.bookshopApp = new BookshopTerminal();
  });
})();
