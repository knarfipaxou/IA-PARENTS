import type { RevisionSheet, Flashcards, Exercises, MiniTest, MockExam } from '../../services/ai';

export type GeneratedKind =
  | 'lesson'
  | 'devoirs'
  | 'fiche'
  | 'flashcards'
  | 'exercices'
  | 'minitest'
  | 'controle';

export type GeneratedStore = Record<string, Partial<Record<GeneratedKind, any>>>;

export interface SavedLesson {
  id: string;
  childId: string;
  createdAt: string;
  matiere: string;
  titre: string;
  niveau?: string;
  notions: string[];
  resume: string;
  /** transcription complète de la leçon (source des générations IA) */
  texte?: string;
  imageBase64?: string;
  fiche?: RevisionSheet;
  flashcards?: Flashcards;
  exercices?: Exercises;
  minitest?: MiniTest;
  controleBlanc?: MockExam;
  // rattachement au programme officiel (data.education.gouv.fr) + validation parent
  programme?: import('../../services/education/programmes').LessonProgram;
}
