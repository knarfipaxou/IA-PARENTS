import type { OpenQuestion } from '../ai';

// ─── Modèle des agents pédagogiques (cahier des charges agents + orchestrateur) ─
// Chaque agent = fonction backend-style : entrée précise, prompt spécialisé,
// sortie JSON stricte validée par schéma. Aucun agent ne publie directement.

export type KnowledgeImportance = 'essential' | 'important' | 'secondary';
export type CognitiveLevel = 'remember' | 'understand' | 'apply' | 'transfer';
export type LessonStatus = 'complete' | 'probably_complete' | 'incomplete' | 'illegible' | 'contradictory';
export type MissionType = 'memory' | 'understanding' | 'application' | 'challenge';

export interface KnowledgeItem {
  knowledgeId: string; // ex: "FCT-001"
  type: string; // date, definition, vocabulaire, personnage, lieu, chiffre, formule, règle…
  label: string;
  content: string;
  importance: KnowledgeImportance;
  cognitiveLevel: CognitiveLevel;
  sourceExcerpt?: string;
  sourceSection?: string;
}

export interface LessonAnalysis2 {
  status: LessonStatus;
  statusDetail?: string; // pages manquantes, phrases coupées, contradictions…
  knowledge: KnowledgeItem[];
  detectedUncertainties?: string[];
}

/** Question de mission : format OpenQuestion (correction par critères) + rattachement aux connaissances. */
export interface MissionQuestion extends OpenQuestion {
  knowledgeIds: string[];
  estimatedMinutes?: number;
  /** sous-partie (division automatique) : "A", "B", "C" */
  part?: string;
}

export interface GeneratedMission {
  missionType: MissionType;
  titre: string;
  questions: MissionQuestion[];
  /** titres des sous-parties si la mission a été divisée (Mémoire A, Mémoire B…) */
  parts?: { part: string; title: string }[];
}

export type AuditStatus = 'approved' | 'approved_with_warnings' | 'rejected';

export interface AuditResult {
  status: AuditStatus;
  essentialCoverage: number; // %
  importantCoverage: number; // %
  missingKnowledgeIds: string[];
  misclassifiedQuestions?: { questionId: string; currentMission: string; recommendedMission: string }[];
  warnings?: string[];
  requiredAction?: 'patch_missing_questions' | 'regenerate' | 'none';
}

// ─── Validation stricte des JSON retournés par les agents ───────────────────

const IMPORTANCES: KnowledgeImportance[] = ['essential', 'important', 'secondary'];
const LEVELS: CognitiveLevel[] = ['remember', 'understand', 'apply', 'transfer'];
const STATUSES: LessonStatus[] = ['complete', 'probably_complete', 'incomplete', 'illegible', 'contradictory'];

export class SchemaError extends Error {}

function req(cond: boolean, msg: string): void {
  if (!cond) throw new SchemaError(msg);
}

/** Valide et normalise la sortie du lesson-analyzer. */
export function validateLessonAnalysis(raw: any): LessonAnalysis2 {
  req(raw && typeof raw === 'object', 'analyse: objet attendu');
  req(STATUSES.includes(raw.status), `analyse: statut invalide (${raw.status})`);
  req(Array.isArray(raw.knowledge), 'analyse: knowledge[] manquant');
  const seen = new Set<string>();
  const knowledge: KnowledgeItem[] = raw.knowledge.map((k: any, i: number) => {
    req(k && typeof k.knowledgeId === 'string' && k.knowledgeId.length > 0, `connaissance ${i}: knowledgeId manquant`);
    req(!seen.has(k.knowledgeId), `connaissance ${i}: knowledgeId dupliqué (${k.knowledgeId})`);
    seen.add(k.knowledgeId);
    req(typeof k.label === 'string' && k.label.length > 0, `connaissance ${k.knowledgeId}: label manquant`);
    req(IMPORTANCES.includes(k.importance), `connaissance ${k.knowledgeId}: importance invalide`);
    req(LEVELS.includes(k.cognitiveLevel), `connaissance ${k.knowledgeId}: cognitiveLevel invalide`);
    return {
      knowledgeId: k.knowledgeId,
      type: String(k.type ?? 'notion'),
      label: k.label,
      content: String(k.content ?? ''),
      importance: k.importance,
      cognitiveLevel: k.cognitiveLevel,
      sourceExcerpt: typeof k.sourceExcerpt === 'string' ? k.sourceExcerpt : undefined,
      sourceSection: typeof k.sourceSection === 'string' ? k.sourceSection : undefined,
    };
  });
  return {
    status: raw.status,
    statusDetail: typeof raw.statusDetail === 'string' ? raw.statusDetail : undefined,
    knowledge,
    detectedUncertainties: Array.isArray(raw.detectedUncertainties) ? raw.detectedUncertainties.map(String) : undefined,
  };
}

