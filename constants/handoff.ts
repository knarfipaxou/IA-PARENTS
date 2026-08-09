// Tokens de la « nouvelle voie graphique » — handoff design Kitsune.
// Valeurs DÉFINITIVES issues du README de handoff (design_handoff_ia_parents).
// Objet de référence pour porter les 21 écrans au pixel près et l'aligner
// progressivement avec le thème sombre existant (constants/darkTheme.ts).

/** Palette (README §Design tokens > Couleurs). */
export const HC = {
  // Fonds
  bgApp: '#0F1424',
  bgBezel: '#0B0E18',
  // Dégradé radial en haut d'écran
  gradTop: '#1B2748',
  gradBottom: '#0F1424',
  // Surfaces cartes (verre)
  cardFrom: 'rgba(255,255,255,0.05)',
  cardTo: 'rgba(255,255,255,0.07)',
  cardBorder: 'rgba(255,255,255,0.08)',
  // Bordure input / bouton secondaire
  inputBorder: 'rgba(255,255,255,0.14)',
  // Textes
  ink: '#FFFFFF',
  sub: '#96A3CC',
  faint: '#5D6890',
  // Vert primaire — actions parent (effet bouton Duolingo)
  green: '#16B26E',
  greenShadow: '#0D8C56',
  greenLight: '#3FD694',
  onGreen: '#062E1E',
  // Cyan — univers enfant
  cyan: '#35E4D2',
  onCyan: '#062A26',
  // Autres accents
  blue: '#3B7DFF',
  blueLight: '#7FAAFF',
  amber: '#FFB020',
  onAmber: '#4A3000',
  coral: '#FF6B5A',
  coralLight: '#FF9683',
  violet: '#A97BFF',
  violetLight: '#C4A2FF',
} as const;

/** Teinte de fond d'une pastille = accent à 16 % d'opacité (README). */
export const tintBg: Record<string, string> = {
  green: 'rgba(22,178,110,0.16)',
  cyan: 'rgba(53,228,210,0.16)',
  blue: 'rgba(59,125,255,0.16)',
  amber: 'rgba(255,176,32,0.16)',
  coral: 'rgba(255,107,90,0.16)',
  violet: 'rgba(169,123,255,0.16)',
};

/** Code couleur IA (README) : statut de lecture d'un contenu. */
export const AI_STATUS = {
  lu: HC.green, // contenu lu et acquis
  aVerifier: HC.amber, // à vérifier par le parent
  erreur: HC.coral, // erreur répétée
} as const;

/**
 * Familles de police chargées via @expo-google-fonts (voir app/_layout.tsx).
 * Fredoka : titres, boutons, chiffres. Plus Jakarta Sans : corps, libellés.
 */
export const FONT = {
  title: 'Fredoka_600SemiBold',
  titleBold: 'Fredoka_700Bold',
  num: 'Fredoka_500Medium',
  numReg: 'Fredoka_400Regular',
  body: 'PlusJakartaSans_400Regular',
  bodyMed: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodyExtra: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Échelle typographique (README §Typographie). */
export const TYPE = {
  h1: { fontFamily: FONT.title, fontSize: 31, lineHeight: 36, letterSpacing: -0.3 },
  screenTitle: { fontFamily: FONT.title, fontSize: 25 },
  cardTitle: { fontFamily: FONT.bodyBold, fontSize: 16 },
  body: { fontFamily: FONT.body, fontSize: 15, lineHeight: 23 },
  meta: { fontFamily: FONT.bodyMed, fontSize: 12.5, color: HC.sub },
  btnLabel: { fontFamily: FONT.title, fontSize: 18 },
  microLabel: { fontFamily: FONT.bodySemi, fontSize: 11.5 },
} as const;

/** Échelle d'espacement 4px (README §Espacement). */
export const SP = {
  xs: 4,
  s: 8,
  m: 12,
  md: 14,
  l: 18,
  xl: 22,
  xxl: 26,
  h: 34,
  hh: 44,
  screenH: 22, // marge horizontale d'écran (26 sur l'écran de bienvenue)
  welcomeH: 26,
  screenTop: 60, // padding haut (sous encoche)
  screenBottom: 34,
} as const;

/** Rayons (README §Rayons). */
export const R = {
  btn: 18,
  cardMain: 18,
  card: 16,
  iconTile: 15,
  chip: 999,
  bezel: 44,
} as const;
