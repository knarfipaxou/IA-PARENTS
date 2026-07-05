# Workflow : suivi-progression

## Déclencheur
Fin d'une séance d'exercices / drill : le parent a marqué les réussites et les erreurs (avec leur type).

## Objectif
Transformer les résultats bruts en progression mesurée, adaptation future et motivation.

## Diagramme
```
Résultats d'exercices (réussite/échec + type d'erreur + temps)
        ↓
  evaluator-agent          (analyse : erreurs récurrentes, notions fragiles, progrès)
        ↓
  quality-review-agent     (les conclusions sont-elles fondées sur les données ?)
        ↓
  revision-planner-agent   (ajustement du plan si échéance en cours)
        ↓
  gamification-agent       (XP, badges mérités, streak, prochaine mission)
        ↓
  parent-summary-agent     (état des lieux + action suivante)
        ↓
  profile-memory-agent     (écriture : le dossier de l'enfant est mis à jour)
```

## Étape par étape

### 1. evaluator-agent (mode analyse)
- Croise les résultats du jour avec l'historique
- Applique le moteur de progression :
  - erreur ×1 → signaler ; ×2 → exercice ciblé au prochain drill ; ×3 → mini-leçon dédiée + volume temporairement augmenté
  - réussite >90% sur 3 séances → difficulté +1 cran
  - réussite <60% → retour au niveau précédent / prérequis
  - réussite sans justification → `partiellement_acquis`

### 2. quality-review-agent
- Vérifie que chaque conclusion cite des résultats réels (pas de fragilité inventée)
- Vérifie la proportionnalité des réactions (pas de mini-leçon pour une erreur d'étourderie isolée)

### 3. revision-planner-agent
- Si un contrôle approche : re-pondère les jalons restants vers les notions qui viennent d'échouer

### 4. gamification-agent
- Attribue les XP réellement gagnés, débloque les badges mérités, met à jour le streak
- Formule le message de motivation en citant un fait précis de la séance

### 5. parent-summary-agent
- « Ce que l'enfant sait / ce qui est fragile / quoi faire demain / temps estimé »

### 6. profile-memory-agent (écriture finale)
- Intègre tout : taux par notion, erreurs typées, vitesse de progression
- Applique le decay de répétition espacée (maîtrisé non revu 30 j → à entretenir)

## Livrable final
Écran de fin de séance : score, XP/badges, constat honnête, prochaine action. Le profil mémoire est à jour pour la prochaine génération.

## Correspondance code actuel
`app/drill.tsx (finish())` → `addDrillResult` → `lib/adaptation.ts` (stats + consignes) → tableau de progression dans `app/(child-tabs)/profil.tsx` + `lib/gamification.ts` (XP/badges).
