import { parseFrDate, daysUntil, effectiveDays, upcomingDeadlines, nextDeadlines } from '../lib/deadlines';

const NOW = new Date(2026, 6, 15); // 15 juillet 2026

describe('parseFrDate / daysUntil', () => {
  it('lit le format JJ/MM/AAAA', () => {
    expect(daysUntil('18/07/2026', NOW)).toBe(3);
    expect(daysUntil('15/07/2026', NOW)).toBe(0);
    expect(daysUntil('13/07/2026', NOW)).toBe(-2);
  });
  it('lit le format français « 17 juin » (année courante) et « 3 juil »', () => {
    expect(daysUntil('20 juillet', NOW)).toBe(5);
    expect(daysUntil('3 juil', NOW)).toBe(-12);
    expect(daysUntil('24 avr 2026', NOW)).toBeLessThan(0);
  });
  it('date illisible → null, effectiveDays retombe sur days stocké', () => {
    expect(parseFrDate('À définir', NOW)).toBeNull();
    expect(effectiveDays({ date: 'À définir', days: 7 }, NOW)).toBe(7);
    expect(effectiveDays({ date: '18/07/2026', days: 99 }, NOW)).toBe(3);
  });
});

describe('upcomingDeadlines — filtrage strict des dépassées + tri', () => {
  const list = [
    { id: 'hier', date: '14/07/2026', days: 99 },
    { id: 'dans8', date: '23/07/2026', days: 99 },
    { id: 'aujourdhui', date: '15/07/2026', days: 99 },
    { id: 'demain', date: '16/07/2026', days: 99 },
  ];
  it("exclut hier, garde aujourd'hui et le futur, trie du plus proche au plus lointain", () => {
    const up = upcomingDeadlines(list, NOW);
    expect(up.map((e: any) => e.id)).toEqual(['aujourdhui', 'demain', 'dans8']);
    expect(up.map((e: any) => e.days)).toEqual([0, 1, 8]);
  });
  it('nextDeadlines limite aux N plus proches à venir', () => {
    expect(nextDeadlines(list, 2, NOW).map((e: any) => e.id)).toEqual(['aujourdhui', 'demain']);
  });
});
