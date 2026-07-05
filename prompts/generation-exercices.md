# Prompt : generation-exercices

Utilisé par : **evaluator-agent** · Implémentation actuelle : `services/ai.ts → generateExercises() / generateDrill()`

## Prompt système
Le system prompt est GÉNÉRÉ PAR ENFANT via `lib/systemPrompt.ts → buildSystemPrompt(child, profile)` :
identité, niveau réel, objectif, points faibles à réinjecter, ton, règles pédagogiques.
Ne jamais utiliser un system prompt générique quand un profil existe.

## Prompt utilisateur (template)
```
Leçon : {titre} ({matiere}, {classe})
Notions : {notions}
Résumé : {resume}

Profil : niveau {niveau_estime}, objectif {objectif}.
Points faibles à réinjecter : {points_faibles}.
Erreurs récentes : {erreurs_recentes}.
{consignes_adaptation}   ← issues de lib/adaptation.ts (baisser/monter la difficulté par notion)

Génère des exercices progressifs :

{
  "exercises": {
    "easy":   [{"consigne": "...", "reponse": "...", "correction": "raisonnement pas à pas"}],
    "medium": [{"consigne": "...", "reponse": "...", "correction": "..."}],
    "hard":   [{"consigne": "...", "reponse": "...", "correction": "...", "piege": "le piège et pourquoi"}]
  },
  "probleme": {"enonce": "situation concrète en plusieurs étapes", "etapes": ["..."], "correction": "..."},
  "questions_cours": [{"question": "...", "reponse": "..."}],
  "common_errors": [{"erreur": "...", "pourquoi": "...", "remede": "..."}]
}

Règles :
- 2-3 easy, 2-3 medium, 1-2 hard, 1 problème, 2-3 questions de cours.
- N'utilise JAMAIS les mêmes valeurs numériques, prénoms ou contextes qu'une session précédente.
- Chaque correction : rappel de la question → réponse → raisonnement étape par étape → astuce.
- Géométrie : formule écrite AVANT le calcul. Raisonnement : "Je sais que / Or / Donc".
- Fractions : simplifier avant de calculer quand c'est possible, et le dire.
- Un exercice réinjecte au moins un point faible du profil quand la leçon s'y prête.

Réponds UNIQUEMENT avec un JSON valide.
```

## Paramètres recommandés
- max_tokens : 4096 · température par défaut

## Critères de qualité
- Progressivité réelle (un « hard » n'est pas un « easy » avec de plus grands nombres)
- Toute correction refaite indépendamment par quality-review doit donner le même résultat
