import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { KITSUNE } from '../constants/darkTheme';

export type KitsuneMove = 'idle' | 'nod' | 'tilt' | 'wag' | 'paw' | 'blink' | 'hop' | 'tap' | 'work';

interface KitsuneProps {
  size?: number;
  move?: KitsuneMove;
  tick?: number;
  style?: object;
}

/** Mascotte Kitsune — image statique fiable (pas de Reanimated au démarrage). */
export function Kitsune({ size = 160, style }: KitsuneProps) {
  const h = size * (850 / 700);
  return (
    <View style={[{ width: size, height: h }, style]}>
      <Image source={KITSUNE.full} style={{ width: size, height: h }} resizeMode="contain" />
    </View>
  );
}

export function KitsuneStatic({ size = 120, style }: { size?: number; style?: object }) {
  return (
    <Image
      source={KITSUNE.full}
      style={[{ width: size, height: size * (850 / 700) }, style]}
      resizeMode="contain"
    />
  );
}
