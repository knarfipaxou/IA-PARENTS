import type { DrillResult } from '../types/childProfile';

export interface CompetenceStat {
  competence: string;
  matiere: string;
  total: number;
  reussites: number;
  taux: number; // 0-100
  echecsConsecutifs: number; // depuis le résultat le plus récent
  reussitesConsecutives: number;
}

/**
 * Agrège les résultats de drill par compétence.
 * `results` doit être trié du plus récent au plus ancien (ordre du store).
 */
export function computeCompetenceStats(results: DrillResult[]): CompetenceStat[] {
  const byComp = new Map<string, DrillResult[]>();
  for (const r of results) {
    const key = `${r.matiere}::${r.competence}`;
    const arr = byComp.get(key) ?? [];
    arr.push(r);
    byComp.set(key, arr);
  }

  const stats: CompetenceStat[] = [];
  for (const [key, arr] of byComp) {
    const [matiere, competence] = key.split('::');
    const total = arr.length;
    const reussites = arr.filter((r) => r.reussite).length;

    let echecsConsecutifs = 0;
    for (const r of arr) {
      if (!r.reussite) echecsConsecutifs++;
      else break;
    }
    let reussitesConsecutives = 0;
    for (const r of arr) {
      if (r.reussite) reussitesConsecutives++;
      else break;
    }

    stats.push({
      competence,
      matiere,
      total,
      reussites,
      taux: total > 0 ? Math.round((reussites / total) * 100) : 0,
      echecsConsecutifs,
      reussitesConsecutives,
    });
  }
  return stats;
}

/**
 * Produit les consignes d'adaptation à injecter dans le prompt de génération,
 * selon les règles : ≥3 échecs consécutifs → baisser la difficulté et revenir
 * aux prérequis ; ≥90% de réussite sur ≥3 essais → augmenter la difficulté ;
 * <60% de réussite → consolider les bases.
 */
export function buildAdaptationConsignes(results: DrillResult[]): string[] {
  const stats = computeCompetenceStats(results);
  const consignes: string[] = [];

  for (const s of stats) {
    if (s.echecsConsecutifs >= 3) {
      consignes.push(
        `"${s.competence}" (${s.matiere}) : ${s.echecsConsecutifs} échecs consécutifs — BAISSE la difficulté d'un cran, reviens aux prérequis, propose une explication différente et un exercice très guidé.`
      );
    } else if (s.total >= 3 && s.taux >= 90 && s.reussitesConsecutives >= 3) {
      consignes.push(
        `"${s.competence}" (${s.matiere}) : ${s.taux}% de réussite — AUGMENTE légèrement la difficulté, ajoute un piège raisonnable ou un problème plus ouvert.`
      );
    } else if (s.total >= 3 && s.taux < 60) {
      consignes.push(
        `"${s.competence}" (${s.matiere}) : seulement ${s.taux}% de réussite — consolide les bases avec des nombres plus simples, n'introduis pas de notion nouvelle sur ce sujet.`
      );
    }
  }
  return consignes.slice(0, 6);
}

/** Compétences fragiles (<60% sur ≥3 essais) — pour le tableau de progression. */
export function fragileCompetences(results: DrillResult[]): CompetenceStat[] {
  return computeCompetenceStats(results).filter((s) => s.total >= 3 && s.taux < 60);
}

/** Compétences maîtrisées (>90% sur ≥3 essais). */
export function masteredCompetences(results: DrillResult[]): CompetenceStat[] {
  return computeCompetenceStats(results).filter((s) => s.total >= 3 && s.taux > 90);
}

/** Taux de réussite par matière — pour le tableau de progression. */
export function statsByMatiere(results: DrillResult[]): { matiere: string; total: number; taux: number }[] {
  const byMat = new Map<string, { total: number; ok: number }>();
  for (const r of results) {
    const cur = byMat.get(r.matiere) ?? { total: 0, ok: 0 };
    cur.total++;
    if (r.reussite) cur.ok++;
    byMat.set(r.matiere, cur);
  }
  return [...byMat.entries()]
    .map(([matiere, { total, ok }]) => ({ matiere, total, taux: Math.round((ok / total) * 100) }))
    .sort((a, b) => b.total - a.total);
}
