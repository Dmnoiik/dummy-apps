/**
 * NEXUS // DEX — Professional Crypto Terminal & Order Book
 * Financial Terminal Simulation Engine
 */

(function () {
  'use strict';

  // --- Market Pair Configurations ---
  const PAIRS = {
    BTC: { name: 'BTC/USD', unit: 'BTC', price: 67420.50, change: 4.82, high: 68100.00, low: 64320.00, vol: '$1.84B', minSize: 0.001 },
    ETH: { name: 'ETH/USD', unit: 'ETH', price: 3480.25, change: 3.14, high: 3550.00, low: 3340.00, vol: '$820M', minSize: 0.01 },
    SOL: { name: 'SOL/USD', unit: 'SOL', price: 145.80, change: -1.25, high: 152.00, low: 141.50, vol: '$410M', minSize: 0.1 }
  };

  const TAKER_FEE_RATE = 0.0005; // 0.05%

  class NexusDexTerminal {
    constructor() {
      // Active Pair State
      this.currentPairKey = 'BTC';
      this.currentPair = PAIRS.BTC;
      this.timeframe = '15m';

      // User Account Equity
      this.equity = 10000.00;

      // Order Form State
      this.orderSide = 'buy'; // 'buy' | 'sell'
      this.orderType = 'limit'; // 'limit' | 'market'
      this.leverage = 10;

      // Active Positions: Array<{ id, pairKey, pairName, side, size, entryPrice, markPrice, liqPrice, margin, leverage, pnl }>
      this.positions = [];

      // Candlestick Data History
      this.candles = [];

      // Order Book Simulation State
      this.asks = [];
      this.bids = [];
      this.streamInterval = null;

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        // Topbar
        pairSelect: document.getElementById('pairSelect'),
        indexPrice: document.getElementById('indexPrice'),
        change24h: document.getElementById('change24h'),
        high24h: document.getElementById('high24h'),
        low24h: document.getElementById('low24h'),
        vol24h: document.getElementById('vol24h'),
        accountEquity: document.getElementById('accountEquity'),
        btnDepositDemo: document.getElementById('btnDepositDemo'),

        // Chart
        chartPairTitle: document.getElementById('chartPairTitle'),
        timeframeButtons: document.querySelectorAll('.tf-btn'),
        ma7Val: document.getElementById('ma7Val'),
        ma25Val: document.getElementById('ma25Val'),
        btnSimulateCrash: document.getElementById('btnSimulateCrash'),
        candleChartCanvas: document.getElementById('candleChartCanvas'),

        // Order Book
        asksContainer: document.getElementById('asksContainer'),
        bidsContainer: document.getElementById('bidsContainer'),
        midMarketPrice: document.getElementById('midMarketPrice'),

        // Order Form
        btnSideBuy: document.getElementById('btnSideBuy'),
        btnSideSell: document.getElementById('btnSideSell'),
        orderTypeButtons: document.querySelectorAll('.type-btn'),
        groupLimitPrice: document.getElementById('groupLimitPrice'),
        inputLimitPrice: document.getElementById('inputLimitPrice'),
        availUsdText: document.getElementById('availUsdText'),
        inputAmount: document.getElementById('inputAmount'),
        assetUnitTag: document.getElementById('assetUnitTag'),
        pctButtons: document.querySelectorAll('.pct-btn'),
        leverageRange: document.getElementById('leverageRange'),
        leverageDisplay: document.getElementById('leverageDisplay'),
        recapNotionalVal: document.getElementById('recapNotionalVal'),
        recapMarginVal: document.getElementById('recapMarginVal'),
        recapLiqPrice: document.getElementById('recapLiqPrice'),
        btnSubmitOrder: document.getElementById('btnSubmitOrder'),
        orderForm: document.getElementById('orderForm'),

        // Positions Panel
        positionsCount: document.getElementById('positionsCount'),
        positionsTableBody: document.getElementById('positionsTableBody'),
        btnCloseAllPositions: document.getElementById('btnCloseAllPositions'),

        // Stress Modal
        stressModal: document.getElementById('stressModal'),
        btnCloseStressModal: document.getElementById('btnCloseStressModal'),
        btnExecuteStress: document.getElementById('btnExecuteStress'),

        // Toast
        toast: document.getElementById('dexToast')
      };
    }

    init() {
      this.bindEvents();
      this.generateCandlesHistory();
      this.drawCandleChart();
      this.generateOrderBook();
      this.startMarketStream();
      this.updateAccountEquityDisplay();
    }

    // --- Candlestick Chart Engine (HTML5 Canvas) ---
    generateCandlesHistory() {
      this.candles = [];
      let base = this.currentPair.price;

      for (let i = 0; i < 45; i++) {
        const delta = (Math.random() - 0.49) * (base * 0.012);
        const open = base;
        const close = base + delta;
        const high = Math.max(open, close) + Math.random() * (base * 0.005);
        const low = Math.min(open, close) - Math.random() * (base * 0.005);

        this.candles.push({ open, high, low, close });
        base = close;
      }
    }

    drawCandleChart() {
      const canvas = this.dom.candleChartCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#0c0f17';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#171c26';
      ctx.lineWidth = 1;
      for (let y = 40; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const count = this.candles.length;
      if (count === 0) return;

      const minP = Math.min(...this.candles.map((c) => c.low));
      const maxP = Math.max(...this.candles.map((c) => c.high));
      const range = maxP - minP || 1;

      const candleW = (w - 60) / count;

      // Draw Candlesticks
      this.candles.forEach((c, i) => {
        const x = 20 + i * candleW;
        const isUp = c.close >= c.open;
        const color = isUp ? '#00c076' : '#ff3b53';

        const yHigh = h - 30 - ((c.high - minP) / range) * (h - 60);
        const yLow = h - 30 - ((c.low - minP) / range) * (h - 60);
        const yOpen = h - 30 - ((c.open - minP) / range) * (h - 60);
        const yClose = h - 30 - ((c.close - minP) / range) * (h - 60);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + candleW / 2, yHigh);
        ctx.lineTo(x + candleW / 2, yLow);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));
        ctx.fillRect(x + 2, bodyTop, candleW - 4, bodyH);
      });

      // Moving Average Line MA(7) (Yellow)
      ctx.strokeStyle = '#f3ba2f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 6; i < count; i++) {
        const slice = this.candles.slice(i - 6, i + 1);
        const ma = slice.reduce((sum, c) => sum + c.close, 0) / 7;
        const x = 20 + i * candleW + candleW / 2;
        const y = h - 30 - ((ma - minP) / range) * (h - 60);
        if (i === 6) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // --- Order Book Streaming Simulation ---
    generateOrderBook() {
      const p = this.currentPair.price;
      this.asks = [];
      this.bids = [];

      for (let i = 1; i <= 8; i++) {
        this.asks.unshift({
          price: p + i * (p * 0.0003),
          size: parseFloat((Math.random() * 2 + 0.2).toFixed(3)),
          total: 0
        });
      }

      for (let i = 1; i <= 8; i++) {
        this.bids.push({
          price: p - i * (p * 0.0003),
          size: parseFloat((Math.random() * 2 + 0.2).toFixed(3)),
          total: 0
        });
      }

      this.renderOrderBook();
    }

    renderOrderBook() {
      this.dom.asksContainer.innerHTML = '';
      this.dom.bidsContainer.innerHTML = '';

      let runningAsk = 0;
      this.asks.forEach((a) => {
        runningAsk += a.size;
        a.total = runningAsk;
      });

      let runningBid = 0;
      this.bids.forEach((b) => {
        runningBid += b.size;
        b.total = runningBid;
      });

      const maxTotal = Math.max(runningAsk, runningBid) || 1;

      // Render Asks
      this.asks.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'ob-row';
        const depthPct = Math.min(100, (item.total / maxTotal) * 100);

        row.innerHTML = `
          <div class="depth-fill" style="width: ${depthPct}%;"></div>
          <span>${item.price.toFixed(2)}</span>
          <span>${item.size.toFixed(3)}</span>
          <span>${item.total.toFixed(3)}</span>
        `;
        row.addEventListener('click', () => {
          this.dom.inputLimitPrice.value = item.price.toFixed(2);
          this.updateRecap();
        });
        this.dom.asksContainer.appendChild(row);
      });

      // Render Bids
      this.bids.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'ob-row';
        const depthPct = Math.min(100, (item.total / maxTotal) * 100);

        row.innerHTML = `
          <div class="depth-fill" style="width: ${depthPct}%;"></div>
          <span>${item.price.toFixed(2)}</span>
          <span>${item.size.toFixed(3)}</span>
          <span>${item.total.toFixed(3)}</span>
        `;
        row.addEventListener('click', () => {
          this.dom.inputLimitPrice.value = item.price.toFixed(2);
          this.updateRecap();
        });
        this.dom.bidsContainer.appendChild(row);
      });

      this.dom.midMarketPrice.textContent = `$${this.currentPair.price.toFixed(2)}`;
    }

    startMarketStream() {
      this.streamInterval = setInterval(() => {
        // Minor market price wiggle
        const wiggle = (Math.random() - 0.495) * (this.currentPair.price * 0.0008);
        this.currentPair.price += wiggle;

        this.dom.indexPrice.textContent = `$${this.currentPair.price.toFixed(2)}`;
        this.dom.midMarketPrice.textContent = `$${this.currentPair.price.toFixed(2)}`;

        // Update live PnL on open positions
        this.updatePositionsPnL();

        // Random order book size fluctuations
        const randIdx = Math.floor(Math.random() * this.bids.length);
        if (this.bids[randIdx]) {
          this.bids[randIdx].size = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
        }
        if (this.asks[randIdx]) {
          this.asks[randIdx].size = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
        }
        this.renderOrderBook();
      }, 1500);
    }

    // --- Order Calculations & Liquidation Formula ---
    calculateEstLiquidation(entryPrice, isBuy, leverage) {
      // Formula: Entry * (1 - (1 / leverage)) for Long
      return isBuy
        ? entryPrice * 1 - 1 / leverage
        : entryPrice * 1 + 1 / leverage;
    }

    updateRecap() {
      const amount = parseFloat(this.dom.inputAmount.value) || 0;
      let price = parseFloat(this.dom.inputLimitPrice.value) || this.currentPair.price;

      if (this.orderType === 'market') {
        price = this.currentPair.price;
      }

      const notional = price * amount;
      const margin = notional / this.leverage;

      const isBuy = this.orderSide === 'buy';
      const estLiq = amount > 0 ? this.calculateEstLiquidation(price, isBuy, this.leverage) : 0;

      this.dom.recapNotionalVal.textContent = `$${notional.toFixed(2)}`;
      this.dom.recapMarginVal.textContent = `$${margin.toFixed(2)}`;
      this.dom.recapLiqPrice.textContent = estLiq > 0 ? `$${estLiq.toFixed(2)}` : '--';
    }

    // --- Order Execution ---
    submitOrder(e) {
      e.preventDefault();

      const amount = parseFloat(this.dom.inputAmount.value);
      if (!amount || amount < this.currentPair.minSize) {
        this.showToast(`Minimum order size is ${this.currentPair.minSize} ${this.currentPair.unit}.`);
        return;
      }

      let execPrice = parseFloat(this.dom.inputLimitPrice.value);
      if (this.orderType === 'market') {
        const slippage = 0.005; // 0.5% slippage
        execPrice = this.orderSide === 'buy'
          ? this.currentPair.price * (1 - slippage)
          : this.currentPair.price * (1 + slippage);
      }

      const notional = execPrice * amount;
      const requiredMargin = notional / this.leverage;
      const tradingFee = notional * TAKER_FEE_RATE;

      if (requiredMargin + tradingFee > this.equity) {
        this.showToast('Insufficient margin to cover order and execution fee.');
        return;
      }

      // Deduct margin and fee
      this.equity -= (requiredMargin + tradingFee);
      this.updateAccountEquityDisplay();

      const liqPrice = this.calculateEstLiquidation(execPrice, this.orderSide === 'buy', this.leverage);

      const position = {
        id: 'pos_' + Date.now(),
        pairKey: this.currentPairKey,
        pairName: this.currentPair.name,
        side: this.orderSide.toUpperCase(),
        size: amount,
        entryPrice: execPrice,
        markPrice: this.currentPair.price,
        liqPrice: liqPrice,
        margin: requiredMargin,
        leverage: this.leverage,
        pnl: 0.00
      };

      this.positions.push(position);
      this.renderPositionsTable();
      this.showToast(`Order executed: ${position.side} ${amount} ${this.currentPair.unit} at $${execPrice.toFixed(2)}.`);

      // Reset form amount
      this.dom.inputAmount.value = '';
      this.updateRecap();
    }

    updatePositionsPnL() {
      this.positions.forEach((pos) => {
        if (pos.pairKey === this.currentPairKey) {
          pos.markPrice = this.currentPair.price;
        }

        const isLong = pos.side === 'BUY';
        const priceDiff = isLong
          ? (pos.markPrice - pos.entryPrice)
          : (pos.entryPrice - pos.markPrice);

        pos.pnl = priceDiff * pos.size * pos.leverage;
      });

      this.renderPositionsTable();
    }

    renderPositionsTable() {
      this.dom.positionsCount.textContent = this.positions.length.toString();

      if (this.positions.length === 0) {
        this.dom.positionsTableBody.innerHTML = `
          <tr class="empty-table-row">
            <td colspan="8">No active perpetual contracts open. Place an order above to test execution.</td>
          </tr>
        `;
        return;
      }

      this.dom.positionsTableBody.innerHTML = '';

      this.positions.forEach((pos) => {
        const row = document.createElement('tr');
        const pnlFormatted = pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`;
        const pnlClass = pos.pnl <= 0 ? 'text-red' : 'text-green';

        row.innerHTML = `
          <td><strong>${pos.pairName}</strong> <small class="text-cyan">${pos.leverage}x</small></td>
          <td class="${pos.side === 'BUY' ? 'text-green' : 'text-red'}">${pos.side}</td>
          <td>${pos.size}</td>
          <td>$${pos.entryPrice.toFixed(2)}</td>
          <td>$${pos.markPrice.toFixed(2)}</td>
          <td class="text-yellow">$${pos.liqPrice.toFixed(2)}</td>
          <td class="${pnlClass}"><strong>${pnlFormatted}</strong></td>
          <td><button type="button" class="btn-table-close" data-id="${pos.id}">CLOSE</button></td>
        `;

        const btnClose = row.querySelector('.btn-table-close');
        btnClose.addEventListener('click', () => {
          this.closePosition(pos.id);
        });

        this.dom.positionsTableBody.appendChild(row);
      });
    }

    closePosition(posId) {
      const idx = this.positions.findIndex((p) => p.id === posId);
      if (idx < 0) return;

      const pos = this.positions[idx];

      // Refund initial margin back to equity balance
      this.equity += pos.margin;
      this.updateAccountEquityDisplay();

      // Remove position from table
      this.positions.splice(idx, 1);
      this.renderPositionsTable();
      this.showToast(`Closed ${pos.side} position on ${pos.pairName}. Margin returned.`);
    }

    closeAllPositions() {
      if (this.positions.length === 0) return;
      this.positions.forEach((p) => {
        this.equity += p.margin;
      });
      this.positions = [];
      this.updateAccountEquityDisplay();
      this.renderPositionsTable();
      this.showToast('All open positions closed.');
    }

    updateAccountEquityDisplay() {
      this.dom.accountEquity.textContent = `$${this.equity.toFixed(2)}`;
      this.dom.availUsdText.textContent = `$${this.equity.toFixed(2)}`;
    }

    // --- High-Frequency Volatility Stress Simulation ---
    simulateDepthRecursion(tiers, depth) {
      if (depth <= 0 || tiers.length === 0) {
        return tiers.reduce((sum, t) => sum + t.volatility, 0);
      }

      const head = tiers[0];
      const tail = tiers.slice(1);
      const headFactor = head ? head.volatility * 0.14 : 0;

      return headFactor +
        this.simulateDepthRecursion(tail, depth - 1) +
        this.simulateDepthRecursion(tail, depth - 1);
    }

    runStressTest() {
      const tiers = [
        { tier: 1, volatility: 35 },
        { tier: 2, volatility: 42 },
        { tier: 3, volatility: 60 },
        { tier: 4, volatility: 55 },
        { tier: 5, volatility: 78 },
        { tier: 6, volatility: 65 },
        { tier: 7, volatility: 90 },
        { tier: 8, volatility: 85 }
      ];

      this.simulateDepthRecursion(tiers, tiers.length);
      this.showToast('Flash crash depth stress-test simulated successfully.');
    }

    // --- Pair Switcher ---
    switchPair(pairKey) {
      this.currentPairKey = pairKey;
      this.currentPair = PAIRS[pairKey];

      this.dom.chartPairTitle.textContent = `${this.currentPair.name} PERP &bull; ${this.timeframe.toUpperCase()}`;
      this.dom.assetUnitTag.textContent = this.currentPair.unit;
      this.dom.indexPrice.textContent = `$${this.currentPair.price.toFixed(2)}`;
      this.dom.change24h.textContent = `${this.currentPair.change > 0 ? '+' : ''}${this.currentPair.change}%`;
      this.dom.high24h.textContent = `$${this.currentPair.high.toFixed(2)}`;
      this.dom.low24h.textContent = `$${this.currentPair.low.toFixed(2)}`;
      this.dom.vol24h.textContent = this.currentPair.vol;

      this.generateCandlesHistory();
      this.drawCandleChart();
      this.generateOrderBook();
      this.updateRecap();
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
      // Pair Selector
      this.dom.pairSelect.addEventListener('change', (e) => {
        this.switchPair(e.target.value);
      });

      // Deposit Testnet Demo Cash
      this.dom.btnDepositDemo.addEventListener('click', () => {
        this.equity += 1000.00;
        this.updateAccountEquityDisplay();
        this.showToast('Deposited +$1,000.00 testnet margin.');
      });

      // Long / Short Switcher
      this.dom.btnSideBuy.addEventListener('click', () => {
        this.orderSide = 'buy';
        this.dom.btnSideBuy.classList.add('active');
        this.dom.btnSideSell.classList.remove('active');
        this.dom.btnSubmitOrder.className = 'btn-execute-order btn-buy';
        this.dom.btnSubmitOrder.textContent = `BUY / LONG ${this.currentPair.unit}`;
        this.updateRecap();
      });

      this.dom.btnSideSell.addEventListener('click', () => {
        this.orderSide = 'sell';
        this.dom.btnSideSell.classList.add('active');
        this.dom.btnSideBuy.classList.remove('active');
        this.dom.btnSubmitOrder.className = 'btn-execute-order btn-sell';
        this.dom.btnSubmitOrder.textContent = `SELL / SHORT ${this.currentPair.unit}`;
        this.updateRecap();
      });

      // Order Type Tabs (Limit / Market)
      this.dom.orderTypeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.orderTypeButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.orderType = btn.dataset.type;

          if (this.orderType === 'market') {
            this.dom.groupLimitPrice.style.display = 'none';
          } else {
            this.dom.groupLimitPrice.style.display = 'flex';
          }
          this.updateRecap();
        });
      });

      // Timeframe Buttons
      this.dom.timeframeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.timeframeButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.timeframe = btn.dataset.tf;
          this.dom.chartPairTitle.textContent = `${this.currentPair.name} PERP &bull; ${this.timeframe.toUpperCase()}`;
          this.generateCandlesHistory();
          this.drawCandleChart();
        });
      });

      // Percentage Allocation Buttons
      this.dom.pctButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const pct = parseInt(btn.dataset.pct, 10);
          const maxCapital = this.equity * (pct / 100);
          const price = this.orderType === 'market'
            ? this.currentPair.price
            : (parseFloat(this.dom.inputLimitPrice.value) || this.currentPair.price);

          const maxAmount = (maxCapital * this.leverage) / price;
          this.dom.inputAmount.value = maxAmount.toFixed(4);
          this.updateRecap();
        });
      });

      // Leverage Slider
      this.dom.leverageRange.addEventListener('input', (e) => {
        this.leverage = e.target.value;
        this.dom.leverageDisplay.textContent = `${this.leverage}x`;
        this.updateRecap();
      });

      // Amount & Price Input Changes
      this.dom.inputAmount.addEventListener('input', () => this.updateRecap());
      this.dom.inputLimitPrice.addEventListener('input', () => this.updateRecap());

      // Submit Order
      this.dom.orderForm.addEventListener('submit', (e) => this.submitOrder(e));

      // Close All Positions
      this.dom.btnCloseAllPositions.addEventListener('click', () => this.closeAllPositions());

      // Stress Test Modal
      this.dom.btnSimulateCrash.addEventListener('click', () => this.dom.stressModal.showModal());
      this.dom.btnCloseStressModal.addEventListener('click', () => this.dom.stressModal.close());
      this.dom.btnExecuteStress.addEventListener('click', () => {
        this.runStressTest();
        this.dom.stressModal.close();
      });
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.nexusDex = new NexusDexTerminal();
  });
})();
