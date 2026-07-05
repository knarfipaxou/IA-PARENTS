# README — Architecture d'agents IA

Architecture multi-agents de **Parent Stratège IA** (nom de code app : PROF PARENT IA) :
transformer une photo de cahier en révisions personnalisées, avec suivi des lacunes
par enfant.

## Arborescence

```
/agents          10 agents à responsabilité unique (spécifications)
  scanner-agent.md            extraction fiable photo → données
  pedagogy-agent.md           explication adaptée, socratique
  evaluator-agent.md          exercices + corrections + détection
  revision-planner-agent.md   planning J-20 → J-1, répétition espacée
  gamification-agent.md       XP, badges, missions — motivation saine
  parent-summary-agent.md     résumé 7 blocs actionnable
  quality-review-agent.md     contrôle qualité avec veto
  orchestrator-agent.md       routage et coordination
  profile-memory-agent.md     historique pédagogique par enfant
  socratic-coach-agent.md     faire réfléchir avant de corriger

/workflows       4 chaînes d'exécution documentées étape par étape
  scan-lecon.md               photo → fiche + exercices + résumé
  preparer-controle.md        échéance → plan + contenus + contrôle blanc
  suivi-progression.md        résultats → adaptation + motivation + mémoire
  correction-exercice.md      réponse d'enfant → dialogue socratique

/prompts         5 prompts opérationnels prêts à l'emploi (templates)
  extraction-lecon.md · generation-exercices.md · correction-pedagogique.md
  flashcards.md · mini-test.md

/docs
  agents-architecture.md      vue d'ensemble, flux, données, limites, extensions

CLAUDE.md        garde-fous normatifs + conventions projet (lu par Claude Code)
```

## Principes clés
1. **Une responsabilité par agent** — pas de gros prompt fourre-tout.
2. **Le profil enfant est injecté partout** et n'est **jamais inventé**.
3. **quality-review a un droit de veto** : aucun contenu pédagogique ne sort sans relecture.
4. **Lu / déduit / proposé** : toute sortie distingue ses sources.
5. **Modes de sortie** : chaque agent produit enfant / parent / correction / JSON.
6. **Moteur de progression** : les erreurs d'hier calibrent les exercices de demain.

## Comment utiliser cette architecture

**Dans Claude Code / Cursor** : ouvrez le fichier de l'agent concerné et utilisez-le
comme spécification pour implémenter ou modifier la fonctionnalité correspondante.
`CLAUDE.md` est chargé automatiquement par Claude Code et impose les garde-fous.

**Dans l'app actuelle** : la correspondance agent ↔ code est documentée en
section 9 de `docs/agents-architecture.md`. Les prompts de `/prompts` sont les
versions de référence de ceux codés dans `services/ai.ts`.

**Dans un futur backend** : chaque `agents/*.md` se transpose en system prompt
d'un service ; chaque `workflows/*.md` en pipeline d'orchestration.

## Évolution recommandée : format hybride
Quand le projet dépassera ~10 agents, migrer chaque agent vers :
```
/agents/scanner-agent/
  agent.yaml     # métadonnées : modèle, max_tokens, entrées/sorties, version
  prompt.md      # le prompt système versionné
  tests.json     # cas de test automatisables (entrée → sortie attendue)
```
Bénéfices : versionnage propre, tests de non-régression automatiques par agent,
évolution indépendante. Point d'extension n°4 dans `docs/agents-architecture.md`.
