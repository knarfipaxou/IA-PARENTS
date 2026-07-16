// HTML A4 imprimable du devoir blanc — VERSION ENFANT UNIQUEMENT.
// Aucune réponse, aucune correction, aucun critère, aucune case parent :
// seulement le sujet, les points et des espaces de réponse adaptés au type
// de production attendue (manuscrit).

export type AnswerSpace = 'courte' | 'definition' | 'explication' | 'redaction' | 'calcul' | 'geometrie';

export interface PrintableQuestion {
  enonce: string;
  points_total?: number;
  answer_space?: AnswerSpace;
}

export interface PrintableDevoir {
  titre: string;
  matiere?: string;
  classe?: string;
  duree_min?: number;
  outils_autorises?: string[];
  consignes?: string;
  questions: PrintableQuestion[];
}

function esc(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nl2br(s: string): string {
  return esc(s).replace(/\n/g, '<br/>');
}

/** nombre de lignes de réponse selon le type de production attendue */
function lineCount(space?: AnswerSpace): number {
  switch (space) {
    case 'courte': return 2;
    case 'definition': return 4;
    case 'explication': return 6;
    case 'redaction': return 10;
    case 'calcul': return 6;
    case 'geometrie': return 4;
    default: return 4;
  }
}

export function buildDevoirHtml(devoir: PrintableDevoir, childName: string, classe: string): string {
  const questionsHtml = devoir.questions
    .map((q, i) => {
      const lines = Array.from({ length: lineCount(q.answer_space) }, () => '<div class="ligne"></div>').join('');
      const geo = q.answer_space === 'geometrie'
        ? '<div class="figure-box"><span class="figure-label">Construction / figure</span></div>'
        : '';
      return `
      <div class="exo">
        <div class="exo-head">
          <span class="exo-num">Question ${i + 1}</span>
          <span class="exo-pts">${q.points_total ? `${q.points_total} pt${q.points_total > 1 ? 's' : ''}` : ''}</span>
        </div>
        <p class="consigne">${nl2br(q.enonce)}</p>
        ${geo}
        <div class="reponse">${lines}</div>
      </div>`;
    })
    .join('\n');

  const outils = (devoir.outils_autorises ?? []).length > 0
    ? `<p class="outils"><strong>Outils autorisés :</strong> ${esc(devoir.outils_autorises!.join(', '))}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<style>
  @page { margin: 18mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #000; background: #fff; margin: 0; font-size: 12pt; line-height: 1.45; }
  header { border-bottom: 1.5px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
  h1 { font-size: 15pt; margin: 0 0 4px 0; font-weight: bold; }
  .meta { font-size: 10pt; display: flex; justify-content: space-between; }
  .slots { display: flex; justify-content: space-between; font-size: 11pt; margin: 10px 0 14px 0; }
  .slot { border-bottom: 1px solid #000; min-width: 220px; padding: 0 4px 2px 4px; }
  .consignes { font-size: 10.5pt; border: 1px solid #000; padding: 6px 10px; margin-bottom: 16px; }
  .outils { font-size: 10.5pt; margin: 6px 0 0 0; }
  .exo { margin-bottom: 20px; page-break-inside: avoid; }
  .exo-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .exo-num { font-weight: bold; font-size: 11.5pt; }
  .exo-pts { font-size: 10pt; }
  .consigne { margin: 4px 0 10px 0; }
  .reponse { margin-top: 6px; }
  .ligne { border-bottom: 1px solid #999; height: 26px; }
  .figure-box { border: 1px solid #666; height: 160px; margin: 8px 0; position: relative; }
  .figure-label { position: absolute; top: 3px; left: 6px; font-size: 8.5pt; color: #666; }
  footer { font-size: 9pt; text-align: right; margin-top: 20px; }
</style>
</head>
<body>
<header>
  <h1>${esc(devoir.titre)}</h1>
  <div class="meta">
    <span>${esc(devoir.matiere ?? '')} — ${esc(devoir.classe ?? classe)}</span>
    <span>${devoir.duree_min ? `Durée : ${devoir.duree_min} min` : ''}</span>
  </div>
</header>
<div class="slots">
  <span>Nom : <span class="slot">${esc(childName)}</span></span>
  <span>Date : <span class="slot">&nbsp;</span></span>
</div>
${devoir.consignes ? `<div class="consignes">${nl2br(devoir.consignes)}${outils}</div>` : outils}
${questionsHtml}
<footer>PROF PARENT IA — Sujet élève</footer>
</body>
</html>`;
}
