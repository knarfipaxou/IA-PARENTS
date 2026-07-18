import { type Cycle, CYCLE_LABELS, classesForCycle } from './cycles';

// ─── Rapprochement leçon ↔ programmes officiels : logique PURE testée ────────
// On ne demande PAS au modèle IA de deviner le niveau : on compare le texte de
// la leçon aux entrées officielles (programmes + compléments) récupérées via
// l'API, par recouvrement de vocabulaire. La classe n'est jamais affirmée si
// les données ne permettent pas de la distinguer au sein du cycle.

/** Entrée normalisée d'un programme officiel (une ligne d'un jeu de données). */
export interface ProgramEntry {
  id: string;
  dataset: string; // jeu de données d'origine
  texte: string; // contenu textuel agrégé de l'enregistrement
  matiere?: string;
  cycle?: string; // tel que fourni par la source
  niveau?: string; // classe précise si le jeu la fournit (repères annuels)
  domaine?: string;
  sousDomaine?: string;
  reference?: string; // référence du texte officiel (BO…)
  url?: string;
  dateEntreeVigueur?: string;
}

export interface ProgramMatchResult {
  matiere?: string;
  cycle: Cycle;
  cycleLabel: string;
  /** classe unique si déterminable, sinon null */
  classeEstimee: string | null;
  classesPossibles: string[];
  domaine?: string;
  sousDomaine?: string;
  notions: string[];
  /** extraits officiels les plus pertinents (max 3) */
  extraits: { texte: string; reference?: string; url?: string; dataset: string }[];
  confiance: number; // 0..100
  explication: string;
  syncDate?: string; // date de synchronisation des programmes utilisés
}

const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'en', 'dans', 'sur', 'pour',
  'avec', 'par', 'est', 'sont', 'que', 'qui', 'ce', 'cette', 'ces', 'son', 'ses', 'aux', 'au',
  'plus', 'pas', 'ne', 'se', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'être', 'avoir',
  'fait', 'faire', 'comme', 'mais', 'aussi', 'entre', 'leur', 'leurs', 'peut', 'tout', 'tous',
]);

/** Tokenisation simple : minuscules, sans accents ni ponctuation, mots ≥ 3 lettres, sans mots vides. */
export function tokenize(text: string): Set<string> {
  const norm = (text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ');
  const out = new Set<string>();
  for (const w of norm.split(/[\s-]+/)) {
    if (w.length >= 3 && !STOPWORDS.has(w)) out.add(w);
  }
  return out;
}

/** Score de recouvrement (0..1) : proportion des mots de la leçon retrouvés dans l'entrée. */
export function overlapScore(lessonTokens: Set<string>, entryTokens: Set<string>): number {
  if (lessonTokens.size === 0 || entryTokens.size === 0) return 0;
  let common = 0;
  for (const t of lessonTokens) if (entryTokens.has(t)) common++;
  return common / lessonTokens.size;
}

export interface LessonForMatch {
  matiere?: string;
  titre?: string;
  notions?: string[];
  texte?: string;
  resume?: string;
}

/**
 * Compare une leçon aux entrées officielles d'un cycle donné et propose le
 * rattachement le plus probable. `childClasse` sert d'indice (jamais de preuve).
 */
export function matchLessonToProgram(
  lesson: LessonForMatch,
  entries: ProgramEntry[],
  cycle: Cycle,
  childClasse: string | undefined,
  syncDate?: string,
): ProgramMatchResult | null {
  const lessonText = [lesson.titre, (lesson.notions ?? []).join(' '), lesson.resume, (lesson.texte ?? '').slice(0, 4000)]
    .filter(Boolean).join(' ');
  const lessonTokens = tokenize(lessonText);
  if (lessonTokens.size === 0 || entries.length === 0) return null;

  const scored = entries
    .map((e) => ({ e, score: overlapScore(lessonTokens, tokenize(`${e.domaine ?? ''} ${e.sousDomaine ?? ''} ${e.texte}`)) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 0.08) return null; // pas de correspondance suffisamment fiable

  const top = scored.slice(0, 3).filter((s) => s.score >= best.score * 0.5);

  // classes possibles : uniquement à partir des niveaux EXPLICITES des entrées retenues
  const explicitLevels = Array.from(new Set(
    top.map((s) => s.e.niveau).filter((n): n is string => !!n && n.trim().length > 0),
  ));
  const cycleClasses = classesForCycle(cycle);
  let classeEstimee: string | null = null;
  let classesPossibles: string[];
  if (explicitLevels.length === 1) {
    classeEstimee = explicitLevels[0];
    classesPossibles = explicitLevels;
  } else if (explicitLevels.length > 1) {
    classesPossibles = explicitLevels;
    // le profil de l'enfant sert d'indice pour départager, jamais de preuve
    if (childClasse && explicitLevels.some((l) => l.toLowerCase().includes(childClasse.toLowerCase()))) {
      classeEstimee = childClasse;
    }
  } else {
    // les programmes ne distinguent pas la classe au sein du cycle
    classesPossibles = cycleClasses;
    classeEstimee = null;
  }

  const confiance = Math.round(Math.min(0.95, best.score * 2.2 + (top.length > 1 ? 0.1 : 0)) * 100);
  const domaine = best.e.domaine;
  const matiere = lesson.matiere ?? best.e.matiere;

  let explication = `La leçon recoupe le ${domaine ? `domaine « ${domaine} » du ` : ''}${CYCLE_LABELS[cycle]}.`;
  if (classeEstimee && explicitLevels.length > 0) {
    explication += ` Le niveau ${classeEstimee} est indiqué par les repères annuels de progression.`;
  } else if (classeEstimee) {
    explication += ` La classe ${classeEstimee} est privilégiée d'après le profil de l'enfant.`;
  } else {
    explication += ` Cette notion appartient au ${CYCLE_LABELS[cycle]} : la classe exacte ne peut pas être déterminée avec suffisamment de certitude.`;
  }

  return {
    matiere,
    cycle,
    cycleLabel: CYCLE_LABELS[cycle],
    classeEstimee,
    classesPossibles,
    domaine,
    sousDomaine: best.e.sousDomaine,
    notions: (lesson.notions ?? []).slice(0, 6),
    extraits: top.map((s) => ({
      texte: s.e.texte.slice(0, 280),
      reference: s.e.reference,
      url: s.e.url,
      dataset: s.e.dataset,
    })),
    confiance,
    explication,
    syncDate,
  };
}
