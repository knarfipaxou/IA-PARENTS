# Workflow : preparer-controle

## Déclencheur
Une échéance est connue : « Contrôle de maths le 17 juin sur les fractions » (saisie manuelle, scan d'agenda, ou détection dans une leçon).

## Objectif
Arriver au jour J préparé : plan de révision réaliste + contenus de révision + suivi.

## Diagramme
```
Leçon(s) liées + Date du contrôle + Profil enfant
        ↓
  scanner-agent            (si nouvelles photos à intégrer)
        ↓
  pedagogy-agent           (explication des notions au programme du contrôle)
        ↓
  evaluator-agent          (exercices calibrés + mini-contrôle blanc)
        ↓
  revision-planner-agent   (jalons J-20/J-15/J-7/J-3/J-1 selon temps restant)
        ↓
  quality-review-agent     (réalisme du plan, exactitude des contenus)
        ↓
  parent-summary-agent     (priorités + alerte échéance + action de ce soir)
        ↓
  Livrable + missions transmises à gamification-agent
```

## Étape par étape

### 1. Constitution du corpus
- Leçons déjà scannées liées à l'échéance (lessonIds) ; si aucune → alerte « Aucune leçon rattachée » et proposition de scan
- scanner-agent traite les nouvelles photos éventuelles

### 2. pedagogy-agent
- Cible UNIQUEMENT les notions du contrôle
- Croise avec profile-memory : les notions fragiles du programme sont traitées en priorité et plus lentement

### 3. evaluator-agent
- Série d'exercices progressifs par notion
- Un **mini-contrôle blanc** complet en conditions réelles (durée, barème), planifié à J-3

### 4. revision-planner-agent
- Calcule les jalons possibles selon la date (si J-5 : compression intelligente, priorités)
- Chaque séance ≤ temps quotidien du profil ; J-1 = révision légère uniquement

### 5. quality-review-agent
- Vérifie que le plan est tenable (somme des minutes vs temps disponible)
- Vérifie que le contrôle blanc couvre bien le périmètre annoncé

### 6. parent-summary-agent
- Résumé avec **alerte échéance** proéminente et le premier jalon à lancer ce soir

## Livrable final
`revision_plan` + exercices + contrôle blanc + résumé parent. Les jalons deviennent des missions datées (gamification).

## Correspondance code actuel
`app/echeance-detail.tsx` → `generateForControl` / `generatePlanning` (services/ai.ts) + `app/prepare-control.tsx`. Le drill quotidien (`app/drill.tsx`) prend automatiquement en compte les échéances ≤7 jours.
