import { getJSON, setJSON } from '../lib/storage';
import type { Child } from '../data/mock';

// ─── API key management ─────────────────────────────────────────────────────

const KEY_API = 'ppia.apiKey';

export async function getApiKey(): Promise<string | null> {
  const key = await getJSON<string | null>(KEY_API, null);
  return key && key.length > 0 ? key : null;
}

export async function setApiKey(key: string): Promise<void> {
  await setJSON(KEY_API, key.trim());
}

// ─── Error types ────────────────────────────────────────────────────────────

export type AiErrorCode = 'NO_KEY' | 'BAD_KEY' | 'NETWORK' | 'API' | 'PARSE';

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// ─── Core Claude call (raw HTTP — no Node SDK in React Native) ──────────────

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

interface AskParams {
  system: string;
  user: string;
  imageBase64?: string;
  /** plusieurs pages photographiées (envoyées dans l'ordre) */
  imagesBase64?: string[];
  /** document PDF complet (base64) */
  pdfBase64?: string;
  maxTokens?: number;
}

export async function askClaude({ system, user, imageBase64, imagesBase64, pdfBase64, maxTokens = 4096 }: AskParams): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new AiError('NO_KEY', 'Aucune clé API configurée.');
  }

  const content: any[] = [];
  if (pdfBase64) {
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
    });
  }
  for (const img of [...(imageBase64 ? [imageBase64] : []), ...(imagesBase64 ?? [])]) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: img },
    });
  }
  content.push({ type: 'text', text: user });

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content }],
      }),
    });
  } catch {
    throw new AiError('NETWORK', 'Impossible de joindre le serveur. Vérifiez votre connexion.');
  }

  if (res.status === 401 || res.status === 403) {
    throw new AiError('BAD_KEY', 'Clé API invalide. Vérifiez-la dans Réglages.');
  }
  if (!res.ok) {
    let msg = `Erreur API (${res.status})`;
    try {
      const err = await res.json();
      if (err?.error?.message) msg = err.error.message;
    } catch {
      // keep default message
    }
    throw new AiError('API', msg);
  }

  const data = await res.json();
  const text = (data?.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n');
  if (!text) throw new AiError('PARSE', "Réponse vide de l'IA.");
  return text;
}

// ─── JSON helper ────────────────────────────────────────────────────────────

export function extractJSON<T = any>(text: string): T {
  // direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through
  }
  // strip markdown fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]) as T;
    } catch {
      // fall through
    }
  }
  // first balanced {...} block
  const start = text.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(text.slice(start, i + 1)) as T;
          } catch {
            break;
          }
        }
      }
    }
  }
  throw new AiError('PARSE', "L'IA a renvoyé un format inattendu. Réessayez.");
}

// ─── Typed AI functions ─────────────────────────────────────────────────────

const SYSTEM = 'Tu es un professeur particulier bienveillant qui aide des parents à faire réviser leurs enfants.';
const JSON_ONLY = 'Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans texte avant ou après.';

function childCtx(child: Child): string {
  return `L'enfant s'appelle ${child.name}, il est en classe de ${child.classe} et a ${child.age} ans. Adapte la difficulté, le vocabulaire et le ton à son niveau scolaire et à son âge.`;
}

export interface LessonAnalysis {
  matiere: string;
  titre: string;
  niveau: string;
  notions: string[];
  resume: string;
}

export async function analyzeLesson(imageBase64: string, child: Child): Promise<LessonAnalysis> {
  return analyzeLessonSources({ images: [imageBase64] }, child);
}

export interface LessonSources {
  /** pages photographiées, dans l'ordre (20 max) */
  images?: string[];
  /** document PDF complet (base64) */
  pdfBase64?: string;
  /** texte brut (fichier Word ou .txt converti) */
  text?: string;
}

/**
 * Analyse une leçon à partir d'une ou plusieurs sources : jusqu'à 20 photos,
 * un PDF, ou le texte extrait d'un document (Word, txt). Une seule leçon en
 * sortie, couvrant TOUTES les pages fournies.
 */
