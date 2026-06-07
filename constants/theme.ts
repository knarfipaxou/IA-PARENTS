export const T = {
  // Brand
  primary: '#0E9D6A',
  primaryDeep: '#0A7A52',
  primarySoft: '#E2F3EB',
  // Hero (dark panel)
  heroFrom: '#12463A',
  heroTo: '#0B2A23',
  // Surfaces
  bg: '#F6F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F4F1',
  // Text
  ink: '#13241D',
  sub: '#5C6B63',
  faint: '#90A097',
  // Lines
  line: 'rgba(19,36,29,0.08)',
  lineStrong: 'rgba(19,36,29,0.14)',
  // On primary
  onPrimary: '#FFFFFF',
  // Accents
  blue:   { fg: '#2F5BD0', soft: '#E7EDFB', solid: '#3B5BD9' },
  amber:  { fg: '#C7791C', soft: '#FBEEDA', solid: '#EFA02E' },
  coral:  { fg: '#D6543F', soft: '#FCE7E1', solid: '#F0654C' },
  violet: { fg: '#6030A8', soft: '#EFE8FB', solid: '#7A45C7' },
  green:  { fg: '#0A7A52', soft: '#E2F3EB', solid: '#0E9D6A' },
} as const;

export type AccentKey = 'blue' | 'amber' | 'coral' | 'violet' | 'green';

export function accent(key: AccentKey) {
  return T[key];
}
