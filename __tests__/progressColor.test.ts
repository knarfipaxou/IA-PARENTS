import { progressColor } from '../lib/progressColor';

// Rappel des paliers stricts demandés :
// 0-39 rouge · 40-59 orange · 60-70 jaune · 71-79 bleu · 80-89 turquoise · 90-100 vert
const ORANGE = '#FF8A3D';

function blue(hex: string) { return parseInt(hex.slice(5, 7), 16); }

describe('progressColor — paliers stricts', () => {
  it('bornes basses de chaque palier = couleur de base', () => {
    expect(progressColor(0)).toBe('#FF4D4D');   // rouge
    expect(progressColor(20)).toBe('#FF4D4D');  // rouge franc
    expect(progressColor(45)).toBe('#FF8A3D');  // orange
    expect(progressColor(65)).toBe('#FFD34D');  // jaune
    expect(progressColor(75)).toBe('#4D7DFF');  // bleu
    expect(progressColor(85)).toBe('#35E4D2');  // turquoise
    expect(progressColor(95)).toBe('#3DDC7A');  // vert
  });

  it('à 70 %, la couleur est jaune SANS aucune dominante orange (bug corrigé)', () => {
    const c = progressColor(70);
    expect(c).not.toBe(ORANGE);
    // le canal bleu est nettement relevé (jaune tirant vers bleu), pas orange (bleu ~61)
    expect(blue(c)).toBeGreaterThan(100);
  });

  it("l'orange ne réapparaît jamais au-delà de 59 %", () => {
    for (let p = 60; p <= 100; p++) {
      expect(progressColor(p)).not.toBe(ORANGE);
    }
  });

  it('clampe hors bornes', () => {
    expect(progressColor(-10)).toBe('#FF4D4D');
    expect(progressColor(150)).toBe('#3DDC7A');
  });
});
