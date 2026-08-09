# Handoff : IA-PARENTS — application mobile (21 écrans)

## Overview
Application mobile pour les parents. Le parent scanne une leçon ou une page d'agenda, l'IA génère un parcours de révision, l'enfant joue les missions, le parent suit la progression. Mascotte : **Kitsune**, un renard articulé qui réagit à chaque choix de l'utilisateur.

## À propos des fichiers de ce bundle
Les fichiers `.dc.html` sont des **références de design en HTML** : des prototypes qui montrent l'apparence et le comportement voulus. Ce **n'est pas du code de production à copier tel quel**.

Le travail attendu : **recréer ces écrans dans l'environnement cible** (React Native / Expo, React web, SwiftUI…) avec ses propres patterns et bibliothèques. Si aucun environnement n'existe encore, choisir le framework adapté (ici : **React Native + Expo**, l'app étant mobile) et y implémenter les écrans.

Les fichiers s'ouvrent directement dans un navigateur : ouvrir `PROF PARENT IA.dc.html` pour voir la planche des 21 écrans + un simulateur cliquable.

## Fidélité
**High-fidelity.** Couleurs, typographies, espacements, rayons, ombres et micro-interactions sont définitifs. À reproduire au pixel près avec les composants de la codebase cible.

---

## Design tokens

### Couleurs
| Rôle | Valeur |
|---|---|
| Fond app | `#0F1424` |
| Fond bezel / plus sombre | `#0B0E18` |
| Fond dégradé haut d'écran | `radial-gradient(120% 70% at 50% 0%, #1B2748 0%, #0F1424 60%)` |
| Surface carte | `rgba(255,255,255,.05)` à `rgba(255,255,255,.07)` |
| Bordure carte | `rgba(255,255,255,.08)` |
| Bordure input / bouton secondaire | `rgba(255,255,255,.14)` |
| Texte primaire | `#FFFFFF` |
| Texte secondaire | `#96A3CC` |
| Texte tertiaire / inactif | `#5D6890` |
| **Vert primaire (actions parent)** | `#16B26E` — ombre bouton `#0D8C56`, clair `#3FD694` |
| Texte sur vert | `#062E1E` |
| **Cyan (univers enfant)** | `#35E4D2` |
| Bleu | `#3B7DFF` — clair `#7FAAFF` |
| Ambre (« à vérifier ») | `#FFB020` — texte sur ambre `#4A3000` |
| Corail (erreur / alerte) | `#FF6B5A` — clair `#FF9683` |
| Violet | `#A97BFF` — clair `#C4A2FF` |

Teintes de fond des pastilles = la couleur d'accent à **16 à 18 % d'opacité** (ex. `rgba(22,178,110,.16)`).

**Code couleur IA à respecter** : vert = contenu lu et acquis · ambre = à vérifier par le parent · corail = erreur répétée.

### Typographie
- **Fredoka** (400/500/600/700) — titres, boutons, chiffres. Google Fonts.
- **Plus Jakarta Sans** (400/500/600/700/800) — corps, métadonnées, libellés. Google Fonts.

Échelle utilisée :
| Usage | Style |
|---|---|
| Titre d'accueil (H1) | Fredoka 600 · 31px / 1.16 · letter-spacing −.3px |
| Titre d'écran | Fredoka 600 · 24–26px |
| Titre de carte | Plus Jakarta Sans 600–700 · 15–17px |
| Corps | Plus Jakarta Sans 400 · 15px / 1.55 |
| Méta / légende | Plus Jakarta Sans 400–500 · 12–13px, couleur `#96A3CC` |
| Libellé bouton principal | Fredoka 600 · 18px |
| Micro-label (onglets, chips) | Plus Jakarta Sans 600 · 11–12px |

### Espacement
Échelle 4px : 4 · 8 · 12 · 14 · 18 · 22 · 26 · 34 · 44.
Marge horizontale d'écran : **22px** (26px sur l'écran de bienvenue). Padding haut d'écran : **60px** (sous encoche). Padding bas : **34px**.

### Rayons
- Bouton principal / carte principale : `18px`
- Carte standard : `16px`
- Pastille d'icône : `14–16px`
- Chip / badge : `999px`
- Écran (bezel maquette) : `44px`

