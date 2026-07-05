# Architecture multi-agents — Parent Stratège IA (PROF PARENT IA)

## 1. Vue d'ensemble

L'application transforme une photo de cahier/leçon/agenda en contenus pédagogiques
personnalisés (fiche, flashcards, exercices, mini-test, planning, résumé parent) et
maintient un suivi des lacunes par enfant.

Plutôt qu'un unique gros prompt, le système est découpé en **10 agents à
responsabilité unique**, coordonnés par un orchestrateur au sein de **4 workflows**.

```
                        ┌──────────────────────┐
   Utilisateur ────────▶│  orchestrator-agent  │  (routage + assemblage)
                        └──────────┬───────────┘
        ┌───────────┬──────────────┼───────────────┬────────────┐
        ▼           ▼              ▼               ▼            ▼
  scanner-     pedagogy-      evaluator-    revision-     socratic-
   agent        agent          agent      planner-agent  coach-agent
        │           │              │               │            │
        └───────────┴──────┬───────┴───────────────┴────────────┘
                           ▼
                 ┌────────────────────┐     lecture/écriture
                 │ quality-review     │◀──────────────────────┐
                 │ (veto obligatoire) │                       │
                 └─────────┬──────────┘              ┌────────┴────────┐
                           ▼                         │ profile-memory  │
                 ┌────────────────────┐              │     agent       │
                 │ parent-summary +   │              └─────────────────┘
                 │ gamification       │
                 └─────────┬──────────┘
                           ▼
                      Utilisateur
```

## 2. Rôle de chaque agent

| Agent | Responsabilité unique | Fichier |
|---|---|---|
| scanner-agent | Extraire (sans inventer) le contenu d'une photo/texte | agents/scanner-agent.md |
| pedagogy-agent | Expliquer pour faire comprendre (socratique, adapté) | agents/pedagogy-agent.md |
| evaluator-agent | Créer/corriger les exercices, détecter les signaux | agents/evaluator-agent.md |
| revision-planner-agent | Planning réaliste à répétition espacée (J-20→J-1) | agents/revision-planner-agent.md |
| gamification-agent | Motivation saine : XP, badges, missions, streak | agents/gamification-agent.md |
| parent-summary-agent | Résumé 7 blocs immédiatement actionnable | agents/parent-summary-agent.md |
| quality-review-agent | Contrôle qualité avec droit de veto | agents/quality-review-agent.md |
| orchestrator-agent | Routage des demandes, ordre d'exécution, erreurs | agents/orchestrator-agent.md |
| profile-memory-agent | Historique pédagogique par enfant, moteur de progression | agents/profile-memory-agent.md |
| socratic-coach-agent | Faire réfléchir : question→indices→guidage→correction | agents/socratic-coach-agent.md |

## 3. Les 4 workflows

| Workflow | Déclencheur | Chaîne | Fichier |
|---|---|---|---|
| scan-lecon | Photo de leçon | scanner → quality → pedagogy → evaluator → parent-summary | workflows/scan-lecon.md |
| preparer-controle | Échéance connue | scanner → pedagogy → evaluator → planner → quality → parent-summary | workflows/preparer-controle.md |
| suivi-progression | Résultats saisis | evaluator → quality → planner → gamification → parent-summary → memory | workflows/suivi-progression.md |
| correction-exercice | Réponse d'enfant | evaluator → socratic-coach → quality → parent-summary → memory | workflows/correction-exercice.md |

## 4. Données échangées

### Profil enfant (entrée de TOUS les agents)
prénom, âge, classe, établissement, niveau scolaire attendu, matières fortes/faibles,
lacunes connues, notions maîtrisées, temps disponible, autonomie, date du contrôle,
historique des erreurs. **Le profil n'est jamais inventé** : champs absents = absents.

### Format JSON commun (toute sortie pédagogique doit pouvoir s'y convertir)
```json
{
  "subject": "",
  "level": "",
  "lesson_title": "",
  "key_concepts": [],
  "detected_uncertainties": [],
  "child_explanation": "",
  "parent_summary": "",
  "exercises": { "easy": [], "medium": [], "hard": [] },
  "corrections": [],
  "common_errors": [],
  "revision_plan": [],
  "next_recommended_action": ""
}
```

### Modes de sortie (chaque agent doit les supporter)
`enfant` · `parent` · `correction détaillée` · `json`

## 5. Moteur de progression (source de vérité : profile-memory-agent)
- Erreur ×1 → signaler · ×2 → exercice ciblé · ×3 → mini-leçon dédiée + volume temporairement accru
- Réussite >90% pendant 3 séances → difficulté +1 cran
- Réussite <60% → revenir au niveau précédent
- Réussite sans justification → partiellement acquis, exiger la justification

## 6. Règles pédagogiques transverses
Compréhension avant mémorisation · justification avant résultat · progression
spiralaire · difficulté progressive · exemples concrets · correction détaillée ·
vocabulaire adapté. Maths : expliquer pourquoi. Géométrie : formule avant calcul.
Raisonnement : « Je sais que / Or / Donc ». Fractions : simplifier avant de calculer.

## 7. Garde-fous (voir CLAUDE.md pour la version normative)
Jamais d'invention · incertitudes signalées · lu/déduit/proposé distingués ·
mauvaise image → redemander · niveau adapté · mode parent ET enfant ·
relecture quality-review systématique · sorties exploitables mobile.

## 8. Responsabilités et limites
- **quality-review ne crée jamais de contenu** : il approuve, corrige à la marge ou bloque.
- **profile-memory ne juge jamais l'enfant** : uniquement des notions, des taux, des dates.
- **gamification ne modifie jamais le contenu pédagogique**.
- **Limite actuelle** : les « agents » sont aujourd'hui des prompts spécialisés appelés
  séquentiellement dans le code de l'app (services/ai.ts), pas des processus autonomes.
  Le passage de review qualité est implicite (validation JSON) et non un second appel LLM —
  c'est le premier point d'extension ci-dessous.

## 9. Correspondance avec le code actuel de l'app

| Concept d'architecture | Implémentation actuelle |
|---|---|
| scanner-agent | `services/ai.ts → analyzeLesson / analyzeAgenda` |
| pedagogy-agent | `generateRevisionSheet` + `lib/systemPrompt.ts` |
| evaluator-agent | `generateExercises / generateMiniTest / generateMockExam / generateDrill` |
| revision-planner-agent | `generatePlanning` + drill J-7 |
| gamification-agent | `lib/gamification.ts` (local, sans LLM) |
| parent-summary-agent | résumés dans result/drill (partiel) |
| profile-memory-agent | `contexts/ChildContext.tsx` + `lib/adaptation.ts` |
| socratic-coach-agent | phraseParent des drills (partiel) |
| quality-review-agent | validation JSON (extractJSON) — pas encore un appel LLM dédié |
| orchestrator-agent | navigation Expo Router + écrans |

## 10. Points d'extension futurs
1. **quality-review réel** : second appel LLM de vérification sur les contenus critiques (corrections de maths d'abord).
2. **Dialogue socratique interactif** : écran de chat enfant↔coach sur un exercice raté.
3. **Répétition espacée des flashcards** : re-proposer les cartes ratées (algorithme SM-2 simplifié).
4. **Format hybride par agent** : `agent.yaml` (métadonnées, modèle, paramètres) + `prompt.md` (prompt versionné) + `tests.json` (cas de test automatisables) — permet de versionner, tester et faire évoluer chaque agent indépendamment. Recommandé dès que le nombre d'agents dépasse la dizaine.
5. **Backend** : ces fichiers .md sont directement transposables en system prompts d'un backend Node/Python multi-agents.