/** Valide et normalise une liste de questions de mission. */
export function validateMissionQuestions(raw: any[], missionType: MissionType): MissionQuestion[] {
  req(Array.isArray(raw) && raw.length > 0, 'mission: questions[] vide');
  return raw.map((q: any, i: number) => {
    req(q && typeof q.enonce === 'string' && q.enonce.length > 0, `question ${i}: énoncé manquant`);
    req(Array.isArray(q.correction_criteria) && q.correction_criteria.length > 0, `question ${i}: critères manquants`);
    req(typeof q.expected_answer === 'string' && q.expected_answer.length > 0, `question ${i}: réponse attendue manquante`);
    const criteria = q.correction_criteria.map((c: any, ci: number) => {
      req(c && typeof c.label === 'string' && c.label.length > 0, `question ${i} critère ${ci}: label manquant`);
      req(typeof c.points === 'number' && c.points > 0, `question ${i} critère ${ci}: points invalides`);
      return {
        criterion_id: String(c.criterion_id ?? `Q${i + 1}-C${ci + 1}`),
        label: c.label,
        points: c.points,
        required_for_mastery: !!c.required_for_mastery,
        related_knowledge_id: typeof c.related_knowledge_id === 'string' ? c.related_knowledge_id : undefined,
      };
    });
    const knowledgeIds = Array.isArray(q.knowledgeIds) ? q.knowledgeIds.map(String).filter(Boolean) : [];
    req(knowledgeIds.length > 0, `question ${i}: knowledgeIds manquants (chaque question doit être reliée aux connaissances évaluées)`);
    return {
      question_id: String(q.question_id ?? `Q${i + 1}`),
      mission_id: undefined,
      enonce: q.enonce,
      points_total: criteria.reduce((a: number, c: any) => a + c.points, 0),
      expected_answer: q.expected_answer,
      accepted_variants: Array.isArray(q.accepted_variants) ? q.accepted_variants.map(String) : [],
      correction_criteria: criteria,
      common_errors: Array.isArray(q.common_errors) ? q.common_errors.map(String) : [],
      explication: typeof q.explication === 'string' ? q.explication : undefined,
      mini_lecon: typeof q.mini_lecon === 'string' ? q.mini_lecon : undefined,
      notion: typeof q.notion === 'string' ? q.notion : undefined,
      answer_space: q.answer_space,
      knowledgeIds,
      estimatedMinutes: typeof q.estimatedMinutes === 'number' ? q.estimatedMinutes : undefined,
    } as MissionQuestion;
  }).map((q) => ({ ...q, mission_id: MISSION_TYPE_TO_ID[missionType] }));
}

export const MISSION_TYPE_TO_ID: Record<MissionType, 'memoire' | 'comprehension' | 'application' | 'defi'> = {
  memory: 'memoire',
  understanding: 'comprehension',
  application: 'application',
  challenge: 'defi',
};

export const MISSION_ID_TO_TYPE: Record<'memoire' | 'comprehension' | 'application' | 'defi', MissionType> = {
  memoire: 'memory',
  comprehension: 'understanding',
  application: 'application',
  defi: 'challenge',
};

export const MISSION_LEVEL: Record<MissionType, CognitiveLevel> = {
  memory: 'remember',
  understanding: 'understand',
  application: 'apply',
  challenge: 'transfer',
};
