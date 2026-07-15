import * as Speech from 'expo-speech';
import { getJSON, setJSON } from './storage';
import { upcomingDeadlines } from './deadlines';
import type { Child } from '../types/childProfile';

// Voix de bienvenue : à CHAQUE arrivée sur l'accueil d'un enfant, une phrase
// d'encouragement (rotation ordonnée 1→20 puis retour à 1, propre à chaque
// enfant et persistée), suivie de l'annonce de la prochaine échéance.
// Désactivable dans les Réglages (ppia.voiceEnabled).

const KEY_GREET_INDEX = 'ppia.greetIndex';
export const KEY_VOICE_ENABLED = 'ppia.voiceEnabled';

/** Les 20 encouragements, prononcés dans cet ordre exact (rotation cyclique). */
export const ENCOURAGEMENTS = [
  "Aujourd'hui est une nouvelle occasion de progresser.",
  'Chaque minute de travail te rapproche de tes objectifs.',
  'Tu es capable de grandes choses, continue comme ça.',
  "Les efforts d'aujourd'hui deviennent les réussites de demain.",
  "Un petit pas aujourd'hui vaut mieux que rien du tout.",
  "Fais de ton mieux, c'est tout ce qu'on te demande.",
  "Chaque erreur est une chance d'apprendre.",
  'Reste concentré, tu avances dans la bonne direction.',
  'Les champions progressent un peu chaque jour.',
  'Tu peux être fier de chaque effort que tu fais.',
  'Garde confiance, tu progresses plus que tu ne le crois.',
  "Aujourd'hui est un bon jour pour apprendre quelque chose de nouveau.",
  'Avec de la régularité, tout devient plus facile.',
  'Donne le meilleur de toi-même, un exercice après l\'autre.',
  "Les défis d'aujourd'hui construisent tes réussites de demain.",
  'Continue, chaque révision compte.',
  'Tu as déjà parcouru du chemin, poursuis tes efforts.',
  'Crois en toi et avance avec détermination.',
  "Le plus important est de ne jamais abandonner.",
  "Je suis là pour t'aider à réussir ta journée.",
] as const;

/** Annonce de la prochaine échéance À VENIR (dépassées ignorées) ; '' si aucune. */
export function buildDeadlinePart(child: Pick<Child, 'echeances'>, now: Date = new Date()): string {
  const next = upcomingDeadlines(child.echeances ?? [], now)[0];
  if (!next) return '';
  const type = (next.type || 'contrôle').toLowerCase();
  const quand = next.days <= 0 ? "aujourd'hui" : next.days === 1 ? 'demain' : `dans ${next.days} jours`;
  return ` Tu as ${/^[aeiouyéè]/.test(type) ? 'une' : 'un'} ${type} de ${next.subj} ${quand}.`;
}

/** Message complet pour un index de rotation donné (0-based, modulo 20). */
export function buildGreeting(
  child: Pick<Child, 'name' | 'echeances'>,
  rotationIndex: number,
  now: Date = new Date(),
): string {
  const phrase = ENCOURAGEMENTS[((rotationIndex % ENCOURAGEMENTS.length) + ENCOURAGEMENTS.length) % ENCOURAGEMENTS.length];
  return `Bonjour ${child.name} ! ${phrase}${buildDeadlinePart(child, now)}`;
}

export async function isVoiceEnabled(): Promise<boolean> {
  return getJSON<boolean>(KEY_VOICE_ENABLED, true);
}

export async function setVoiceEnabled(on: boolean): Promise<void> {
  await setJSON(KEY_VOICE_ENABLED, on);
}

// voix française la plus naturelle disponible sur l'appareil (qualité
// « Enhanced » si le système en propose une), détectée une seule fois
let bestFrVoice: string | undefined | null = null;
async function pickBestFrenchVoice(): Promise<string | undefined> {
  if (bestFrVoice !== null) return bestFrVoice ?? undefined;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const fr = voices.filter((v) => v.language?.toLowerCase().startsWith('fr'));
    const enhanced = fr.find((v) => `${v.quality}`.toLowerCase().includes('enhanced'));
    bestFrVoice = (enhanced ?? fr[0])?.identifier;
  } catch {
    bestFrVoice = undefined;
  }
  return bestFrVoice ?? undefined;
}

/**
 * Salue l'enfant à voix haute : phrase suivante de SA rotation (persistée),
 * puis annonce de la prochaine échéance. Retourne true si la voix a parlé.
 */
export async function speakGreeting(child: Pick<Child, 'id' | 'name' | 'echeances'>): Promise<boolean> {
  if (!(await isVoiceEnabled())) return false;
  const indexes = await getJSON<Record<string, number>>(KEY_GREET_INDEX, {});
  const idx = indexes[child.id] ?? 0;
  await setJSON(KEY_GREET_INDEX, { ...indexes, [child.id]: (idx + 1) % ENCOURAGEMENTS.length });
  const voice = await pickBestFrenchVoice();
  Speech.stop();
  Speech.speak(buildGreeting(child, idx), {
    language: 'fr-FR',
    voice,
    rate: 0.92,
    pitch: 1.05,
  });
  return true;
}
