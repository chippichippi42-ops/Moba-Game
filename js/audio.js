/**
 * ========================================
 * MOBA Arena - Audio System
 * ========================================
 * Quản lý âm thanh game
 */

const AudioManager = {
    // Audio context
    context: null,
    
    // Audio buffers
    buffers: {},
    
    // Currently playing
    currentMusic: null,
    sounds: [],
    
    // Volume settings
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    
    // Sound definitions - sử dụng Web Audio API tạo âm thanh
    soundDefs: {
        // UI sounds
        click: { frequency: 800, duration: 0.05, type: 'sine' },
        hover: { frequency: 600, duration: 0.03, type: 'sine' },
        
        // Combat sounds
        hit: { frequency: 200, duration: 0.1, type: 'sawtooth' },
        critHit: { frequency: 300, duration: 0.15, type: 'sawtooth' },
        
        // Ability sounds
        skillQ: { frequency: 400, duration: 0.2, type: 'square' },
        skillE: { frequency: 500, duration: 0.2, type: 'square' },
        skillR: { frequency: 600, duration: 0.2, type: 'square' },
        skillT: { frequency: 700, duration: 0.4, type: 'square' },
        
        // Movement
        dash: { frequency: 300, duration: 0.15, type: 'triangle' },
        flash: { frequency: 1000, duration: 0.1, type: 'sine' },
        
        // Tower
        towerHit: { frequency: 150, duration: 0.3, type: 'sawtooth' },
        towerDestroy: { frequency: 100, duration: 0.8, type: 'sawtooth' },
        
        // Kill sounds
        kill: { frequency: 500, duration: 0.3, type: 'square' },
        death: { frequency: 150, duration: 0.5, type: 'sawtooth' },
        
        // Level up
        levelUp: { frequency: 800, duration: 0.4, type: 'sine', sweep: true },
        
        // Game events
        victory: { frequency: 600, duration: 1.0, type: 'sine', sweep: true },
        defeat: { frequency: 200, duration: 1.0, type: 'sawtooth' },
        
        // Minion
        minionSpawn: { frequency: 400, duration: 0.1, type: 'triangle' },
        
        // Gold/Exp
        gold: { frequency: 1200, duration: 0.08, type: 'sine' },
        exp: { frequency: 900, duration: 0.1, type: 'sine' },
    },
    
    /**
     * Khởi tạo audio system
     */
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
        
        // Load settings
        this.loadSettings();
    },
    
    /**
     * Load volume settings
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('mobaAudioSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.masterVolume = settings.masterVolume ?? 0.8;
                this.musicVolume = settings.musicVolume ?? 0.5;
                this.sfxVolume = settings.sfxVolume ?? 0.7;
            }
        } catch (e) {
            console.warn('Failed to load audio settings:', e);
        }
    },
    
    /**
     * Save volume settings
     */
    saveSettings() {
        try {
            localStorage.setItem('mobaAudioSettings', JSON.stringify({
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
            }));
        } catch (e) {
            console.warn('Failed to save audio settings:', e);
        }
    },
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Utils.clamp(volume, 0, 1);
        this.saveSettings();
    },
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
        this.saveSettings();
    },
    
    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Utils.clamp(volume, 0, 1);
        this.saveSettings();
    },
    
    /**
     * Play a sound effect
     */
    play(soundName, volumeMultiplier = 1) {
        if (!this.context) return;
        if (this.masterVolume === 0 || this.sfxVolume === 0) return;
        
        const soundDef = this.soundDefs[soundName];
        if (!soundDef) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        try {
            // Resume context if suspended
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = soundDef.type;
            oscillator.frequency.setValueAtTime(soundDef.frequency, this.context.currentTime);
            
            // Sweep effect for level up, victory
            if (soundDef.sweep) {
                oscillator.frequency.exponentialRampToValueAtTime(
                    soundDef.frequency * 2,
                    this.context.currentTime + soundDef.duration
                );
            }
            
            // Volume
            const volume = this.masterVolume * this.sfxVolume * volumeMultiplier;
            gainNode.gain.setValueAtTime(volume * 0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + soundDef.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + soundDef.duration);
            
        } catch (e) {
            console.warn('Failed to play sound:', e);
        }
    },
    
    /**
     * Play background music (procedural)
     */
    playMusic() {
        if (!this.context) return;
        if (this.currentMusic) return;
        
        // Simple procedural music using oscillators
        this.currentMusic = {
            playing: true,
            interval: null,
        };
        
        const playNote = () => {
            if (!this.currentMusic || !this.currentMusic.playing) return;
            if (this.masterVolume === 0 || this.musicVolume === 0) return;
            
            try {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                
                // Random pentatonic note
                const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
                const frequency = notes[Math.floor(Math.random() * notes.length)];
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
                
                const volume = this.masterVolume * this.musicVolume * 0.1;
                gainNode.gain.setValueAtTime(volume, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 2);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.context.destination);
                
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 2);
            } catch (e) {
                // Ignore
            }
        };
        
        // Play a note every 2 seconds
        playNote();
        this.currentMusic.interval = setInterval(playNote, 2000);
    },
    
    /**
     * Stop music
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.playing = false;
            if (this.currentMusic.interval) {
                clearInterval(this.currentMusic.interval);
            }
            this.currentMusic = null;
        }
    },
    
    /**
     * Play attack sound based on damage type
     */
    playAttackSound(damageType, isCrit = false) {
        if (isCrit) {
            this.play('critHit');
        } else {
            this.play('hit');
        }
    },
    
    /**
     * Play ability sound
     */
    playAbilitySound(abilityKey) {
        const soundMap = {
            'q': 'skillQ',
            'e': 'skillE',
            'r': 'skillR',
            't': 'skillT',
        };
        
        const soundName = soundMap[abilityKey];
        if (soundName) {
            this.play(soundName);
        }
    },
    
    /**
     * Resume audio context (call on user interaction)
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopMusic();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
