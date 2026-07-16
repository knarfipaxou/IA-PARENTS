import type { KnowledgeItem, MissionQuestion, CognitiveLevel } from '../services/agents/types';

// ─── Couverture des connaissances : calcul DÉTERMINISTE en code ─────────────
// L'audit de couverture ne dépend pas de l'IA : on compare les knowledgeIds
// référencés par les questions à la carte des connaissances. L'auditeur IA ne
// fait que les contrôles qualitatifs (classement, fuites de réponses…).

export interface CoverageReport {
  /** connaissances du niveau cognitif visé par la mission */
  essentialTotal: number;
  essentialCovered: number;
  importantTotal: number;
  importantCovered: number;
  secondaryTotal: number;
  secondaryCovered: number;
  essentialPct: number; // 100 si aucun essentiel
  importantPct: number;
  missingEssentialIds: string[];
  missingImportantIds: string[];
  estimatedMinutes: number;
}

/** connaissances de la carte concernées par une mission (niveau cognitif). */
export function knowledgeForLevel(knowledge: KnowledgeItem[], level: CognitiveLevel): KnowledgeItem[] {
  return knowledge.filter((k) => k.cognitiveLevel === level);
}

export function computeCoverage(
  scoped: KnowledgeItem[],
  questions: MissionQuestion[],
): CoverageReport {
  const covered = new Set<string>();
  questions.forEach((q) => (q.knowledgeIds ?? []).forEach((id) => covered.add(id)));

  const byImp = (imp: KnowledgeItem['importance']) => scoped.filter((k) => k.importance === imp);
  const ess = byImp('essential');
  const imp = byImp('important');
  const sec = byImp('secondary');
  const cov = (list: KnowledgeItem[]) => list.filter((k) => covered.has(k.knowledgeId));

  const essCov = cov(ess).length;
  const impCov = cov(imp).length;
  const estimatedMinutes = questions.reduce((a, q) => a + (q.estimatedMinutes ?? 2), 0);

  return {
    essentialTotal: ess.length,
    essentialCovered: essCov,
    importantTotal: imp.length,
    importantCovered: impCov,
    secondaryTotal: sec.length,
    secondaryCovered: cov(sec).length,
    essentialPct: ess.length === 0 ? 100 : Math.round((essCov / ess.length) * 100),
    importantPct: imp.length === 0 ? 100 : Math.round((impCov / imp.length) * 100),
    missingEssentialIds: ess.filter((k) => !covered.has(k.knowledgeId)).map((k) => k.knowledgeId),
    missingImportantIds: imp.filter((k) => !covered.has(k.knowledgeId)).map((k) => k.knowledgeId),
    estimatedMinutes,
  };
}

/** Règle bloquante du cahier des charges : 100 % essentiel, ≥ 90 % important. */
export function coverageAcceptable(report: CoverageReport): boolean {
  return report.essentialPct === 100 && report.importantPct >= 90;
}

// ─── Division automatique (Mémoire A / B / C) ────────────────────────────────
// Si la mission dépasse ~15 grands blocs ou ~20 minutes, on la divise en
// sous-parties équilibrées. Toutes les sous-parties restent la même mission.

export const MAX_BLOCKS_PER_PART = 15;
export const MAX_MINUTES_PER_PART = 20;

export function splitIntoParts(questions: MissionQuestion[]): MissionQuestion[] {
  const totalMinutes = questions.reduce((a, q) => a + (q.estimatedMinutes ?? 2), 0);
  if (questions.length <= MAX_BLOCKS_PER_PART && totalMinutes <= MAX_MINUTES_PER_PART) {
    return questions.map((q) => ({ ...q, part: undefined }));
  }
  const nParts = Math.max(
    Math.ceil(questions.length / MAX_BLOCKS_PER_PART),
    Math.ceil(totalMinutes / MAX_MINUTES_PER_PART),
  );
  const perPart = Math.ceil(questions.length / nParts);
  return questions.map((q, i) => ({
    ...q,
    part: String.fromCharCode(65 + Math.min(Math.floor(i / perPart), 25)), // A, B, C…
  }));
}

export function partLabels(questions: MissionQuestion[]): string[] {
  const parts: string[] = [];
  questions.forEach((q) => {
    if (q.part && !parts.includes(q.part)) parts.push(q.part);
  });
  return parts;
}
