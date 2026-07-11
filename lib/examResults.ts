import { getJSON, setJSON } from './storage';

// Historique des contrôles blancs corrigés (clé ppia.examResults)
export interface ExamNotionDetail {
  notion: string;
  ok: number;
  total: number;
}
export interface ExamResult {
  id: string;
  childId: string;
  date: string; // ISO
  titre: string;
  matiere: string;
  note: number; // sur 20
  totalOk: number;
  totalMax: number;
  acquis: string[];
  aRenforcer: string[];
  notionsDetail?: ExamNotionDetail[]; // détail par notion (analyse multi-contrôles)
}

const KEY = 'ppia.examResults';

export async function loadExamResults(childId?: string): Promise<ExamResult[]> {
  const all = await getJSON<ExamResult[]>(KEY, []);
  const list = Array.isArray(all) ? all : [];
  return childId ? list.filter((r) => r.childId === childId) : list;
}

export async function saveExamResult(result: ExamResult): Promise<void> {
  const all = await getJSON<ExamResult[]>(KEY, []);
  const list = Array.isArray(all) ? all : [];
  await setJSON(KEY, [result, ...list].slice(0, 100));
}

// ─── Analyse de progression (jauge, priorités, erreurs fréquentes, objectif) ─

export interface ExamPriority {
  notion: string;
  label: string; // "Erreur fréquente", "Erreur répétée", "À surveiller"
  detail: string; // phrase courte
}
export interface ExamImprovement {
  notion: string;
  detail: string;
}
export interface ExamAnalysis {
  last?: ExamResult;
  delta?: number; // évolution vs contrôle précédent
  bestScore: boolean; // nouveau meilleur score
  streak: number; // nombre de contrôles terminés
  gaugePct: number; // note/20 en %
  gaugeLabel: string; // palier de maîtrise
  motivation: string; // message motivant (sans masquer les difficultés)
  last3: ExamResult[];
  priorities: ExamPriority[]; // max 3, classées par priorité
  improvements: ExamImprovement[]; // compétences en amélioration
  objectif?: string; // objectif du prochain contrôle
}

export function gaugeTier(note: number): string {
  if (note >= 19) return 'Maîtrise excellente';
  if (note >= 16) return 'Très bonne maîtrise';
  if (note >= 12) return 'Bien maîtrisé';
  if (note >= 8) return 'En progression';
  return 'À renforcer';
}
function nextTierThreshold(note: number): number | null {
  for (const t of [8, 12, 16, 19]) if (note < t) return t;
  return null;
}

export function analyzeExams(results: ExamResult[]): ExamAnalysis {
  const last = results[0];
  const prev = results[1];
  const last3 = results.slice(0, 3);
  const streak = results.length;
  const note = last?.note ?? 0;
  const delta = last && prev ? last.note - prev.note : undefined;
  const bestScore = !!last && results.every((r) => r.note <= last.note) && results.length > 1;

  // message motivant
  let motivation = '';
  if (!last) motivation = '';
  else if (bestScore) motivation = '🏆 Nouveau meilleur score !';
  else if (delta !== undefined && delta > 0) motivation = `Tu progresses : +${delta} point${delta > 1 ? 's' : ''} depuis le dernier contrôle`;
  else {
    const next = nextTierThreshold(note);
    if (next) motivation = `Encore ${next - note} point${next - note > 1 ? 's' : ''} pour atteindre le niveau « ${gaugeTier(next)} »`;
    else motivation = 'Niveau maximal atteint, continue !';
  }
  if (streak >= 3 && motivation === '') motivation = `Série de ${streak} contrôles terminés`;

  // agrégation par notion sur les 5 derniers contrôles (du plus récent au plus ancien)
  const recent = results.slice(0, 5);
  const byNotion: Record<string, { missedExams: number; seenExams: number; missesByExam: number[] }> = {};
  recent.forEach((r, idx) => {
    (r.notionsDetail ?? []).forEach((d) => {
      const k = d.notion;
      byNotion[k] = byNotion[k] ?? { missedExams: 0, seenExams: 0, missesByExam: [] };
      byNotion[k].seenExams += 1;
      const misses = d.total - d.ok;
      byNotion[k].missesByExam[idx] = misses;
      if (misses > 0) byNotion[k].missedExams += 1;
    });
  });

  // priorités : notions encore ratées récemment, classées par récurrence
  const priorities: ExamPriority[] = Object.entries(byNotion)
    .filter(([, v]) => (v.missesByExam[0] ?? 0) > 0 || v.missedExams >= 2)
    .sort((a, b) => b[1].missedExams - a[1].missedExams || (b[1].missesByExam[0] ?? 0) - (a[1].missesByExam[0] ?? 0))
    .slice(0, 3)
    .map(([notion, v], i) => {
      if (v.missedExams >= 3) return {
        notion,
        label: i === 0 ? 'Priorité' : 'Erreur fréquente',
        detail: `Cette erreur est apparue dans ${v.missedExams} des ${recent.length} derniers contrôles.`,
      };
      if (v.missedExams === 2) return {
        notion,
        label: i === 0 ? 'Priorité' : 'Erreur répétée',
        detail: `Erreur répétée sur 2 contrôles.`,
      };
      return {
        notion,
        label: 'À surveiller',
        detail: `Erreur ponctuelle sur le dernier contrôle.`,
      };
    });

  // en amélioration : ratée avant, (presque) réussie sur les 2 derniers
  const improvements: ExamImprovement[] = Object.entries(byNotion)
    .filter(([, v]) => {
      if (v.seenExams < 3) return false;
      const recentMisses = (v.missesByExam[0] ?? 0) + (v.missesByExam[1] ?? 0);
      const olderMisses = v.missesByExam.slice(2).reduce((a, m) => a + (m ?? 0), 0);
      return olderMisses >= 2 && recentMisses <= 1 && olderMisses > recentMisses;
    })
    .slice(0, 2)
    .map(([notion, v]) => {
      const recentMisses = (v.missesByExam[0] ?? 0) + (v.missesByExam[1] ?? 0);
      const olderMisses = v.missesByExam.slice(2).reduce((a, m) => a + (m ?? 0), 0);
      return {
        notion,
        detail: `${recentMisses === 0 ? 'Aucune erreur' : `${recentMisses} seule erreur`} sur les deux derniers contrôles, contre ${olderMisses} auparavant.`,
      };
    });

  // objectif du prochain contrôle
  let objectif: string | undefined;
  if (last) {
    const cible = Math.min(20, last.note + 2);
    objectif = priorities.length > 0
      ? `Atteindre ${cible}/20 en évitant les erreurs de ${priorities[0].notion}. 🎯`
      : `Atteindre ${cible}/20 en confirmant les acquis. 🎯`;
  }

  return {
    last, delta, bestScore, streak,
    gaugePct: Math.round((note / 20) * 100),
    gaugeLabel: gaugeTier(note),
    motivation,
    last3, priorities, improvements, objectif,
  };
}
