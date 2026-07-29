# Handoff — reprise du projet dans Cursor

Document de passation pour continuer le développement de PROF PARENT IA
dans un autre environnement (Cursor). Tout le code est déjà commité et
poussé sur `origin/claude/lucid-lamport-AeSNN` — aucun travail en attente
non sauvegardé.

## Pour démarrer dans Cursor

```bash
git clone <url-du-repo> IA-PARENTS
cd IA-PARENTS
git checkout claude/lucid-lamport-AeSNN
npm install
npx expo start
```

## ⚠️ Important : qui a exposé quoi à un téléphone

### Session Claude Code (conteneur cloud précédent)

Aucun serveur Expo n'a été exposé à un téléphone. Un
`expo start --web --offline` a servi uniquement à du test Chromium
headless sur `localhost` — **pas de tunnel, pas de QR, pas de refresh
Expo Go depuis cette conversation Claude Code.**

Si des mises à jour ont été vues sur un iPhone via Expo Go à ce
moment-là, elles venaient d'un **autre environnement** (souvent Claude
Code desktop local sur Mac).

### Session Cursor cloud (cette reprise)

Contrairement à l'hypothèse « cloud = pas de réseau externe », **cette**
session Cursor a un egress ouvert et un vrai tunnel Expo a été lancé :
`npx expo start --tunnel --go` → hôte `*.exp.direct`. Un QR / lien
`exp://…` peut donc être partagé depuis Cursor cloud.

Le tunnel n'est valide que tant que la session Cursor tourne : à chaque
nouvelle session, relancer `npx expo start --tunnel` pour un nouveau QR.

### Ne pas confondre avec Vercel

Le dashboard « Projects » (`ia-parents`, `la_parents`, etc. sous
`@knarfipaxous-team`) est l'**app Vercel**, pas Expo Go. Ce n'est pas
le serveur de dev mobile. Pour tester l'app native : ouvrir **Expo Go**
et scanner le QR du `expo start` actif.

## Comment l'app apparaît dans Expo Go (compte @knarfipaxous-team)

Ce n'est **pas** le QR tunnel local. Le flux réel utilisé jusqu'ici :

1. Push sur la branche `claude/lucid-lamport-AeSNN` (hors fichiers `.md`)
2. Le workflow GitHub **« Publier sur Expo (EAS Update) »**
   (`.github/workflows/eas-update.yml`) tourne automatiquement
3. Il exécute `eas update --branch preview` avec le secret `EXPO_TOKEN`
4. Sur le téléphone : Expo Go → compte **`knarfipaxous-team`** → projet
   **`ia-parents`** (`@knarfipaxous-team/ia-parents`) → ouvrir / tirer pour
   rafraîchir → la dernière update `preview` se charge

Ne pas confondre avec l'app **Vercel** (même liste de noms de projets
possible). L'app mobile est bien **Expo Go**.

## Tester sur device réel : Expo Go

Le projet est compatible **Expo Go** (aucun module natif custom hors
`expo-camera` / `expo-image-picker`, tous deux supportés par Expo Go) :

```bash
npx expo start
```

