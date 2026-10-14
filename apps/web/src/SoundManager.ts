// Procedural 8-bit Web Audio Sound Synthesizer & Chiptune BGM Generator
// 100% zero asset downloads, pure Web Audio oscillators & scheduled chiptune sequencing.

export type BgmTrack = 'town' | 'route' | 'battle' | 'boss' | 'none';

const NOTE_FREQS: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00, As3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, As5: 932.33, B5: 987.77,
  C6: 1046.50,
  _: 0 // Rest
};

class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private muted = false;
  private sfxVolume = 0.8;
  private bgmVolume = 0.35;

  private currentBgm: BgmTrack = 'none';
  private bgmTimer: number | null = null;
  private currentStep = 0;
  private nextStepTime = 0;
  private bpm = 110;

  constructor() {
    const storedMuted = localStorage.getItem('monster_proto_muted');
    if (storedMuted === 'true') {
      this.muted = true;
    }
    const storedBgm = localStorage.getItem('monster_proto_bgm_vol');
    if (storedBgm !== null) {
      this.bgmVolume = parseFloat(storedBgm);
    }
    const storedSfx = localStorage.getItem('monster_proto_sfx_vol');
    if (storedSfx !== null) {
      this.sfxVolume = parseFloat(storedSfx);
    }
  }

  private initAudio() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);
  }

  private getContext(): AudioContext | null {
    this.initAudio();
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    localStorage.setItem('monster_proto_muted', mute ? 'true' : 'false');
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('monster_proto_bgm_vol', this.bgmVolume.toString());
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('monster_proto_sfx_vol', this.sfxVolume.toString());
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  // --- Sound Effects (SFX) ---
  public playHit(isSuper = false) {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isSuper ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isSuper ? 240 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + (isSuper ? 0.18 : 0.12));

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isSuper ? 0.18 : 0.12));

    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + (isSuper ? 0.18 : 0.12));
  }

  public playWiggle() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playCatchSuccess() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public playLevelUp() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  public playFaint() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playRevitalize() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const notes = [330, 440, 554.37, 659.25, 880]; // E4, A4, C#5, E5, A5
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playGrassStep() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    noise.start(now);
  }

  // --- Procedural 8-Bit Chiptune BGM Generator ---
  public getCurrentBgm(): BgmTrack {
    return this.currentBgm;
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = 'none';
  }

  public playBgm(track: BgmTrack) {
    if (this.currentBgm === track && this.bgmTimer !== null) {
      return;
    }

    this.stopBgm();
    if (track === 'none') return;

    this.currentBgm = track;
    const ctx = this.getContext();
    if (!ctx) return;

    // Set tempo per theme
    switch (track) {
      case 'town': this.bpm = 104; break;
      case 'route': this.bpm = 124; break;
      case 'battle': this.bpm = 140; break;
      case 'boss': this.bpm = 148; break;
    }

    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    // Lookahead scheduling loop (every 50ms)
    this.bgmTimer = window.setInterval(() => {
      this.scheduleBgmSteps();
    }, 50);
  }

  private scheduleBgmSteps() {
    const ctx = this.getContext();
    if (!ctx || this.currentBgm === 'none') return;

    const stepDuration = (60 / this.bpm) / 4; // 16th note step
    const scheduleAheadTime = 0.2; // 200ms lookahead

    while (this.nextStepTime < ctx.currentTime + scheduleAheadTime) {
      this.playTrackStep(this.currentBgm, this.currentStep, this.nextStepTime, stepDuration);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 64; // 4-bar loop (64 steps)
    }
  }

  private playTrackStep(track: BgmTrack, step: number, time: number, stepDuration: number) {
    const ctx = this.ctx;
    if (!ctx) return;

    const pattern = this.getTrackPattern(track);
    const leadNote = pattern.lead[step % pattern.lead.length];
    const bassNote = pattern.bass[step % pattern.bass.length];
    const drumType = pattern.drums[step % pattern.drums.length];

    // 1. Lead Melody Note
    if (leadNote && leadNote !== '_' && NOTE_FREQS[leadNote]) {
      this.synthesizeNote(
        NOTE_FREQS[leadNote],
        time,
        stepDuration * 1.6,
        pattern.leadWave,
        pattern.leadVol
      );
    }

    // 2. Bassline Note
    if (bassNote && bassNote !== '_' && NOTE_FREQS[bassNote]) {
      this.synthesizeNote(
        NOTE_FREQS[bassNote],
        time,
        stepDuration * 1.8,
        pattern.bassWave,
        pattern.bassVol
      );
    }

    // 3. Percussion Hit
    if (drumType && drumType !== '_') {
      this.synthesizeDrum(drumType, time);
    }
  }

  private synthesizeNote(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType,
    vol: number
  ) {
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    // ADSR Envelope
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain || ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthesizeDrum(type: string, time: number) {
    const ctx = this.ctx;
    if (!ctx) return;

    if (type === 'K') {
      // 8-bit Kick drum (Sine frequency drop)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.1);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.bgmGain || ctx.destination);

      osc.start(time);
      osc.stop(time + 0.1);
    } else if (type === 'S') {
      // 8-bit Snare drum (Noise burst with pitch drop)
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain || ctx.destination);

      noise.start(time);
    } else if (type === 'H') {
      // 8-bit Hi-Hat (Crisp short noise)
      const bufferSize = ctx.sampleRate * 0.025;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain || ctx.destination);

      noise.start(time);
    }
  }

  // --- Chiptune Track Patterns ---
  private getTrackPattern(track: BgmTrack) {
    switch (track) {
      case 'town':
        return {
          leadWave: 'triangle' as OscillatorType,
          leadVol: 0.18,
          bassWave: 'triangle' as OscillatorType,
          bassVol: 0.22,
          lead: [
            // Measure 1
            'C4', '_', 'E4', '_', 'G4', '_', 'E4', '_', 'F4', '_', 'A4', '_', 'G4', '_', 'E4', '_',
            // Measure 2
            'D4', '_', 'F4', '_', 'E4', '_', 'C4', '_', 'D4', '_', 'F4', '_', 'E4', '_', 'D4', '_',
            // Measure 3
            'C4', '_', 'E4', '_', 'G4', '_', 'C5', '_', 'B4', '_', 'A4', '_', 'G4', '_', 'E4', '_',
            // Measure 4
            'F4', '_', 'G4', '_', 'A4', '_', 'B4', '_', 'C5', '_', '_', '_', '_', '_', '_', '_'
          ],
          bass: [
            'C3', '_', '_', '_', 'G3', '_', '_', '_', 'F3', '_', '_', '_', 'C3', '_', '_', '_',
            'D3', '_', '_', '_', 'A3', '_', '_', '_', 'G3', '_', '_', '_', 'G2', '_', '_', '_',
            'C3', '_', '_', '_', 'E3', '_', '_', '_', 'F3', '_', '_', '_', 'C3', '_', '_', '_',
            'F3', '_', '_', '_', 'G3', '_', '_', '_', 'C3', '_', 'G3', '_', 'C4', '_', '_', '_'
          ],
          drums: [
            'K', '_', 'H', '_', 'S', '_', 'H', '_', 'K', '_', 'H', '_', 'S', '_', 'H', '_',
            'K', '_', 'H', '_', 'S', '_', 'H', '_', 'K', '_', 'H', '_', 'S', '_', 'H', '_',
            'K', '_', 'H', '_', 'S', '_', 'H', '_', 'K', '_', 'H', '_', 'S', '_', 'H', '_',
            'K', '_', 'H', '_', 'S', '_', 'H', '_', 'K', '_', 'H', '_', 'S', '_', 'H', 'H'
          ]
        };

      case 'route':
        return {
          leadWave: 'square' as OscillatorType,
          leadVol: 0.16,
          bassWave: 'triangle' as OscillatorType,
          bassVol: 0.24,
          lead: [
            // Measure 1
            'G4', '_', 'C5', '_', 'B4', 'C5', 'D5', '_', 'C5', '_', 'G4', '_', 'E4', '_', 'G4', '_',
            // Measure 2
            'A4', '_', 'C5', '_', 'D5', '_', 'E5', '_', 'D5', '_', 'C5', '_', 'B4', '_', 'A4', '_',
            // Measure 3
            'G4', '_', 'E5', '_', 'D5', 'C5', 'B4', '_', 'C5', '_', 'A4', '_', 'F4', '_', 'A4', '_',
            // Measure 4
            'G4', '_', 'C5', '_', 'E5', '_', 'D5', '_', 'C5', '_', '_', '_', '_', '_', '_', '_'
          ],
          bass: [
            'C3', 'C3', 'G3', 'C3', 'E3', 'C3', 'G3', 'C3', 'A2', 'A2', 'E3', 'A2', 'C3', 'A2', 'E3', 'A2',
            'F2', 'F2', 'C3', 'F2', 'A2', 'F2', 'C3', 'F2', 'G2', 'G2', 'D3', 'G2', 'B2', 'G2', 'D3', 'G2',
            'C3', 'C3', 'G3', 'C3', 'E3', 'C3', 'G3', 'C3', 'F2', 'F2', 'C3', 'F2', 'A2', 'F2', 'C3', 'F2',
            'G2', 'G2', 'D3', 'G2', 'G3', 'G2', 'D3', 'G2', 'C3', 'C3', 'E3', 'G3', 'C4', '_', '_', '_'
          ],
          drums: [
            'K', 'H', 'H', 'H', 'S', 'H', 'K', 'H', 'K', 'H', 'H', 'H', 'S', 'H', 'H', 'H',
            'K', 'H', 'H', 'H', 'S', 'H', 'K', 'H', 'K', 'H', 'H', 'H', 'S', 'H', 'H', 'H',
            'K', 'H', 'H', 'H', 'S', 'H', 'K', 'H', 'K', 'H', 'H', 'H', 'S', 'H', 'H', 'H',
            'K', 'H', 'H', 'H', 'S', 'H', 'K', 'H', 'K', 'K', 'S', 'S', 'K', 'H', 'S', 'S'
          ]
        };

      case 'battle':
        return {
          leadWave: 'square' as OscillatorType,
          leadVol: 0.18,
          bassWave: 'sawtooth' as OscillatorType,
          bassVol: 0.22,
          lead: [
            // Fast 16th-note battle arpeggios
            'D4', 'F4', 'A4', 'D5', 'Cs5', 'A4', 'F4', 'Cs4', 'D4', 'F4', 'A4', 'D5', 'E5', 'Cs5', 'A4', 'F4',
            'G4', 'Bb4', 'D5', 'G5', 'Fs5', 'D5', 'Bb4', 'G4', 'A4', 'Cs5', 'E5', 'A5', 'G5', 'E5', 'Cs5', 'A4',
            'F4', 'A4', 'C5', 'F5', 'E5', 'C5', 'A4', 'F4', 'G4', 'Bb4', 'D5', 'G5', 'F5', 'D5', 'Bb4', 'G4',
            'A4', 'Cs5', 'E5', 'A5', 'Bb5', 'A5', 'G5', 'E5', 'D5', '_', '_', '_', '_', '_', '_', '_'
          ],
          bass: [
            'D3', 'D3', 'D2', 'D3', 'D3', 'D2', 'D3', 'D3', 'D3', 'D3', 'D2', 'D3', 'Cs3', 'Cs3', 'A2', 'Cs3',
            'G2', 'G2', 'D3', 'G2', 'G2', 'D3', 'G2', 'G2', 'A2', 'A2', 'E3', 'A2', 'A2', 'E3', 'A2', 'A2',
            'F2', 'F2', 'C3', 'F2', 'F2', 'C3', 'F2', 'F2', 'G2', 'G2', 'D3', 'G2', 'G2', 'D3', 'G2', 'G2',
            'A2', 'A2', 'E3', 'A2', 'A2', 'E3', 'A2', 'A2', 'D3', 'D3', 'A3', 'D4', 'D3', '_', '_', '_'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'S',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'S',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'S',
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'S', 'K', 'S', 'K', 'S', 'K', 'K', 'S', 'S'
          ]
        };

      case 'boss':
        return {
          leadWave: 'sawtooth' as OscillatorType,
          leadVol: 0.20,
          bassWave: 'square' as OscillatorType,
          bassVol: 0.25,
          lead: [
            // Dramatic Gym Leader / Champion theme in G Minor
            'G4', 'G4', 'Bb4', 'D5', 'G5', '_', 'Fs5', '_', 'F5', '_', 'E5', '_', 'Eb5', 'D5', 'C5', 'Bb4',
            'C5', 'C5', 'Eb5', 'G5', 'C6', '_', 'B5', '_', 'Bb5', '_', 'A5', '_', 'Ab5', 'G5', 'F5', 'Eb5',
            'D5', 'Fs5', 'A5', 'D6', 'C6', 'Bb5', 'A5', 'G5', 'Fs5', 'A5', 'C6', 'Eb6', 'D6', 'C6', 'Bb5', 'A5',
            'G5', '_', 'D5', '_', 'G5', '_', 'Bb5', '_', 'A5', 'G5', 'Fs5', 'G5', 'G5', '_', '_', '_'
          ],
          bass: [
            'G2', 'G2', 'G3', 'G2', 'G2', 'G3', 'G2', 'G2', 'Eb2', 'Eb2', 'Eb3', 'Eb2', 'Eb2', 'Eb3', 'Eb2', 'Eb2',
            'C2', 'C2', 'C3', 'C2', 'C2', 'C3', 'C2', 'C2', 'F2', 'F2', 'F3', 'F2', 'F2', 'F3', 'F2', 'F2',
            'D2', 'D2', 'D3', 'D2', 'D2', 'D3', 'D2', 'D2', 'Fs2', 'Fs2', 'Fs3', 'Fs2', 'Fs2', 'Fs3', 'Fs2', 'Fs2',
            'G2', 'G2', 'D3', 'G3', 'G2', 'G2', 'D3', 'G3', 'G2', 'D3', 'G3', 'D4', 'G3', '_', '_', '_'
          ],
          drums: [
            'K', 'H', 'K', 'S', 'K', 'H', 'K', 'S', 'K', 'K', 'H', 'S', 'K', 'H', 'S', 'S',
            'K', 'H', 'K', 'S', 'K', 'H', 'K', 'S', 'K', 'K', 'H', 'S', 'K', 'H', 'S', 'S',
            'K', 'H', 'K', 'S', 'K', 'H', 'K', 'S', 'K', 'K', 'H', 'S', 'K', 'H', 'S', 'S',
            'K', 'K', 'S', 'K', 'K', 'S', 'K', 'S', 'K', 'S', 'K', 'S', 'K', 'K', 'S', 'S'
          ]
        };

      default:
        return {
          leadWave: 'triangle' as OscillatorType,
          leadVol: 0,
          bassWave: 'triangle' as OscillatorType,
          bassVol: 0,
          lead: [],
          bass: [],
          drums: []
        };
    }
  }
}

export const Sound = new SoundSynth();
