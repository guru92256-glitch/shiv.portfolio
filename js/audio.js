/**
 * High-Tech Engineering & Automotive Sound Synthesizer (Web Audio API)
 * Zero external audio assets required; 100% synthesized in real-time.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.initialized = true;
            }
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    toggle() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.playMechanicalClick(880, 0.08);
        }
        return this.enabled;
    }

    // Mechanical relay / switch tick
    playMechanicalClick(freq = 600, duration = 0.04) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + duration);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    // High-tech telemetry beep / hover tone
    playHoverTone(freq = 520) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    // Automotive Turbo / Engine spool tone
    playEngineRev() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            const now = this.ctx.currentTime;
            
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.7);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, now);
            filter.frequency.linearRampToValueAtTime(1800, now + 0.35);
            filter.frequency.linearRampToValueAtTime(400, now + 0.7);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.75);
        } catch (e) {}
    }
}

window.soundEngine = new SoundEngine();
