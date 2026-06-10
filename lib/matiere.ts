import type { AccentKey } from '../constants/theme';

export const ACCENT_CYCLE: AccentKey[] = ['green', 'violet', 'coral', 'blue', 'amber'];

export function iconForMatiere(matiere: string): string {
  const m = (matiere ?? '').toLowerCase();
  if (m.includes('math')) return 'calculator-outline';
  if (m.includes('fran') || m.includes('lettre')) return 'book-outline';
  if (m.includes('svt') || m.includes('science') || m.includes('physique') || m.includes('chimie')) return 'flask-outline';
  if (m.includes('hist') || m.includes('géo') || m.includes('geo')) return 'globe-outline';
  if (m.includes('angl') || m.includes('espagn') || m.includes('allem') || m.includes('langue')) return 'chatbubble-outline';
  if (m.includes('musi')) return 'musical-notes-outline';
  if (m.includes('sport') || m.includes('eps')) return 'fitness-outline';
  return 'school-outline';
}

export function accentForMatiere(matiere: string): AccentKey {
  const m = (matiere ?? '').toLowerCase();
  if (m.includes('math')) return 'green';
  if (m.includes('fran') || m.includes('lettre')) return 'violet';
  if (m.includes('svt') || m.includes('science') || m.includes('physique') || m.includes('chimie')) return 'coral';
  if (m.includes('hist') || m.includes('géo') || m.includes('geo')) return 'amber';
  return 'blue';
}

export function daysFromDate(dateStr: string): number {
  const m = (dateStr ?? '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    const target = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
    if (!isNaN(diff)) return Math.max(diff, 0);
  }
  return 7;
}

// types d'échéance considérés comme des contrôles (évaluations notées)
export function isControle(type: string): boolean {
  return /contr[oô]le|composition|\bds\b|interro|éval|evaluation|dictée|dictee/i.test(type ?? '');
}

export function formatLessonDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
