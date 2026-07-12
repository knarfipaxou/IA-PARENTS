// Couleur des barres de progression selon le pourcentage :
// 0 % rouge → 40 % orange → 60 % jaune → 75 % bleu → 80 % turquoise → 90 %+ vert
// Interpolation continue entre les paliers.

const STOPS: [number, string][] = [
  [0, '#FF4D4D'],
  [40, '#FF8A3D'],
  [60, '#FFD34D'],
  [75, '#4D7DFF'],
  [80, '#35E4D2'],
  [90, '#3DDC7A'],
  [100, '#2ECC71'],
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/** Couleur correspondant à un pourcentage (0-100), interpolée entre les paliers. */
export function progressColor(pct: number): string {
  const p = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (p <= p1) {
      const t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      const [r0, g0, b0] = hexToRgb(c0);
      const [r1, g1, b1] = hexToRgb(c1);
      return rgbToHex(r0 + (r1 - r0) * t, g0 + (g1 - g0) * t, b0 + (b1 - b0) * t);
    }
  }
  return STOPS[STOPS.length - 1][1];
}

/** Paire de couleurs pour un remplissage en dégradé (début → pointe de la barre). */
export function progressGradient(pct: number): [string, string] {
  return [progressColor(Math.max(0, pct - 30)), progressColor(pct)];
}
