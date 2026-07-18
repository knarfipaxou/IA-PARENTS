// Cycles officiels de l'Éducation nationale — logique pure testée.
// C1 : PS/MS/GS · C2 : CP/CE1/CE2 · C3 : CM1/CM2/6e · C4 : 5e/4e/3e · Lycée.

export type Cycle = 'cycle1' | 'cycle2' | 'cycle3' | 'cycle4' | 'lycee';

export const CYCLE_LABELS: Record<Cycle, string> = {
  cycle1: 'Cycle 1', cycle2: 'Cycle 2', cycle3: 'Cycle 3', cycle4: 'Cycle 4', lycee: 'Lycée',
};

const CYCLE_CLASSES: Record<Cycle, string[]> = {
  cycle1: ['PS', 'MS', 'GS'],
  cycle2: ['CP', 'CE1', 'CE2'],
  cycle3: ['CM1', 'CM2', '6e'],
  cycle4: ['5e', '4e', '3e'],
  lycee: ['2nde', '1re', 'Terminale'],
};

/** Cycle officiel d'une classe (null si la classe n'est pas reconnue). */
export function cycleForClasse(classe: string | undefined): Cycle | null {
  const c = (classe ?? '').toLowerCase().replace('maternelle', '').trim();
  if (/^(ps|ms|gs)$/.test(c)) return 'cycle1';
  if (/^(cp|ce1|ce2)$/.test(c)) return 'cycle2';
  if (/^(cm1|cm2|6e|6ème|6eme)$/.test(c)) return 'cycle3';
  if (/^(5e|5ème|5eme|4e|4ème|4eme|3e|3ème|3eme)$/.test(c)) return 'cycle4';
  if (/2nde|seconde|1re|première|premiere|terminale/.test(c)) return 'lycee';
  return null;
}

/** Classes appartenant à un cycle (pour afficher « plusieurs niveaux possibles »). */
export function classesForCycle(cycle: Cycle): string[] {
  return CYCLE_CLASSES[cycle];
}

/**
 * Premier ou second degré (choix du jeu de données de programmes).
 * Le cycle 3 est à cheval (CM1/CM2 = premier degré, 6e = second degré).
 */
export function degreForCycle(cycle: Cycle): 'premier' | 'second' | 'both' {
  if (cycle === 'cycle1' || cycle === 'cycle2') return 'premier';
  if (cycle === 'cycle3') return 'both';
  return 'second';
}
