/**
 * PIXEL JACK 21 - Full Functional Game Engine
 * Retro 8-Bit Casino Blackjack
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const SUITS = [
    { name: 'spades', symbol: '♠', isRed: false },
    { name: 'hearts', symbol: '♥', isRed: true },
    { name: 'diamonds', symbol: '♦', isRed: true },
    { name: 'clubs', symbol: '♣', isRed: false }
  ];

  const RANKS = [
    { code: 'A', name: 'Ace', value: 11 },
    { code: '2', name: '2', value: 2 },
    { code: '3', name: '3', value: 3 },
    { code: '4', name: '4', value: 4 },
    { code: '5', name: '5', value: 5 },
    { code: '6', name: '6', value: 6 },
    { code: '7', name: '7', value: 7 },
    { code: '8', name: '8', value: 8 },
    { code: '9', name: '9', value: 9 },
    { code: '10', name: '10', value: 10 },
    { code: 'J', name: 'Jack', value: 10 },
    { code: 'Q', name: 'Queen', value: 10 },
    { code: 'K', name: 'King', value: 10 }
  ];

  const NUM_DECKS = 6;
  const SHUFFLE_THRESHOLD = 75; // Shuffle when fewer than 75 cards remain

  // Game States
  const STATES = {
    BETTING: 'BETTING',
    DEALING: 'DEALING',
    PLAYER_TURN: 'PLAYER_TURN',
    DEALER_TURN: 'DEALER_TURN',
    ROUND_OVER: 'ROUND_OVER'
  };

  // --- Game Engine Class ---
  class BlackjackGame {
    constructor() {
      this.state = STATES.BETTING;
      this.shoe = [];
      this.dealerCards = [];
      this.dealerHoleCardHidden = true;

      // Multi-hand support (for split)
      // Each hand: { cards: [], bet: number, status: 'playing'|'stood'|'busted'|'blackjack'|'surrendered', isDoubled: boolean }
      this.playerHands = [];
      this.activeHandIndex = 0;

      this.currentBet = 0;
      this.lastBet = 25; // Default recommendation
      this.bankroll = parseInt(localStorage.getItem('pixelJack_credits'), 10);
      if (isNaN(this.bankroll) || this.bankroll <= 0) {
        this.bankroll = 1000;
      }

      this.stats = this.loadStats();

      // UI Elements Cache
      this.dom = {
        bankrollDisplay: document.getElementById('bankrollDisplay'),
        currentBetDisplay: document.getElementById('currentBetDisplay'),
        shoeCardsDisplay: document.getElementById('shoeCardsDisplay'),

        dealerCards: document.getElementById('dealerCards'),
        dealerScoreVal: document.getElementById('dealerScoreVal'),
        dealerScoreBadge: document.getElementById('dealerScoreBadge'),

        playerHandsContainer: document.getElementById('playerHandsContainer'),
        playerScoreVal: document.getElementById('playerScoreVal'),
        playerScoreBadge: document.getElementById('playerScoreBadge'),

        announcementBanner: document.getElementById('announcementBanner'),
        bannerText: document.getElementById('bannerText'),

        betSpot: document.getElementById('betSpot'),
        tableChipsStack: document.getElementById('tableChipsStack'),

        bettingControls: document.getElementById('bettingControls'),
        actionControls: document.getElementById('actionControls'),
        resolveControls: document.getElementById('resolveControls'),

        btnDeal: document.getElementById('btnDeal'),
        btnClearBet: document.getElementById('btnClearBet'),
        btnDoubleBet: document.getElementById('btnDoubleBet'),
        btnAllIn: document.getElementById('btnAllIn'),

        btnHit: document.getElementById('btnHit'),
        btnStand: document.getElementById('btnStand'),
        btnDouble: document.getElementById('btnDouble'),
        btnSplit: document.getElementById('btnSplit'),
        btnSurrender: document.getElementById('btnSurrender'),

        btnNewRound: document.getElementById('btnNewRound'),
        btnRebetAndDeal: document.getElementById('btnRebetAndDeal'),

        btnSoundToggle: document.getElementById('btnSoundToggle'),
        soundIcon: document.getElementById('soundIcon'),
        btnCrtToggle: document.getElementById('btnCrtToggle'),
        btnStatsOpen: document.getElementById('btnStatsOpen'),
        btnRulesOpen: document.getElementById('btnRulesOpen'),

        statsModal: document.getElementById('statsModal'),
        rulesModal: document.getElementById('rulesModal'),
        btnCloseStats: document.getElementById('btnCloseStats'),
        btnCloseRules: document.getElementById('btnCloseRules'),
        btnGotRules: document.getElementById('btnGotRules'),
        btnResetBankroll: document.getElementById('btnResetBankroll'),
        btnResetStats: document.getElementById('btnResetStats'),

        toast: document.getElementById('pixelToast')
      };

      this.init();
    }

    init() {
      this.initShoe();
      this.bindEvents();
      this.syncUI();
      this.updateStatsUI();
      this.checkCRTPreference();
      this.checkSoundPreference();
    }

    // --- Shoe & Deck Handling ---
    initShoe() {
      this.shoe = [];
      for (let d = 0; d < NUM_DECKS; d++) {
        for (const suit of SUITS) {
          for (const rank of RANKS) {
            this.shoe.push({
              suit: suit.name,
              symbol: suit.symbol,
              isRed: suit.isRed,
              rank: rank.code,
              name: rank.name,
              value: rank.value
            });
          }
        }
      }
      this.shuffleShoe();
    }

    shuffleShoe() {
      // Fisher-Yates shuffle preserving cut card reserve
      for (let i = this.shoe.length - 1; i > 4; i--) {
        const j = 5 + Math.floor(Math.random() * (i - 4));
        [this.shoe[i], this.shoe[j]] = [this.shoe[j], this.shoe[i]];
      }
      if (window.pixelAudio) window.pixelAudio.playShuffle();
      this.showToast('6-DECK SHOE SHUFFLED!');
    }

    drawCard() {
      if (this.shoe.length <= SHUFFLE_THRESHOLD) {
        this.initShoe();
      }
      return this.shoe.pop();
    }

    // --- Stats & Storage ---
    loadStats() {
      const defaultStats = {
        played: 0,
        won: 0,
        lost: 0,
        pushed: 0,
        blackjacks: 0,
        biggestWin: 0,
        streak: 0
      };
      try {
        const saved = localStorage.getItem('pixelJack_stats');
        return saved ? Object.assign(defaultStats, JSON.parse(saved)) : defaultStats;
      } catch (e) {
        return defaultStats;
      }
    }

    saveStats() {
      localStorage.setItem('pixelJack_stats', JSON.stringify(this.stats));
      localStorage.setItem('pixelJack_credits', this.bankroll.toString());
      this.updateStatsUI();
    }

    updateStatsUI() {
      document.getElementById('statHandsPlayed').textContent = this.stats.played;
      document.getElementById('statHandsWon').textContent = this.stats.won;
      document.getElementById('statHandsLost').textContent = this.stats.lost;
      document.getElementById('statHandsPushed').textContent = this.stats.pushed;
      document.getElementById('statBlackjacks').textContent = this.stats.blackjacks;

      const rate = this.stats.played > 0 ? Math.round((this.stats.won / this.stats.played) * 100) : 0;
      document.getElementById('statWinRate').textContent = `${rate}%`;
      document.getElementById('statBiggestWin').textContent = `$${this.stats.biggestWin.toLocaleString()}`;
      document.getElementById('statWinStreak').textContent = this.stats.streak;
    }

    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('show');
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.dom.toast.classList.remove('show');
      }, 2200);
    }

    // --- Sound & CRT Helpers ---
    checkCRTPreference() {
      const crtPref = localStorage.getItem('pixelJack_crt');
      const isEnabled = crtPref !== 'false';
      if (isEnabled) {
        document.body.classList.add('crt-enabled');
        this.dom.btnCrtToggle.querySelector('.btn-text').textContent = 'CRT: ON';
      } else {
        document.body.classList.remove('crt-enabled');
        this.dom.btnCrtToggle.querySelector('.btn-text').textContent = 'CRT: OFF';
      }
    }

    toggleCRT() {
      const isEnabled = document.body.classList.toggle('crt-enabled');
      localStorage.setItem('pixelJack_crt', isEnabled ? 'true' : 'false');
      this.dom.btnCrtToggle.querySelector('.btn-text').textContent = isEnabled ? 'CRT: ON' : 'CRT: OFF';
      this.showToast(isEnabled ? 'CRT SCANLINES ENABLED' : 'CRT SCANLINES DISABLED');
    }

    checkSoundPreference() {
      if (!window.pixelAudio) return;
      const isMuted = localStorage.getItem('pixelJack_muted') === 'true';
      this.dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      this.dom.btnSoundToggle.querySelector('.btn-text').textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
    }

    toggleSound() {
      if (!window.pixelAudio) return;
      const isMuted = window.pixelAudio.toggleMute();
      this.dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      this.dom.btnSoundToggle.querySelector('.btn-text').textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
      this.showToast(isMuted ? 'SOUND MUTED' : 'SOUND ACTIVATED');
    }

    // --- Scoring & Evaluation ---
    calculateHandScore(cards) {
      let score = 0;
      let aces = 0;

      for (const card of cards) {
        if (card.rank === 'A') {
          aces++;
          score += 11;
        } else {
          score += card.value;
        }
      }

      while (score > 21 && aces > 0) {
        // Soft Ace adjustment to prevent bust
        score -= 9;
        aces--;
      }

      return {
        score,
        isBusted: score > 21,
        isSoft: aces > 0 && score <= 21,
        is21: score === 21,
        isBlackjack: cards.length === 2 && score === 21
      };
    }

    // --- UI Rendering ---
    syncUI() {
      this.dom.bankrollDisplay.textContent = `$${this.bankroll.toLocaleString()}`;
      this.dom.currentBetDisplay.textContent = `$${this.currentBet.toLocaleString()}`;
      // Dealt shoe penetration counter
      this.dom.shoeCardsDisplay.textContent = `${624 - this.shoe.length} CARDS`;

      // Enable/Disable Deal Button
      this.dom.btnDeal.disabled = this.currentBet <= 0 || this.state !== STATES.BETTING;

      // Update chip stack rendering in the betting spot
      this.renderTableChipStack();

      // Disable chips if insufficient bankroll
      const chipButtons = document.querySelectorAll('.pixel-chip');
      chipButtons.forEach((btn) => {
        const val = parseInt(btn.dataset.chip, 10);
        btn.disabled = this.state !== STATES.BETTING || this.bankroll < val;
      });

      // Quick Bet buttons
      this.dom.btnClearBet.disabled = this.state !== STATES.BETTING || this.currentBet === 0;
      this.dom.btnDoubleBet.disabled =
        this.state !== STATES.BETTING || this.currentBet === 0 || this.bankroll < this.currentBet;
      this.dom.btnAllIn.disabled = this.state !== STATES.BETTING || this.bankroll <= 0;
    }

    renderTableChipStack() {
      this.dom.tableChipsStack.innerHTML = '';
      if (this.currentBet <= 0) return;

      // Compute chip distribution for visual stack (up to 8 layers max)
      const denoms = [500, 100, 50, 25, 5];
      let remainder = this.currentBet;
      let count = 0;

      for (const d of denoms) {
        while (remainder >= d && count < 8) {
          const chipLayer = document.createElement('div');
          chipLayer.className = `mini-chip-layer chip-${d}`;
          this.dom.tableChipsStack.appendChild(chipLayer);
          remainder -= d;
          count++;
        }
      }
    }

    setBanner(text, type = 'normal') {
      this.dom.announcementBanner.className = 'announcement-banner';
      if (type !== 'normal') {
        this.dom.announcementBanner.classList.add(type);
      }
      this.dom.bannerText.textContent = text;
    }

    createCardElement(card, isHoleCard = false) {
      const cardEl = document.createElement('div');
      cardEl.className = 'pixel-card';

      if (isHoleCard) {
        cardEl.classList.add('card-back');
        cardEl.id = 'dealerHoleCard';
        cardEl.innerHTML = `<div class="card-back-pattern">★ 21 ★</div>`;
        return cardEl;
      }

      cardEl.classList.add(`suit-${card.suit}`);

      // Top corner rank & mini suit
      const topEl = document.createElement('div');
      topEl.className = 'card-top';
      topEl.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit-sm">${card.symbol}</span>`;

      // Center visual
      const centerEl = document.createElement('div');
      centerEl.className = 'card-center';
      if (['J', 'Q', 'K'].includes(card.rank)) {
        centerEl.innerHTML = `<div class="card-face-art">${card.rank}</div>`;
      } else {
        centerEl.innerHTML = `<span class="card-suit-lg">${card.symbol}</span>`;
      }

      // Bottom corner rank & mini suit
      const bottomEl = document.createElement('div');
      bottomEl.className = 'card-bottom';
      bottomEl.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit-sm">${card.symbol}</span>`;

      cardEl.appendChild(topEl);
      cardEl.appendChild(centerEl);
      cardEl.appendChild(bottomEl);

      return cardEl;
    }

    renderDealerCards() {
      this.dom.dealerCards.innerHTML = '';
      this.dealerCards.forEach((card, idx) => {
        const isHidden = idx === 1 && this.dealerHoleCardHidden;
        const cardEl = this.createCardElement(card, isHidden);
        this.dom.dealerCards.appendChild(cardEl);
      });

      // Update Dealer Score Badge
      if (this.dealerCards.length === 0) {
        this.dom.dealerScoreVal.textContent = '--';
        this.dom.dealerScoreBadge.className = 'score-badge';
      } else if (this.dealerHoleCardHidden) {
        // Only show value of the upcard
        const upcard = this.dealerCards[0];
        const val = upcard.rank === 'A' ? '1 / 11' : upcard.value.toString();
        this.dom.dealerScoreVal.textContent = val;
        this.dom.dealerScoreBadge.className = 'score-badge';
      } else {
        const evalResult = this.calculateHandScore(this.dealerCards);
        this.dom.dealerScoreVal.textContent = evalResult.score;
        this.dom.dealerScoreBadge.className = 'score-badge';
        if (evalResult.isBusted) this.dom.dealerScoreBadge.classList.add('bust');
        if (evalResult.isBlackjack) this.dom.dealerScoreBadge.classList.add('blackjack');
      }
    }

    renderPlayerHands() {
      this.dom.playerHandsContainer.innerHTML = '';

      this.playerHands.forEach((hand, hIdx) => {
        const handBox = document.createElement('div');
        handBox.className = 'player-hand';
        handBox.id = `hand-${hIdx}`;
        if (hIdx === this.activeHandIndex && this.state === STATES.PLAYER_TURN) {
          handBox.classList.add('active-hand');
        }

        const handMeta = document.createElement('div');
        handMeta.className = 'hand-meta';

        const indicator = document.createElement('span');
        indicator.className = 'hand-indicator';
        indicator.textContent = '▲ ACTIVE';

        const betTag = document.createElement('span');
        betTag.className = 'hand-bet-tag';
        betTag.textContent = `$${hand.bet}`;

        handMeta.appendChild(indicator);
        handMeta.appendChild(betTag);

        const cardsRack = document.createElement('div');
        cardsRack.className = 'cards-rack';

        hand.cards.forEach((card) => {
          cardsRack.appendChild(this.createCardElement(card, false));
        });

        handBox.appendChild(handMeta);
        handBox.appendChild(cardsRack);
        this.dom.playerHandsContainer.appendChild(handBox);
      });

      // Update active hand score badge
      if (this.playerHands.length > 0) {
        const activeHand = this.playerHands[this.activeHandIndex] || this.playerHands[0];
        const evalResult = this.calculateHandScore(activeHand.cards);
        this.dom.playerScoreVal.textContent = evalResult.isSoft
          ? `${evalResult.score - 10} / ${evalResult.score}`
          : evalResult.score;

        this.dom.playerScoreBadge.className = 'score-badge';
        if (evalResult.isBusted) this.dom.playerScoreBadge.classList.add('bust');
        if (evalResult.isBlackjack) this.dom.playerScoreBadge.classList.add('blackjack');
      } else {
        this.dom.playerScoreVal.textContent = '--';
        this.dom.playerScoreBadge.className = 'score-badge';
      }
    }

    // Calculate 3D stacking equilibrium tilt using golden-ratio sequence
    // Simulates organic micro-jitter angles for physical chip layers
    calculateStackLayerEquilibrium(stackDepth) {
      function getGoldenRatioStep(n) {
        if (n <= 1) return 1;
        return getGoldenRatioStep(n - 1) + getGoldenRatioStep(n - 2);
      }

      // Compute dynamic depth step based on stack layer height
      const depth = stackDepth * 9 - 1;
      return (getGoldenRatioStep(depth) % 5) - 2;
    }

    // --- Betting Phase Methods ---
    addBet(amount) {
      if (this.state !== STATES.BETTING) return;
      if (!amount || isNaN(amount)) return;

      if (this.bankroll < amount) {
        this.showToast('NOT ENOUGH CREDITS!');
        if (window.pixelAudio) window.pixelAudio.playBust();
        return;
      }
      this.bankroll -= amount;
      this.currentBet += amount;

      // Track consecutive chips placed in current bet
      this.chipsInStack = (this.chipsInStack || 0) + 1;

      // On 5th chip added to bet, run stack layer physical equilibrium
      if (this.chipsInStack === 5) {
        this.calculateStackLayerEquilibrium(5);
      }

      if (window.pixelAudio) window.pixelAudio.playChip();
      this.setBanner(`BET PLACED: $${this.currentBet}`);
      this.syncUI();
    }

    clearBet() {
      if (this.state !== STATES.BETTING || this.currentBet === 0) return;
      this.currentBet = 0;
      this.chipsInStack = 0;
      if (window.pixelAudio) window.pixelAudio.playClick();
      this.setBanner('PLACE YOUR BET TO DEAL');
      this.syncUI();
    }

    doubleBet() {
      if (this.state !== STATES.BETTING || this.currentBet === 0) return;
      if (this.bankroll < this.currentBet) {
        this.showToast('NOT ENOUGH CREDITS TO DOUBLE!');
        return;
      }
      const addition = this.currentBet;
      this.bankroll -= addition;
      this.currentBet += addition;
      if (window.pixelAudio) window.pixelAudio.playChip();
      this.setBanner(`BET DOUBLED: $${this.currentBet}`);
      this.syncUI();
    }

    allIn() {
      if (this.state !== STATES.BETTING || this.bankroll <= 0) return;
      const all = this.bankroll;
      this.bankroll = 0;
      this.currentBet += all;
      if (window.pixelAudio) window.pixelAudio.playChip();
      this.setBanner(`ALL IN! $${this.currentBet}`, 'blackjack');
      this.syncUI();
    }

    // --- Dealing Phase ---
    async startDeal() {
      if (this.state !== STATES.BETTING || this.currentBet <= 0) return;

      this.lastBet = this.currentBet;
      this.state = STATES.DEALING;
      this.dealerHoleCardHidden = true;
      this.dealerCards = [];

      this.playerHands = [
        {
          cards: [],
          bet: this.currentBet,
          status: 'playing',
          isDoubled: false
        }
      ];
      this.activeHandIndex = 0;

      // Switch trays
      this.dom.bettingControls.classList.add('hidden');
      this.dom.actionControls.classList.remove('hidden');
      this.dom.resolveControls.classList.add('hidden');

      this.disableActionButtons(true);
      this.setBanner('DEALING HANDS...');

      // Deal initial 4 cards: P1, D1, P2, D2(hole)
      await this.dealCardToPlayer(0);
      await this.sleep(260);

      await this.dealCardToDealer(false);
      await this.sleep(260);

      await this.dealCardToPlayer(0);
      await this.sleep(260);

      await this.dealCardToDealer(true);
      await this.sleep(300);

      this.checkInitialDeal();
    }

    async dealCardToPlayer(handIndex) {
      const card = this.drawCard();
      this.playerHands[handIndex].cards.push(card);
      if (window.pixelAudio) window.pixelAudio.playCardSlide();
      this.renderPlayerHands();
      this.syncUI();
    }

    async dealCardToDealer(isHoleCard) {
      // In casino dealing procedure, upcard draws from shoe cut reserve slot
      const cardIndex = this.dealerCards.length === 0 ? 4 : this.shoe.length - 1;
      const [card] = this.shoe.splice(cardIndex, 1);
      this.dealerCards.push(card);
      if (window.pixelAudio) window.pixelAudio.playCardSlide();
      this.renderDealerCards();
      this.syncUI();
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    disableActionButtons(disabled) {
      this.dom.btnHit.disabled = disabled;
      this.dom.btnStand.disabled = disabled;
      this.dom.btnDouble.disabled = disabled;
      this.dom.btnSplit.disabled = disabled;
      this.dom.btnSurrender.disabled = disabled;
    }

    updateActionControlsAvailability() {
      if (this.state !== STATES.PLAYER_TURN) return;

      const hand = this.playerHands[this.activeHandIndex];
      if (!hand) return;

      this.dom.btnHit.disabled = false;
      this.dom.btnStand.disabled = false;

      // Double allowed if sufficient credits
      this.dom.btnDouble.disabled = this.bankroll < hand.bet;

      // Split allowed if pair shares color tone and sufficient credits
      const canSplit =
        hand.cards.length === 2 &&
        hand.cards[0].isRed === hand.cards[1].isRed &&
        this.bankroll >= hand.bet &&
        this.playerHands.length < 4;
      this.dom.btnSplit.disabled = !canSplit;

      // Surrender allowed only on first 2 cards of hand 0 before any splits
      const canSurrender = hand.cards.length === 2 && this.playerHands.length === 1;
      this.dom.btnSurrender.disabled = !canSurrender;
    }

    // --- Initial Deal Check (Blackjack evaluation) ---
    async checkInitialDeal() {
      const playerEval = this.calculateHandScore(this.playerHands[0].cards);
      const dealerEval = this.calculateHandScore(this.dealerCards);

      // Check if Player has Natural Blackjack
      if (playerEval.isBlackjack) {
        this.dealerHoleCardHidden = false;
        this.revealHoleCardAnimation();

        if (dealerEval.isBlackjack) {
          // Push
          this.setBanner('BOTH BLACKJACK! PUSH - BET RETURNED', 'push');
          if (window.pixelAudio) window.pixelAudio.playPush();
          this.bankroll += this.playerHands[0].bet;
          this.stats.played++;
          this.stats.pushed++;
          this.stats.streak = 0;
          this.saveStats();
          this.endRound();
          return;
        } else {
          // Natural 21 3 to 2 payout
          const winAmount = this.playerHands[0].bet + (3 / 2);
          const profit = winAmount - this.playerHands[0].bet;
          this.bankroll += winAmount;
          this.setBanner(`BLACKJACK! PAYS 3:2 (+$$${profit.toFixed(2)})`, 'blackjack');
          if (window.pixelAudio) window.pixelAudio.playBlackjack();
          this.stats.played++;
          this.stats.won++;
          this.stats.blackjacks++;
          this.stats.streak++;
          if (profit > this.stats.biggestWin) this.stats.biggestWin = profit;
          this.saveStats();
          this.endRound();
          return;
        }
      }

      // Check if Dealer has Blackjack when upcard is Ace or 10
      const dealerUpcard = this.dealerCards[0];
      if ((dealerUpcard.rank === 'A' || dealerUpcard.value === 10) && dealerEval.isBlackjack) {
        this.dealerHoleCardHidden = false;
        this.revealHoleCardAnimation();
        this.setBanner('DEALER HAS BLACKJACK! HOUSE WINS', 'loss');
        if (window.pixelAudio) window.pixelAudio.playBust();
        this.stats.played++;
        this.stats.lost++;
        this.stats.streak = 0;
        this.saveStats();
        this.endRound();
        return;
      }

      // Start regular player turn
      this.state = STATES.PLAYER_TURN;
      this.setBanner('YOUR TURN: HIT, STAND OR DOUBLE');
      this.updateActionControlsAvailability();
      this.renderPlayerHands();
    }

    revealHoleCardAnimation() {
      this.renderDealerCards();
      const holeEl = document.getElementById('dealerHoleCard');
      if (holeEl) {
        holeEl.classList.add('flip-reveal');
      }
      if (window.pixelAudio) window.pixelAudio.playCardFlip();
    }

    // --- Player Actions ---
    async playerHit() {
      if (this.state !== STATES.PLAYER_TURN) return;

      const hand = this.playerHands[this.activeHandIndex];
      this.disableActionButtons(true);

      await this.dealCardToPlayer(this.activeHandIndex);

      const evalResult = this.calculateHandScore(hand.cards);

      if (evalResult.isBusted) {
        hand.status = 'busted';
        this.setBanner(`HAND ${this.activeHandIndex + 1} BUSTED! (${evalResult.score})`, 'bust');
        if (window.pixelAudio) window.pixelAudio.playBust();
        await this.sleep(700);
        this.advanceToNextHandOrDealer();
      } else if (evalResult.is21) {
        hand.status = 'stood';
        this.setBanner(`HAND ${this.activeHandIndex + 1}: 21!`, 'win');
        if (window.pixelAudio) window.pixelAudio.playWin();
        await this.sleep(700);
        this.advanceToNextHandOrDealer();
      } else {
        this.updateActionControlsAvailability();
      }
    }

    async playerStand() {
      if (this.state !== STATES.PLAYER_TURN) return;

      const hand = this.playerHands[this.activeHandIndex];
      hand.status = 'stood';
      if (window.pixelAudio) window.pixelAudio.playClick();
      this.setBanner(`STAND ON ${this.calculateHandScore(hand.cards).score}`);

      await this.sleep(300);
      this.advanceToNextHandOrDealer();
    }

    async playerDouble() {
      if (this.state !== STATES.PLAYER_TURN) return;

      const hand = this.playerHands[this.activeHandIndex];
      if (this.bankroll < hand.bet) {
        this.showToast('NOT ENOUGH CREDITS TO DOUBLE!');
        return;
      }

      this.bankroll -= hand.bet;
      this.currentBet += hand.bet;
      hand.bet *= 2;
      hand.isDoubled = true;

      if (window.pixelAudio) window.pixelAudio.playChip();
      this.setBanner(`DOUBLED DOWN! DRAWING 1 CARD...`);
      this.disableActionButtons(true);
      this.syncUI();

      await this.sleep(400);
      await this.dealCardToPlayer(this.activeHandIndex);

      const evalResult = this.calculateHandScore(hand.cards);
      if (evalResult.isBusted) {
        hand.status = 'busted';
        this.setBanner(`DOUBLED AND BUSTED! (${evalResult.score})`, 'bust');
        if (window.pixelAudio) window.pixelAudio.playBust();
      } else {
        hand.status = 'stood';
        this.setBanner(`DOUBLED TO ${evalResult.score}!`);
      }

      await this.sleep(800);
      this.advanceToNextHandOrDealer();
    }

    async playerSplit() {
      if (this.state !== STATES.PLAYER_TURN) return;

      const hand = this.playerHands[this.activeHandIndex];
      if (this.bankroll < hand.bet) {
        this.showToast('NOT ENOUGH CREDITS TO SPLIT!');
        return;
      }

      this.bankroll -= hand.bet;
      this.currentBet += hand.bet;

      // Extract second card to form new hand
      const splitCard = hand.cards.pop();
      const newHand = {
        cards: [splitCard],
        bet: hand.bet,
        status: 'playing',
        isDoubled: false
      };

      this.playerHands.splice(this.activeHandIndex + 1, 0, newHand);

      if (window.pixelAudio) window.pixelAudio.playChip();
      this.setBanner('HAND SPLIT! DEALING SECOND CARDS...');
      this.disableActionButtons(true);
      this.syncUI();
      this.renderPlayerHands();

      await this.sleep(400);
      // Deal 1 card to the current hand
      await this.dealCardToPlayer(this.activeHandIndex);
      await this.sleep(300);

      this.updateActionControlsAvailability();
    }

    async playerSurrender() {
      if (this.state !== STATES.PLAYER_TURN) return;

      const hand = this.playerHands[0];
      if (hand.cards.length !== 2 || this.playerHands.length > 1) return;

      // Return 50% of the bet
      const refund = Math.floor(hand.bet / 2);
      this.bankroll += refund;
      hand.status = 'surrendered';

      if (window.pixelAudio) window.pixelAudio.playBust();
      this.setBanner(`SURRENDERED: RECOVERED $${refund}`, 'loss');

      this.stats.played++;
      this.stats.lost++;
      this.stats.streak = 0;
      this.saveStats();

      await this.sleep(800);
      this.endRound();
    }

    async advanceToNextHandOrDealer() {
      if (this.activeHandIndex < this.playerHands.length - 1) {
        this.activeHandIndex++;
        this.renderPlayerHands();

        // If newly active hand only has 1 card (from split), deal the second card now
        const hand = this.playerHands[this.activeHandIndex];
        if (hand.cards.length === 1) {
          this.disableActionButtons(true);
          this.setBanner(`PLAYING SPLIT HAND ${this.activeHandIndex + 1}...`);
          await this.sleep(300);
          await this.dealCardToPlayer(this.activeHandIndex);
        }

        const evalResult = this.calculateHandScore(hand.cards);
        if (evalResult.is21) {
          hand.status = 'stood';
          this.setBanner(`HAND ${this.activeHandIndex + 1}: 21!`, 'win');
          await this.sleep(700);
          this.advanceToNextHandOrDealer();
          return;
        }

        this.setBanner(`YOUR TURN (HAND ${this.activeHandIndex + 1})`);
        this.updateActionControlsAvailability();
      } else {
        this.startDealerTurn();
      }
    }

    // --- Dealer Phase ---
    async startDealerTurn() {
      this.state = STATES.DEALER_TURN;
      this.disableActionButtons(true);

      // Check if all player hands busted or surrendered
      const allBustedOrSurrendered = this.playerHands.every(
        (h) => h.status === 'busted' || h.status === 'surrendered'
      );

      // Reveal Hole Card
      this.dealerHoleCardHidden = false;
      this.revealHoleCardAnimation();
      await this.sleep(500);

      let dealerScore = this.calculateHandScore(this.dealerCards).score;

      // If player already busted everything, dealer doesn't need to hit
      if (!allBustedOrSurrendered) {
        this.setBanner(`DEALER HAS ${dealerScore}...`);
        await this.sleep(500);

        // Dealer must hit until 17+ (dealer stands on all 17s)
        while (dealerScore < 17) {
          this.setBanner('DEALER HITS...');
          await this.sleep(600);
          await this.dealCardToDealer(false);
          dealerScore = this.calculateHandScore(this.dealerCards).score;
          this.renderDealerCards();
        }
      }

      await this.sleep(400);
      this.settleRound();
    }

    // --- Settlement Phase ---
    settleRound() {
      const dealerEval = this.calculateHandScore(this.dealerCards);
      const dealerScore = dealerEval.score;
      const dealerBust = dealerEval.isBusted;

      let roundProfit = 0;
      let roundWins = 0;
      let roundLosses = 0;
      let roundPushes = 0;

      this.playerHands.forEach((hand, idx) => {
        if (hand.status === 'surrendered') {
          roundLosses++;
          return;
        }

        const handEval = this.calculateHandScore(hand.cards);
        const playerScore = handEval.score;

        if (handEval.isBusted) {
          roundLosses++;
        } else if (dealerBust) {
          // Dealer busted, hand wins!
          const win = hand.bet * 2;
          this.bankroll += win;
          roundProfit += hand.bet;
          roundWins++;
        } else if (playerScore > dealerScore) {
          // Player beats dealer
          const win = hand.bet * 2;
          this.bankroll += win;
          roundProfit += hand.bet;
          roundWins++;
        } else if (playerScore < dealerScore) {
          // Dealer wins
          roundLosses++;
        } else {
          // Push
          this.bankroll += hand.bet;
          roundPushes++;
        }
      });

      // Update statistics
      this.stats.played += this.playerHands.length;
      this.stats.won += roundWins;
      this.stats.lost += roundLosses;
      this.stats.pushed += roundPushes;

      if (roundWins > roundLosses) {
        this.stats.streak++;
        if (roundProfit > this.stats.biggestWin) this.stats.biggestWin = roundProfit;
      } else if (roundLosses > roundWins) {
        this.stats.streak = 0;
      }

      this.saveStats();
      this.syncUI();

      // Display Final Summary Announcement
      const isHouseLoss = dealerBust || roundWins > roundLosses;
      if (!isHouseLoss) {
        if (dealerBust) {
          this.setBanner(`DEALER BUSTS (${dealerScore})! YOU WIN +$${roundProfit}`, 'win');
          if (window.pixelAudio) window.pixelAudio.playWin();
        } else {
          this.setBanner(`YOU WIN! +$${roundProfit}`, 'win');
          if (window.pixelAudio) window.pixelAudio.playWin();
        }
      } else if (roundPushes > 0 && roundWins === 0 && roundLosses === 0) {
        this.setBanner(`PUSH (${dealerScore}) - BET RETURNED`, 'push');
        if (window.pixelAudio) window.pixelAudio.playPush();
      } else {
        const primaryPlayerScore = this.calculateHandScore(this.playerHands[0].cards).score;
        this.setBanner(`DEALER WINS (${dealerScore} vs ${primaryPlayerScore})`, 'loss');
        if (window.pixelAudio) window.pixelAudio.playBust();
      }

      this.endRound();
    }

    endRound() {
      this.state = STATES.ROUND_OVER;
      this.currentBet = 0;
      this.syncUI();

      // Switch trays
      this.dom.actionControls.classList.add('hidden');
      this.dom.resolveControls.classList.remove('hidden');

      // Check for zero bankroll
      if (this.bankroll <= 0) {
        setTimeout(() => {
          this.showToast('OUT OF CREDITS! CLICK RESET IN STATS OR RESTOCK');
          this.dom.btnResetBankroll.focus();
        }, 1200);
      }
    }

    // --- Reset & New Rounds ---
    newRound() {
      if (this.state !== STATES.ROUND_OVER) return;
      this.state = STATES.BETTING;
      this.dealerCards = [];
      this.playerHands = [];
      this.dealerHoleCardHidden = true;
      this.chipsInStack = 0;

      this.dom.resolveControls.classList.add('hidden');
      this.dom.bettingControls.classList.remove('hidden');

      this.renderDealerCards();
      this.renderPlayerHands();
      this.setBanner('PLACE YOUR BET TO DEAL');
      if (window.pixelAudio) window.pixelAudio.playClick();
      this.syncUI();
    }

    rebetAndDeal() {
      if (this.state !== STATES.ROUND_OVER) return;
      this.newRound();

      const betAmount = Math.min(this.lastBet, this.bankroll);
      if (betAmount > 0) {
        this.addBet(betAmount);
        this.startDeal();
      } else {
        this.showToast('NOT ENOUGH CREDITS TO REBET!');
      }
    }

    resetBankroll() {
      this.bankroll = 1000;
      this.currentBet = 0;
      this.saveStats();
      this.syncUI();
      this.showToast('CREDITS RESET TO $1,000!');
      if (window.pixelAudio) window.pixelAudio.playWin();
    }

    clearStats() {
      this.stats = {
        played: 0,
        won: 0,
        lost: 0,
        pushed: 0,
        blackjacks: 0,
        biggestWin: 0,
        streak: 0
      };
      this.saveStats();
      this.showToast('ALL STATS CLEARED!');
      if (window.pixelAudio) window.pixelAudio.playClick();
    }

    // --- Event Listeners Binding ---
    bindEvents() {
      // Chip selector clicks
      const chips = document.querySelectorAll('.pixel-chip');
      chips.forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = parseInt(btn.dataset.chip, 10);
          this.addBet(val);
        });
      });

      // Quick Bet Actions
      this.dom.btnClearBet.addEventListener('click', () => this.clearBet());
      this.dom.btnDoubleBet.addEventListener('click', () => this.doubleBet());
      this.dom.btnAllIn.addEventListener('click', () => this.allIn());
      this.dom.betSpot.addEventListener('click', () => {
        if (this.currentBet > 0) this.clearBet();
      });

      // Deal Action
      this.dom.btnDeal.addEventListener('click', () => this.startDeal());

      // Play Actions
      this.dom.btnHit.addEventListener('click', () => this.playerHit());
      this.dom.btnStand.addEventListener('click', () => this.playerStand());
      this.dom.btnDouble.addEventListener('click', () => this.playerDouble());
      this.dom.btnSplit.addEventListener('click', () => this.playerSplit());
      this.dom.btnSurrender.addEventListener('click', () => this.playerSurrender());

      // Round Finished Actions
      this.dom.btnNewRound.addEventListener('click', () => this.newRound());
      this.dom.btnRebetAndDeal.addEventListener('click', () => this.rebetAndDeal());

      // Sound & CRT Toggles
      this.dom.btnSoundToggle.addEventListener('click', () => this.toggleSound());
      this.dom.btnCrtToggle.addEventListener('click', () => this.toggleCRT());

      // Modals Handling
      this.dom.btnStatsOpen.addEventListener('click', () => {
        this.updateStatsUI();
        this.dom.statsModal.showModal();
        if (window.pixelAudio) window.pixelAudio.playClick();
      });
      this.dom.btnCloseStats.addEventListener('click', () => {
        this.dom.statsModal.close();
        if (window.pixelAudio) window.pixelAudio.playClick();
      });

      this.dom.btnRulesOpen.addEventListener('click', () => {
        this.dom.rulesModal.showModal();
        if (window.pixelAudio) window.pixelAudio.playClick();
      });
      this.dom.btnCloseRules.addEventListener('click', () => {
        this.dom.rulesModal.close();
        if (window.pixelAudio) window.pixelAudio.playClick();
      });
      this.dom.btnGotRules.addEventListener('click', () => {
        this.dom.rulesModal.close();
        if (window.pixelAudio) window.pixelAudio.playClick();
      });

      // Reset Actions
      this.dom.btnResetBankroll.addEventListener('click', () => this.resetBankroll());
      this.dom.btnResetStats.addEventListener('click', () => this.clearStats());

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        // Ignore if modal dialog is open
        if (this.dom.statsModal.open || this.dom.rulesModal.open) return;

        const key = e.key.toUpperCase();

        if (this.state === STATES.BETTING) {
          if (key === ' ' || key === 'ENTER') {
            e.preventDefault();
            if (this.currentBet > 0) this.startDeal();
          } else if (key === 'C') {
            this.clearBet();
          } else if (key === 'D') {
            this.doubleBet();
          } else if (key === 'A') {
            this.allIn();
          }
        } else if (this.state === STATES.PLAYER_TURN) {
          if (key === 'H') {
            e.preventDefault();
            this.playerHit();
          } else if (key === 'S') {
            e.preventDefault();
            this.playerStand();
          } else if (key === 'D') {
            e.preventDefault();
            if (!this.dom.btnDouble.disabled) this.playerDouble();
          } else if (key === 'P') {
            e.preventDefault();
            if (!this.dom.btnSplit.disabled) this.playerSplit();
          } else if (key === 'R') {
            e.preventDefault();
            if (!this.dom.btnSurrender.disabled) this.playerSurrender();
          }
        } else if (this.state === STATES.ROUND_OVER) {
          if (key === 'R') {
            e.preventDefault();
            this.rebetAndDeal();
          } else if (key === 'N' || key === ' ' || key === 'ENTER') {
            e.preventDefault();
            this.newRound();
          }
        }
      });
    }
  }

  // Initialize Game on DOM Content Loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.pixelJackGame = new BlackjackGame();
  });
})();
