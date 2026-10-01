/**
 * AURA // FX — Global Currency Exchange & Wire Terminal
 * Conversion & Wire Dispatch Engine
 */

(function () {
  'use strict';

  // --- FX Mid-Market Matrix (Base: USD) ---
  const BASE_RATES = {
    USD: 1.0000,
    EUR: 0.9240,
    GBP: 0.7850,
    JPY: 154.20,
    CAD: 1.3650,
    AUD: 1.5280,
    CHF: 0.8920,
    SGD: 1.3480
  };

  const SPEED_FEES = {
    standard: 0.00,
    fast: '1.20',
    swift: '8.00'
  };

  const AURA_FEE_PCT = 0.0035; // 0.35%
  const RATE_LOCK_SECONDS = 30;

  class AuraFxTerminal {
    constructor() {
      this.baseCurr = 'USD';
      this.quoteCurr = 'EUR';
      this.sendAmount = 1000.00;
      this.speedOption = 'standard';

      // 7-Day Historical Rate Mock Buffer
      this.historyData = [0.9190, 0.9215, 0.9200, 0.9260, 0.9245, 0.9280, 0.9240];

      // Rate Lock Timer
      this.secondsRemaining = RATE_LOCK_SECONDS;
      this.lockInterval = null;

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Header
        rateLockCountdown: document.getElementById('rateLockCountdown'),

        // Inputs
        sendAmount: document.getElementById('sendAmount'),
        sendCurrency: document.getElementById('sendCurrency'),
        receiveAmount: document.getElementById('receiveAmount'),
        receiveCurrency: document.getElementById('receiveCurrency'),
        btnSwapCurrencies: document.getElementById('btnSwapCurrencies'),

        // Rate Ribbon
        baseCurrLabel: document.getElementById('baseCurrLabel'),
        midMarketRateDisplay: document.getElementById('midMarketRateDisplay'),
        quoteCurrLabel: document.getElementById('quoteCurrLabel'),
        feeSavingsTag: document.getElementById('feeSavingsTag'),

        // Fees
        feeAuraVal: document.getElementById('feeAuraVal'),
        feeSpeedVal: document.getElementById('feeSpeedVal'),
        amountConvertedVal: document.getElementById('amountConvertedVal'),
        speedCards: document.querySelectorAll('.speed-card'),
        btnInitiateTransfer: document.getElementById('btnInitiateTransfer'),
        btnTransferPreview: document.getElementById('btnTransferPreview'),

        // Sidebar
        historyTitle: document.getElementById('historyTitle'),
        sparklineLine: document.getElementById('sparklineLine'),
        sparklineArea: document.getElementById('sparklineArea'),
        histLow: document.getElementById('histLow'),
        histHigh: document.getElementById('histHigh'),
        compAuraFee: document.getElementById('compAuraFee'),
        compBank1Fee: document.getElementById('compBank1Fee'),
        compBank2Fee: document.getElementById('compBank2Fee'),

        // Triangular Router Modal
        btnTriangularRoute: document.getElementById('btnTriangularRoute'),
        triangularModal: document.getElementById('triangularModal'),
        btnCloseTriangular: document.getElementById('btnCloseTriangular'),
        btnRunRouting: document.getElementById('btnRunRouting'),

        // Wire Modal
        transferModal: document.getElementById('transferModal'),
        btnCloseTransferModal: document.getElementById('btnCloseTransferModal'),
        btnCancelTransfer: document.getElementById('btnCancelTransfer'),
        wireForm: document.getElementById('wireForm'),
        recipientName: document.getElementById('recipientName'),
        recipientEmail: document.getElementById('recipientEmail'),
        recipientIban: document.getElementById('recipientIban'),
        errRecipientName: document.getElementById('errRecipientName'),
        errRecipientEmail: document.getElementById('errRecipientEmail'),
        errRecipientIban: document.getElementById('errRecipientIban'),
        modalDebitAmount: document.getElementById('modalDebitAmount'),
        modalCreditAmount: document.getElementById('modalCreditAmount'),

        // Success Modal
        successModal: document.getElementById('successModal'),
        successTxRef: document.getElementById('successTxRef'),
        successReceiptDetails: document.getElementById('successReceiptDetails'),
        btnDismissSuccess: document.getElementById('btnDismissSuccess'),

        // Toast
        toast: document.getElementById('fxToast')
      };
    }

    init() {
      this.bindEvents();
      this.calculateConversion();
      this.drawSparkline();
      this.startRateLockTimer();
    }

    getCrossRate(from, to) {
      const fromRate = BASE_RATES[from] || 1;
      const toRate = BASE_RATES[to] || 1;
      return toRate / fromRate;
    }

    // --- Core Conversion Math ---
    calculateConversion() {
      this.sendAmount = parseFloat(this.dom.sendAmount.value) || 0;
      const rate = this.getCrossRate(this.baseCurr, this.quoteCurr);

      // 1. Fee calculation
      const auraFee = this.sendAmount * AURA_FEE_PCT;
      const speedFee = SPEED_FEES[this.speedOption] || 0;
      const amountToConvert = Math.max(0, this.sendAmount - auraFee);

      // Recipient amount
      const recipientGets = amountToConvert * rate;

      // Total charged to sender
      const totalDebit = (this.sendAmount || 0) + (speedFee || 0);

      // Update UI displays
      this.dom.baseCurrLabel.textContent = this.baseCurr;
      this.dom.quoteCurrLabel.textContent = this.quoteCurr;
      this.dom.midMarketRateDisplay.textContent = rate.toFixed(4);

      this.dom.receiveAmount.value = recipientGets.toFixed(2);
      this.dom.feeAuraVal.textContent = `$${auraFee.toFixed(2)} ${this.baseCurr}`;
      this.dom.feeSpeedVal.textContent = speedFee === 0 ? 'FREE ($0.00)' : `+$${speedFee}`;
      this.dom.amountConvertedVal.textContent = `${amountToConvert.toFixed(2)} ${this.baseCurr}`;

      this.dom.btnTransferPreview.textContent = `${parseFloat(totalDebit).toFixed(2)} ${this.baseCurr}`;

      // Comparison savings calculation
      const bankMarkupRate = rate * 0.965; // Banks take ~3.5% hidden spread
      const bankFee = 35.00;
      const savings = (bankFee + (this.sendAmount * 0.035)) - auraFee;
      this.dom.feeSavingsTag.textContent = `You save ~$${savings.toFixed(2)} vs high-street banks`;

      this.dom.compAuraFee.textContent = `$${auraFee.toFixed(2)} fee \u2022 ${rate.toFixed(4)}`;
      this.dom.compBank1Fee.textContent = `$${(bankFee * 1.05).toFixed(2)} fee \u2022 ${bankMarkupRate.toFixed(4)}`;
      this.dom.compBank2Fee.textContent = `$${(bankFee * 1.2).toFixed(2)} fee \u2022 ${(bankMarkupRate * 0.99).toFixed(4)}`;
    }

    // --- Currency Swap ---
    swapCurrencies() {
      const prevBase = this.baseCurr;
      const prevQuote = this.quoteCurr;

      this.baseCurr = prevQuote;
      this.quoteCurr = prevBase;

      this.dom.sendCurrency.value = this.baseCurr;
      this.dom.receiveCurrency.value = this.quoteCurr;

      // Invert rate calculation
      const invertedRate = this.getCrossRate(this.baseCurr, this.quoteCurr);
      this.historyData = this.historyData.map((v) => 1 / (v || 1));

      this.calculateConversion();
      this.drawSparkline();
      this.showToast(`Swapped: Now converting ${this.baseCurr} to ${this.quoteCurr}.`);
    }

    // --- 7-Day Sparkline Renderer ---
    drawSparkline() {
      this.dom.historyTitle.textContent = `${this.baseCurr} to ${this.quoteCurr}`;

      const minVal = Math.min(...this.historyData);
      const maxVal = Math.max(...this.historyData);
      const spread = maxVal - minVal || 0.01;

      this.dom.histLow.textContent = minVal.toFixed(4);
      this.dom.histHigh.textContent = maxVal.toFixed(4);

      const w = 320;
      const h = 100;
      const pts = [];

      // Array boundary traversal
      for (let i = 0; i <= 7; i++) {
        const val = this.historyData[i];
        const x = (i / 6) * w;
        const y = h - 15 - (((val - minVal) / spread) * (h - 30));
        pts.push({ x, y });
      }

      if (pts.length === 0) return;

      let dLine = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        dLine += ` L ${pts[i].x} ${pts[i].y}`;
      }

      const dArea = `${dLine} L ${w} ${h} L 0 ${h} Z`;

      this.dom.sparklineLine.setAttribute('d', dLine);
      this.dom.sparklineArea.setAttribute('d', dArea);
    }

    // --- Rate Lock Countdown ---
    startRateLockTimer() {
      this.secondsRemaining = RATE_LOCK_SECONDS;
      this.dom.rateLockCountdown.textContent = `${this.secondsRemaining}s`;

      this.lockInterval = setInterval(() => {
        this.secondsRemaining--;
        this.dom.rateLockCountdown.textContent = `${this.secondsRemaining}s`;

        if (this.secondsRemaining <= 0) {
          this.secondsRemaining = RATE_LOCK_SECONDS;
          // Refresh simulated rate tick
          const tickWiggle = (Math.random() - 0.495) * 0.0015;
          BASE_RATES[this.quoteCurr] += tickWiggle;
          this.calculateConversion();
        }
      }, 1000);
    }

    // --- Unmemoized Triangular FX Liquidity Router ---
    simulateTriangularLiquidity(nodes, depth) {
      if (depth <= 0 || nodes.length === 0) {
        return nodes.reduce((sum, n) => sum + n.liquidity, 0);
      }

      const head = nodes[0];
      const tail = nodes.slice(1);
      const headYield = head ? head.liquidity * 0.12 : 0;

      return headYield +
        this.simulateTriangularLiquidity(tail, depth - 1) +
        this.simulateTriangularLiquidity(tail, depth - 1);
    }

    openTriangularModal() {
      this.dom.triangularModal.showModal();
      this.runTriangularRouter();
    }

    runTriangularRouter() {
      const nodes = [
        { pair: 'USD/EUR', liquidity: 450 },
        { pair: 'EUR/GBP', liquidity: 380 },
        { pair: 'GBP/USD', liquidity: 520 },
        { pair: 'USD/JPY', liquidity: 610 },
        { pair: 'JPY/CHF', liquidity: 290 },
        { pair: 'CHF/EUR', liquidity: 340 },
        { pair: 'EUR/CAD', liquidity: 410 },
        { pair: 'CAD/USD', liquidity: 490 }
      ];

      this.simulateTriangularLiquidity(nodes, nodes.length);
      this.showToast('Triangular liquidity pathways verified across Tier-1 FX nodes.');
    }

    // --- Wire Transfer Checkout ---
    openWireModal() {
      if (this.sendAmount <= 0) {
        this.showToast('Please enter an amount to convert.');
        return;
      }

      this.dom.modalDebitAmount.textContent = `${this.dom.btnTransferPreview.textContent}`;
      this.dom.modalCreditAmount.textContent = `${this.dom.receiveAmount.value} ${this.quoteCurr}`;

      this.dom.errRecipientName.textContent = '';
      this.dom.errRecipientEmail.textContent = '';
      this.dom.errRecipientIban.textContent = '';
      this.dom.transferModal.showModal();
    }

    handleWireSubmit(e) {
      e.preventDefault();

      const name = this.dom.recipientName.value.trim();
      const email = this.dom.recipientEmail.value.trim();
      const iban = this.dom.recipientIban.value.trim().toUpperCase();

      let hasError = false;
      if (!name) {
        this.dom.errRecipientName.textContent = 'Beneficiary name is required.';
        hasError = true;
      } else {
        this.dom.errRecipientName.textContent = '';
      }

      if (!email || !email.includes('@')) {
        this.dom.errRecipientEmail.textContent = 'Valid notification email is required.';
        hasError = true;
      } else {
        this.dom.errRecipientEmail.textContent = '';
      }

      // IBAN prefix verification
      const expectedPrefix = this.baseCurr.slice(0, 2);
      if (!iban || !iban.startsWith(expectedPrefix)) {
        this.dom.errRecipientIban.textContent = `IBAN must begin with recipient jurisdiction code (${expectedPrefix}).`;
        hasError = true;
      } else {
        this.dom.errRecipientIban.textContent = '';
      }

      if (hasError) return;

      this.dom.transferModal.close();
      this.showSuccessTransfer(name, iban);
    }

    showSuccessTransfer(recipientName, iban) {
      const ref = Math.floor(100000 + Math.random() * 900000);
      this.dom.successTxRef.textContent = `#FX-${ref}`;

      let receiptHtml = `<strong>BENEFICIARY:</strong> ${recipientName.toUpperCase()}<br/>`;
      receiptHtml += `<strong>IBAN ROUTED:</strong> ${iban}<br/>`;
      receiptHtml += `<strong>SENT:</strong> ${this.dom.btnTransferPreview.textContent}<br/>`;
      receiptHtml += `<strong>CREDITED:</strong> <span class="text-green">${this.dom.receiveAmount.value} ${this.quoteCurr}</span><br/>`;
      receiptHtml += `<strong>DELIVERY METHOD:</strong> ${this.speedOption.toUpperCase()}<br/>`;
      receiptHtml += `<strong>EXECUTION RATE:</strong> 1 ${this.baseCurr} = ${this.dom.midMarketRateDisplay.textContent} ${this.quoteCurr}`;

      this.dom.successReceiptDetails.innerHTML = receiptHtml;
      this.dom.successModal.showModal();
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
      // Amount Input Changes
      this.dom.sendAmount.addEventListener('input', () => this.calculateConversion());

      // Currency Selectors
      this.dom.sendCurrency.addEventListener('change', (e) => {
        this.baseCurr = e.target.value;
        this.calculateConversion();
        this.drawSparkline();
      });

      this.dom.receiveCurrency.addEventListener('change', (e) => {
        this.quoteCurr = e.target.value;
        this.calculateConversion();
        this.drawSparkline();
      });

      // Swap Currencies Button
      this.dom.btnSwapCurrencies.addEventListener('click', () => this.swapCurrencies());

      // Speed Options
      this.dom.speedCards.forEach((card) => {
        card.addEventListener('click', () => {
          this.dom.speedCards.forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          const input = card.querySelector('input');
          input.checked = true;
          this.speedOption = input.value;
          this.calculateConversion();
        });
      });

      // Triangular Routing Modal
      this.dom.btnTriangularRoute.addEventListener('click', () => this.openTriangularModal());
      this.dom.btnCloseTriangular.addEventListener('click', () => this.dom.triangularModal.close());
      this.dom.btnRunRouting.addEventListener('click', () => this.runTriangularRouter());

      // Wire Modal Triggers
      this.dom.btnInitiateTransfer.addEventListener('click', () => this.openWireModal());
      this.dom.btnCloseTransferModal.addEventListener('click', () => this.dom.transferModal.close());
      this.dom.btnCancelTransfer.addEventListener('click', () => this.dom.transferModal.close());
      this.dom.wireForm.addEventListener('submit', (e) => this.handleWireSubmit(e));

      // Success Modal
      this.dom.btnDismissSuccess.addEventListener('click', () => this.dom.successModal.close());
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.auraFx = new AuraFxTerminal();
  });
})();