export async function analyzeLessonSources(sources: LessonSources, child: Child): Promise<LessonAnalysis> {
  const images = (sources.images ?? []).slice(0, 20);
  const nbPages = images.length;
  const intro = sources.pdfBase64
    ? "Voici une leçon au format PDF (toutes les pages du document font partie de la MÊME leçon)."
    : nbPages > 1
      ? `Voici les ${nbPages} pages photographiées d'une MÊME leçon, dans l'ordre.`
      : sources.text
        ? 'Voici le texte complet d\'une leçon (extrait d\'un document).'
        : "Voici la photo d'une leçon.";
  const text = await askClaude({
    system: SYSTEM,
    imagesBase64: images,
    pdfBase64: sources.pdfBase64,
    user: `${childCtx(child)}
${intro}
${sources.text ? `\n--- CONTENU DE LA LEÇON ---\n${sources.text}\n--- FIN ---\n` : ''}
Analyse l'ENSEMBLE du contenu (toutes les pages) et renvoie UNE seule synthèse:
{"matiere": "matière scolaire", "titre": "titre de la leçon", "niveau": "niveau scolaire estimé", "notions": ["notion 1", "notion 2", ...], "resume": "résumé simple en 2-3 phrases compréhensible par un parent"}
Les "notions" doivent couvrir toutes les pages fournies, sans rien inventer qui n'y figure pas.
${JSON_ONLY}`,
    maxTokens: 3072,
  });
  return extractJSON<LessonAnalysis>(text);
}

export interface AgendaDevoir {
  matiere: string;
  type: string;
  titre: string;
  date: string;
  notions: string[];
  priorite: 'haute' | 'normale' | 'basse';
}

export async function analyzeAgenda(imageBase64: string, child: Child): Promise<{ devoirs: AgendaDevoir[] }> {
  const text = await askClaude({
    system: SYSTEM,
    imageBase64,
    user: `${childCtx(child)}
Voici la photo d'un agenda ou cahier de texte scolaire. Extrais tous les devoirs, contrôles et échéances visibles (dates incluses) et renvoie:
{"devoirs": [{"matiere": "...", "type": "Contrôle|Devoir|Dictée|Exposé|Composition|Leçon", "titre": "...", "date": "date au format JJ/MM/AAAA si lisible, sinon texte tel quel", "notions": ["..."], "priorite": "haute|normale|basse"}]}
${JSON_ONLY}`,
    maxTokens: 3072,
  });
  return extractJSON<{ devoirs: AgendaDevoir[] }>(text);
}

export interface RevisionSheet {
  titre: string;
  sections: { titre: string; contenu: string; points_cles: string[] }[];
}

export async function generateRevisionSheet(lesson: LessonAnalysis, child: Child): Promise<RevisionSheet> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Leçon: ${JSON.stringify(lesson)}
Crée une fiche de révision claire et structurée pour cette leçon:
{"titre": "...", "sections": [{"titre": "...", "contenu": "explication simple et pédagogique", "points_cles": ["point 1", "point 2"]}]}
3 à 5 sections. ${JSON_ONLY}`,
    maxTokens: 4096,
  });
  return extractJSON<RevisionSheet>(text);
}

// conservé uniquement pour le typage des données déjà stockées (ppia.*)
export interface Flashcards {
  cards: { recto: string; verso: string }[];
}

export interface QcmExercise {
  type: 'qcm';
  question: string;
  options: string[];
  bonneReponse: number;
  explication: string;
}

export interface Exercises {
  exercices: QcmExercise[];
}

export async function generateExercises(lesson: LessonAnalysis, child: Child): Promise<Exercises> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Leçon: ${JSON.stringify(lesson)}
Crée 5 exercices QCM pour entraîner l'enfant sur cette leçon:
{"exercices": [{"type": "qcm", "question": "...", "options": ["a", "b", "c", "d"], "bonneReponse": 0, "explication": "pourquoi cette réponse est correcte"}]}
Exactement 4 options par question. "bonneReponse" est l'index (0-3) de la bonne option. ${JSON_ONLY}`,
    maxTokens: 4096,
  });
  return extractJSON<Exercises>(text);
}

export interface MiniTest extends Exercises {
  conseil: string;
}

export async function generateMiniTest(lesson: LessonAnalysis, child: Child): Promise<MiniTest> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Leçon: ${JSON.stringify(lesson)}
Crée un mini-test rapide de 3 questions QCM sur cette leçon, plus un conseil de révision:
{"exercices": [{"type": "qcm", "question": "...", "options": ["a", "b", "c", "d"], "bonneReponse": 0, "explication": "..."}], "conseil": "conseil de révision personnalisé pour l'enfant"}
Exactement 4 options par question. "bonneReponse" est l'index (0-3). ${JSON_ONLY}`,
    maxTokens: 3072,
  });
  return extractJSON<MiniTest>(text);
}

// ─── Devoir blanc complet & parcours de maîtrise (questions ouvertes à critères) ─

