import type { AccentKey } from '../constants/theme';
import type { Enfant, Echeance as LegacyEcheance, Mission, AnalyseResult } from '../types';

// ─── New design-bundle types ────────────────────────────────────────────────

export type EcheanceStatus = 'confirme' | 'incertain' | 'erreur' | 'flou';

export interface Echeance {
  id: string;
  subj: string;
  type: string;
  date: string;
  days: number;
  status: EcheanceStatus;
  accent: AccentKey;
  icon: string;
  urg?: boolean;
  // extended (Milestone 2/3) — optional for backward compat with stored data
  titre?: string;
  consigne?: string;
  noteParent?: string;
  lessonIds?: string[];
  generated?: Record<string, any>;
}

export interface HistoryItem {
  subj: string;
  type: string;
  score: string;
  date: string;
  accent: AccentKey;
}

export interface MatiereStat {
  s: string;
  v: number;
  a: AccentKey;
  icon: string;
}

interface ChildBaseExtras {
  archived?: boolean;
  archivedAt?: string;
}

export interface CollegeChild extends ChildBaseExtras {
  id: string;
  kind: 'college';
  name: string;
  classe: string;
  age: number;
  accent: AccentKey;
  progress: number;
  next: { subj: string; type: string; days: number; accent: AccentKey };
  mission: { subj: string; min: number; obj: string; notion: string };
  matieres: MatiereStat[];
  forts: string[];
  faibles: string[];
  echeances: Echeance[];
  history: HistoryItem[];
}

export interface MaternelleChild extends ChildBaseExtras {
  id: string;
  kind: 'maternelle';
  name: string;
  classe: string;
  age: number;
  accent: AccentKey;
  progress: number;
  activity: { label: string; min: number; obj: string };
  matieres: MatiereStat[];
  forts: string[];
  faibles: string[];
  echeances: Echeance[];
  history: HistoryItem[];
}

export type Child = CollegeChild | MaternelleChild;

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

// ─── Legacy mock data (kept for screens that still use it) ──────────────────

export const mockEnfants: Enfant[] = [
  {
    id: '1',
    prenom: 'Maxime',
    classe: '6ème B',
    avatar: null,
    matieres: ['SVT', 'Mathématiques', 'Français', 'Histoire-Géo', 'Anglais'],
  },
];

export const mockEcheances: LegacyEcheance[] = [
  {
    id: '1',
    enfantId: '1',
    matiere: 'SVT',
    type: 'Composition',
    titre: 'La reproduction des végétaux',
    date: '2026-06-10',
    notions: ['spores', 'prothalle', 'fougère', 'multiplication végétative'],
    priorite: 'haute',
    couleur: '#4CAF82',
    missionsTotal: 4,
    missionsFaites: 1,
  },
  {
    id: '2',
    enfantId: '1',
    matiere: 'Mathématiques',
    type: 'Contrôle',
    titre: 'Fractions et décimaux',
    date: '2026-06-14',
    notions: ['fractions', 'nombres décimaux', 'comparaison', 'addition'],
    priorite: 'normale',
    couleur: '#2C5F8A',
    missionsTotal: 5,
    missionsFaites: 0,
  },
  {
    id: '3',
    enfantId: '1',
    matiere: 'Français',
    type: 'Dictée',
    titre: 'Les accords du participe passé',
    date: '2026-06-18',
    notions: ['accord PP', 'auxiliaire être', 'auxiliaire avoir'],
    priorite: 'basse',
    couleur: '#E8A94D',
    missionsTotal: 3,
    missionsFaites: 0,
  },
];

export const mockMissions: Mission[] = [
  {
    id: '1',
    echeanceId: '1',
    titre: 'Spores et prothalle',
    duree: 12,
    statut: 'disponible',
    exercices: [
      {
        id: 'e1',
        type: 'rappel',
        contenu:
          'La fougère se reproduit grâce à des **spores**. Ces minuscules cellules tombent sur le sol humide et germent pour former le **prothalle**.',
      },
      {
        id: 'e2',
        type: 'qcm',
        question: "Qu'est-ce qu'un prothalle ?",
        options: [
          'Une feuille de fougère adulte',
          "Une petite plante issue de la germination d'une spore",
          'Un type de racine souterraine',
          'Une graine modifiée de la fougère',
        ],
        bonneReponse: 1,
        explication: "Le prothalle est la petite plante bisexuée qui naît de la germination d'une spore.",
      },
    ],
  },
];

export const mockAnalyseResult: AnalyseResult = {
  matiere: 'SVT',
  type: 'Composition',
  titre: 'La reproduction des végétaux',
  dateEvaluation: '10 juin 2026',
  joursRestants: 3,
  notions: ['spores', 'prothalle', 'fougère', 'multiplication végétative', 'reproduction sexuée'],
  consignes: "Savoir expliquer le cycle de reproduction de la fougère.",
  priorite: 'haute',
  dureeConseillee: 12,
  missionsProposees: 3,
};

export const parentPrenom = 'Franck';
