# Workflow : correction-exercice

## Déclencheur
L'enfant (ou le parent pour lui) soumet une réponse à un exercice — juste, fausse ou incomplète.

## Objectif
Corriger en faisant réfléchir : l'enfant repart en ayant compris son erreur, pas juste la bonne réponse.

## Diagramme
```
Réponse de l'enfant + exercice + profil
        ↓
  evaluator-agent        (diagnostic : juste/faux/incomplet, type d'erreur, correction de référence)
        ↓
  socratic-coach-agent   (dialogue : reformuler → savoir → indice → guider → vérifier → corriger si besoin)
        ↓
  quality-review-agent   (le diagnostic est-il juste ? le dialogue guide-t-il sans révéler trop tôt ?)
        ↓
  parent-summary-agent   (compte-rendu : où il a bloqué, quoi retravailler)
        ↓
  profile-memory-agent   (écriture : erreur typée, blocage, indice qui a débloqué)
```

## Étape par étape

### 1. evaluator-agent (diagnostic)
- Compare la réponse à la correction de référence
- Qualifie : `juste` / `juste_sans_justification` / `erreur` (+ type : calcul, méthode, consigne, etc.) / `incomplet`
- Identifie l'étape précise du raisonnement où ça a dérapé

### 2. socratic-coach-agent (le cœur du workflow)
- Méthode stricte en 6 étapes ; ne révèle la réponse qu'en dernier recours
- Réponse juste sans justification → « Comment es-tu sûr ? Explique-moi avec Je sais que / Or / Donc »
- Réponse juste et justifiée → validation + question de transfert (« Et si les nombres étaient… ? »)
- Calibre les indices sur l'autonomie du profil

### 3. quality-review-agent
- Refait le calcul de référence indépendamment (une correction fausse = block)
- Vérifie que le coach n'a pas donné la réponse trop tôt ni humilié l'erreur

### 4. parent-summary-agent
- Compte-rendu court : la notion, où ça a bloqué, l'indice qui a marché, la phrase à redire ce soir

### 5. profile-memory-agent
- Enregistre : notion, type d'erreur, niveau de guidage nécessaire (autonomie observée)
- Si c'est la 2e ou 3e occurrence du même type d'erreur : déclenche les réactions du moteur de progression

## Livrable final
Dialogue de correction pour l'enfant + compte-rendu parent + dossier mis à jour.

## Correspondance code actuel
Partiellement implémenté : QCM avec feedback dans `app/generate.tsx`, chips de type d'erreur dans `app/drill.tsx`. Le dialogue socratique interactif complet est un point d'extension (voir docs/agents-architecture.md).
