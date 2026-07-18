import type { AccentKey } from '../constants/theme';

// ─── Modèle enfant / échéances (source de vérité unique) ────────────────────
// Anciennement dans data/mock.ts, mélangé aux données de démo — déplacé ici
// pour que data/mock.ts ne contienne plus que des données, pas le modèle.

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
  // mode de préparation de l'échéance : contrôle blanc, flashcards ou les deux
  prepMode?: 'controle' | 'flashcards' | 'both';
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
  photoUri?: string; // photo de profil choisie par l'utilisateur (bibliothèque)
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

// ─── Profil pédagogique ──────────────────────────────────────────────────────

export type SchoolLevel = 'fragile' | 'moyen' | 'bon' | 'avance' | 'tres_avance';
export type LearningObjective = 'consolidation' | 'bon_niveau' | 'excellence' | 'concours';
export type DrillDuration = 10 | 20 | 30 | 40 | 'custom';
export type WorkRhythm = 'semaine' | 'semaine_weekend' | 'custom';
export type ParentTone = 'bienveillant' | 'exigeant';
export type ErrorType =
  | 'calcul' | 'retenue' | 'methode' | 'consigne' | 'orthographe' | 'accord'
  | 'conjugaison' | 'vocabulaire' | 'justification' | 'raisonnement' | 'soin'
  | 'non_redige' | 'resultat_sans_methode';

export interface ChildProfile {
  childId: string;
  dateNaissance?: string;         // ISO date string "YYYY-MM-DD"
  etablissement?: string;         // school name (affichage / compat)
  // fiche officielle de l'établissement (annuaire Éducation nationale, réf. = code UAI)
  etablissementInfo?: import('../services/education/annuaire').EtablissementScolaire;
  pays?: string;                  // default "France"
  niveauEstime: SchoolLevel;
  objectif: LearningObjective;
  matieresPrioritaires: string[]; // e.g. ['Mathématiques', 'Français']
  dureeQuotidienne: DrillDuration;
  rythme: WorkRhythm;
  joursCustom?: number[];         // 0=Sun,1=Mon,...6=Sat if rythme=custom
  pointsFaibles: string[];        // free text descriptions
  pointsForts: string[];
  correctionDetaillee: boolean;
  versionImprimable: boolean;
  ton: ParentTone;
  noteLibre?: string;             // free notes from parent (like the Maxime example)
  createdAt: string;
  updatedAt: string;
}

export interface DrillExercise {
  id: string;
  matiere: string;
  competence: string;             // e.g. "fractions - addition dénominateurs différents"
  niveau: string;                 // class level this exercise targets
  consigne: string;               // the exercise text
  correction: string;             // detailed correction (shown to parent only)
  phraseParent?: string;          // hint for parent to guide child without giving answer
  type: 'calcul' | 'geometrie' | 'francais' | 'lecture' | 'science' | 'histoire' | 'anglais' | 'autre';
}

export interface DrillSession {
  id: string;
  childId: string;
  date: string;                   // ISO date "YYYY-MM-DD"
  dureeMin: number;
  exercises: DrillExercise[];
  status: 'pending' | 'done';
  scoreGlobal?: number;           // 0-100
  commentaireParent?: string;
  createdAt: string;
}

export interface DrillResult {
  id: string;
  sessionId: string;
  exerciseId: string;
  childId: string;
  date: string;
  matiere: string;
  competence: string;
  reussite: boolean;
  typeErreur?: ErrorType;
  commentaireParent?: string;
  tempsPasseMin?: number;
}

