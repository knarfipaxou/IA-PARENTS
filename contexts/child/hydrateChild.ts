import type { Child } from '../../data/mock';

/**
 * Normalise un enfant chargé du stockage : applique les valeurs par défaut
 * pour les champs ajoutés après coup (archived, lessonIds par échéance) afin
 * que les anciennes données enregistrées restent compatibles.
 */
export function hydrateChild(c: Child): Child {
  return {
    ...c,
    archived: c.archived ?? false,
    echeances: (c.echeances ?? []).map((e) => ({ ...e, lessonIds: e.lessonIds ?? [] })),
  } as Child;
}
