import { buildGreeting } from '../lib/greeting';

const child = (echeances: any[]) => ({ name: 'Maxime', echeances } as any);

describe('buildGreeting', () => {
  it('sans échéance : simple bonjour', () => {
    expect(buildGreeting(child([]))).toBe('Bonjour Maxime !');
  });

  it('avec échéance : ajoute la plus proche avec le bon délai', () => {
    const msg = buildGreeting(child([
      { subj: 'SVT', type: 'Composition', days: 9 },
      { subj: 'Maths', type: 'Contrôle', days: 3 },
    ]));
    expect(msg).toBe('Bonjour Maxime ! Tu as un contrôle de Maths dans 3 jours.');
  });

  it("aujourd'hui et demain sont formulés naturellement", () => {
    expect(buildGreeting(child([{ subj: 'Maths', type: 'Contrôle', days: 0 }])))
      .toContain("aujourd'hui");
    expect(buildGreeting(child([{ subj: 'Maths', type: 'Contrôle', days: 1 }])))
      .toContain('demain');
  });

  it('accorde « une » devant les types féminins/voyelle (évaluation, interro…)', () => {
    expect(buildGreeting(child([{ subj: 'Anglais', type: 'Interro', days: 2 }])))
      .toContain('une interro');
  });
});
