import { askClaude, extractJSON, type EcheanceLite } from '../ai';
import type { Child } from '../../data/mock';
import {
  validateMissionQuestions,
  MISSION_LEVEL,
  type KnowledgeItem, type MissionQuestion, type MissionType,
} from './types';

export const MISSION_GENERATOR_PROMPT_VERSION = 'mission-generator/v1';

const SYSTEM = `Tu es mission-generator, un agent de génération pédagogique. Tu crées les questions d'une mission du Parcours de maîtrise à partir d'une carte de connaissances VALIDÉE.
RÈGLES ABSOLUES :
- Le nombre de questions dépend du nombre RÉEL de connaissances à couvrir. Jamais de nombre fixé à l'avance.
- Utilise UNIQUEMENT les connaissances fournies. N'invente rien.
- AUCUN QCM, AUCUN vrai/faux, AUCUNE liste de réponses proposées : l'enfant produit lui-même ses réponses.
- Chaque question référence explicitement les knowledgeIds qu'elle évalue.
- Regroupe les connaissances proches, environ 3 connaissances atomiques maximum par question.
- Ne supprime JAMAIS une connaissance essentielle pour raccourcir la mission.
- Le barème valorise la méthode et la justification (critères précis, jamais « réponse correcte »).
- Aucune question ne doit révéler la réponse d'une autre.
Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.`;

const MISSION_BRIEFS: Record<MissionType, string> = {
  memory: `Mission Mémoire : restitution SANS AIDE (définitions, vocabulaire, dates, personnages, lieux, chiffres, formules, règles, chronologie). Pas d'explication longue, pas d'analyse, pas de transfert.`,
  understanding: `Mission Compréhension : l'enfant explique AVEC SES PROPRES MOTS (reformuler, justifier, expliquer une cause/conséquence, donner un exemple).`,
  application: `Mission Application : exercices concrets d'application directe (calculs, analyses, constructions), méthode exigée dans les critères.`,
  challenge: `Mission Défi final : problèmes complets mobilisant plusieurs connaissances dans un contexte nouveau, raisonnement structuré et justification exigés.`,
};

const QUESTION_FORMAT = `{"question_id": "MEM-Q01", "enonce": "consigne complète et autonome", "knowledgeIds": ["VOC-001", "VOC-002"], "expected_answer": "réponse modèle complète", "accepted_variants": ["formulation équivalente acceptée"], "correction_criteria": [{"criterion_id": "MEM-Q01-C1", "label": "critère précis et observable", "points": 1, "required_for_mastery": true, "related_knowledge_id": "VOC-001"}], "common_errors": ["erreur classique"], "explication": "explication pédagogique", "mini_lecon": "mini-leçon corrective courte", "notion": "notion évaluée", "answer_space": "courte|definition|explication|redaction|calcul|geometrie", "estimatedMinutes": 3}`;

function knowledgeBlock(items: KnowledgeItem[]): string {
  return JSON.stringify(items.map((k) => ({
    knowledgeId: k.knowledgeId, type: k.type, label: k.label, content: k.content,
    importance: k.importance,
  })));
}

function childCtx(child: Child): string {
  return `Élève : ${child.name}, classe ${child.classe}, ${child.age} ans. Adapte la formulation à son niveau.`;
}

/**
 * Agent 2 — mission-generator : génère TOUTES les questions nécessaires pour
 * couvrir les connaissances du niveau cognitif de la mission.
 */
export async function runMissionGenerator(
  missionType: MissionType,
  scopedKnowledge: KnowledgeItem[],
  echeance: EcheanceLite,
  child: Child,
): Promise<MissionQuestion[]> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Il prépare : ${echeance.type} de ${echeance.subj} (${echeance.date}).
${MISSION_BRIEFS[missionType]}
Connaissances à couvrir (niveau ${MISSION_LEVEL[missionType]}) — TOUTES les "essential" doivent être évaluées, et au moins 90 % des "important" :
${knowledgeBlock(scopedKnowledge)}
Crée le nombre de questions réellement nécessaire pour couvrir ces connaissances (≈3 connaissances max par question).
{"questions": [${QUESTION_FORMAT}]}`,
    maxTokens: 16384,
  });
  const raw = extractJSON<{ questions: any[] }>(text);
  return validateMissionQuestions(raw.questions ?? [], missionType);
}

/**
 * Régénération CIBLÉE : ajoute uniquement les questions couvrant les
 * connaissances manquantes, sans toucher aux questions déjà validées.
 */
export async function runMissionPatch(
  missionType: MissionType,
  missingKnowledge: KnowledgeItem[],
  existingQuestions: MissionQuestion[],
  echeance: EcheanceLite,
  child: Child,
): Promise<MissionQuestion[]> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Il prépare : ${echeance.type} de ${echeance.subj} (${echeance.date}).
${MISSION_BRIEFS[missionType]}
ACTION : add_missing_questions. La mission existe déjà mais l'audit a détecté des connaissances NON couvertes.
Connaissances manquantes à couvrir maintenant :
${knowledgeBlock(missingKnowledge)}
Questions déjà validées (NE PAS les recopier, NE PAS les modifier, ne pas créer de doublon avec elles) :
${JSON.stringify(existingQuestions.map((q) => ({ question_id: q.question_id, enonce: q.enonce, knowledgeIds: q.knowledgeIds })))}
Crée UNIQUEMENT les nouvelles questions nécessaires pour couvrir les connaissances manquantes (≈3 max par question).
{"questions": [${QUESTION_FORMAT}]}`,
    maxTokens: 8192,
  });
  const raw = extractJSON<{ questions: any[] }>(text);
  return validateMissionQuestions(raw.questions ?? [], missionType);
}
