// Logique pure de notation du contrôle blanc : normalisation (compat ancien
// format), calcul du total/note sur 20, et classement des notions (acquis /
// à renforcer). Extrait de app/generate.tsx pour être testable indépendamment
// de l'écran.

export interface ExamSubQ {
  texte: string;
  reponse: string;
  notion: string;
}
export interface ExamQuestionRaw {
  enonce: string;
  points?: number;
  sousQuestions?: ExamSubQ[];
  correction?: string; // ancien format (une seule correction par question)
}
export interface ExamQuestionNormalized {
  enonce: string;
  sousQuestions: ExamSubQ[];
}

/**
 * Normalise les questions d'un contrôle blanc : un contrôle de l'ancien
 * format (une seule `correction`, sans sous-questions) devient une question
 * à une seule sous-question, pour uniformiser le calcul de score.
 */
export function normalizeExamQuestions(
  questions: ExamQuestionRaw[] | undefined,
  fallbackNotion: string,
): ExamQuestionNormalized[] {
  return (questions ?? []).map((qu) => ({
    enonce: qu.enonce,
    sousQuestions: (qu.sousQuestions && qu.sousQuestions.length > 0)
      ? qu.sousQuestions
      : [{ texte: qu.enonce, reponse: qu.correction ?? '', notion: fallbackNotion }],
  }));
}

export interface ExamNotionTally { ok: number; total: number }

export interface ExamScore {
  totalMax: number;
  totalOk: number;
  note: number; // arrondi sur 20
  notions: Record<string, ExamNotionTally>;
  acquis: string[];       // notions 100% justes
  aRenforcer: string[];   // "notion (ok/total)" pour les notions avec erreur
}

/**
 * Calcule le score d'un contrôle blanc à partir des questions normalisées et
 * des cases cochées (`subChecks["qi-si"] = true` si la sous-question est
 * juste). C'est la SEULE source de vérité pour la note /20 et le classement
 * par notion — le tableau de bord et l'écran de correction s'appuient dessus.
 */
export function computeExamScore(
  questions: ExamQuestionNormalized[],
  subChecks: Record<string, boolean>,
): ExamScore {
  const totalMax = questions.reduce((acc, qu) => acc + qu.sousQuestions.length, 0);
  const totalOk = questions.reduce((acc, qu, qi) =>
    acc + qu.sousQuestions.filter((_, si) => subChecks[`${qi}-${si}`]).length, 0);
  const note = totalMax > 0 ? Math.round((totalOk / totalMax) * 20) : 0;

  const notions: Record<string, ExamNotionTally> = {};
  questions.forEach((qu, qi) => qu.sousQuestions.forEach((sq, si) => {
    const n = sq.notion || 'général';
    notions[n] = notions[n] ?? { ok: 0, total: 0 };
    notions[n].total += 1;
    if (subChecks[`${qi}-${si}`]) notions[n].ok += 1;
  }));

  const acquis = Object.entries(notions).filter(([, v]) => v.ok === v.total && v.total > 0).map(([n]) => n);
  const aRenforcer = Object.entries(notions).filter(([, v]) => v.ok < v.total).map(([n, v]) => `${n} (${v.ok}/${v.total})`);

  return { totalMax, totalOk, note, notions, acquis, aRenforcer };
}
