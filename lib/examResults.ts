import { getJSON, setJSON } from './storage';

// Historique des contrôles blancs corrigés (clé ppia.examResults)
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
