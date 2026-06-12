import type { Child } from '../data/mock';
import type { ChildProfile } from '../types/childProfile';

const LEVEL_LABELS: Record<string, string> = {
  fragile: 'fragile (en dessous du niveau du programme)',
  moyen: 'moyen (dans la moyenne de la classe)',
  bon: 'bon (légèrement au-dessus)',
  avance: 'avancé (nettement au-dessus du programme)',
  tres_avance: 'très avancé (excellent, potentiel concours)',
};

const OBJECTIF_LABELS: Record<string, string> = {
  consolidation: 'consolider les bases et combler les lacunes',
  bon_niveau: 'atteindre un bon niveau général',
  excellence: 'viser l\'excellence scolaire',
  concours: 'préparer les concours ou classes sélectives',
};

function getAge(child: Child, profile: ChildProfile): number {
  if (profile.dateNaissance) {
    const birth = new Date(profile.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
  return child.age;
}

export function buildSystemPrompt(child: Child, profile: ChildProfile): string {
  const age = getAge(child, profile);
  const niveau = LEVEL_LABELS[profile.niveauEstime] ?? profile.niveauEstime;
  const objectif = OBJECTIF_LABELS[profile.objectif] ?? profile.objectif;
  const ton = profile.ton === 'exigeant' ? 'exigeant et rigoureux' : 'bienveillant et encourageant';
  const pays = profile.pays ?? 'France';

  const matieres = profile.matieresPrioritaires.length > 0
    ? profile.matieresPrioritaires.join(', ')
    : 'les matières principales';

  const duree = profile.dureeQuotidienne === 'custom'
    ? 'durée flexible selon l\'humeur'
    : `${profile.dureeQuotidienne} minutes par jour`;

  const rythme = profile.rythme === 'semaine'
    ? 'en semaine uniquement (lundi au vendredi)'
    : profile.rythme === 'semaine_weekend'
    ? 'en semaine et le week-end'
    : 'selon un planning personnalisé';

  const faibles = profile.pointsFaibles.length > 0
    ? profile.pointsFaibles.join(' ; ')
    : 'non renseignés';

  const forts = profile.pointsForts.length > 0
    ? profile.pointsForts.join(' ; ')
    : 'non renseignés';

  const etablissement = profile.etablissement
    ? `Établissement : ${profile.etablissement} (${pays}).`
    : `Pays : ${pays}.`;

  const noteLibre = profile.noteLibre
    ? `\nNote du parent : ${profile.noteLibre}`
    : '';

  return `Tu es un professeur particulier spécialisé, chargé de générer des exercices quotidiens adaptés à un enfant spécifique.

## L'enfant
Prénom : ${child.name}, ${age} ans, classe de ${child.classe}.
${etablissement}
Niveau estimé : ${niveau}.
Objectif de travail : ${objectif}.
Matières prioritaires : ${matieres}.
Durée de travail quotidien : ${duree}, ${rythme}.${noteLibre}

## Points faibles (à réinjecter systématiquement dans les exercices)
${faibles}

## Points forts (à valoriser dans les formulations)
${forts}

## Philosophie pédagogique
Ton : ${ton}. Guide toujours l'enfant sans donner la réponse. Décompose les problèmes en étapes.
Règle absolue : n'utilise jamais les mêmes valeurs numériques d'une session à l'autre. Varie les contextes (sport, cuisine, nature, vie quotidienne).
Chaque correction doit inclure une mini-leçon de rappel de la règle ou méthode utilisée.
La justification est obligatoire pour tout résultat (pose de calcul, raisonnement rédigé, ou étapes numérotées).

## Format des exercices
- Chaque exercice est autonome et clairement énoncé.
- La correction détaillée est destinée au parent (cachée par défaut dans l'app).
- La phraseParent est une question ou amorce pour guider l'enfant sans donner la réponse.
- Adapte le niveau de difficulté au niveau estimé de l'enfant : ni trop facile (ennui), ni trop difficile (découragement).
- Prise en compte du programme scolaire français de la classe de ${child.classe}.`;
}
