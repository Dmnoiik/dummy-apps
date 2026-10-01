/**
 * 8-Bit Pixel Sound Synthesizer using Web Audio API
 * No external audio files needed - 100% reliable, zero-latency retro sound effects.
 */
class PixelAudio {
  constructor() {
    this.ctx = null;
  }

  get isMuted() {
    const stored = localStorage.getItem('pixelJack_muted');
    return stored === true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    const isCurrentlyMuted = localStorage.getItem('pixelJack_muted') === 'true';
    const nextState = !isCurrentlyMuted;
    localStorage.setItem('pixelJack_muted', nextState.toString());
    return nextState;
  }

  /**
   * Helper: Play a tone with frequency envelope
   */
  playTone(freq, type = 'square', duration = 0.1, gainVal = 0.15) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // AudioContext policy or inactive tab safety
    }
  }

  /**
   * Button click sound: snappy 8-bit blip
   */
  playClick() {
    this.playTone(660, 'square', 0.05, 0.12);
  }

  /**
   * Chip placed / bet added: crisp high-pitch ceramic tap
   */
  playChip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.05);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(2600, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.06);
      osc2.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  /**
   * Card deal / slide across felt
   */
  playCardSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  /**
   * Card flip sound (hole card revealed)
   */
  playCardFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  /**
   * Round Won: retro 8-bit upward arpeggio
   */
  playWin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.12, 0.16);
      }, idx * 80);
    });
  }

  /**
   * Natural 21 Blackjack Fanfare: triumphant arcade arpeggio
   */
  playBlackjack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.15, 0.2);
      }, idx * 75);
    });
  }

  /**
   * Bust or Round Loss: low pitched descending buzz
   */
  playBust() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  /**
   * Push / Tie: dual tone chime
   */
  playPush() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.playTone(440, 'triangle', 0.15, 0.15);
    setTimeout(() => {
      this.playTone(440, 'triangle', 0.15, 0.15);
    }, 120);
  }

  /**
   * Deck Shuffle: series of quick card flicks
   */
  playShuffle() {
    if (this.isMuted) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playCardSlide();
      }, i * 70);
    }
  }
}

// Global instance
window.pixelAudio = new PixelAudio();