Puis scanner le QR code affiché dans le terminal avec l'app **Expo Go**
(iOS App Store / Android Play Store) — le téléphone doit être sur le
même réseau Wi-Fi que la machine de dev (ou utiliser `--tunnel` si
réseaux différents). C'est la méthode la plus rapide pour tester le scan
photo et la caméra en conditions réelles, ce qui n'a pas pu être fait
dans cette session cloud (pas d'accès caméra/device).

Pour un simulateur iOS local (nécessite Xcode sur Mac) :
```bash
npx expo run:ios
# ou, avec un serveur déjà lancé : appuyer sur "i" dans le terminal expo start
```

## Publication / mises à jour

Le projet a déjà un projet **EAS** configuré (`app.json` →
`extra.eas.projectId`, `updates.url`). Pas de build de production ni de
soumission store à ce stade — voir la contrainte produit non négociable
du CLAUDE.md : *"Aucun paiement, abonnement, compte Google/Apple, ni
publication store (phase actuelle)"*.

Ce qui est possible/pertinent maintenant si besoin de partager une build
de test (au-delà d'Expo Go) :
```bash
npx eas build --profile development --platform ios   # build de dev installable
npx eas update                                         # push OTA sur un build existant
```
Ne pas lancer `eas submit` (soumission store) sans validation explicite
du produit — c'est hors scope de la phase actuelle.

Lire `/CLAUDE.md` en premier : il contient les conventions non négociables
du projet (stack, design system, garde-fous pédagogiques, règles de
progression). Ces règles s'appliquent à tout agent IA (Claude, Cursor, etc.)
qui touche ce code.

## Ce qui a été fait dans cette session (branche `claude/lucid-lamport-AeSNN`)

Historique des commits, du plus ancien au plus récent :

1. **Données officielles Éducation nationale** (`4b3c8e79`)
   - `services/education/api.ts` : client générique Explore v2.1
     (data.education.gouv.fr), timeout 8s, retry, cache local
   - `services/education/annuaire.ts` : recherche d'établissement scolaire
     (annuaire-education), WHERE clause dynamique, replis résilients sur
     erreurs 400
   - `services/education/programmes.ts` : sync + cache (30j) des 4 jeux de
     données de programmes (1er/2nd degré, programmes + compléments),
     matching leçon ↔ programme par recouvrement de vocabulaire (PAS de
     déduction IA)
   - `lib/cycles.ts` : mapping officiel classe → cycle (C1/C2/C3/C4/Lycée)
   - `lib/programMatch.ts` : tokenisation, calcul de recouvrement, règle
     "cycle certain, classe probable"
   - `components/SchoolPicker.tsx` : recherche établissement avec debounce,
     saisie manuelle, "École à la maison"
   - `components/ProgramCard.tsx` : affichage programme identifié +
     validation parent (Confirmer / Cycle seul / Incorrect)
   - Tests : `__tests__/education.test.ts` (22+ tests)
   - ✅ **Schémas vérifiés en conditions réelles** (Cursor cloud, 2026-07-29) :
     voir section « Points d'attention » et branche
     `cursor/verify-education-schemas-eaae` (mapping explicite + pagination
     + matching matière/niveau).

2. **Deux actions distinctes pour rattacher une leçon** (`77e742f9`)
   - `app/attach-lesson.tsx` : liste à cocher des leçons enregistrées,
     bouton "Enregistrer (n)"
   - `app/echeance-detail.tsx` : écran sans leçon montre deux boutons —
     "Rattacher une leçon existante" (principal, cyan) / "Scanner une
     leçon" (secondaire, outline)

3. **Nom des leçons partout + timeout génération + nettoyage** (`cf2062ea`)
   - `components/DeadlineCard.tsx` : prop `lessonTitles`, affichage des
     titres sous l'échéance
   - `app/(child-tabs)/espace.tsx`, `echeances.tsx` : helper
     `lessonTitlesFor`
   - `services/ai.ts` : timeout 150s (2min30) avec `AbortController`,
     distinction timeout / erreur réseau
   - Suppression des anciens types de contenu (fiche de révision, QCM
     exercices, mini-test) dans `app/lesson-detail.tsx` et `app/result.tsx`
     — ne reste que **Devoir blanc complet** (`controle`)

4. **Analyse de leçon 3x plus rapide** (`c3a0273c`, dernier commit)
   - `services/agents/lessonAnalyzer.ts` : texte d'entrée réduit 12k→9k
     caractères, sortie max 6144 tokens (au lieu de 16384), max 45
     connaissances, label/content en 1 phrase
   - `services/agents/missionGenerator.ts` : génération des lots en
     **parallèle** (`Promise.all`) au lieu de séquentiel — le temps total
     devient celui du lot le plus lent, pas la somme
   - Corrige le bug bloquant : génération qui échouait systématiquement à
     2min30 sur les leçons de 5 pages

## État vérifié dans cette session

- `npx tsc --noEmit` : OK (à revérifier après tout changement, c'est une
  règle non négociable du projet, cf. CLAUDE.md)
- `npm test` : suite verte au dernier commit
- Flux d'onboarding (welcome → créer famille → créer profil enfant) testé
  en web (Expo web + Chromium headless, viewport iPhone 390×844) car
  **le simulateur iOS n'est pas disponible dans cet environnement cloud
  Linux** — aucun accès à Xcode/xcrun. Les 3 écrans rendent sans erreur
  console, navigation OK.
- Le simulateur iOS natif (build + run réel) n'a jamais pu être testé
  dans cette session. **Cursor tournant probablement sur macOS local,
  c'est le bon endroit pour faire ce test manquant.**

## Points d'attention pour la suite

1. ~~**Vérifier les schémas réels des datasets Éducation nationale**~~ — **FAIT**
   dans Cursor cloud (2026-07-29), branche `cursor/verify-education-schemas-eaae`.
   Accès réseau OK. Corrections livrées :
   - Annuaire : schémas confirmés à 13/13 champs ; `searchSchools` validé en
     live (texte, CP, UAI).
   - Programmes : mapping explicite du schéma Explore v2.1 réel
     (`descriptif`, `discipline`, `niveau_d_enseignement`, `nature_du_complement`,
     URLs PDF). Les datasets sont des **métadonnées** (titres + liens), pas le
     corps des programmes — les URLs ne polluent plus le matching ; pagination
     complète ; préférence aux programmes non abrogés ; filtre de cycle resserré.
   - Matching matière+niveau adapté à ces métadonnées. Live : leçon maths 5e →
     « Mathématiques : attendus de fin de 5e ».
2. **Tester le flux complet school-picker → scan leçon → identification
   programme → génération mission** sur device réel via **Expo Go**
   (`npx expo start` + QR code — voir section ci-dessus), ou simulateur
   iOS local sur Mac. Priorité : caméra / scan photo, non testables en
   cloud Linux. Pas de soumission store (`eas submit`) en phase actuelle.
3. Le moteur de progression (`lib/adaptation.ts`) et les règles
   pédagogiques transverses du CLAUDE.md s'appliquent à toute nouvelle
   génération — les relire avant de toucher aux agents IA
   (`services/agents/*`, `agents/*.md`).
4. Architecture multi-agents documentée dans
   `docs/agents-architecture.md`, contrats détaillés dans `/agents`,
   prompts dans `/prompts`, workflows dans `/workflows`.