export interface CorrectionCriterion {
  criterion_id: string;
  label: string; // ex: "Formule écrite avant le calcul"
  points: number;
  required_for_mastery?: boolean;
  related_knowledge_id?: string;
}

export type MissionIdAI = 'memoire' | 'comprehension' | 'application' | 'defi';

export interface OpenQuestion {
  question_id: string;
  mission_id?: MissionIdAI;
  enonce: string;
  points_total: number;
  expected_answer: string; // réservé au parent
  accepted_variants?: string[];
  correction_criteria: CorrectionCriterion[];
  common_errors?: string[];
  explication?: string; // explication pédagogique de la bonne réponse
  mini_lecon?: string; // mini-leçon corrective si l'enfant s'est trompé
  notion?: string; // notion évaluée (classement des erreurs)
  answer_space?: 'courte' | 'definition' | 'explication' | 'redaction' | 'calcul' | 'geometrie';
}

export interface DevoirBlanc {
  titre: string;
  matiere: string;
  classe: string;
  duree_min: number;
  outils_autorises?: string[];
  consignes?: string;
  questions: OpenQuestion[];
}

// alias historique : les anciens contenus « contrôle blanc » stockés utilisent
// d'autres champs ; ils sont détectés comme périmés et régénérés
export type MockExam = DevoirBlanc;

export interface KnowledgeAtom {
  id: string; // ex: "DEF-01"
  type: 'DEF' | 'VOC' | 'FCT' | 'REG' | 'PRO' | 'FOR' | 'MET' | 'CON' | 'EXC' | 'RAI' | 'REP' | 'RED' | 'SYN' | string;
  label: string;
  importance: 'ESSENTIELLE' | 'IMPORTANTE' | 'SECONDAIRE';
  cognitive_level: 'RESTITUER' | 'COMPRENDRE' | 'APPLIQUER' | 'TRANSFERER';
}

export interface KnowledgeMap {
  knowledge: KnowledgeAtom[];
}

// Règles absolues communes à toute génération du parcours et du devoir blanc.
const OPEN_RULES = `RÈGLES ABSOLUES (non négociables) :
- Utilise UNIQUEMENT le contenu des leçons fournies. N'invente RIEN qui n'y figure pas.
- AUCUN QCM, AUCUN vrai/faux, AUCUNE liste de réponses proposées : l'enfant produit lui-même toutes ses réponses (à l'écrit ou à l'oral).
- Les critères de réussite et les réponses attendues sont réservés au PARENT, jamais montrés à l'enfant.
- Le barème valorise la méthode et la justification, pas seulement le résultat (ex : formule 1 pt, calcul 1 pt, unité + conclusion 1 pt).
- Accepte les formulations équivalentes correctes ("accepted_variants").
- "notion" est courte et précise (elle sert à classer les erreurs).`;

const OPEN_QUESTION_FORMAT = `{"question_id": "Q1", "enonce": "consigne complète, autonome", "points_total": 3, "expected_answer": "réponse modèle complète", "accepted_variants": ["formulation équivalente acceptée"], "correction_criteria": [{"criterion_id": "Q1-C1", "label": "Formule écrite avant le calcul", "points": 1, "required_for_mastery": true}, {"criterion_id": "Q1-C2", "label": "Calcul exact", "points": 1, "required_for_mastery": true}, {"criterion_id": "Q1-C3", "label": "Unité et phrase de conclusion", "points": 1}], "common_errors": ["erreur classique"], "explication": "explication pédagogique de la bonne réponse", "mini_lecon": "mini-leçon corrective courte si l'enfant s'est trompé", "notion": "notion évaluée", "answer_space": "calcul"}
"answer_space" ∈ courte (1-2 lignes), definition, explication, redaction, calcul, geometrie.
"points_total" = somme des points des critères de la question.`;

const DEVOIR_FORMAT = `{"titre": "...", "matiere": "...", "classe": "...", "duree_min": 30, "outils_autorises": ["règle", "calculatrice"], "consignes": "consignes générales pour l'élève", "questions": [${OPEN_QUESTION_FORMAT}]}
Le total des points de toutes les questions fait exactement 20.
Le devoir mélange les 4 dimensions : restitution (mémoire), compréhension (expliquer), application (exercices) et transfert (problème complet), avec "mission_id" ∈ memoire|comprehension|application|defi sur chaque question.`;

