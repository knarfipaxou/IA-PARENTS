import { buildMission, MAX_ATTEMPTS, lessonAllowsFullAudit } from '../services/agents/orchestrator';
import { runQualityAuditor } from '../services/agents/qualityAuditor';
import { validateLessonAnalysis, validateMissionQuestions } from '../services/agents/types';
import type { KnowledgeItem, LessonAnalysis2, MissionQuestion, AuditResult } from '../services/agents/types';

// mock du contrôle qualitatif IA de l'auditeur (la couverture, elle, est calculée en code)
jest.mock('../services/ai', () => ({
  askClaude: jest.fn(async () => '{"ok": true, "misclassifiedQuestions": [], "warnings": []}'),
  extractJSON: (t: string) => JSON.parse(t),
}));

// ─── Fixture « Verdun » : leçon d'histoire riche en connaissances mémorielles ─
const VERDUN_KNOWLEDGE: KnowledgeItem[] = [
  { knowledgeId: 'VOC-001', type: 'vocabulaire', label: 'Poilu', content: 'Soldat français de 14-18', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'VOC-002', type: 'vocabulaire', label: 'Tranchée', content: 'Fossé de combat', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'FCT-001', type: 'date', label: 'Début de la bataille', content: '21 février 1916', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'FCT-002', type: 'date', label: 'Fin de la bataille', content: 'décembre 1916', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'PER-001', type: 'personnage', label: 'Pétain', content: 'Général français à Verdun', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'LIEU-001', type: 'lieu', label: 'Verdun', content: 'Ville de la Meuse', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'CHI-001', type: 'chiffre', label: 'Pertes', content: '≈ 700 000 morts et blessés', importance: 'essential', cognitiveLevel: 'remember' },
  { knowledgeId: 'FCT-003', type: 'evenement', label: 'Voie sacrée', content: 'Route de ravitaillement', importance: 'important', cognitiveLevel: 'remember' },
  { knowledgeId: 'FCT-004', type: 'evenement', label: 'Mémoire de Verdun', content: 'Symbole franco-allemand', importance: 'important', cognitiveLevel: 'remember' },
  { knowledgeId: 'CPR-001', type: 'notion', label: 'Guerre de position', content: 'Front immobile', importance: 'essential', cognitiveLevel: 'understand' },
];

const VERDUN: LessonAnalysis2 = { status: 'complete', knowledge: VERDUN_KNOWLEDGE };

function Q(id: string, knowledgeIds: string[]): MissionQuestion {
  return {
    question_id: id, enonce: `Question ${id}`, points_total: 1, expected_answer: 'r',
    correction_criteria: [{ criterion_id: `${id}-C1`, label: 'exact', points: 1, required_for_mastery: true }],
    knowledgeIds,
  } as MissionQuestion;
}

