// Tokens light (écrans legacy) + accents partagés.
// Le design Kitsune (dark) vit dans constants/darkTheme.ts — source de vérité visuelle.

export const T = {
  // Brand — alignés Kitsune pour cohérence cross-mode
  primary: '#16B26E',
  primaryDeep: '#0D8C56',
  primarySoft: 'rgba(22,178,110,0.14)',
  // Hero (dark panel)
  heroFrom: '#1B2748',
  heroTo: '#0F1424',
  // Surfaces light (legacy)
  bg: '#F6F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F4F1',
  // Text light
  ink: '#13241D',
  sub: '#5C6B63',
  faint: '#90A097',
  // Lines
  line: 'rgba(19,36,29,0.08)',
  lineStrong: 'rgba(19,36,29,0.14)',
  // On primary (Kitsune: texte sombre sur vert)
  onPrimary: '#062E1E',
  // Accents — hex Kitsune
  blue:   { fg: '#3B7DFF', soft: 'rgba(59,125,255,0.16)', solid: '#3B7DFF' },
  amber:  { fg: '#FFB020', soft: 'rgba(255,176,32,0.16)', solid: '#FFB020' },
  coral:  { fg: '#FF6B5A', soft: 'rgba(255,107,90,0.16)', solid: '#FF6B5A' },
  violet: { fg: '#A97BFF', soft: 'rgba(169,123,255,0.16)', solid: '#A97BFF' },
  green:  { fg: '#0D8C56', soft: 'rgba(22,178,110,0.16)', solid: '#16B26E' },
} as const;

export type AccentKey = 'blue' | 'amber' | 'coral' | 'violet' | 'green';

export function accent(key: AccentKey) {
  return T[key];
}
