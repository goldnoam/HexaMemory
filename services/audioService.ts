class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Lazy initialization to respect browser autoplay policies
  }

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  public playTone(frequency: number, duration: number = 0.3, type: OscillatorType = 'sine') {
    this.init();
    if (!this.audioContext || !this.gainNode) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Envelope for smoother sound
    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay

    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  public playError() {
    this.playTone(150, 0.5, 'sawtooth');
    setTimeout(() => this.playTone(100, 0.5, 'sawtooth'), 100);
  }

  public playSuccess() {
    this.playTone(600, 0.1, 'sine');
    setTimeout(() => this.playTone(800, 0.2, 'sine'), 100);
  }
}

export const audioService = new AudioService();
