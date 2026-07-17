// Icônes 3D des matières (banque fournie, versions sombre et claire).
// La correspondance matière → clé est pure et testée dans subjectMatch.ts ;
// ce fichier ne fait que l'associer à la table d'images (couplée à l'UI).
import { SUBJECT_MATCHES, matchSubjectKey } from './subjectMatch';

export interface SubjectDef {
  key: string;
  label: string;
  match: RegExp;
  dark: any;
  light: any;
}

const ASSETS: Record<string, { dark: any; light: any }> = {
  maths: { dark: require('../assets/subjects/dark_maths.png'), light: require('../assets/subjects/light_maths.png') },
  francais: { dark: require('../assets/subjects/dark_francais.png'), light: require('../assets/subjects/light_francais.png') },
  histoire: { dark: require('../assets/subjects/dark_histoire.png'), light: require('../assets/subjects/light_histoire.png') },
  geographie: { dark: require('../assets/subjects/dark_geographie.png'), light: require('../assets/subjects/light_geographie.png') },
  emc: { dark: require('../assets/subjects/dark_emc.png'), light: require('../assets/subjects/light_emc.png') },
  svt: { dark: require('../assets/subjects/dark_svt.png'), light: require('../assets/subjects/light_svt.png') },
  physchim: { dark: require('../assets/subjects/dark_physchim.png'), light: require('../assets/subjects/light_physchim.png') },
  techno: { dark: require('../assets/subjects/dark_techno.png'), light: require('../assets/subjects/light_techno.png') },
  informatique: { dark: require('../assets/subjects/dark_informatique.png'), light: require('../assets/subjects/light_informatique.png') },
  anglais: { dark: require('../assets/subjects/dark_anglais.png'), light: require('../assets/subjects/light_anglais.png') },
  espagnol: { dark: require('../assets/subjects/dark_espagnol.png'), light: require('../assets/subjects/light_espagnol.png') },
  allemand: { dark: require('../assets/subjects/dark_allemand.png'), light: require('../assets/subjects/light_allemand.png') },
  italien: { dark: require('../assets/subjects/dark_italien.png'), light: require('../assets/subjects/light_italien.png') },
  latin: { dark: require('../assets/subjects/dark_latin.png'), light: require('../assets/subjects/light_latin.png') },
  grec: { dark: require('../assets/subjects/dark_grec.png'), light: require('../assets/subjects/light_grec.png') },
  arts: { dark: require('../assets/subjects/dark_arts.png'), light: require('../assets/subjects/light_arts.png') },
  musique: { dark: require('../assets/subjects/dark_musique.png'), light: require('../assets/subjects/light_musique.png') },
  eps: { dark: require('../assets/subjects/dark_eps.png'), light: require('../assets/subjects/light_eps.png') },
};

export const SUBJECTS: SubjectDef[] = SUBJECT_MATCHES.map((m) => ({ ...m, ...ASSETS[m.key] }));

/** Icône 3D de la matière selon le thème (repli : Maths pour les intitulés non reconnus). */
export function subjectIcon(subj: string | undefined, scheme: 'light' | 'dark'): any {
  const key = matchSubjectKey(subj);
  return scheme === 'light' ? ASSETS[key].light : ASSETS[key].dark;
}
