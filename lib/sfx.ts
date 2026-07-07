import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type SfxName = 'correct' | 'wrong' | 'success' | 'badge';

const SOURCES: Record<SfxName, any> = {
  correct: require('../assets/sounds/correct.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
  success: require('../assets/sounds/success.wav'),
  badge: require('../assets/sounds/badge.wav'),
};

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let audioModeSet = false;

/** Joue un son court, discret (volume modéré, ne coupe pas la musique en cours). */
export function playSfx(name: SfxName) {
  try {
    if (!audioModeSet) {
      audioModeSet = true;
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      p.volume = 0.55;
      players[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {
    // le son est un bonus : ne jamais faire planter l'app pour ça
  }
}
