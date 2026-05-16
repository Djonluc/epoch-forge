/**
 * Audio service for managing sound effects in Epoch Forge.
 * Handles preloading and playback of resonant gaming sounds.
 */

const AUDIO_ASSETS = {
    FORGE_CLANG: 'https://cdn.pixabay.com/audio/2022/01/18/audio_9cac826cfc.mp3',
    FIRE_CRACKLE: 'https://cdn.pixabay.com/audio/2025/07/17/audio_5925f8939b.mp3',
    EE_GRUNT: 'https://eesoundboard.online/sounds/unsorted/kgrunt3.wav',
    EE_UNIT_1: 'https://eesoundboard.online/sounds/unit/forgodandcountry.wav',
    EE_UNIT_2: 'https://eesoundboard.online/sounds/unit/mm.wav',
    EE_UNIT_3: 'https://eesoundboard.online/sounds/unit/galory.wav',
    EE_UNIT_4: 'https://eesoundboard.online/sounds/unit/hallelujah.wav',
};

const EE_UNIT_SOUNDS = ['EE_UNIT_1', 'EE_UNIT_2', 'EE_UNIT_3', 'EE_UNIT_4'];

class AudioService {
    private sounds: Map<string, HTMLAudioElement> = new Map();

    constructor() {
        // Preload sounds
        Object.entries(AUDIO_ASSETS).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            if (key === 'FIRE_CRACKLE') {
                audio.loop = true;
                audio.volume = 0.08; // Subtle atmospheric volume
            } else {
                audio.volume = 0.16; // Balanced impact volume
            }
            this.sounds.set(key, audio);
        });
    }

    /**
     * Play the resonant anvil clang
     */
    playForgeClang() {
        const sound = this.sounds.get('FORGE_CLANG');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio playback failed:', e));
        }
    }

    /**
     * Start the fire crackling ambience
     */
    startFireCrackle() {
        const sound = this.sounds.get('FIRE_CRACKLE');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio playback failed:', e));
        }
    }

    /**
     * Stop the fire crackling ambience
     */
    stopFireCrackle() {
        const sound = this.sounds.get('FIRE_CRACKLE');
        if (sound) {
            sound.pause();
        }
    }

    /**
     * Play the Empire Earth: Art of Conquest intro grunt
     */
    playIntroGrunt() {
        const sound = this.sounds.get('EE_GRUNT');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio playback failed:', e));
        }
    }

    /**
     * Play a random Empire Earth: Art of Conquest unit sound
     */
    playRandomUnitSound() {
        const randomIndex = Math.floor(Math.random() * EE_UNIT_SOUNDS.length);
        const soundKey = EE_UNIT_SOUNDS[randomIndex];
        const sound = this.sounds.get(soundKey);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio playback failed:', e));
        }
    }

    /**
     * Play a random interaction sound (Grunt has lower chance than Unit sounds)
     */
    playInteraction() {
        // 20% chance for grunt, 80% chance for random unit sound
        if (Math.random() < 0.2) {
            this.playIntroGrunt();
        } else {
            this.playRandomUnitSound();
        }
    }
}

export const audioService = new AudioService();
