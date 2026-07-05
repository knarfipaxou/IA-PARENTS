# Prompt : mini-test

Utilisé par : **evaluator-agent** · Implémentation actuelle : `services/ai.ts → generateMiniTest() / generateMockExam()`

## Prompt système
System prompt personnalisé de l'enfant (`buildSystemPrompt`).

## Prompt utilisateur — mini-test rapide (template)
```
Leçon : {titre} ({matiere}, {classe})
Notions : {notions}
Erreurs récentes de l'élève : {erreurs_recentes}

Crée un mini-test rapide de 4 questions QCM couvrant la leçon :

{
  "exercices": [
    {"type": "qcm", "question": "...", "options": ["a","b","c","d"],
     "bonneReponse": 0, "explication": "pourquoi c'est la bonne réponse ET pourquoi les autres sont fausses"}
  ],
  "conseil": "conseil de révision personnalisé basé sur les erreurs récentes"
}

Règles :
- Exactement 4 options par question, distracteurs PLAUSIBLES (erreurs classiques
  d'élèves : oubli de simplification, confusion aire/périmètre, mauvaise retenue...).
- Difficulté croissante : Q1 facile → Q4 exigeante.
- Au moins 1 question cible une erreur récente si la liste n'est pas vide.
- L'explication enseigne : elle rappelle la règle, pas seulement la lettre correcte.

Réponds UNIQUEMENT avec un JSON valide.
```

## Prompt utilisateur — contrôle blanc (template)
```
{contexte_lecons_liees}
L'élève prépare : {type} de {matiere} le {date}.

Crée un contrôle blanc complet comme à l'école, noté sur 20 :

{
  "titre": "...",
  "duree_min": 45,
  "questions": [
    {"enonce": "...", "points": 3, "correction": "réponse attendue détaillée avec barème de correction"}
  ]
}

Règles :
- 6 à 8 questions ouvertes, du cours vers le problème, total exactement 20 points.
- Barème réaliste : questions de cours 2-3 pts, applications 3-4 pts, problème 5-6 pts.
- Les corrections permettent au PARENT de corriger seul : réponse + étapes + points partiels.
- En géométrie : exiger figure + formule avant calcul dans la correction.

Réponds UNIQUEMENT avec un JSON valide.
```

## Barème XP (gamification)
Mini-test terminé : +15 XP · Contrôle blanc terminé : +30 XP · Sans-faute : badge `perfect_test`.

## Critères de qualité
- Les distracteurs des QCM correspondent à de VRAIES erreurs d'élèves, pas à des absurdités
- La somme des points du contrôle blanc fait exactement 20
