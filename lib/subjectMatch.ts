// Correspondance matière → clé de matière : logique PURE, sans dépendance
// à React Native ni aux assets (images). Extrait de subjectIcons.ts pour
// pouvoir être testé indépendamment de l'UI.

export interface SubjectMatch {
  key: string;
  label: string;
  match: RegExp;
}

export const SUBJECT_MATCHES: SubjectMatch[] = [
  { key: 'maths', label: 'Maths', match: /math|calcul|conversion|éval|eval|géom|geom|fraction/i },
  { key: 'francais', label: 'Français', match: /fran|lettre|dictée|dictee|lecture|conjugaison|grammaire|orthographe|rédaction|redaction/i },
  { key: 'anglais', label: 'Anglais', match: /angl|english/i },
  { key: 'espagnol', label: 'Espagnol', match: /espa|spanish/i },
  { key: 'latin', label: 'Latin', match: /latin|grec/i },
  { key: 'histgeo', label: 'Histoire-Géo', match: /hist|géo|geo|emc/i },
  { key: 'svt', label: 'SVT', match: /svt|bio|vie|terre|science/i },
  { key: 'physchim', label: 'Physique-Chimie', match: /phys|chim/i },
  { key: 'techno', label: 'Technologie', match: /techno|informat/i },
  { key: 'arts', label: 'Arts plastiques', match: /art|dessin|plastique/i },
  { key: 'musique', label: 'Musique', match: /musi/i },
  { key: 'eps', label: 'EPS', match: /eps|sport/i },
];

/** Clé de matière correspondant à un intitulé libre ; repli sur "maths" si aucune ne correspond. */
export function matchSubjectKey(subj: string | undefined): string {
  const found = SUBJECT_MATCHES.find((x) => x.match.test(subj ?? ''));
  return (found ?? SUBJECT_MATCHES[0]).key;
}
