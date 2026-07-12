import { getJSON, setJSON } from './storage';

// Maîtrise des flashcards par contenu (clé ppia.flashMastery)
// clé d'entrée : `${childId}:${echeanceId ?? lessonId}`
export interface FlashMastery {
  known: number;
  total: number;
  date: string; // ISO de la dernière session
}

const KEY = 'ppia.flashMastery';

export async function loadFlashMastery(entryKey: string): Promise<FlashMastery | null> {
  const all = await getJSON<Record<string, FlashMastery>>(KEY, {});
  return all?.[entryKey] ?? null;
}

export async function saveFlashMastery(entryKey: string, mastery: FlashMastery): Promise<void> {
  const all = await getJSON<Record<string, FlashMastery>>(KEY, {});
  await setJSON(KEY, { ...(all ?? {}), [entryKey]: mastery });
}

export function masteryPct(m: FlashMastery | null): number | null {
  if (!m || m.total === 0) return null;
  return Math.round((m.known / m.total) * 100);
}
