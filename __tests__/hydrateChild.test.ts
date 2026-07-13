import { hydrateChild } from '../contexts/child/hydrateChild';
import type { Child } from '../data/mock';

describe('hydrateChild', () => {
  it('applique archived=false par défaut', () => {
    const c = { id: '1', kind: 'college', name: 'Test' } as unknown as Child;
    expect(hydrateChild(c).archived).toBe(false);
  });

  it('conserve archived existant', () => {
    const c = { id: '1', kind: 'college', name: 'Test', archived: true } as unknown as Child;
    expect(hydrateChild(c).archived).toBe(true);
  });

  it('ajoute lessonIds=[] aux échéances qui en sont dépourvues (anciennes données)', () => {
    const c = {
      id: '1', kind: 'college', name: 'Test',
      echeances: [{ id: 'e1', subj: 'Maths' }],
    } as unknown as Child;
    expect((hydrateChild(c).echeances as any)[0].lessonIds).toEqual([]);
  });

  it('préserve les lessonIds déjà présents', () => {
    const c = {
      id: '1', kind: 'college', name: 'Test',
      echeances: [{ id: 'e1', subj: 'Maths', lessonIds: ['l1'] }],
    } as unknown as Child;
    expect((hydrateChild(c).echeances as any)[0].lessonIds).toEqual(['l1']);
  });
});