describe('orchestrateur — test Verdun', () => {
  it('rejette une Mission Mémoire limitée à 6 questions qui oublie des essentielles, la répare, puis valide', async () => {
    // 1re génération incomplète (l'ancienne logique arbitraire) : CHI-001 et FCT-002 oubliés
    const incomplete = [
      Q('MEM-Q01', ['VOC-001', 'VOC-002']),
      Q('MEM-Q02', ['FCT-001']),
      Q('MEM-Q03', ['PER-001']),
      Q('MEM-Q04', ['LIEU-001']),
    ];
    const patched = [Q('MEM-Q05', ['CHI-001', 'FCT-002']), Q('MEM-Q06', ['FCT-003', 'FCT-004'])];
    const patch = jest.fn(async (_t: any, _missing: KnowledgeItem[], _existing: MissionQuestion[]) => patched);

    const result = await buildMission('memory', VERDUN, {
      generate: async () => incomplete,
      patch,
      audit: (t, k, q) => runQualityAuditor(t, k, q),
    });

    expect(patch).toHaveBeenCalledTimes(1);
    // la réparation est ciblée : les manquantes uniquement
    expect((patch.mock.calls[0]?.[1] ?? []).map((k: KnowledgeItem) => k.knowledgeId).sort())
      .toEqual(['CHI-001', 'FCT-002', 'FCT-003', 'FCT-004']);
    expect(result.ok).toBe(true);
    expect(result.state).toBe('approved');
    // les bonnes questions initiales sont conservées
    expect(result.questions.map((q) => q.question_id)).toEqual(
      expect.arrayContaining(['MEM-Q01', 'MEM-Q05']),
    );
    expect(result.coverage.essentialPct).toBe(100);
    expect(result.coverage.importantPct).toBe(100);
  });

  it("ne publie RIEN après 3 audits rejetés (règle bloquante)", async () => {
    const bad = [Q('MEM-Q01', ['VOC-001'])]; // couvre 1 essentielle sur 7
    const result = await buildMission('memory', VERDUN, {
      generate: async () => bad,
      patch: async () => [], // la réparation n'apporte rien
      audit: (t, k, q) => runQualityAuditor(t, k, q),
    });
    expect(result.ok).toBe(false);
    expect(result.state).toBe('failed');
    expect(result.attempts).toBe(MAX_ATTEMPTS);
    expect(result.error).toContain('Audit rejeté');
  });

  it('valide du premier coup une mission couvrant tout (pas de patch inutile)', async () => {
    const full = [
      Q('Q1', ['VOC-001', 'VOC-002', 'FCT-001']),
      Q('Q2', ['FCT-002', 'PER-001', 'LIEU-001']),
      Q('Q3', ['CHI-001', 'FCT-003', 'FCT-004']),
    ];
    const patch = jest.fn();
    const result = await buildMission('memory', VERDUN, {
      generate: async () => full,
      patch: patch as any,
      audit: (t, k, q) => runQualityAuditor(t, k, q),
    });
    expect(result.ok).toBe(true);
    expect(result.attempts).toBe(1);
    expect(patch).not.toHaveBeenCalled();
  });

  it("une erreur d'agent ne publie rien et remonte l'erreur", async () => {
    const result = await buildMission('memory', VERDUN, {
      generate: async () => { throw new Error('API en panne'); },
      patch: async () => [],
      audit: async () => ({ status: 'approved' } as AuditResult),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('API en panne');
  });

  it('les statuts de leçon incomplete/illegible/contradictory interdisent un audit exhaustif', () => {
    expect(lessonAllowsFullAudit(VERDUN)).toBe(true);
    expect(lessonAllowsFullAudit({ status: 'incomplete', knowledge: [] })).toBe(false);
    expect(lessonAllowsFullAudit({ status: 'illegible', knowledge: [] })).toBe(false);
    expect(lessonAllowsFullAudit({ status: 'contradictory', knowledge: [] })).toBe(false);
  });
});

describe('validation stricte des schémas', () => {
  it('rejette une analyse sans statut valide ou avec knowledgeId dupliqué', () => {
    expect(() => validateLessonAnalysis({ status: 'nimporte', knowledge: [] })).toThrow();
    expect(() => validateLessonAnalysis({
      status: 'complete',
      knowledge: [
        { knowledgeId: 'A', label: 'a', importance: 'essential', cognitiveLevel: 'remember' },
        { knowledgeId: 'A', label: 'b', importance: 'essential', cognitiveLevel: 'remember' },
      ],
    })).toThrow(/dupliqué/);
  });

  it('rejette une question sans knowledgeIds ou sans critères', () => {
    const base = { enonce: 'Q', expected_answer: 'r', correction_criteria: [{ label: 'ok', points: 1 }] };
    expect(() => validateMissionQuestions([{ ...base, knowledgeIds: [] }], 'memory')).toThrow(/knowledgeIds/);
    expect(() => validateMissionQuestions([{ ...base, correction_criteria: [], knowledgeIds: ['A'] }], 'memory')).toThrow(/critères/);
  });

  it('normalise une question valide (points_total = somme des critères, mission_id)', () => {
    const [q] = validateMissionQuestions([{
      enonce: 'Q', expected_answer: 'r', knowledgeIds: ['A'],
      correction_criteria: [{ label: 'a', points: 1 }, { label: 'b', points: 2 }],
    }], 'memory');
    expect(q.points_total).toBe(3);
    expect(q.mission_id).toBe('memoire');
  });
});
