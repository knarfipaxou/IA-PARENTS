import { useCallback, useRef, useState } from 'react';
import { getJSON, setJSON } from '../../lib/storage';
import type { SavedLesson } from './types';

export const KEY_LESSONS = 'ppia.lessons';

/** Domaine « leçons enregistrées » (scan + contenus IA générés dessus). */
export function useLessonsStore() {
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const lessonsRef = useRef(lessons);
  lessonsRef.current = lessons;

  const addLesson = useCallback(
    (data: Omit<SavedLesson, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): SavedLesson => {
      const lesson: SavedLesson = {
        ...data,
        id: data.id ?? `lesson-${Date.now()}`,
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
      setLessons((prev) => {
        const next = [lesson, ...prev];
        setJSON(KEY_LESSONS, next);
        return next;
      });
      return lesson;
    },
    []
  );

  const updateLesson = useCallback((id: string, patch: Partial<SavedLesson>) => {
    setLessons((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
      setJSON(KEY_LESSONS, next);
      return next;
    });
  }, []);

  /** Retire la leçon (le décrochage des échéances liées est orchestré par le provider). */
  const removeLesson = useCallback((id: string) => {
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      setJSON(KEY_LESSONS, next);
      return next;
    });
  }, []);

  const removeLessonsForChild = useCallback((childId: string) => {
    setLessons((prev) => {
      const next = prev.filter((l) => l.childId !== childId);
      setJSON(KEY_LESSONS, next);
      return next;
    });
  }, []);

  const lessonsForChild = useCallback((childId: string) => {
    return lessonsRef.current.filter((l) => l.childId === childId);
  }, []);

  const getLesson = useCallback((id: string) => {
    return lessonsRef.current.find((l) => l.id === id);
  }, []);

  return {
    lessons, setLessonsRaw: setLessons,
    addLesson, updateLesson, removeLesson, removeLessonsForChild, lessonsForChild, getLesson,
  };
}
