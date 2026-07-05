# Prompt : flashcards

Utilisé par : **evaluator-agent** / **pedagogy-agent** · Implémentation actuelle : `services/ai.ts → generateFlashcards()`

## Prompt système
System prompt personnalisé de l'enfant (`buildSystemPrompt`) ou, à défaut, le système générique professeur particulier.

## Prompt utilisateur (template)
```
Leçon : {titre} ({matiere}, {classe})
Notions : {notions}
Résumé : {resume}
Points faibles de l'élève : {points_faibles}

Crée 8 à 10 flashcards pour mémoriser APRÈS avoir compris (pas de par-cœur
sur une notion non expliquée) :

{
  "cards": [
    {"recto": "question courte et précise", "verso": "réponse courte", "type": "definition|formule|application|piege"}
  ]
}

Règles :
- Recto : une seule question, formulée simplement, adaptée à la classe {classe}.
- Verso : réponse courte (1-2 phrases max) — une flashcard n'est pas une leçon.
- Varier les types : définitions, formules, mini-applications ("Simplifie 6/8"), pièges classiques.
- Au moins 2 cartes ciblent les points faibles listés quand la leçon s'y prête.
- Formules : le recto demande la formule ("Aire du trapèze ?"), le verso la donne
  avec la signification de chaque lettre.
- Jamais deux cartes redondantes.

Réponds UNIQUEMENT avec un JSON valide.
```

## Paramètres recommandés
- max_tokens : 3072

## Usage dans l'app
Chaque retournement de carte = +2 XP (gamification). Les cartes ratées deux fois
de suite devraient être re-proposées en début de session suivante (répétition espacée
— point d'extension, voir docs).

## Critères de qualité
- Chaque verso tient en 2 phrases maximum
- Aucune carte ne teste une notion absente de la leçon source
