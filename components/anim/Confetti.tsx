import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';

const COLORS = ['#34C759', '#FF9500', '#007AFF', '#AF52DE', '#FF3B30', '#FFD60A', '#5AC8FA'];
const COUNT = 42;

function Piece({ index }: { index: number }) {
  const { width, height } = Dimensions.get('window');
  // pseudo-aléatoire déterministe par index
  const rnd = (salt: number) => {
    const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const startX = rnd(1) * width;
  const drift = (rnd(2) - 0.5) * 140;
  const size = 7 + rnd(3) * 7;
  const color = COLORS[index % COLORS.length];
  const duration = 2200 + rnd(4) * 1400;
  const delay = rnd(5) * 500;
  const spins = 2 + rnd(6) * 3;

  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + t.value * drift },
      { translateY: -30 + t.value * (height + 60) },
      { rotate: `${t.value * 360 * spins}deg` },
      { rotateX: `${t.value * 360 * spins * 1.3}deg` },
    ],
    opacity: t.value < 0.85 ? 1 : (1 - t.value) / 0.15,
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute', top: 0, left: 0,
        width: size, height: size * 0.6, borderRadius: 2, backgroundColor: color,
      }, style]}
    />
  );
}

/** Pluie de confettis plein écran (~3 s), à monter conditionnellement. */
export function Confetti() {
  const pieces = useMemo(() => Array.from({ length: COUNT }, (_, i) => i), []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((i) => <Piece key={i} index={i} />)}
    </View>
  );
}
