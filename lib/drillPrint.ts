import type { DrillSession } from '../types/childProfile';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nl2br(s: string): string {
  return esc(s).replace(/\n/g, '<br/>');
}

/**
 * Génère le HTML imprimable d'un drill en deux parties :
 * page 1 = feuille élève (exercices seuls, grands espaces de réponse),
 * page 2 = feuille correction (réservée au parent).
 * Mise en page sobre : fond blanc, texte noir, impression économique.
 */
export function buildDrillHtml(
  session: DrillSession,
  childName: string,
  classe: string,
  dateFr: string
): string {
  const exercisesHtml = session.exercises
    .map((ex, i) => {
      const isGeo = ex.type === 'geometrie';
      return `
      <div class="exo">
        <div class="exo-head">
          <span class="exo-num">Exercice ${i + 1}</span>
          <span class="exo-mat">${esc(ex.matiere)} — ${esc(ex.competence)}</span>
        </div>
        <p class="consigne">${nl2br(ex.consigne)}</p>
        ${isGeo ? '<div class="figure-box"><span class="figure-label">Figure</span></div>' : ''}
        <div class="reponse">
          <div class="ligne"></div>
          <div class="ligne"></div>
          <div class="ligne"></div>
          ${isGeo ? '<div class="ligne"></div><div class="ligne"></div>' : ''}
        </div>
      </div>`;
    })
    .join('\n');

  const correctionsHtml = session.exercises
    .map((ex, i) => `
      <div class="corr">
        <div class="exo-head">
          <span class="exo-num">Exercice ${i + 1}</span>
          <span class="exo-mat">${esc(ex.matiere)} — ${esc(ex.competence)}</span>
        </div>
        <p class="corr-consigne"><em>${nl2br(ex.consigne)}</em></p>
        <p class="corr-body">${nl2br(ex.correction)}</p>
        ${ex.phraseParent ? `<p class="phrase-parent"><strong>Pour guider sans donner la réponse :</strong> ${esc(ex.phraseParent)}</p>` : ''}
      </div>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<style>
  @page { margin: 18mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #000; background: #fff; margin: 0; font-size: 12pt; line-height: 1.45; }
  .page-eleve { page-break-after: always; }
  header { border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: baseline; }
  h1 { font-size: 14pt; margin: 0; font-weight: bold; }
  .meta { font-size: 10pt; }
  .exo { margin-bottom: 22px; page-break-inside: avoid; }
  .exo-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .exo-num { font-weight: bold; font-size: 11.5pt; }
  .exo-mat { font-size: 9.5pt; }
  .consigne { margin: 4px 0 10px 0; }
  .reponse { margin-top: 6px; }
  .ligne { border-bottom: 1px solid #999; height: 26px; }
  .figure-box { border: 1px solid #666; height: 150px; margin: 8px 0; position: relative; }
  .figure-label { position: absolute; top: 3px; left: 6px; font-size: 8.5pt; color: #666; }
  .corr { margin-bottom: 18px; page-break-inside: avoid; }
  .corr-consigne { font-size: 10pt; margin: 3px 0 6px 0; }
  .corr-body { margin: 0 0 6px 0; }
  .phrase-parent { font-size: 10.5pt; border-left: 2px solid #000; padding-left: 8px; margin: 6px 0 0 0; }
  footer { font-size: 9pt; text-align: right; margin-top: 20px; }
</style>
</head>
<body>

<section class="page-eleve">
  <header>
    <h1>Drill du jour — ${esc(childName)} (${esc(classe)})</h1>
    <span class="meta">${esc(dateFr)} · ${session.dureeMin} min · Page 1/2</span>
  </header>
  ${exercisesHtml}
  <footer>PROF PARENT IA — Feuille élève</footer>
</section>

<section class="page-correction">
  <header>
    <h1>Corrections — réservé au parent</h1>
    <span class="meta">${esc(dateFr)} · Page 2/2</span>
  </header>
  ${correctionsHtml}
  <footer>PROF PARENT IA — Feuille correction</footer>
</section>

</body>
</html>`;
}
