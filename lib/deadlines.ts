import type { ExamResult } from './examResults';

// ─── Dates & jours restants ──────────────────────────────────────────────────
// Le champ `days` d'une échéance est un instantané pris à sa création : il ne
// diminue pas avec le temps. Pour l'affichage, on RECALCULE les jours restants
// à partir de la date quand elle est interprétable, sinon on retombe sur `days`.

const MOIS_FR: Record<string, number> = {
  janvier: 0, janv: 0, 'févr': 1, fevr: 1, 'février': 1, fevrier: 1, mars: 2,
  avril: 3, avr: 3, mai: 4, juin: 5, juillet: 6, juil: 6, 'août': 7, aout: 7,
  septembre: 8, sept: 8, octobre: 9, oct: 9, novembre: 10, nov: 10,
  'décembre': 11, decembre: 11, 'déc': 11, dec: 11,
};

/** Interprète "JJ/MM/AAAA" ou "17 juin [2026]" ; null si illisible. */
export function parseFrDate(dateStr: string | undefined, now: Date = new Date()): Date | null {
  if (!dateStr) return null;
  const slash = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slash) return new Date(+slash[3], +slash[2] - 1, +slash[1]);
  const fr = dateStr.toLowerCase().match(/(\d{1,2})\s+([a-zéûôè.]+)\.?\s*(\d{4})?/);
  if (fr) {
    const month = MOIS_FR[fr[2].replace('.', '')];
    if (month !== undefined) {
      return new Date(fr[3] ? +fr[3] : now.getFullYear(), month, +fr[1]);
    }
  }
  return null;
}

/** Jours restants jusqu'à la date (négatif si dépassée) ; null si date illisible. */
export function daysUntil(dateStr: string | undefined, now: Date = new Date()): number | null {
  const d = parseFrDate(dateStr, now);
  if (!d) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

/** Jours restants effectifs d'une échéance : recalculés depuis la date, sinon `days` stocké. */
export function effectiveDays(e: { date?: string; days: number }, now: Date = new Date()): number {
  return daysUntil(e.date, now) ?? e.days;
}

/**
 * Échéances À VENIR uniquement (aujourd'hui inclus, dépassées exclues),
 * avec `days` remis à jour, triées de la plus proche à la plus lointaine.
 * À utiliser PARTOUT où l'app affiche des contrôles/échéances à venir.
 */
export function upcomingDeadlines<T extends { date?: string; days: number }>(
  echeances: readonly T[],
  now: Date = new Date(),
): T[] {
  return echeances
    .map((e) => ({ ...e, days: effectiveDays(e, now) }))
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days);
}

/** Les N échéances à venir les plus proches (dépassées exclues, jours recalculés). */
export function nextDeadlines<T extends { date?: string; days: number }>(
  echeances: readonly T[],
  n = 3,
  now: Date = new Date(),
): T[] {
  return upcomingDeadlines(echeances, now).slice(0, n);
}

// ─── Maîtrise ────────────────────────────────────────────────────────────────

/**
 * Maîtrise d'une matière = dernière note de devoir blanc, convertie en %.
 * `null` si aucune matière ne correspond (non évalué).
 */
export function masteryForSubject(
  examResults: readonly ExamResult[],
  subj: string | undefined,
): { pct: number; note: number } | null {
  const m = (subj ?? '').toLowerCase();
  const r = examResults.find((x) => (x.matiere ?? '').toLowerCase() === m);
  return r ? { pct: Math.round((r.note / 20) * 100), note: r.note } : null;
}

/** Une échéance est « en alerte » si non préparée : non évaluée OU maîtrise < 80 %. */
export function isDeadlineAtRisk(mastery: { pct: number } | null): boolean {
  return !mastery || mastery.pct < 80;
}
