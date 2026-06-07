import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { T } from '../../constants/theme';

export function ProgressBar({ value, color, h = 9 }: { value: number; color?: string; h?: number }) {
  return (
    <View style={{ height: h, borderRadius: 999, backgroundColor: T.surfaceAlt, overflow: 'hidden' }}>
      <View style={{
        width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', borderRadius: 999,
        backgroundColor: color || T.primary,
      }} />
    </View>
  );
}

export function ProgressRing({
  value, size = 64, sw = 7, color, children,
}: { value: number; size?: number; sw?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surfaceAlt} strokeWidth={sw} />
        <Circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color || T.primary} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
