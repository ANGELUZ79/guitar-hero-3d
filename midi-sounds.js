/**
 * MIDI Sounds System for Guitar Hero 3D
 * Provides Web Audio API-based sound generation for musical notes
 */

class MidiSoundsSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.instruments = new Map();
        this.isInitialized = false;
        this.currentNotes = new Map();
        
        // Note frequencies in Hz (4th and 5th octaves)
        this.noteFrequencies = {
            'C4': 261.63,
            'D4': 293.66,
            'E4': 329.63,
            'F4': 349.23,
            'G4': 392.00,
            'A4': 440.00,
            'B4': 493.88,
            'C5': 523.25,
            'D5': 587.33,
            'E5': 659.25,
            'F5': 698.46,
            'G5': 783.99,
            'A5': 880.00,
            'B5': 987.77,
            'C6': 1046.50
        };
        
        // Note name mappings from Spanish to standard notation
        this.noteMapping = {
            'DO': 'C4',
            'RE': 'D4',
            'MI': 'E4',
            'FA': 'F4',
            'SOL': 'G4',
            'LA': 'A4',
            'SI': 'B4'
        };
    }
    
    /**
     * Initialize the audio context
     */
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle browser autoplay policies
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('MIDI Sounds System initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }
    
    /**
     * Create a synthesized instrument sound
     */
    createInstrument(type = 'piano') {
        if (!this.isInitialized) {
            throw new Error('Audio system not initialized');
        }
        
        const instrument = {
            type: type,
            attack: 0.01,
            decay: 0.1,
            sustain: 0.3,
            release: 0.5,
            waveform: 'sine'
        };
        
        switch (type) {
            case 'piano':
                instrument.waveform = 'sine';
                instrument.attack = 0.01;
                instrument.decay = 0.2;
                instrument.sustain = 0.2;
                instrument.release = 0.8;
                break;
            case 'guitar':
                instrument.waveform = 'sawtooth';
                instrument.attack = 0.02;
                instrument.decay = 0.1;
                instrument.sustain = 0.4;
                instrument.release = 1.2;
                break;
            case 'bell':
                instrument.waveform = 'sine';
                instrument.attack = 0.001;
                instrument.decay = 0.5;
                instrument.sustain = 0.1;
                instrument.release = 2.0;
                break;
        }
        
        this.instruments.set(type, instrument);
        return instrument;
    }
    
    /**
     * Play a note with specified parameters
     */
    playNote(noteName, duration = 0.5, instrument = 'piano', volume = 1.0) {
        if (!this.isInitialized) {
            console.warn('Audio system not initialized');
            return null;
        }
        
        // Convert Spanish note names to standard notation
        const standardNote = this.noteMapping[noteName] || noteName;
        const frequency = this.noteFrequencies[standardNote];
        
        if (!frequency) {
            console.warn(`Unknown note: ${noteName} (${standardNote})`);
            return null;
        }
        
        // Get or create instrument
        let inst = this.instruments.get(instrument);
        if (!inst) {
            inst = this.createInstrument(instrument);
        }
        
        // Create audio nodes
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Configure oscillator
        oscillator.type = inst.waveform;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Add some harmonic richness for piano
        if (instrument === 'piano') {
            const harmonic = this.audioContext.createOscillator();
            const harmonicGain = this.audioContext.createGain();
            
            harmonic.type = 'sine';
            harmonic.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
            harmonicGain.gain.setValueAtTime(0.1 * volume * this.masterVolume, this.audioContext.currentTime);
            
            harmonic.connect(harmonicGain);
            harmonicGain.connect(this.audioContext.destination);
            
            harmonic.start();
            harmonic.stop(this.audioContext.currentTime + duration);
        }
        
        // Configure filter for more realistic sound
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        // Configure envelope (ADSR)
        const now = this.audioContext.currentTime;
        const attackTime = inst.attack;
        const decayTime = inst.decay;
        const sustainLevel = inst.sustain * volume * this.masterVolume;
        const releaseTime = inst.release;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        // Connect audio graph
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        // Store current note for potential stopping
        this.currentNotes.set(noteName, { oscillator, gainNode, stopTime: now + duration });
        
        // Clean up after note ends
        setTimeout(() => {
            this.currentNotes.delete(noteName);
        }, duration * 1000 + 100);
        
        return { oscillator, gainNode, frequency, duration };
    }
    
    /**
     * Stop a currently playing note
     */
    stopNote(noteName) {
        const standardNote = this.noteMapping[noteName] || noteName;
        const noteData = this.currentNotes.get(noteName);
        
        if (noteData && this.audioContext.currentTime < noteData.stopTime) {
            const now = this.audioContext.currentTime;
            noteData.gainNode.gain.cancelScheduledValues(now);
            noteData.gainNode.gain.setValueAtTime(noteData.gainNode.gain.value, now);
            noteData.gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
            noteData.oscillator.stop(now + 0.1);
            this.currentNotes.delete(noteName);
        }
    }
    
    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        for (const [noteName, noteData] of this.currentNotes) {
            this.stopNote(noteName);
        }
    }
    
    /**
     * Set master volume
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Play a chord (multiple notes simultaneously)
     */
    playChord(noteNames, duration = 0.5, instrument = 'piano') {
        const playedNotes = [];
        for (const noteName of noteNames) {
            const note = this.playNote(noteName, duration, instrument);
            if (note) {
                playedNotes.push(note);
            }
        }
        return playedNotes;
    }
    
    /**
     * Create a simple metronome click
     */
    playMetronomeClick(accent = false) {
        if (!this.isInitialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(accent ? 1200 : 800, this.audioContext.currentTime);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.001);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
    
    /**
     * Create sound effect for successful note hit
     */
    playHitEffect(quality = 'perfect') {
        if (!this.isInitialized) return;
        
        let baseFreq, duration;
        
        switch (quality) {
            case 'perfect':
                baseFreq = 800;
                duration = 0.3;
                break;
            case 'good':
                baseFreq = 600;
                duration = 0.2;
                break;
            case 'ok':
                baseFreq = 400;
                duration = 0.1;
                break;
            default:
                baseFreq = 200;
                duration = 0.05;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(baseFreq, now);
        oscillator.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + duration);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    /**
     * Create sound effect for missed note
     */
    playMissEffect() {
        if (!this.isInitialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
    
    /**
     * Get the current audio context state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            contextState: this.audioContext ? this.audioContext.state : 'not created',
            currentTime: this.audioContext ? this.audioContext.currentTime : 0,
            playingNotes: this.currentNotes.size,
            masterVolume: this.masterVolume
        };
    }
}

// Create and export global instance
window.MidiSounds = new MidiSoundsSystem();

// Auto-initialize when user interacts with the page
document.addEventListener('click', async () => {
    if (!window.MidiSounds.isInitialized) {
        await window.MidiSounds.initialize();
        
        // Hide audio warning if it exists
        const warning = document.getElementById('audio-warning');
        if (warning) {
            warning.style.display = 'none';
        }
    }
}, { once: true });

document.addEventListener('keydown', async () => {
    if (!window.MidiSounds.isInitialized) {
        await window.MidiSounds.initialize();
        
        // Hide audio warning if it exists
        const warning = document.getElementById('audio-warning');
        if (warning) {
            warning.style.display = 'none';
        }
    }
}, { once: true });