import { computeCoverage, knowledgeForLevel, splitIntoParts, type CoverageReport } from '../../lib/coverage';
import {
  MISSION_LEVEL,
  type AuditResult, type KnowledgeItem, type LessonAnalysis2,
  type MissionQuestion, type MissionType,
} from './types';

// ─── Orchestrateur pédagogique : du CODE, pas une IA ─────────────────────────
// Chaîne : analyser → générer → valider → auditer → réparer (ciblé) → valider.
// Rien n'est publié tant que l'audit n'a pas validé. Trois tentatives max.

export type GenerationState =
  | 'analyzing_lesson'
  | 'generating'
  | 'auditing'
  | 'patching'
  | 'approved'
  | 'failed';

export const STATE_LABELS: Record<GenerationState, string> = {
  analyzing_lesson: 'Analyse de la leçon…',
  generating: 'Création des questions…',
  auditing: 'Vérification de la couverture…',
  patching: 'Ajout des questions manquantes…',
  approved: 'Mission validée',
  failed: 'Échec de la génération',
};

export const MAX_ATTEMPTS = 3;

/** Agents injectés (fonctions réelles en prod, mocks dans les tests). */
export interface MissionAgents {
  generate: (missionType: MissionType, scoped: KnowledgeItem[]) => Promise<MissionQuestion[]>;
  patch: (missionType: MissionType, missing: KnowledgeItem[], existing: MissionQuestion[]) => Promise<MissionQuestion[]>;
  audit: (missionType: MissionType, knowledge: KnowledgeItem[], questions: MissionQuestion[]) => Promise<AuditResult>;
}

export interface MissionBuildResult {
  ok: boolean;
  questions: MissionQuestion[];
  coverage: CoverageReport;
  audit: AuditResult | null;
  attempts: number;
  /** état final : approved ou failed */
  state: GenerationState;
  error?: string;
}

/**
 * Construit une mission validée à partir d'une carte de connaissances.
 * Rejet d'audit → réparation CIBLÉE (les questions validées sont conservées,
 * seules les connaissances manquantes sont régénérées). MAX_ATTEMPTS max.
 */
export async function buildMission(
  missionType: MissionType,
  analysis: LessonAnalysis2,
  agents: MissionAgents,
  onState?: (state: GenerationState) => void,
): Promise<MissionBuildResult> {
  const scoped = knowledgeForLevel(analysis.knowledge, MISSION_LEVEL[missionType]);
  const emit = (s: GenerationState) => { try { onState?.(s); } catch { /* affichage seulement */ } };

  let questions: MissionQuestion[] = [];
  let audit: AuditResult | null = null;
  let attempts = 0;

  try {
    emit('generating');
    questions = await agents.generate(missionType, scoped);

    while (attempts < MAX_ATTEMPTS) {
      attempts += 1;
      emit('auditing');
      audit = await agents.audit(missionType, analysis.knowledge, questions);

      if (audit.status !== 'rejected') {
        emit('approved');
        return {
          ok: true,
          questions: splitIntoParts(questions),
          coverage: computeCoverage(scoped, questions),
          audit, attempts, state: 'approved',
        };
      }

      if (attempts >= MAX_ATTEMPTS) break;

      // réparation ciblée : on ne régénère jamais toute la mission
      emit('patching');
      const missing = scoped.filter((k) => audit!.missingKnowledgeIds.includes(k.knowledgeId));
      if (missing.length > 0) {
        const added = await agents.patch(missionType, missing, questions);
        // on conserve les questions déjà validées et on ajoute les nouvelles
        const seen = new Set(questions.map((q) => q.question_id));
        questions = [...questions, ...added.filter((q) => !seen.has(q.question_id))];
      } else if ((audit.misclassifiedQuestions ?? []).length > 0) {
        // question mal classée sans manque de couverture : on retire les
        // questions litigieuses puis on laisse l'audit re-vérifier la couverture
        const bad = new Set(audit.misclassifiedQuestions!.map((m) => m.questionId));
        questions = questions.filter((q) => !bad.has(q.question_id ?? ''));
        if (questions.length === 0) break;
      } else {
        break; // rejet sans action possible
      }
    }

    emit('failed');
    return {
      ok: false, questions, coverage: computeCoverage(scoped, questions),
      audit, attempts, state: 'failed',
      error: audit
        ? `Audit rejeté après ${attempts} tentative${attempts > 1 ? 's' : ''} — couverture essentielle ${audit.essentialCoverage} %, importante ${audit.importantCoverage} %.`
        : 'Audit indisponible.',
    };
  } catch (e) {
    emit('failed');
    return {
      ok: false, questions, coverage: computeCoverage(scoped, questions),
      audit, attempts, state: 'failed',
      error: e instanceof Error ? e.message : 'Erreur inattendue.',
    };
  }
}

/** La leçon permet-elle un audit exhaustif ? (statuts bloquants du cahier des charges) */
export function lessonAllowsFullAudit(analysis: LessonAnalysis2): boolean {
  return analysis.status === 'complete' || analysis.status === 'probably_complete';
}
