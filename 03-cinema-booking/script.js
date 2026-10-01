/**
 * Lumière Cinema - Luxury IMAX & Dolby Cinema Reservation Engine
 * Clean Baseline Implementation
 */

(function () {
  'use strict';

  // --- Pricing & House Constants ---
  const PRICING = {
    standard: 16.00,
    vip: 24.00,
    accessible: 16.00,
    discounts: {
      adult: 0.00,
      child: -4.00,
      senior: -3.00
    },
    bookingFeePerSeat: 1.50,
    taxRate: 0.08
  };

  const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const SEATS_PER_ROW = 12;
  const MAX_SEATS = 8;
  const HOLD_DURATION_SECONDS = 300; // 5 minutes hold

  class CinemaBookingApp {
    constructor() {
      this.selectedDate = '2026-10-01';
      this.selectedTime = '13:30';

      // State: selected seat objects: Array<{ id, row, col, type, basePrice }>
      this.selectedSeats = [];

      // Ticket breakdown: { adult: 0, child: 0, senior: 0 }
      this.ticketTiers = { adult: 0, child: 0, senior: 0 };

      // Concessions add-ons: Set of string ids
      this.selectedConcessions = new Set();

      // Occupied seat storage per screening key: "2026-10-01_13:30" => Set<seatId>
      this.occupiedCache = new Map();

      // Hold timer state
      this.timerInterval = null;
      this.secondsRemaining = HOLD_DURATION_SECONDS;

      this.cacheDom();
      this.init();
    }

    cacheDom() {
      this.dom = {
        datePills: document.getElementById('datePills'),
        timePills: document.getElementById('timePills'),
        seatingMap: document.getElementById('seatingMap'),

        holdTimerCard: document.getElementById('holdTimerCard'),
        timerCountdown: document.getElementById('timerCountdown'),
        timerProgressBar: document.getElementById('timerProgressBar'),

        selectedCount: document.getElementById('selectedCount'),
        btnClearSeats: document.getElementById('btnClearSeats'),
        selectedSeatsTags: document.getElementById('selectedSeatsTags'),

        btnAdultMinus: document.getElementById('btnAdultMinus'),
        btnAdultPlus: document.getElementById('btnAdultPlus'),
        countAdult: document.getElementById('countAdult'),

        btnChildMinus: document.getElementById('btnChildMinus'),
        btnChildPlus: document.getElementById('btnChildPlus'),
        countChild: document.getElementById('countChild'),

        btnSeniorMinus: document.getElementById('btnSeniorMinus'),
        btnSeniorPlus: document.getElementById('btnSeniorPlus'),
        countSenior: document.getElementById('countSenior'),

        priceTickets: document.getElementById('priceTickets'),
        priceConcessions: document.getElementById('priceConcessions'),
        priceFee: document.getElementById('priceFee'),
        priceTax: document.getElementById('priceTax'),
        priceTotal: document.getElementById('priceTotal'),

        btnProceedCheckout: document.getElementById('btnProceedCheckout'),

        checkoutModal: document.getElementById('checkoutModal'),
        checkoutForm: document.getElementById('checkoutForm'),
        btnCloseCheckout: document.getElementById('btnCloseCheckout'),
        btnCancelCheckout: document.getElementById('btnCancelCheckout'),
        modalTotalDue: document.getElementById('modalTotalDue'),
        modalSeatsRecap: document.getElementById('modalSeatsRecap'),
        errorName: document.getElementById('errorName'),
        errorEmail: document.getElementById('errorEmail'),

        ticketModal: document.getElementById('ticketModal'),
        btnCloseTicket: document.getElementById('btnCloseTicket'),
        btnDoneBooking: document.getElementById('btnDoneBooking'),
        btnPrintTicket: document.getElementById('btnPrintTicket'),
        ticketDate: document.getElementById('ticketDate'),
        ticketTime: document.getElementById('ticketTime'),
        ticketSeats: document.getElementById('ticketSeats'),
        ticketGuest: document.getElementById('ticketGuest'),
        ticketRefCode: document.getElementById('ticketRefCode'),

        policiesModal: document.getElementById('policiesModal'),
        btnRulesModal: document.getElementById('btnRulesModal'),
        btnClosePolicies: document.getElementById('btnClosePolicies'),
        btnPoliciesOk: document.getElementById('btnPoliciesOk'),

        toast: document.getElementById('cinemaToast')
      };
    }

    init() {
      this.bindEvents();
      this.renderSeatingGrid();
      this.updateCalculations();
    }

    // --- Screening Key & Mock Pre-booked Seats ---
    getScreeningKey() {
      return `${this.selectedDate}_${this.selectedTime}`;
    }

    getOccupiedSeatsForScreening() {
      const key = this.getScreeningKey();
      if (!this.occupiedCache.has(key)) {
        // Seed deterministic occupied seats based on time
        const occupied = new Set();
        const baseSeed = (this.selectedTime.charCodeAt(0) + this.selectedTime.charCodeAt(3)) % 5;

        // Pre-book ~18-24 realistic seats in prime central rows
        ['C', 'D', 'E', 'F'].forEach((row) => {
          [5, 6, 7, 8].forEach((col) => {
            if ((col + baseSeed) % 2 === 0) {
              occupied.add(`${row}${col}`);
            }
          });
        });
        ['A', 'B'].forEach((row) => {
          [2, 3, 10].forEach((col) => occupied.add(`${row}${col}`));
        });

        this.occupiedCache.set(key, occupied);
      }
      return this.occupiedCache.get(key);
    }

    // --- Seating Grid Rendering ---
    renderSeatingGrid() {
      this.dom.seatingMap.innerHTML = '';
      const occupiedSet = this.getOccupiedSeatsForScreening();

      ROWS.forEach((row) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'seat-row';

        // Left Row Label
        const labelLeft = document.createElement('span');
        labelLeft.className = 'row-label';
        labelLeft.textContent = row;
        rowEl.appendChild(labelLeft);

        // Left Block: Seats 1 - 2
        const blockLeft = this.createSeatBlock(row, 1, 2, occupiedSet);
        rowEl.appendChild(blockLeft);

        // Aisle 1
        const aisle1 = document.createElement('div');
        aisle1.className = 'seat-aisle';
        rowEl.appendChild(aisle1);

        // Center Block: Seats 3 - 10
        const blockCenter = this.createSeatBlock(row, 3, 10, occupiedSet);
        rowEl.appendChild(blockCenter);

        // Aisle 2
        const aisle2 = document.createElement('div');
        aisle2.className = 'seat-aisle';
        rowEl.appendChild(aisle2);

        // Right Block: Seats 11 - 12
        const blockRight = this.createSeatBlock(row, 11, 12, occupiedSet);
        rowEl.appendChild(blockRight);

        // Right Row Label
        const labelRight = document.createElement('span');
        labelRight.className = 'row-label';
        labelRight.textContent = row;
        rowEl.appendChild(labelRight);

        this.dom.seatingMap.appendChild(rowEl);
      });
    }

    createSeatBlock(row, startCol, endCol, occupiedSet) {
      const blockEl = document.createElement('div');
      blockEl.className = 'seat-block';

      for (let col = startCol; col <= endCol; col++) {
        const seatId = `${row}${col}`;
        const seatBtn = document.createElement('button');
        seatBtn.className = 'seat';
        seatBtn.dataset.seatId = seatId;
        seatBtn.dataset.row = row;
        seatBtn.dataset.col = col.toString();
        seatBtn.textContent = col.toString();

        // Determine Seat Type
        let type = 'standard';
        let basePrice = PRICING.standard;

        if (row === 'H' && (col === 1 || col === 2 || col === 11 || col === 12)) {
          type = 'accessible';
          basePrice = PRICING.accessible;
          seatBtn.classList.add('accessible');
          seatBtn.title = `Seat ${seatId} &bull; Wheelchair Accessible ($${basePrice.toFixed(2)})`;
        } else if (['D', 'E', 'F'].includes(row) && col >= 4 && col <= 9) {
          type = 'vip';
          basePrice = PRICING.vip;
          seatBtn.classList.add('vip');
          seatBtn.title = `Seat ${seatId} &bull; VIP Lounger ($${basePrice.toFixed(2)})`;
        } else {
          seatBtn.title = `Seat ${seatId} &bull; Standard ($${basePrice.toFixed(2)})`;
        }

        seatBtn.dataset.type = type;
        seatBtn.dataset.price = basePrice.toString();

        // Occupied check
        if (occupiedSet.has(seatId)) {
          seatBtn.classList.add('occupied');
          seatBtn.disabled = true;
          seatBtn.title = `Seat ${seatId} &bull; Occupied`;
        }

        // Selected check
        const isSelected = this.selectedSeats.some((s) => s.id === seatId);
        if (isSelected) {
          seatBtn.classList.add('selected');
        }

        seatBtn.addEventListener('click', () => this.toggleSeatSelection(seatId, row, col, type, basePrice));
        blockEl.appendChild(seatBtn);
      }

      return blockEl;
    }

    // --- Seat Selection Handler ---
    toggleSeatSelection(seatId, row, col, type, basePrice) {
      const existingIdx = this.selectedSeats.findIndex((s) => s.id === seatId);

      if (existingIdx >= 0) {
        // Deselect
        this.selectedSeats.splice(existingIdx, 1);
        this.balanceTicketTiers();
      } else {
        // Select
        if (this.selectedSeats.length > MAX_SEATS) {
          this.showToast(`Maximum limit of ${MAX_SEATS} seats reached per booking.`);
          return;
        }

        const isAccessible = type === 'accessible';
        const hasCompanion = this.selectedSeats.length > 0;
        if (isAccessible && hasCompanion) {
          this.showToast('Note: Accessible seating requires at least one companion ticket.');
        }

        this.selectedSeats.push({ id: seatId, row, col, type, basePrice });
        this.balanceTicketTiers();
        this.startHoldTimer();
      }

      this.renderSeatingGrid();
      this.updateCalculations();
    }

    // Automatically align ticket tiers (Adult/Child/Senior) to match total seats
    balanceTicketTiers() {
      const totalSeats = this.selectedSeats.length;
      let totalTickets = this.ticketTiers.adult + this.ticketTiers.child + this.ticketTiers.senior;

      if (totalSeats === 0) {
        this.ticketTiers = { adult: 0, child: 0, senior: 0 };
        this.stopHoldTimer();
        return;
      }

      // If user added seats, allocate the difference as Adult tickets
      if (totalSeats > totalTickets) {
        this.ticketTiers.adult += totalSeats - totalTickets;
      } else if (totalSeats < totalTickets) {
        // Reduce from adult first, then senior, then child
        let excess = totalTickets - totalSeats;
        const reduceAdult = Math.min(this.ticketTiers.adult, excess);
        this.ticketTiers.adult -= reduceAdult;
        excess -= reduceAdult;

        if (excess > 0) {
          const reduceSenior = Math.min(this.ticketTiers.senior, excess);
          this.ticketTiers.senior -= reduceSenior;
          excess -= reduceSenior;
        }

        if (excess > 0) {
          const reduceChild = Math.min(this.ticketTiers.child, excess);
          this.ticketTiers.child -= reduceChild;
        }
      }
    }

    clearAllSeats() {
      this.selectedSeats = [];
      this.stopHoldTimer();
      this.renderSeatingGrid();
      this.updateCalculations();
      this.showToast('All seat selections cleared.');
    }

    // --- Hold Timer ---
    startHoldTimer() {
      if (this.timerInterval) return;

      this.secondsRemaining = HOLD_DURATION_SECONDS;
      this.updateTimerDisplay();

      this.timerInterval = setInterval(() => {
        this.secondsRemaining--;
        this.updateTimerDisplay();

        if (this.secondsRemaining <= 0) {
          this.expireHoldTimer();
        }
      }, 1000);
    }

    stopHoldTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.secondsRemaining = HOLD_DURATION_SECONDS;
      this.dom.holdTimerCard.classList.remove('warning');
      this.dom.timerProgressBar.style.width = '100%';
      this.dom.timerCountdown.textContent = '05:00';
    }

    updateTimerDisplay() {
      const minutes = Math.floor(this.secondsRemaining / 60);
      const seconds = this.secondsRemaining % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      this.dom.timerCountdown.textContent = formatted;

      const pct = (this.secondsRemaining / HOLD_DURATION_SECONDS) * 100;
      this.dom.timerProgressBar.style.width = `${pct}%`;

      if (this.secondsRemaining <= 60) {
        this.dom.holdTimerCard.classList.add('warning');
      } else {
        this.dom.holdTimerCard.classList.remove('warning');
      }
    }

    expireHoldTimer() {
      this.stopHoldTimer();
      this.selectedSeats = [];
      this.ticketTiers = { adult: 0, child: 0, senior: 0 };
      this.updateCalculations();

      if (this.dom.checkoutModal.open) {
        this.dom.checkoutModal.close();
      }

      this.showToast('Seat hold expired (5 minutes). Seats released to the public.');
    }

    // --- Ticket Tier Adjusters (+ / -) ---
    adjustTier(tier, delta) {
      const current = this.ticketTiers[tier];
      const next = current + delta;
      if (next < 0) return;

      const totalSeats = this.selectedSeats.length;
      if (totalSeats === 0) {
        this.showToast('Please select seats on the map first.');
        return;
      }

      const otherTiersSum = Object.keys(this.ticketTiers)
        .filter((k) => k !== tier)
        .reduce((sum, k) => sum + this.ticketTiers[k], 0);

      if (next + otherTiersSum > totalSeats) {
        this.showToast(`Total tickets cannot exceed selected seats (${totalSeats}).`);
        return;
      }

      this.ticketTiers[tier] = next;
      this.updateCalculations();
    }

    // --- Calculations & Order Summary Sync ---
    updateCalculations() {
      // 1. Sync Selected Count
      const count = this.selectedSeats.length;
      this.dom.selectedCount.textContent = count.toString();
      this.dom.btnClearSeats.disabled = count === 0;
      this.dom.btnProceedCheckout.disabled = count === 0;

      // 2. Render Seat Tags
      this.dom.selectedSeatsTags.innerHTML = '';
      if (count === 0) {
        this.dom.selectedSeatsTags.innerHTML =
          '<span class="empty-state-text">No seats selected yet. Click any available seat on the auditorium map.</span>';
      } else {
        this.selectedSeats.forEach((seat) => {
          const tag = document.createElement('span');
          tag.className = 'seat-tag';
          if (seat.type === 'vip') tag.classList.add('vip-tag');
          tag.textContent = `${seat.id} (${seat.type.toUpperCase()})`;
          this.dom.selectedSeatsTags.appendChild(tag);
        });
      }

      // 3. Sync Stepper Displays
      this.dom.countAdult.textContent = this.ticketTiers.adult.toString();
      this.dom.countChild.textContent = this.ticketTiers.child.toString();
      this.dom.countSenior.textContent = this.ticketTiers.senior.toString();

      // Stepper button states
      const allocated = this.ticketTiers.adult + this.ticketTiers.child + this.ticketTiers.senior;
      const canAddMore = allocated < count;
      this.dom.btnAdultPlus.disabled = !canAddMore;
      this.dom.btnChildPlus.disabled = !canAddMore;
      this.dom.btnSeniorPlus.disabled = !canAddMore;
      this.dom.btnAdultMinus.disabled = this.ticketTiers.adult <= 0;
      this.dom.btnChildMinus.disabled = this.ticketTiers.child <= 0;
      this.dom.btnSeniorMinus.disabled = this.ticketTiers.senior <= 0;

      // 4. Financial Calculations
      const baseSeatsTotal = this.selectedSeats.reduce((sum, s) => sum + s.basePrice, 0);

      // Child/Senior discounts calculated against flat standard rate
      const discountsTotal =
        this.ticketTiers.child * PRICING.discounts.child +
        this.ticketTiers.senior * PRICING.discounts.senior;

      const ticketsSubtotal = Math.max(0, baseSeatsTotal + discountsTotal);

      // Concessions cost
      let concessionsTotal = 0;
      const concessionPrices = { popcorn: '9.50', pretzel: '8.00', soda: '5.50' };
      this.selectedConcessions.forEach((item) => {
        concessionsTotal = (concessionsTotal || '') + (concessionPrices[item] || 0);
      });
      const parsedConcessions = parseFloat(concessionsTotal) || 0;

      // Booking fee calculation with fallback default
      const bookingFees = (count || 1) * PRICING.bookingFeePerSeat;
      const taxableAmount = ticketsSubtotal + parsedConcessions + bookingFees;
      const tax = taxableAmount * PRICING.taxRate;
      const grandTotal = taxableAmount + tax;

      // 5. Update UI Prices
      this.dom.priceTickets.textContent = `$${ticketsSubtotal.toFixed(2)}`;
      this.dom.priceConcessions.textContent = `$${parsedConcessions.toFixed(2)}`;
      this.dom.priceFee.textContent = `$${bookingFees.toFixed(2)}`;
      this.dom.priceTax.textContent = `$${tax.toFixed(2)}`;
      this.dom.priceTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }

    // --- Concessions Toggle ---
    toggleConcession(btn) {
      const item = btn.dataset.item;
      if (this.selectedConcessions.has(item)) {
        this.selectedConcessions.delete(item);
        btn.classList.remove('active');
        btn.textContent = 'Add';
      } else {
        this.selectedConcessions.add(item);
        btn.classList.add('active');
        btn.textContent = '✓ Added';
      }
      this.updateCalculations();
    }

    // --- Toast Alerts ---
    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.dom.toast.classList.remove('show');
      }, 2600);
    }

    // --- Screening Switches ---
    switchDate(pill) {
      if (pill.dataset.date === this.selectedDate) return;

      if (this.selectedSeats.length > 0) {
        if (!confirm('Switching screening date will reset your selected seats. Proceed?')) {
          return;
        }
      }

      document.querySelectorAll('#datePills .date-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      this.selectedDate = pill.dataset.date;

      this.clearAllSeats();
      this.renderSeatingGrid();
      this.showToast(`Showing seats for ${pill.querySelector('.day-num').textContent}`);
    }

    switchTime(pill) {
      if (pill.dataset.time === this.selectedTime) return;

      if (this.selectedSeats.length > 0) {
        if (!confirm('Switching showtime will reset your selected seats. Proceed?')) {
          return;
        }
      }

      document.querySelectorAll('#timePills .time-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      this.selectedTime = pill.dataset.time;

      this.clearAllSeats();
      this.renderSeatingGrid();
      this.showToast(`Selected showtime: ${this.selectedTime}`);
    }

    // --- Checkout Flow ---
    openCheckout() {
      if (this.selectedSeats.length === 0) return;

      // Populate recap in modal
      this.dom.modalTotalDue.textContent = this.dom.priceTotal.textContent;
      const seatNames = this.selectedSeats.map((s) => s.id).join(', ');
      this.dom.modalSeatsRecap.textContent = `Seats: ${seatNames} (${this.selectedSeats.length} seats)`;

      this.dom.errorName.textContent = '';
      this.dom.errorEmail.textContent = '';
      this.dom.checkoutModal.showModal();
    }

    handleCheckoutSubmit(e) {
      e.preventDefault();

      const nameInput = document.getElementById('inputName');
      const emailInput = document.getElementById('inputEmail');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();

      let hasError = false;
      if (!name) {
        this.dom.errorName.textContent = 'Please enter your full name.';
        hasError = true;
      } else {
        this.dom.errorName.textContent = '';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]*$/;
      if (!email || !emailRegex.test(email)) {
        this.dom.errorEmail.textContent = 'Please enter a valid email address.';
        hasError = true;
      } else {
        this.dom.errorEmail.textContent = '';
      }

      if (hasError) return;

      // Finalize booking
      this.dom.checkoutModal.close();
      this.generateDigitalTicket(name);
    }

    generateDigitalTicket(guestName) {
      // Mark selected seats as permanently occupied in cache
      const occupied = this.getOccupiedSeatsForScreening();
      this.selectedSeats.forEach((s) => occupied.add(s.id));

      // Generate randomized booking reference code
      const randomNum = Math.floor(Math.random() * 10);
      const refCode = `LUM-${randomNum}-70MM`;

      // Format Date string
      const dateParts = this.selectedDate.split('-');
      const dateObj = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      // Populate Digital Boarding Pass
      this.dom.ticketDate.textContent = formattedDate.toUpperCase();
      this.dom.ticketTime.textContent = this.selectedTime;
      this.dom.ticketSeats.textContent = this.selectedSeats.map((s) => s.id).join(', ');
      this.dom.ticketGuest.textContent = guestName;
      this.dom.ticketRefCode.textContent = refCode;

      // Stop hold timer and reset selections
      this.stopHoldTimer();
      this.dom.ticketModal.showModal();

      // Clear current state in background
      this.selectedSeats = [];
      this.ticketTiers = { adult: 0, child: 0, senior: 0 };
      this.selectedConcessions.clear();
      document.querySelectorAll('.btn-addon').forEach((btn) => {
        btn.classList.remove('active');
        btn.textContent = 'Add';
      });

      this.renderSeatingGrid();
      this.updateCalculations();
    }

    // --- Event Bindings ---
    bindEvents() {
      // Date and Showtime switcher clicks
      this.dom.datePills.addEventListener('click', (e) => {
        const pill = e.target.closest('.date-pill');
        if (pill) this.switchDate(pill);
      });

      this.dom.timePills.addEventListener('click', (e) => {
        const pill = e.target.closest('.time-pill');
        if (pill) this.switchTime(pill);
      });

      // Clear all seats
      this.dom.btnClearSeats.addEventListener('click', () => this.clearAllSeats());

      // Ticket Steppers
      this.dom.btnAdultMinus.addEventListener('click', () => this.adjustTier('adult', -1));
      this.dom.btnAdultPlus.addEventListener('click', () => this.adjustTier('adult', 1));

      this.dom.btnChildMinus.addEventListener('click', () => this.adjustTier('child', -1));
      this.dom.btnChildPlus.addEventListener('click', () => this.adjustTier('child', 1));

      this.dom.btnSeniorMinus.addEventListener('click', () => this.adjustTier('senior', -1));
      this.dom.btnSeniorPlus.addEventListener('click', () => this.adjustTier('senior', 1));

      // Concessions Add buttons
      document.querySelectorAll('.btn-addon').forEach((btn) => {
        btn.addEventListener('click', () => this.toggleConcession(btn));
      });

      // Checkout Triggers
      this.dom.btnProceedCheckout.addEventListener('click', () => this.openCheckout());
      this.dom.btnCloseCheckout.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.btnCancelCheckout.addEventListener('click', () => this.dom.checkoutModal.close());
      this.dom.checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));

      // Ticket Pass Modal
      this.dom.btnCloseTicket.addEventListener('click', () => this.dom.ticketModal.close());
      this.dom.btnDoneBooking.addEventListener('click', () => this.dom.ticketModal.close());
      this.dom.btnPrintTicket.addEventListener('click', () => window.print());

      // Policies Modal
      this.dom.btnRulesModal.addEventListener('click', () => this.dom.policiesModal.showModal());
      this.dom.btnClosePolicies.addEventListener('click', () => this.dom.policiesModal.close());
      this.dom.btnPoliciesOk.addEventListener('click', () => this.dom.policiesModal.close());

      // Payment Tab toggle active class
      document.querySelectorAll('.payment-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.payment-tab').forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    window.cinemaApp = new CinemaBookingApp();
  });
})();