export async function generateMockExam(lesson: LessonAnalysis, child: Child): Promise<DevoirBlanc> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Leçon: ${JSON.stringify(lesson)}
Crée un devoir blanc complet (comme un vrai devoir à l'école) sur cette leçon, 5 à 6 questions ouvertes notées sur 20 au total :
${DEVOIR_FORMAT}
${OPEN_RULES}
${JSON_ONLY}`,
    maxTokens: 8192,
  });
  return extractJSON<DevoirBlanc>(text);
}

// ─── Contrôles : suggestion, génération globale, planning ────────────────────

export interface LessonLite {
  id: string;
  matiere: string;
  titre: string;
  notions: string[];
  resume: string;
}

export interface EcheanceLite {
  subj: string;
  type: string;
  date: string;
  titre?: string;
  consigne?: string;
}

export interface LessonSuggestions {
  suggestions: { lessonId: string; raison: string }[];
}

export async function suggestLessons(echeance: EcheanceLite, lessons: LessonLite[], child: Child): Promise<LessonSuggestions> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
Contrôle à venir: ${JSON.stringify(echeance)}
Leçons enregistrées de l'enfant: ${JSON.stringify(lessons.map((l) => ({ id: l.id, matiere: l.matiere, titre: l.titre, notions: l.notions, resume: l.resume })))}
Compare la matière, le titre, les notions et le résumé de chaque leçon avec le contrôle (matière, titre, consigne). Renvoie uniquement les leçons probablement concernées par ce contrôle:
{"suggestions": [{"lessonId": "id de la leçon", "raison": "explication courte en une phrase"}]}
Si aucune leçon ne correspond, renvoie {"suggestions": []}. ${JSON_ONLY}`,
    maxTokens: 2048,
  });
  return extractJSON<LessonSuggestions>(text);
}

export type ControlKind = 'fiche' | 'exercices' | 'minitest' | 'controle' | 'piege';

function lessonsBlock(lessons: LessonLite[]): string {
  return lessons
    .map((l, i) => `Leçon ${i + 1} — ${l.matiere} : ${l.titre}\nNotions: ${l.notions.join(', ')}\nRésumé: ${l.resume}`)
    .join('\n\n');
}

export async function generateForControl(
  kind: ControlKind,
  echeance: EcheanceLite,
  lessons: LessonLite[],
  child: Child
): Promise<any> {
  const ctx = `${childCtx(child)}
L'enfant prépare: ${echeance.type} de ${echeance.subj} (${echeance.date})${echeance.titre ? ` — ${echeance.titre}` : ''}${echeance.consigne ? `\nConsigne du professeur: ${echeance.consigne}` : ''}
Le contenu doit couvrir TOUTES les leçons suivantes (mélange les notions):
${lessonsBlock(lessons)}`;

  let user: string;
  let maxTokens = 4096;
  if (kind === 'fiche') {
    user = `${ctx}
Crée une fiche de révision globale couvrant toutes ces leçons:
{"titre": "...", "sections": [{"titre": "...", "contenu": "explication simple et pédagogique", "points_cles": ["point 1", "point 2"]}]}
4 à 6 sections. ${JSON_ONLY}`;
  } else if (kind === 'exercices') {
    user = `${ctx}
Crée 6 exercices QCM mélangés couvrant l'ensemble des leçons:
{"exercices": [{"type": "qcm", "question": "...", "options": ["a", "b", "c", "d"], "bonneReponse": 0, "explication": "..."}]}
Exactement 4 options par question. "bonneReponse" est l'index (0-3). ${JSON_ONLY}`;
  } else if (kind === 'minitest') {
    user = `${ctx}
Crée un mini-test rapide de 4 questions QCM couvrant toutes les leçons, plus un conseil de révision:
{"exercices": [{"type": "qcm", "question": "...", "options": ["a", "b", "c", "d"], "bonneReponse": 0, "explication": "..."}], "conseil": "conseil personnalisé"}
Exactement 4 options par question. ${JSON_ONLY}`;
  } else if (kind === 'piege') {
    user = `${ctx}
Crée un test piégeux: 5 questions QCM avec des distracteurs très plausibles correspondant aux erreurs classiques des élèves sur ces notions:
{"exercices": [{"type": "qcm", "question": "...", "options": ["a", "b", "c", "d"], "bonneReponse": 0, "explication": "pourquoi les autres options sont des pièges classiques"}]}
Exactement 4 options par question. ${JSON_ONLY}`;
  } else {
    user = `${ctx}
Crée un devoir blanc complet (comme un vrai devoir à l'école) couvrant toutes les leçons, 6 à 8 questions ouvertes notées sur 20 au total :
${DEVOIR_FORMAT}
${OPEN_RULES}
${JSON_ONLY}`;
    maxTokens = 8192;
  }

  const text = await askClaude({ system: SYSTEM, user, maxTokens });
  return extractJSON<any>(text);
}

