import { salvageArray } from '../lib/jsonSalvage';

describe('salvageArray — récupération de JSON tronqué', () => {
  it('récupère tous les objets complets d\'un tableau tronqué en plein milieu', () => {
    const truncated = `{"questions": [
      {"question_id": "Q1", "enonce": "Définis « poilu »", "points": 2},
      {"question_id": "Q2", "enonce": "Donne la date", "points": 1},
      {"question_id": "Q3", "enonce": "Cite le gé`;
    const items = salvageArray(truncated, 'questions');
    expect(items).toHaveLength(2);
    expect(items[1].question_id).toBe('Q2');
  });

  it('gère les accolades et guillemets échappés dans les chaînes', () => {
    const text = `{"questions": [{"question_id": "Q1", "enonce": "Que signifie \\"{x}\\" ?", "nested": {"a": 1}}]}`;
    const items = salvageArray(text, 'questions');
    expect(items).toHaveLength(1);
    expect(items[0].nested.a).toBe(1);
  });

  it('renvoie [] si la clé ou le tableau est absent', () => {
    expect(salvageArray('pas de json', 'questions')).toEqual([]);
    expect(salvageArray('{"autre": []}', 'questions')).toEqual([]);
  });

  it('fonctionne sur un JSON complet et valide', () => {
    const text = '{"knowledge": [{"knowledgeId": "A"}, {"knowledgeId": "B"}]}';
    expect(salvageArray(text, 'knowledge')).toHaveLength(2);
  });
});
