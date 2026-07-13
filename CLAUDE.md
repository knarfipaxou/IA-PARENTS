# CLAUDE.md — PROF PARENT IA / Parent Stratège IA

Application Expo/React Native aidant les parents à transformer les photos de
cahiers de leurs enfants en contenus de révision personnalisés par IA.

## Stack et conventions
- Expo 52 + Expo Router (fichiers = routes), React Native 0.76, TypeScript strict
- Design system : `T` de `constants/theme.ts`, composants `components/ui/*`
  (Btn, GhostBtn, Card, Squircle, TopBar, Chip, Progress, XPToast), `StyleSheet.create` uniquement
- État : `contexts/ChildContext.tsx` (source unique), persistance AsyncStorage clés `ppia.*`
- IA : `services/ai.ts` (appels Claude), prompts par enfant via `lib/systemPrompt.ts`
- Textes UI en français, ton chaleureux
- `npx tsc --noEmit` doit passer à zéro erreur avant tout commit
- `npm test` (Jest) doit rester vert avant tout commit — tests de la logique
  pure dans `__tests__/` (progressColor, examResults, flashMastery, adaptation,
  gamification). Ajoute un test quand tu ajoutes/répares une règle métier.

## Contraintes produit non négociables
- Toutes les actions scolaires vivent DANS l'espace enfant, jamais sur l'accueil parent
- Aucun paiement, abonnement, compte Google/Apple, ni publication store (phase actuelle)
- Ne jamais casser les données existantes (clés AsyncStorage `ppia.*`)

## Architecture multi-agents
Voir `docs/agents-architecture.md`, `/agents`, `/workflows`, `/prompts`.
Chaque agent a une responsabilité unique ; l'orchestrateur route ; quality-review a un veto.

## Garde-fous pédagogiques (normatifs — s'appliquent à TOUTE génération IA)

1. **Ne jamais inventer une information absente.** Un champ non lisible ou non
   fourni reste vide et est signalé — jamais complété de mémoire.
2. **Toujours signaler les incertitudes** (`detected_uncertainties`) et les rendre
   visibles au parent.
3. **Toujours distinguer** : ce qui est **lu** (présent dans la source), ce qui est
   **déduit** (inféré), ce qui est **proposé** (suggestion pédagogique).
4. **Si une image est mauvaise** : demander une meilleure image plutôt que compléter.
   Seuil : >40% illisible → `status: image_insuffisante`.
5. **Toujours adapter le contenu au niveau de l'enfant** — la classe ET le niveau
   réel du profil (`ppia.profiles`), jamais un niveau générique.
6. **Toujours privilégier la compréhension avant la réponse** : méthode socratique
   côté enfant (question → indice → indice → étape → réponse en dernier recours).
7. **Toujours prévoir un mode parent et un mode enfant** : les corrections détaillées
   et réponses modèles sont destinées au parent, masquées par défaut côté enfant.
8. **Toujours faire relire les contenus pédagogiques par quality-review-agent**
   (contrat cible : cf. `agents/quality-review-agent.md`) — a minima, validation
   stricte du JSON et vérification des corrections mathématiques.
9. **Produire des réponses directement exploitables dans une application mobile** :
   JSON valide conforme au format commun, textes courts, lisibles sur petit écran.
10. **Le profil enfant n'est jamais inventé** : toute fragilité citée doit être
    documentée par un résultat réel horodaté (`ppia.drillResults`).

## Règles pédagogiques transverses
- Compréhension avant mémorisation ; justification avant résultat
- Progression spiralaire ; difficulté progressive ; exemples concrets
- Maths : expliquer POURQUOI, pas seulement calculer
- Géométrie : écrire la formule AVANT le calcul
- Raisonnement : « Je sais que / Or / Donc » (collège), « Je vois / Je calcule / Je conclus » (primaire)
- Fractions : simplifier avant le calcul lorsque c'est possible
- Anti-répétition : jamais les mêmes valeurs/contextes d'une session à l'autre

## Moteur de progression
- Erreur ×1 → signaler · ×2 → exercice ciblé · ×3 → mini-leçon dédiée
- Réussite >90% sur 3 séances → monter la difficulté · <60% → revenir au niveau précédent
- Implémentation : `lib/adaptation.ts` (consignes injectées dans `generateDrill`)
