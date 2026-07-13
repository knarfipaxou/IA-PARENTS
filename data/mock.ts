// Données de démonstration pour l'accueil (avant tout enfant réel ajouté par
// l'utilisateur). Le MODÈLE (Child, Echeance, ...) vit désormais dans
// types/childProfile.ts — ce fichier ne contient plus que des données.
import type { Child } from '../types/childProfile';

export type {
  EcheanceStatus, Echeance, HistoryItem, MatiereStat, CollegeChild, MaternelleChild, Child,
} from '../types/childProfile';

export const CHILDREN: Child[] = [
  {
    id: 'maxime',
    kind: 'college',
    name: 'Maxime',
    classe: '6e',
    age: 11,
    accent: 'green',
    progress: 65,
    next: { subj: 'SVT', type: 'Composition', days: 3, accent: 'coral' },
    mission: {
      subj: 'SVT',
      min: 12,
      obj: 'Expliquer la reproduction des végétaux à fleurs',
      notion: 'La reproduction des plantes',
    },
    matieres: [
      { s: 'Mathématiques', v: 78, a: 'green', icon: 'calculator-outline' },
      { s: 'Français', v: 64, a: 'violet', icon: 'book-outline' },
      { s: 'Sciences', v: 71, a: 'coral', icon: 'flask-outline' },
    ],
    forts: ['Calcul mental', 'Lecture'],
    faibles: ['Problèmes', 'Dictée'],
    echeances: [
      { id: 'svt', subj: 'SVT', type: 'Composition', date: '24 avr', days: 3, status: 'confirme', accent: 'coral', icon: 'flask-outline', urg: true },
      { id: 'mat', subj: 'Maths', type: 'DS', date: '28 avr', days: 7, status: 'confirme', accent: 'green', icon: 'calculator-outline' },
      { id: 'fr', subj: 'Français', type: 'Dictée', date: '2 mai', days: 11, status: 'incertain', accent: 'violet', icon: 'book-outline' },
    ],
    history: [
      { subj: 'Histoire', type: 'Interro', score: '16/20', date: 'Mai', accent: 'amber' },
      { subj: 'Maths', type: 'Contrôle', score: '14/20', date: 'Mai', accent: 'green' },
    ],
  },
  {
    id: 'alexia',
    kind: 'maternelle',
    name: 'Alexia',
    classe: 'Moyenne section',
    age: 4,
    accent: 'violet',
    progress: 80,
    activity: { label: 'Langage oral', min: 8, obj: 'Décrire une image' },
    matieres: [
      { s: 'Langage', v: 85, a: 'violet', icon: 'chatbubble-outline' },
      { s: 'Graphisme', v: 70, a: 'blue', icon: 'pencil-outline' },
      { s: 'Nombres', v: 75, a: 'green', icon: 'calculator-outline' },
    ],
    forts: ['Vocabulaire', 'Motricité fine'],
    faibles: ['Tracé des lettres'],
    echeances: [
      { id: 'lang', subj: 'Langage', type: 'Activité', date: "Aujourd'hui", days: 0, status: 'confirme', accent: 'violet', icon: 'chatbubble-outline' },
    ],
    history: [],
  },
];
