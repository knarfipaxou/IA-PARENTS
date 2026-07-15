import { buildGreeting, buildDeadlinePart, ENCOURAGEMENTS } from '../lib/greeting';

const NOW = new Date(2026, 6, 15); // 15 juillet 2026
const child = (echeances: any[]) => ({ name: 'Maxime', echeances } as any);

describe('ENCOURAGEMENTS', () => {
  it('contient exactement les 20 phrases, dans l’ordre demandé', () => {
    expect(ENCOURAGEMENTS).toHaveLength(20);
    expect(ENCOURAGEMENTS[0]).toBe("Aujourd'hui est une nouvelle occasion de progresser.");
    expect(ENCOURAGEMENTS[6]).toBe("Chaque erreur est une chance d'apprendre.");
    expect(ENCOURAGEMENTS[19]).toBe("Je suis là pour t'aider à réussir ta journée.");
  });
});

describe('buildGreeting — rotation ordonnée', () => {
  it('suit l’ordre 1→20 puis reboucle sur la 1', () => {
    expect(buildGreeting(child([]), 0, NOW)).toBe(`Bonjour Maxime ! ${ENCOURAGEMENTS[0]}`);
    expect(buildGreeting(child([]), 7, NOW)).toContain(ENCOURAGEMENTS[7]);
    expect(buildGreeting(child([]), 20, NOW)).toContain(ENCOURAGEMENTS[0]); // reboucle
    expect(buildGreeting(child([]), 41, NOW)).toContain(ENCOURAGEMENTS[1]);
  });

  it('ajoute l’échéance à venir la plus proche après l’encouragement', () => {
    const msg = buildGreeting(
      child([{ subj: 'mathématiques', type: 'Contrôle', date: '18/07/2026', days: 99 }]),
      6, NOW,
    );
    expect(msg).toBe(
      "Bonjour Maxime ! Chaque erreur est une chance d'apprendre. Tu as un contrôle de mathématiques dans 3 jours.",
    );
  });
});

describe('buildDeadlinePart — échéances dépassées ignorées', () => {
  it('ignore une échéance d’hier, garde celle de demain', () => {
    const part = buildDeadlinePart(child([
      { subj: 'SVT', type: 'Contrôle', date: '14/07/2026', days: 99 },   // hier
      { subj: 'Maths', type: 'Contrôle', date: '16/07/2026', days: 99 }, // demain
    ]), NOW);
    expect(part).toContain('Maths');
    expect(part).toContain('demain');
    expect(part).not.toContain('SVT');
  });

  it("aujourd'hui est annoncé, vide si tout est dépassé", () => {
    expect(buildDeadlinePart(child([{ subj: 'Maths', type: 'Contrôle', date: '15/07/2026', days: 99 }]), NOW))
      .toContain("aujourd'hui");
    expect(buildDeadlinePart(child([{ subj: 'Maths', type: 'Contrôle', date: '01/07/2026', days: 99 }]), NOW))
      .toBe('');
  });
});
