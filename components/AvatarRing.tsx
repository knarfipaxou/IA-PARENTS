import React from 'react';
import Svg, { Circle } from 'react-native-svg';

/** Anneau décoratif autour de l'avatar (arc teal + point, comme la maquette). */
export function AvatarRing({ size, teal, track }: { size: number; teal: string; track: string }) {
  const r = size / 2 - 3;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }}>
      <Circle cx={c} cy={c} r={r} fill="none" stroke={track} strokeWidth={2.5} />
      <Circle
        cx={c} cy={c} r={r} fill="none" stroke={teal} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={`${circ * 0.3} ${circ}`} transform={`rotate(-125 ${c} ${c})`}
      />
      <Circle cx={c * 0.18} cy={c * 1.62} r={5} fill={teal} />
    </Svg>
  );
}
