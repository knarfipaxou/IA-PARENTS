// Correspondance matière → clé de matière : logique PURE, sans dépendance
// à React Native ni aux assets (images). Extrait de subjectIcons.ts pour
// pouvoir être testé indépendamment de l'UI.
// L'ORDRE compte : la première expression qui matche gagne (ex. « géométrie »
// est capté par maths avant que « géo » ne capte géographie).

export interface SubjectMatch {
  key: string;
  label: string;
  match: RegExp;
}

export const SUBJECT_MATCHES: SubjectMatch[] = [
  { key: 'maths', label: 'Mathématiques', match: /math|calcul|conversion|géom|geom|fraction/i },
  { key: 'francais', label: 'Français', match: /fran|lettre|dictée|dictee|lecture|conjugaison|grammaire|orthographe|rédaction|redaction|poésie|poesie/i },
  { key: 'histoire', label: 'Histoire', match: /hist/i },
  { key: 'geographie', label: 'Géographie', match: /géo|geo/i },
  { key: 'emc', label: 'EMC', match: /emc|moral|civique/i },
  { key: 'svt', label: 'SVT', match: /svt|bio|vie|terre/i },
  { key: 'physchim', label: 'Physique-Chimie', match: /phys|chim/i },
  { key: 'techno', label: 'Technologie', match: /techno/i },
  { key: 'informatique', label: 'Informatique', match: /informat|nsi|snt|code|programmation/i },
  { key: 'anglais', label: 'Anglais', match: /angl|english/i },
  { key: 'espagnol', label: 'Espagnol', match: /espa|spanish/i },
  { key: 'allemand', label: 'Allemand', match: /allem|deutsch/i },
  { key: 'italien', label: 'Italien', match: /ital/i },
  { key: 'latin', label: 'Latin', match: /latin/i },
  { key: 'grec', label: 'Grec', match: /grec/i },
  { key: 'arts', label: 'Arts plastiques', match: /art|dessin|plastique/i },
  { key: 'musique', label: 'Éducation musicale', match: /musi/i },
  { key: 'eps', label: 'EPS', match: /eps|sport/i },
];

/** Clé de matière correspondant à un intitulé libre ; repli sur "maths" si aucune ne correspond. */
export function matchSubjectKey(subj: string | undefined): string {
  const found = SUBJECT_MATCHES.find((x) => x.match.test(subj ?? ''));
  return (found ?? SUBJECT_MATCHES[0]).key;
}
