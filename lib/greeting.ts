import * as Speech from 'expo-speech';
import { getJSON, setJSON } from './storage';
import type { Child } from '../types/childProfile';

// Voix de bienvenue : « Bonjour {prénom} ! » + l'échéance la plus proche.
// Parle une seule fois par jour et par enfant (première entrée dans son
// espace), désactivable dans les Réglages (ppia.voiceEnabled).

const KEY_GREET_DATES = 'ppia.greetDates';
export const KEY_VOICE_ENABLED = 'ppia.voiceEnabled';

/** Construit le message vocal : prénom + contexte de la prochaine échéance. */
export function buildGreeting(child: Pick<Child, 'name' | 'echeances'>): string {
  const hello = `Bonjour ${child.name} !`;
  const next = [...(child.echeances ?? [])].sort((a, b) => a.days - b.days)[0];
  if (!next) return hello;
  const type = (next.type || 'contrôle').toLowerCase();
  const quand = next.days <= 0 ? "aujourd'hui" : next.days === 1 ? 'demain' : `dans ${next.days} jours`;
  return `${hello} Tu as ${/^[aeiouyéè]/.test(type) ? 'une' : 'un'} ${type} de ${next.subj} ${quand}.`;
}

export async function isVoiceEnabled(): Promise<boolean> {
  return getJSON<boolean>(KEY_VOICE_ENABLED, true);
}

export async function setVoiceEnabled(on: boolean): Promise<void> {
  await setJSON(KEY_VOICE_ENABLED, on);
}

/**
 * Salue l'enfant à voix haute si c'est sa première entrée du jour et que la
 * voix est activée. Retourne true si la voix a parlé.
 */
export async function speakDailyGreeting(child: Pick<Child, 'id' | 'name' | 'echeances'>): Promise<boolean> {
  if (!(await isVoiceEnabled())) return false;
  const today = new Date().toISOString().slice(0, 10);
  const dates = await getJSON<Record<string, string>>(KEY_GREET_DATES, {});
  if (dates[child.id] === today) return false;
  await setJSON(KEY_GREET_DATES, { ...dates, [child.id]: today });
  Speech.speak(buildGreeting(child), { language: 'fr-FR', rate: 0.95 });
  return true;
}
