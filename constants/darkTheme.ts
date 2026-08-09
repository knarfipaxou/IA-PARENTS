// Thème Kitsune — handoff design/handoff (high-fidelity dark)
// Vert = lu/acquis · Ambre = à vérifier · Corail = erreur répétée

export const DK = {
  bg: '#0F1424',
  bgTop: '#1B2748',
  bgBottom: '#0F1424',
  bezel: '#0B0E18',
  nav: '#141A2F',
  card: 'rgba(255,255,255,0.06)',
  cardSolid: '#1B2238',
  cardBorder: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.14)',
  ink: '#FFFFFF',
  sub: '#96A3CC',
  faint: '#5D6890',
  // Parent primary
  primary: '#16B26E',
  primaryDeep: '#0D8C56',
  primaryLight: '#3FD694',
  onPrimary: '#062E1E',
  // Child accent
  cyan: '#35E4D2',
  cyanDeep: '#1BB3A3',
  onCyan: '#06322D',
  // Accents
  blue: '#3B7DFF',
  blueLight: '#7FAAFF',
  amber: '#FFB020',
  onAmber: '#4A3000',
  coral: '#FF6B5A',
  coralLight: '#FF9683',
  violet: '#A97BFF',
  violetLight: '#C4A2FF',
  // XP / gold (kept for gamification)
  xpFrom: '#FF3D8A',
  xpMid: '#FF7A3D',
  xpTo: '#FFC24B',
  gold: '#F5C24B',
  red: '#FF6B5A',
  green: '#16B26E',
  // Spacing
  screenPadX: 22,
  screenPadXWelcome: 26,
  screenPadTop: 60,
  screenPadBottom: 34,
  radiusBtn: 18,
  radiusCard: 16,
  radiusPill: 999,
} as const;

/** Teinte pastille = accent @ 16–18 % d'opacité. */
export function softTint(rgb: string, alpha = 0.16): string {
  // rgb like "22,178,110" or hex "#16B26E"
  if (rgb.startsWith('#')) {
    const h = rgb.slice(1);
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(${rgb},${alpha})`;
}

export const Fonts = {
  display: 'Fredoka_600SemiBold',
  displayMed: 'Fredoka_500Medium',
  displayReg: 'Fredoka_400Regular',
  displayBold: 'Fredoka_700Bold',
  body: 'PlusJakartaSans_400Regular',
  bodyMed: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodyExtra: 'PlusJakartaSans_800ExtraBold',
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
  navHome: require('../assets/icons/nav_home.png'),
  navCalendar: require('../assets/icons/nav_calendar.png'),
  navProfile: require('../assets/icons/nav_profile.png'),
};

export const KITSUNE = {
  full: require('../assets/kitsune/kitsune.png'),
  head: require('../assets/kitsune/kitsune-head.png'),
  body: require('../assets/kitsune/kitsune-body.png'),
  paw: require('../assets/kitsune/kitsune-paw.png'),
  tail: require('../assets/kitsune/kitsune-tail.png'),
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

export const CHEERS: Record<string, string> = {
  CE2: 'CE2, super ! Je connais bien le programme.',
  CM1: 'CM1, top ! On va viser les fractions.',
  CM2: 'CM2, parfait ! Bientôt le collège.',
  '6e': '6e, on entre au collège !',
  '5e': '5e, on passe la vitesse supérieure !',
  default: 'Bien joué !',
};

export const HANDOFF_CLASSES = [
  { id: 'CE2', short: 'CE2', label: 'CE2 · 8-9 ans', tint: '#3B7DFF', tileFg: '#7FAAFF' },
  { id: 'CM1', short: 'CM1', label: 'CM1 · 9-10 ans', tint: '#FFB020', tileFg: '#FFB020' },
  { id: 'CM2', short: 'CM2', label: 'CM2 · 10-11 ans', tint: '#16B26E', tileFg: '#3FD694' },
  { id: '6e', short: '6e', label: '6e · 11-12 ans', tint: '#A97BFF', tileFg: '#C4A2FF' },
  { id: '5e', short: '5e', label: '5e · 12-13 ans', tint: '#FF6B5A', tileFg: '#FF9683' },
] as const;

export const FAMILY_COLORS = ['#16B26E', '#3B7DFF', '#FFB020', '#A97BFF', '#FF6B5A'] as const;
