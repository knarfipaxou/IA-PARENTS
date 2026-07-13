import type { Echeance } from '../data/mock';
import type { ExamResult } from './examResults';

/**
 * Les N échéances les plus proches, toutes matières et tous types confondus,
 * classées de la plus proche (`days` le plus petit) à la plus lointaine.
 * Source de vérité partagée entre l'accueil et la page Échéances.
 */
export function nextDeadlines<T extends { days: number }>(echeances: readonly T[], n = 3): T[] {
  return [...echeances].sort((a, b) => a.days - b.days).slice(0, n);
}

/**
 * Maîtrise d'une matière = dernière note de contrôle blanc, convertie en %.
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