### Ombres
- Bouton principal (effet Duolingo) : `0 5px 0 #0D8C56` ; à l'appui `transform: translateY(5px); box-shadow: 0 0 0 #0D8C56`
- Carte élevée : `0 10px 26px rgba(0,0,0,.14)`

---

## Écrans (21)

L'ordre de navigation est défini par le tableau `order` dans la logique de `PPScreen.dc.html` :

| # | Clé | Nom | But |
|---|---|---|---|
| 1 | `welcome` | Bienvenue | Pitch + création de famille |
| 2 | `family` | Créer la famille | Nom de famille, premier parent |
| 3 | `profile` | Profil enfant | Prénom, classe (CE2→5e), couleur d'avatar |
| 4 | `home` | Accueil parent | Tableau de bord : enfants, prochaine échéance, actions rapides |
| 5 | `scan` | Scanner la leçon | Viseur caméra + conseils de cadrage |
| 6 | `result` | Résultat du scan | Ce que l'IA a lu / ce qui reste à vérifier |
| 7 | `agenda` | Scan d'agenda | Extraction des devoirs datés |
| 8 | `children` | Mes enfants | Liste des profils |
| 9 | `plan` | Parcours de révision | 4 étapes séquentielles, déblocage progressif |
| 10 | `mission` | Mission enfant | QCM, 4 réponses, barre de progression |
| 11 | `missionResult` | Résultat de mission | Score, XP, critères pédagogiques atteints |
| 12 | `progress` | Progression | 30 jours, maîtrise par matière, barres hebdo |
| 13 | `settings` | Réglages | Compte, notifications, mode Parent/Enfant |
| 14 | `deadlines` | Échéances | Devoirs et contrôles à venir |
| 15 | `deadlineDetail` | Détail d'échéance | Une échéance + son parcours associé |
| 16 | `lessons` | Bibliothèque de leçons | Leçons scannées, statut d'analyse |
| 17 | `generating` | Génération en cours | 4 étapes d'analyse IA en direct |
| 18 | `blurry` | Photo illisible | Refus explicite de l'IA + conseils |
| 19 | `correction` | Correction parent | Le parent corrige ce que l'IA a mal lu |
| 20 | `mockTest` | Devoir blanc | 4 questions notées, format contrôle |
| 21 | `notifications` | Notifications | Fil d'événements, lus / non lus |

Chaque écran est un bloc `<sc-if value="{{ isXxx }}">` dans `PPScreen.dc.html`. Tous les styles sont inline : les valeurs exactes (px, hex, poids) se lisent directement dans le fichier.

## Contenu et copie
**Tous les textes français du prototype sont définitifs et doivent être repris verbatim.** Les jeux de données de référence (classes, matières, échéances, leçons, questions, notifications, critères pédagogiques) sont déclarés en haut de la logique de `PPScreen.dc.html` sous les constantes `CLASSES`, `COLORS`, `CHEERS`, `PLAN`, `ANSWERS`, `SUBJECTS`, `BARS`, `DEADLINES`, `TONES`, `LESSONS`, `GEN`, `TIPS`, `CRITERIA`, `MOCK`, `NOTIFS`. À porter telles quelles comme données de démo.

## Garde-fous IA (règles produit, non négociables)
1. L'app distingue toujours **ce que l'IA a lu** de **ce qui reste à vérifier** (écran 6).
2. Sur photo floue, l'IA **refuse d'inventer** et demande une nouvelle photo (écran 18). Jamais de contenu deviné.
3. Les **corrections sont réservées au parent** (écran 19). L'enfant ne peut pas éditer le contenu analysé.
4. Une erreur répétée 3 fois déclenche une mini-leçon, pas une sanction (écran 21).

