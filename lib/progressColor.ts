// Couleur des barres de progression : plages STRICTES par palier.
//  0-39 % rouge · 40-59 % orange · 60-70 % jaune · 71-79 % bleu ·
//  80-89 % turquoise · 90-100 % vert
// La transition vers la couleur suivante n'apparaît que légèrement, en fin
// de plage, et ne déborde JAMAIS sur les paliers voisins (à 70 % : jaune
// sans dominante orange ; le bleu ne commence qu'à 71 %).

const BANDS: { from: number; to: number; color: string }[] = [
  { from: 0, to: 39, color: '#FF4D4D' }, // rouge
  { from: 40, to: 59, color: '#FF8A3D' }, // orange
  { from: 60, to: 70, color: '#FFD34D' }, // jaune
  { from: 71, to: 79, color: '#4D7DFF' }, // bleu
  { from: 80, to: 89, color: '#35E4D2' }, // turquoise
  { from: 90, to: 100, color: '#3DDC7A' }, // vert
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
function mix(c0: string, c1: string, t: number): string {
  const [r0, g0, b0] = hexToRgb(c0);
  const [r1, g1, b1] = hexToRgb(c1);
  return rgbToHex(r0 + (r1 - r0) * t, g0 + (g1 - g0) * t, b0 + (b1 - b0) * t);
}

/** Couleur du palier correspondant au pourcentage (0-100). */
export function progressColor(pct: number): string {
  const p = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < BANDS.length; i++) {
    const b = BANDS[i];
    if (p <= b.to || i === BANDS.length - 1) {
      const next = BANDS[i + 1];
      if (!next) return b.color;
      // léger rapprochement vers la couleur suivante sur les 4 derniers points
      // du palier, plafonné à 35 % de mélange (jamais la couleur suivante pleine)
      const blendStart = b.to - 4;
      if (p >= blendStart) {
        const t = ((p - blendStart) / (b.to - blendStart)) * 0.35;
        return mix(b.color, next.color, t);
      }
      return b.color;
    }
  }
  return BANDS[BANDS.length - 1].color;
}

/**
 * Paire de couleurs pour un remplissage : teinte unique du palier
 * (léger éclaircissement en tête de barre), sans déborder sur les
 * paliers précédents.
 */
export function progressGradient(pct: number): [string, string] {
  const c = progressColor(pct);
  return [mix(c, '#FFFFFF', 0.12), c];
}