export interface Planning {
  jours: { jour: string; taches: { label: string; min: number }[] }[];
}

export async function generatePlanning(echeance: EcheanceLite, lessons: LessonLite[], child: Child): Promise<Planning> {
  const text = await askClaude({
    system: SYSTEM,
    user: `${childCtx(child)}
L'enfant prépare: ${echeance.type} de ${echeance.subj} le ${echeance.date}${echeance.consigne ? `\nConsigne: ${echeance.consigne}` : ''}
Leçons à réviser:
${lessonsBlock(lessons)}
Crée un planning de révision progressif de J-10 à J-1 (10 jours avant le contrôle jusqu'à la veille). Chaque jour comporte 1 à 3 tâches courtes et concrètes avec une durée en minutes adaptée à l'âge de l'enfant:
{"jours": [{"jour": "J-10", "taches": [{"label": "tâche concrète", "min": 15}]}]}
Termine par J-1 (révision légère et confiance). ${JSON_ONLY}`,
    maxTokens: 4096,
  });
  return extractJSON<Planning>(text);
}

// ─── Daily drill generation ──────────────────────────────────────────────────

export interface DrillExerciseAI {
  numero: number;
  matiere: string;
  competence: string;
  niveau: string;
  consigne: string;
  correction: string;
  phraseParent: string;
  type: 'calcul' | 'geometrie' | 'francais' | 'lecture' | 'science' | 'histoire' | 'anglais' | 'autre';
}

export interface GeneratedDrill {
  titre: string;
  dureeEstimee: number;
  exercises: DrillExerciseAI[];
}

export interface DrillRequest {
  childName: string;
  classe: string;
  date: string;
  jourSemaine: string;
  dureeMin: number;
  matieres: string[];
  niveauEstime: string;
  objectif: string;
  pointsFaibles: string[];
  recentErrors?: string[];
  controleAVenir?: string;
  consignesAdaptation?: string[];
}

export async function generateDrill(request: DrillRequest, systemPrompt: string): Promise<GeneratedDrill> {
  const nb = request.dureeMin <= 15 ? 3 : request.dureeMin <= 25 ? 4 : request.dureeMin <= 35 ? 5 : 6;
  const faibles = request.pointsFaibles.length > 0 ? `Points faibles à réinjecter : ${request.pointsFaibles.join(' ; ')}.` : '';
  const erreurs = request.recentErrors && request.recentErrors.length > 0 ? `Erreurs récentes : ${request.recentErrors.join(', ')}.` : '';
  const controle = request.controleAVenir ? `Attention : ${request.controleAVenir} — augmenter la fréquence de cette matière.` : '';
  const adaptation = request.consignesAdaptation && request.consignesAdaptation.length > 0
    ? `RÈGLES D'ADAPTATION (issues de l'historique de l'élève, à respecter impérativement) :\n- ${request.consignesAdaptation.join('\n- ')}`
    : '';

  const user = `Date : ${request.date} (${request.jourSemaine}).
Élève : ${request.childName}, ${request.classe}.
Durée : ${request.dureeMin} minutes → génère ${nb} exercices.
Matières : ${request.matieres.join(', ')}.
Niveau : ${request.niveauEstime}. Objectif : ${request.objectif}.
${faibles}
${erreurs}
${controle}
${adaptation}

Génère un drill quotidien varié (une notion récente, une notion ancienne, un point faible, +1 si exigeant/concours).
N'utilise PAS les mêmes valeurs numériques que d'habitude. Varie les contextes (noms, situations, unités).
Structure de raisonnement géométrie : "Je sais que… / Or… / Donc…" (collège) ou "Je vois… / Je calcule… / Je conclus…" (primaire).
Justification obligatoire dans la correction.

${JSON_ONLY}
{"titre": "Drill du ${request.date}", "dureeEstimee": ${request.dureeMin}, "exercises": [{"numero": 1, "matiere": "...", "competence": "...", "niveau": "${request.classe}", "consigne": "...", "correction": "correction détaillée mini-leçon...", "phraseParent": "question guide sans donner la réponse", "type": "calcul"}]}`;

  const text = await askClaude({ system: systemPrompt, user, maxTokens: 4096 });
  return extractJSON<GeneratedDrill>(text);
}

// ─── Module lecture ──────────────────────────────────────────────────────────

