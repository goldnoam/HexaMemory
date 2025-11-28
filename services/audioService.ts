class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Lazy initialization
  }

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  public playTone(frequency: number, duration: number = 0.3) {
    this.init();
    if (!this.audioContext || !this.gainNode) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    
    // Oscillator 1: Triangle for clear tone
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);

    // Oscillator 2: Sine for body/warmth
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency, now);

    const mainGain = this.audioContext.createGain();
    mainGain.connect(this.audioContext.destination);
    
    // Snappy Envelope
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.25, now + 0.02); // Quick attack
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Smooth decay

    osc1.connect(mainGain);
    osc2.connect(mainGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  public playError() {
    this.init();
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    // Discordant dual oscillator for "buzzer" effect
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.linearRampToValueAtTime(50, now + 0.5); // Pitch drop

    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(145, now); // Dissonant interval
    osc2.frequency.linearRampToValueAtTime(70, now + 0.5);

    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  public playSuccess() {
    this.init();
    if (!this.audioContext) return;
    
    // Simple Arpeggio
    this.playTone(523.25, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2), 200); // G5
  }
}

export const audioService = new AudioService();