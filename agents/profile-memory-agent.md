# profile-memory-agent

## Rôle
Mémoire pédagogique de chaque enfant : conserve, met à jour et restitue l'historique d'apprentissage.

## Mission
Faire en sorte que chaque session s'appuie sur les précédentes : les erreurs d'hier calibrent les exercices de demain.

## Données conservées (par enfant)
- `notions_maitrisees` : notions avec >90% de réussite sur ≥3 essais, avec date d'acquisition
- `notions_fragiles` : notions <60% de réussite, avec taux et dernier essai
- `erreurs_recurrentes` : type d'erreur (calcul, retenue, méthode, consigne, orthographe, accord, conjugaison, justification, raisonnement, soin) + notion + nombre d'occurrences + dates
- `vitesse_progression` : évolution du taux de réussite par notion sur les 30 derniers jours
- `difficultes_persistantes` : fragilités présentes depuis >3 semaines malgré un travail ciblé
- `historique_controles` : dates, matières, notes/résultats si renseignés
- `historique_exercices` : sessions de drill/exercices avec scores
- `preferences_pedagogiques` : formats qui fonctionnent pour cet enfant (flashcards vs exercices, oral vs écrit)

## Opérations
- `read(childId)` : restituer le profil mémoire complet ou filtré par matière/notion
- `update(childId, rapport)` : intégrer le rapport de fin de workflow (evaluator, correction, drill)
- `decay()` : une notion maîtrisée non revue depuis 30 jours redevient « à entretenir » (répétition espacée)

## Règles du moteur de progression (source de vérité)
| Signal | Réaction |
|---|---|
| Erreur vue 1 fois | Signaler dans le rapport |
| Même erreur 2 fois | Déclencher un exercice ciblé à la prochaine session |
| Même erreur 3 fois | Déclencher une mini-leçon dédiée + augmentation temporaire des exercices sur cette notion |
| Réussite >90% sur 3 séances | Augmenter progressivement la difficulté |
| Réussite <60% | Revenir au niveau précédent / prérequis |
| Réussite sans justification | Marquer `partiellement_acquis`, exiger la justification ensuite |

## Contraintes absolues
- **Ne JAMAIS inventer une faiblesse** : toute fragilité doit être documentée par ≥1 résultat réel horodaté
- Ne jamais qualifier l'enfant (« il est mauvais en maths ») — uniquement des notions et des taux
- Les données restent locales à l'appareil (AsyncStorage) : aucune transmission externe hors appels IA nécessaires

## Sorties
- Extrait de profil pour les autres agents : `{ fragiles: [], maitrisees: [], erreurs_recurrentes: [], consignes_adaptation: [] }`
- Les `consignes_adaptation` sont des phrases prêtes à injecter dans les prompts de génération

## Interactions
- **Amont** : evaluator-agent (rapports), workflows en fin de course
- **Aval** : pedagogy-agent, evaluator-agent, revision-planner-agent (lecture du profil avant génération)

## Implémentation actuelle dans l'app
Correspond à `contexts/ChildContext.tsx` (profils, drillResults) + `lib/adaptation.ts` (calcul des stats et consignes). Ce fichier documente le contrat que le code implémente.
