import type { AccentKey } from '../constants/theme';

export type BadgeId =
  | 'first_scan'
  | 'first_flashcard'
  | 'first_exercise'
  | 'first_minitest'
  | 'first_controle'
  | 'streak_3'
  | 'streak_7'
  | 'xp_100'
  | 'xp_500'
  | 'lessons_5'
  | 'perfect_test';

export interface Badge {
  id: BadgeId;
  label: string;
  desc: string;
  icon: string;
  accent: AccentKey;
}

export interface GamificationData {
  xp: number;
  streak: number;
  lastActiveDate: string;
  badges: BadgeId[];
  totalScans: number;
  totalFlashcards: number;
  totalExercises: number;
  totalMinitests: number;
  totalControles: number;
  totalLessons: number;
  totalPerfect: number;
}

export const DEFAULT_GAMIFICATION: GamificationData = {
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  badges: [],
  totalScans: 0,
  totalFlashcards: 0,
  totalExercises: 0,
  totalMinitests: 0,
  totalControles: 0,
  totalLessons: 0,
  totalPerfect: 0,
};

export const BADGE_DEFS: Badge[] = [
  { id: 'first_scan', label: 'Premier scan', desc: 'Scanne ta première leçon', icon: 'scan-outline', accent: 'blue' },
  { id: 'first_flashcard', label: 'Flashcard pro', desc: 'Révise avec les flashcards', icon: 'layers-outline', accent: 'violet' },
  { id: 'first_exercise', label: 'En pratique', desc: 'Fais tes premiers exercices', icon: 'pencil-outline', accent: 'amber' },
  { id: 'first_minitest', label: 'Mini-test', desc: 'Passe un mini-test', icon: 'flask-outline', accent: 'coral' },
  { id: 'first_controle', label: 'Contrôle blanc', desc: 'Passe un contrôle blanc', icon: 'ribbon-outline', accent: 'green' },
  { id: 'streak_3', label: 'Sur la lancée', desc: '3 jours de suite actif', icon: 'flame-outline', accent: 'coral' },
  { id: 'streak_7', label: 'Semaine parfaite', desc: '7 jours de suite actif', icon: 'flame', accent: 'amber' },
  { id: 'xp_100', label: '100 XP', desc: 'Atteins 100 XP', icon: 'star-outline', accent: 'amber' },
  { id: 'xp_500', label: '500 XP', desc: 'Atteins 500 XP', icon: 'star', accent: 'amber' },
  { id: 'lessons_5', label: '5 leçons', desc: 'Scanne 5 leçons', icon: 'library-outline', accent: 'blue' },
  { id: 'perfect_test', label: 'Sans faute', desc: 'Score parfait à un mini-test', icon: 'trophy-outline', accent: 'green' },
];

export const LEVEL_THRESHOLDS = [
  { label: 'Novice', min: 0, max: 99, color: '#8E8E93' },
  { label: 'Apprenti', min: 100, max: 299, color: '#34C759' },
  { label: 'Explorateur', min: 300, max: 599, color: '#007AFF' },
  { label: 'Expert', min: 600, max: 999, color: '#AF52DE' },
  { label: 'Champion', min: 1000, max: Infinity, color: '#FF9500' },
];

export function getLevel(xp: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].min) return LEVEL_THRESHOLDS[i];
  }
  return LEVEL_THRESHOLDS[0];
}

export function getLevelProgress(xp: number): number {
  const lvl = getLevel(xp);
  if (lvl.max === Infinity) return 1;
  return (xp - lvl.min) / (lvl.max - lvl.min + 1);
}

export function getNextLevelXP(xp: number): number {
  const lvl = getLevel(xp);
  return lvl.max === Infinity ? lvl.min : lvl.max + 1;
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function updateStreak(data: GamificationData): GamificationData {
  const today = todayStr();
  if (data.lastActiveDate === today) return data;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const newStreak = data.lastActiveDate === yStr ? data.streak + 1 : 1;
  return { ...data, streak: newStreak, lastActiveDate: today };
}

export type XPReason =
  | 'lesson_scan'
  | 'fiche'
  | 'flashcard_flip'
  | 'flashcard_set'
  | 'qcm_correct'
  | 'qcm_wrong'
  | 'minitest'
  | 'controle'
  | 'exercise';

export const XP_VALUES: Record<XPReason, number> = {
  lesson_scan: 10,
  fiche: 5,
  flashcard_flip: 2,
  flashcard_set: 5,
  qcm_correct: 5,
  qcm_wrong: 1,
  minitest: 15,
  controle: 30,
  exercise: 5,
};

export function applyXP(data: GamificationData, amount: number, reason: XPReason): GamificationData {
  let updated = updateStreak(data);
  updated = { ...updated, xp: updated.xp + amount };
  // increment counters
  if (reason === 'lesson_scan') updated = { ...updated, totalScans: updated.totalScans + 1, totalLessons: updated.totalLessons + 1 };
  if (reason === 'flashcard_flip') updated = { ...updated, totalFlashcards: updated.totalFlashcards + 1 };
  if (reason === 'exercise') updated = { ...updated, totalExercises: updated.totalExercises + 1 };
  if (reason === 'minitest') updated = { ...updated, totalMinitests: updated.totalMinitests + 1 };
  if (reason === 'controle') updated = { ...updated, totalControles: updated.totalControles + 1 };
  return updated;
}

export function checkBadges(data: GamificationData): { data: GamificationData; newBadges: BadgeId[] } {
  const newBadges: BadgeId[] = [];
  const has = (id: BadgeId) => data.badges.includes(id);
  const candidates: Array<{ id: BadgeId; cond: boolean }> = [
    { id: 'first_scan', cond: data.totalScans >= 1 },
    { id: 'first_flashcard', cond: data.totalFlashcards >= 1 },
    { id: 'first_exercise', cond: data.totalExercises >= 1 },
    { id: 'first_minitest', cond: data.totalMinitests >= 1 },
    { id: 'first_controle', cond: data.totalControles >= 1 },
    { id: 'streak_3', cond: data.streak >= 3 },
    { id: 'streak_7', cond: data.streak >= 7 },
    { id: 'xp_100', cond: data.xp >= 100 },
    { id: 'xp_500', cond: data.xp >= 500 },
    { id: 'lessons_5', cond: data.totalLessons >= 5 },
    { id: 'perfect_test', cond: data.totalPerfect >= 1 },
  ];
  for (const c of candidates) {
    if (c.cond && !has(c.id)) newBadges.push(c.id);
  }
  if (newBadges.length === 0) return { data, newBadges };
  return { data: { ...data, badges: [...data.badges, ...newBadges] }, newBadges };
}
