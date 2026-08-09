// Palette partagée « T » — repointée sur la NOUVELLE VOIE GRAPHIQUE (handoff
// Kitsune, sombre). Les clés sont inchangées : tous les écrans/atomes qui lisent
// `T` (Card, Squircle, TopBar, Btn, result, lessons, add-child, edit-child,
// manual-deadline, lesson-detail, echeance-edit, archived-children,
// mission-rappel…) basculent en sombre sans modification.
export const T = {
  // Brand (vert parent handoff)
  primary: '#16B26E',
  primaryDeep: '#0D8C56',
  primarySoft: 'rgba(22,178,110,0.16)',
  // Hero (panneau sombre) — dégradé de carte
  heroFrom: '#1F3A6B',
  heroTo: '#16234A',
  // Surfaces (sombre)
  bg: '#0F1424',
  surface: '#1B2238',
  surfaceAlt: 'rgba(255,255,255,0.05)',
  // Textes
  ink: '#FFFFFF',
  sub: '#96A3CC',
  faint: '#5D6890',
  // Lignes
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.14)',
  // Sur primaire
  onPrimary: '#062E1E',
  // Accents : fg = teinte claire (texte/icône), soft = fond pastille sombre, solid = aplat
  blue:   { fg: '#7FAAFF', soft: 'rgba(59,125,255,0.16)', solid: '#3B7DFF' },
  amber:  { fg: '#FFB020', soft: 'rgba(255,176,32,0.16)', solid: '#FFB020' },
  coral:  { fg: '#FF9683', soft: 'rgba(255,107,90,0.16)', solid: '#FF6B5A' },
  violet: { fg: '#C4A2FF', soft: 'rgba(169,123,255,0.16)', solid: '#A97BFF' },
  green:  { fg: '#3FD694', soft: 'rgba(22,178,110,0.16)', solid: '#16B26E' },
} as const;

export type AccentKey = 'blue' | 'amber' | 'coral' | 'violet' | 'green';

export function accent(key: AccentKey) {
  return T[key];
}
