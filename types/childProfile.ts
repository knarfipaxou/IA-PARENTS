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
  etablissement?: string;         // school name
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
