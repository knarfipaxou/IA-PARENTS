# Workflow : scan-lecon

## Déclencheur
Le parent (ou l'enfant dans son espace) photographie une leçon, une page de cahier ou un agenda.

## Objectif
Photo → contenu pédagogique complet et validé : fiche, exercices, résumé parent.

## Diagramme
```
Photo + Profil enfant
        ↓
  scanner-agent          (extraction structurée, incertitudes signalées)
        ↓
  quality-review-agent   (l'extraction est-elle fiable ? image suffisante ?)
        ↓ approve                    ↓ block (image insuffisante)
  pedagogy-agent                → STOP : demander une meilleure photo
        ↓
  evaluator-agent        (exercices easy/medium/hard + corrections)
        ↓
  quality-review-agent   (exactitude, difficulté, corrections refaites)
        ↓
  parent-summary-agent   (les 7 blocs actionnables)
        ↓
  Livrable à l'utilisateur + notification profile-memory (nouvelle leçon au dossier)
```

## Étape par étape

### 1. scanner-agent
- **Entrée** : image base64 + profil (classe/âge pour contexte)
- **Sortie** : JSON `{ matiere, titre, notions, definitions, formules, echeances, detected_uncertainties, status }`
- **Échec possible** : `status: image_insuffisante` → le workflow s'arrête, message : « La photo est trop floue pour une lecture fiable. Reprenez-la avec plus de lumière, à plat. »

### 2. quality-review-agent (passage 1)
- Vérifie la vraisemblance de l'extraction (matière cohérente avec le contenu, pas de notion inventée)
- Transforme les incertitudes en alertes parent visibles

### 3. pedagogy-agent
- Produit `child_explanation` (mode socratique) + explication de fond
- Réinjecte les notions fragiles connexes du profil (via profile-memory)

### 4. evaluator-agent
- Génère `exercises` (easy/medium/hard/probleme/questions_cours) + `corrections` + `common_errors`
- Anti-répétition contre l'historique des sessions

### 5. quality-review-agent (passage 2)
- Refait chaque correction indépendamment ; `block` si erreur mathématique
- Vérifie la progressivité et le calibrage au profil

### 6. parent-summary-agent
- Assemble le résumé 7 blocs + `next_recommended_action`

## Livrable final
JSON complet (format commun) rendu dans l'app : fiche, flashcards/exercices activables, résumé parent, alertes.

## Correspondance code actuel
`app/scan.tsx` → `services/ai.ts (analyzeLesson)` → `app/result.tsx` → `app/generate.tsx`. Ce workflow documente la cible multi-agents vers laquelle faire évoluer ce pipeline.
