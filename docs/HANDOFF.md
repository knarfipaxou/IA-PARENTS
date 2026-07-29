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
   - Tests : `__tests__/education.test.ts` (18 tests)
   - ⚠️ **Non vérifié en conditions réelles** : l'environnement de dev de
     cette session n'a pas accès réseau à data.education.gouv.fr (proxy
     bloquant). Le code tolère les noms de champs inconnus par heuristique
     regex, mais les schémas réels des datasets n'ont pas pu être
     confirmés. **Premier test à faire dans Cursor** : lancer une vraie
     recherche d'établissement et une identification de programme sur un
     scan réel, vérifier que les champs sont bien mappés.

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

1. **Vérifier les schémas réels des datasets Éducation nationale** dès que
   l'accès réseau est possible (voir point 1 ci-dessus) — c'est la plus
   grosse zone d'incertitude du code livré.
2. **Tester le flux complet school-picker → scan leçon → identification
   programme → génération mission** sur device/simulateur réel, pas
   seulement en web.
3. Le moteur de progression (`lib/adaptation.ts`) et les règles
   pédagogiques transverses du CLAUDE.md s'appliquent à toute nouvelle
   génération — les relire avant de toucher aux agents IA
   (`services/agents/*`, `agents/*.md`).
4. Architecture multi-agents documentée dans
   `docs/agents-architecture.md`, contrats détaillés dans `/agents`,
   prompts dans `/prompts`, workflows dans `/workflows`.
