// Icônes 3D des matières (banque fournie, versions sombre et claire)
export interface SubjectDef {
  key: string;
  label: string;
  match: RegExp;
  dark: any;
  light: any;
}

export const SUBJECTS: SubjectDef[] = [
  { key: 'maths', label: 'Maths', match: /math|calcul|conversion|éval|eval|géom|geom|fraction/i, dark: require('../assets/subjects/dark_maths.png'), light: require('../assets/subjects/light_maths.png') },
  { key: 'francais', label: 'Français', match: /fran|lettre|dictée|dictee|lecture|conjugaison|grammaire|orthographe|rédaction|redaction/i, dark: require('../assets/subjects/dark_francais.png'), light: require('../assets/subjects/light_francais.png') },
  { key: 'anglais', label: 'Anglais', match: /angl|english/i, dark: require('../assets/subjects/dark_anglais.png'), light: require('../assets/subjects/light_anglais.png') },
  { key: 'espagnol', label: 'Espagnol', match: /espa|spanish/i, dark: require('../assets/subjects/dark_espagnol.png'), light: require('../assets/subjects/light_espagnol.png') },
  { key: 'latin', label: 'Latin', match: /latin|grec/i, dark: require('../assets/subjects/dark_latin.png'), light: require('../assets/subjects/light_latin.png') },
  { key: 'histgeo', label: 'Histoire-Géo', match: /hist|géo|geo|emc/i, dark: require('../assets/subjects/dark_histgeo.png'), light: require('../assets/subjects/light_histgeo.png') },
  { key: 'svt', label: 'SVT', match: /svt|bio|vie|terre|science/i, dark: require('../assets/subjects/dark_svt.png'), light: require('../assets/subjects/light_svt.png') },
  { key: 'physchim', label: 'Physique-Chimie', match: /phys|chim/i, dark: require('../assets/subjects/dark_physchim.png'), light: require('../assets/subjects/light_physchim.png') },
  { key: 'techno', label: 'Technologie', match: /techno|informat/i, dark: require('../assets/subjects/dark_techno.png'), light: require('../assets/subjects/light_techno.png') },
  { key: 'arts', label: 'Arts plastiques', match: /art|dessin|plastique/i, dark: require('../assets/subjects/dark_arts.png'), light: require('../assets/subjects/light_arts.png') },
  { key: 'musique', label: 'Musique', match: /musi/i, dark: require('../assets/subjects/dark_musique.png'), light: require('../assets/subjects/light_musique.png') },
  { key: 'eps', label: 'EPS', match: /eps|sport/i, dark: require('../assets/subjects/dark_eps.png'), light: require('../assets/subjects/light_eps.png') },
];

/** Icône 3D de la matière selon le thème (repli : Maths pour les intitulés chiffrés, sinon Français). */
export function subjectIcon(subj: string | undefined, scheme: 'light' | 'dark'): any {
  const found = SUBJECTS.find((x) => x.match.test(subj ?? ''));
  const def = found ?? SUBJECTS[0];
  return scheme === 'light' ? def.light : def.dark;
}
