import { askClaude, extractJSON } from '../ai';
import { computeCoverage, coverageAcceptable, knowledgeForLevel } from '../../lib/coverage';
import {
  MISSION_LEVEL,
  type AuditResult, type KnowledgeItem, type MissionQuestion, type MissionType,
} from './types';

export const QUALITY_AUDITOR_PROMPT_VERSION = 'quality-auditor/v1';

const SYSTEM = `Tu es quality-auditor, un agent de contrôle qualité pédagogique INDÉPENDANT du générateur. Tu vérifies une mission avant publication. Tu ne génères jamais de contenu.
Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.`;

/**
 * Agent 3 — quality-auditor.
 * La COUVERTURE est calculée en code (déterministe) : 100 % des connaissances
 * essentielles, ≥ 90 % des importantes — règle bloquante.
 * L'appel IA ne fait que les contrôles qualitatifs : questions mal classées,
 * réponses révélées par une autre question, barème incohérent, doublons.
 */
export async function runQualityAuditor(
  missionType: MissionType,
  knowledge: KnowledgeItem[],
  questions: MissionQuestion[],
): Promise<AuditResult> {
  const scoped = knowledgeForLevel(knowledge, MISSION_LEVEL[missionType]);
  const cov = computeCoverage(scoped, questions);
  const covOk = coverageAcceptable(cov);

  // contrôles qualitatifs par IA (jamais bloqués par un échec réseau : la
  // couverture, elle, est déjà garantie par le calcul en code)
  let misclassified: AuditResult['misclassifiedQuestions'] = [];
  let warnings: string[] = [];
  let aiRejected = false;
  try {
    const text = await askClaude({
      system: SYSTEM,
      user: `Mission auditée : ${missionType}.
Connaissances de référence : ${JSON.stringify(scoped.map((k) => ({ knowledgeId: k.knowledgeId, label: k.label, importance: k.importance })))}
Questions : ${JSON.stringify(questions.map((q) => ({ question_id: q.question_id, enonce: q.enonce, knowledgeIds: q.knowledgeIds, points: q.points_total, criteria: q.correction_criteria.map((c) => c.label) })))}
Vérifie UNIQUEMENT :
1. chaque question appartient bien à la mission ${missionType} (memory=restitution, understanding=explication, application=exercice, challenge=transfert) ;
2. aucune question ne révèle la réponse d'une autre ;
3. aucune connaissance n'est évaluée en double inutilement ;
4. le barème est cohérent (points ≈ effort demandé) et les critères sont précis (jamais « réponse correcte ») ;
5. la mission est réaliste sur mobile.
{"ok": true/false, "misclassifiedQuestions": [{"questionId": "...", "currentMission": "${missionType}", "recommendedMission": "memory|understanding|application|challenge"}], "warnings": ["problème constaté"]}
"ok" est false UNIQUEMENT si un problème grave (question mal classée, réponse révélée, doublon flagrant) est constaté.`,
      maxTokens: 2048,
    });
    const raw = extractJSON<{ ok?: boolean; misclassifiedQuestions?: any[]; warnings?: any[] }>(text);
    misclassified = Array.isArray(raw.misclassifiedQuestions) ? raw.misclassifiedQuestions : [];
    warnings = Array.isArray(raw.warnings) ? raw.warnings.map(String) : [];
    aiRejected = raw.ok === false && misclassified.length > 0;
  } catch {
    warnings = ["Contrôle qualitatif IA indisponible — audit de couverture (calculé en code) appliqué seul."];
  }

  const rejected = !covOk || aiRejected;
  return {
    status: rejected ? 'rejected' : warnings.length > 0 ? 'approved_with_warnings' : 'approved',
    essentialCoverage: cov.essentialPct,
    importantCoverage: cov.importantPct,
    missingKnowledgeIds: [...cov.missingEssentialIds, ...cov.missingImportantIds],
    misclassifiedQuestions: misclassified,
    warnings,
    requiredAction: !covOk ? 'patch_missing_questions' : aiRejected ? 'regenerate' : 'none',
  };
}
