# PROMPT DE FINALISATION — à coller dans Claude Code

# MISSION : FINALISER PROF PARENT IA — BOUCLE AUTONOME COMPLÈTE

Tu travailles sur l'app Expo/React Native "PROF PARENT IA" (repo IA-PARENTS,
branche claude/lucid-lamport-AeSNN). Lis d'abord ARCHITECTURE.md et
CLAUDE.md s'il existe, puis contexts/ChildContext.tsx, services/ai.ts,
lib/systemPrompt.ts et types/childProfile.ts pour comprendre l'existant.

## OBJECTIF
Amener l'application à l'état "prête à faire tester à des familles" en
travaillant en BOUCLE AUTONOME : implémenter → vérifier → corriger →
recommencer, sans t'arrêter pour me demander quoi que ce soit, jusqu'à ce
que tout soit terminé et poussé.

## BOUCLE DE QUALITÉ (à chaque itération)
1. Implémente une fonctionnalité ou un correctif (liste ci-dessous, dans l'ordre).
2. Lance `npx tsc --noEmit` — corrige TOUTES les erreurs avant de continuer.
3. Relis l'écran modifié en entier et vérifie : navigation correcte (chaque
   bouton mène au bon écran, retour fonctionne), textes en français sans
   faute, aucun état vide cassé (que se passe-t-il si 0 leçon, 0 échéance,
   pas de profil, pas de clé API ?), icônes Ionicons valides.
4. Cherche les régressions : grep les écrans qui utilisent ce que tu viens
   de modifier et vérifie qu'ils compilent et restent cohérents.
5. Commit avec un message clair, puis passe à l'item suivant.
6. Push sur claude/lucid-lamport-AeSNN après chaque groupe de commits.

## CE QUI RESTE À CONSTRUIRE (dans cet ordre)
1. VERSION IMPRIMABLE des drills : bouton "Version imprimable" sur l'écran
   drill → génère un HTML sobre (fond blanc, texte noir, pas de décoration,
   page 1 = feuille élève avec grands espaces de réponse et cadres pour
   figures, page 2 = corrections détaillées) partagé via expo-print /
   expo-sharing (npm install si besoin).
2. RÈGLES D'ADAPTATION : dans la génération du drill, exploiter l'historique
   drillResults — si une compétence a ≥3 échecs consécutifs, demander à l'IA
   de baisser la difficulté et revenir aux prérequis ; si ≥90% de réussite
   3 sessions de suite, augmenter la difficulté. Passer ces consignes dans
   le prompt de generateDrill.
3. SAISIE DU TYPE D'ERREUR : quand le parent marque "Erreur" sur un exercice
   du drill, proposer un petit choix (calcul, méthode, consigne, orthographe,
   accord, justification, soin, autre) stocké dans DrillResult.typeErreur.
4. MODULE LECTURE : nouvel écran lecture.tsx (œuvre en cours, pages lues,
   résumé de l'enfant, vocabulaire) + génération IA de questions de
   compréhension portant UNIQUEMENT sur les pages lues, réponses modèles
   destinées au parent. Entrée depuis l'espace enfant. Persister dans
   AsyncStorage via ChildContext (clé ppia.lectures).
5. TABLEAU DE PROGRESSION : dans l'onglet Profil enfant, section montrant
   par matière le taux de réussite des drills (depuis drillResults), les
   compétences fragiles (<60%) et maîtrisées (>90%).
6. HISTORIQUE DES SÉANCES : liste des drills passés (date, score, durée)
   accessible depuis l'écran drill, avec détail consultable.
7. NETTOYAGE : supprimer les écrans legacy non reliés — (tabs)/children,
   (tabs)/exercises, (tabs)/plan, coming-soon, photo-floue, validation,
   mock-test, pdf, correction, progress, agenda-results, notifications
   racine (garder (tabs)/notifications). Vérifier qu'aucun import ne casse.
8. ROBUSTESSE FINALE : passer sur chaque écran actif et vérifier les cas
   limites (pas de clé API → message clair vers Réglages, pas de réseau →
   message d'erreur avec bouton réessayer, données vides → état vide propre).

## CONTRAINTES NON NÉGOCIABLES
- Toutes les actions scolaires restent DANS l'espace enfant, jamais sur
  l'accueil parent.
- Aucun paiement, abonnement, compte Google/Apple, ni publication store.
- Design system existant uniquement : T de constants/theme.ts, composants
  Btn/Card/Squircle/TopBar/Chip/Progress, StyleSheet.create.
- Textes UI en français, ton chaleureux.
- L'IA guide sans donner la réponse à l'enfant : corrections côté parent.
- Ne jamais casser les données existantes (clés AsyncStorage ppia.*).
- TypeScript strict : zéro erreur tsc à chaque commit.

## FIN DE MISSION
Termine par : un dernier `npx tsc --noEmit` propre, un push final, la mise à
jour d'ARCHITECTURE.md avec les nouveaux écrans, et un résumé en français de
tout ce qui a été fait + ce qu'il faut tester sur téléphone.
