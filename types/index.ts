export type Priorite = 'haute' | 'normale' | 'basse';
export type MissionStatut = 'disponible' | 'en_cours' | 'fait';
export type ExerciceType = 'rappel' | 'qcm' | 'texte_trous' | 'flashcard';

export interface Enfant {
  id: string;
  prenom: string;
  classe: string;
  avatar: string | null;
  matieres: string[];
}

export interface Echeance {
  id: string;
  enfantId: string;
  matiere: string;
  type: string;
  titre: string;
  date: string;
  notions: string[];
  priorite: Priorite;
  couleur: string;
  missionsTotal: number;
  missionsFaites: number;
}

export interface ExerciceRappel {
  id: string;
  type: 'rappel';
  contenu: string;
}

export interface ExerciceQCM {
  id: string;
  type: 'qcm';
  question: string;
  options: string[];
  bonneReponse: number;
  explication: string;
}

export interface ExerciceTexteTrous {
  id: string;
  type: 'texte_trous';
  question: string;
  texte: string;
  trous: string[];
  explication: string;
}

export type Exercice = ExerciceRappel | ExerciceQCM | ExerciceTexteTrous;

export interface Mission {
  id: string;
  echeanceId: string;
  titre: string;
  duree: number;
  statut: MissionStatut;
  exercices: Exercice[];
}

export interface AnalyseResult {
  matiere: string;
  type: string;
  titre: string;
  dateEvaluation: string;
  joursRestants: number;
  notions: string[];
  consignes: string;
  priorite: Priorite;
  dureeConseillee: number;
  missionsProposees: number;
}
