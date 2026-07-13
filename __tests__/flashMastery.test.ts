import { masteryPct } from '../lib/flashMastery';

describe('masteryPct — taux de cartes maîtrisées', () => {
  it('arrondit known/total en %', () => {
    expect(masteryPct({ known: 41, total: 50, date: '2026-07-01' })).toBe(82);
    expect(masteryPct({ known: 3, total: 4, date: '2026-07-01' })).toBe(75);
  });
  it('null si absent ou aucune carte', () => {
    expect(masteryPct(null)).toBeNull();
    expect(masteryPct({ known: 0, total: 0, date: '2026-07-01' })).toBeNull();
  });
});