## Interactions et comportements
- **Sélection (classe, couleur, filtre)** : `pick()` incrémente `tick`, tire une animation Kitsune au hasard parmi celles qui ne sont pas l'animation courante, et affiche une bulle d'encouragement (`CHEERS`).
- **Bulle d'encouragement** : apparition `ppBubble` — `opacity 0→1`, `translateY(6px)→0`, `scale(.96)→1`.
- **Bouton principal** : à l'appui, descend de 5px et l'ombre passe à 0 (effet touche physique).
- **QCM (écran 10)** : `state.answer` passe de `null` à la clé choisie. Bonne réponse → bordure verte ; mauvaise → bordure corail + révélation de la bonne. Les réponses sont figées après le choix.
- **Scan (écran 5)** : ligne de balayage animée `ppScanLine`, 10 %→82 %→10 %.
- **Génération (écran 17)** : les 4 étapes `GEN` passent `done` → `now` → suivante.
- **Mode Parent / Enfant** : `state.mode` bascule l'accent de `#16B26E` (parent) à `#35E4D2` (enfant).

### Animations Kitsune (`Kitsune.dc.html`)
La mascotte est découpée en **4 calques indépendants** : tête, corps, patte, queue (`assets/kitsune-*.png`). Sept animations : `nod`, `tilt`, `wag`, `paw`, `blink`, `hop`, `tap`. Chacune anime un ou deux calques seulement — jamais le bloc entier.

Keyframes globales déclarées dans `PPScreen.dc.html` : `ppPop` (rebond élastique), `ppFloat` (flottement ±10px), `ppBubble`, `ppScanLine`, `ppBlink`, `kSpin`, `kSlide`.

## State
```
classe: 'CM2'          // classe sélectionnée
color:  '#16B26E'      // couleur d'avatar de l'enfant
tick:   0              // compteur incrémenté à chaque sélection (relance l'animation)
cheer:  null           // texte de la bulle Kitsune
move:   'idle'         // animation Kitsune courante
answer: null           // réponse choisie au QCM
mode:   'Parent'       // 'Parent' | 'Enfant'
filter: 'Toutes'       // filtre de la bibliothèque de leçons
flags:  { rappel: true, resume: true, silence: false }  // réglages notifications
```
Navigation : prop `screen` (clé d'écran) + callback `go(key)`. À remplacer par le routeur de la codebase cible (React Navigation en Expo).

Données à câbler côté back : OCR de la photo, génération du parcours, scoring des missions, calcul de la maîtrise par matière, fil de notifications.

## Assets
- `assets/kitsune-head.png`, `kitsune-body.png`, `kitsune-paw.png`, `kitsune-tail.png` — les 4 calques de la mascotte, à conserver séparés pour l'articulation.
- `assets/kitsune.png` — la mascotte entière (fallback statique).
- `assets/icons/` — 11 icônes PNG : `agenda`, `avatar`, `book`, `flame`, `nav_calendar`, `nav_home`, `nav_profile`, `scan`, `sqrt`, `target`, `warning`.
- Polices : Fredoka et Plus Jakarta Sans, Google Fonts. En React Native, les charger via `expo-font`.

## Fichiers
| Fichier | Contenu |
|---|---|
| `PROF PARENT IA.dc.html` | Planche de présentation : simulateur cliquable + les 21 écrans côte à côte. **Point d'entrée à ouvrir.** |
| `PPScreen.dc.html` | Les 21 écrans, la logique de navigation et toutes les données de démo. **Source de vérité du design.** |
| `Kitsune.dc.html` | Mascotte articulée : 4 calques, 7 animations. |
| `support.js` | Runtime nécessaire pour ouvrir les `.dc.html` dans un navigateur. Ne pas porter — c'est un outil de prévisualisation, pas du code produit. |
| `assets/` | Images et icônes. |

## Ordre de travail suggéré pour Cursor
1. Ouvrir `PROF PARENT IA.dc.html` dans un navigateur, parcourir les 21 écrans.
2. Initialiser le projet Expo, charger les deux polices, poser les tokens ci-dessus dans un thème.
3. Construire les primitives partagées : bouton principal (ombre 5px), carte, chip, pastille d'icône, barre de progression, en-tête d'écran, barre de navigation.
4. Porter les écrans dans l'ordre du tableau ci-dessus ; reprendre les valeurs inline de `PPScreen.dc.html` écran par écran.
5. Porter Kitsune en dernier (4 `<Image>` superposées + `Animated`).
