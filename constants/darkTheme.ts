// Thème sombre néon — direction artistique des wireframes Claude Design
// (fond #0A0E22→#141B3C, cartes verre, accent cyan #35E4D2, XP rose→orange→or)
export const DK = {
  bgTop: '#0A0E22',
  bgBottom: '#141B3C',
  card: 'rgba(148,168,255,0.07)',
  cardBorder: 'rgba(148,168,255,0.18)',
  ink: '#FFFFFF',
  sub: '#96A3CC',
  faint: '#5D6890',
  cyan: '#35E4D2',
  xpFrom: '#FF3D8A',
  xpMid: '#FF7A3D',
  xpTo: '#FFC24B',
  gold: '#F5C24B',
  red: '#FF6B5A',
  green: '#34D696',
  blue: '#5A8CFF',
  violet: '#B266FF',
  amber: '#FF9E2C',
} as const;

export const DK_ICONS = {
  avatar: require('../assets/icons/avatar.png'),
  target: require('../assets/icons/target.png'),
  flame: require('../assets/icons/flame.png'),
  lightning: require('../assets/icons/lightning.png'),
  scan: require('../assets/icons/scan.png'),
  agenda: require('../assets/icons/agenda.png'),
  trophy: require('../assets/icons/trophy.png'),
  book: require('../assets/icons/book.png'),
  planning: require('../assets/icons/planning.png'),
  music: require('../assets/icons/music.png'),
  sqrt: require('../assets/icons/sqrt.png'),
  calculator: require('../assets/icons/calculator.png'),
  warning: require('../assets/icons/warning.png'),
  flashcards: require('../assets/icons/flashcards.png'),
  pencil: require('../assets/icons/pencil.png'),
  medal: require('../assets/icons/medal.png'),
  clock: require('../assets/icons/clock.png'),
  profile: require('../assets/icons/profile.png'),
};

/** Icône illustrée par matière (listes contrôles/leçons). */
export function dkIconForSubject(subj?: string) {
  const s = (subj ?? '').toLowerCase();
  if (s.includes('musi')) return DK_ICONS.music;
  if (s.includes('math')) return DK_ICONS.sqrt;
  if (s.includes('fran') || s.includes('lect')) return DK_ICONS.book;
  if (s.includes('calc')) return DK_ICONS.calculator;
  return DK_ICONS.planning;
}
