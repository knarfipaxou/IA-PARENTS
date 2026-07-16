// Logique pure de correction par critères de réussite (devoir blanc complet
// et missions du parcours de maîtrise). Chaque question ouverte porte des
// critères cochables valant chacun des points (ex : formule 1 pt, calcul 1 pt,
// unité + conclusion 1 pt). Le crédit partiel est natif. Testée dans
// __tests__/masteryScoring.test.ts.

export interface CriterionLike {
  criterion_id?: string;
  label: string;
  points: number;
  required_for_mastery?: boolean;
  related_knowledge_id?: string;
}

export interface CriteriaQuestionLike {
  question_id?: string;
  enonce: string;
  points_total?: number;
  notion?: string;
  correction_criteria: CriterionLike[];
}

export interface NotionTally { ok: number; total: number }

export interface CriteriaScore {
  totalMax: number; // somme des points de tous les critères
  totalOk: number; // points des critères cochés
  note: number; // arrondi sur 20
  pct: number; // 0..100
  notions: Record<string, NotionTally>; // points par notion (ok / total)
  acquis: string[]; // notions dont tous les points sont obtenus
  aRenforcer: string[]; // "notion (ok/total)" pour les notions incomplètes
  /** questions dont un critère `required_for_mastery` est manqué */
  masteryMissed: string[];
}

/** clé d'un critère dans la map de coches : `${questionIndex}-${criterionIndex}` */
export function critKey(qi: number, ci: number): string {
  return `${qi}-${ci}`;
}

export function computeCriteriaScore(
  questions: CriteriaQuestionLike[],
  checks: Record<string, boolean>,
): CriteriaScore {
  let totalMax = 0;
  let totalOk = 0;
  const notions: Record<string, NotionTally> = {};
  const masteryMissed: string[] = [];

  questions.forEach((qu, qi) => {
    const notion = qu.notion || 'général';
    let missedRequired = false;
    (qu.correction_criteria ?? []).forEach((cr, ci) => {
      const pts = Math.max(0, cr.points || 0);
      totalMax += pts;
      notions[notion] = notions[notion] ?? { ok: 0, total: 0 };
      notions[notion].total += pts;
      if (checks[critKey(qi, ci)]) {
        totalOk += pts;
        notions[notion].ok += pts;
      } else if (cr.required_for_mastery) {
        missedRequired = true;
      }
    });
    if (missedRequired) masteryMissed.push(qu.enonce);
  });

  const note = totalMax > 0 ? Math.round((totalOk / totalMax) * 20) : 0;
  const pct = totalMax > 0 ? Math.round((totalOk / totalMax) * 100) : 0;
  const acquis = Object.entries(notions).filter(([, v]) => v.total > 0 && v.ok === v.total).map(([n]) => n);
  const aRenforcer = Object.entries(notions).filter(([, v]) => v.ok < v.total).map(([n, v]) => `${n} (${v.ok}/${v.total})`);

  return { totalMax, totalOk, note, pct, notions, acquis, aRenforcer, masteryMissed };
}

/** true si la question a tous ses critères obligatoires cochés (réinjection adaptation). */
export function questionMastered(
  qu: CriteriaQuestionLike, qi: number, checks: Record<string, boolean>,
): boolean {
  const crits = qu.correction_criteria ?? [];
  const required = crits.map((cr, ci) => ({ cr, ci })).filter(({ cr }) => cr.required_for_mastery);
  const pool = required.length > 0 ? required : crits.map((cr, ci) => ({ cr, ci }));
  return pool.length > 0 && pool.every(({ ci }) => checks[critKey(qi, ci)]);
}
