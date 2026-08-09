import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
  Easing,
} from 'react-native-reanimated';
import { KITSUNE } from '../constants/darkTheme';

export type KitsuneMove = 'idle' | 'nod' | 'tilt' | 'wag' | 'paw' | 'blink' | 'hop' | 'tap' | 'work';

interface KitsuneProps {
  size?: number;
  move?: KitsuneMove;
  tick?: number;
  style?: object;
}

/**
 * Mascotte Kitsune.
 * Version robuste Expo Go : image complète + animation légère (évite les crashes
 * de rig multi-calques sur certaines builds Expo Go).
 */
export function Kitsune({ size = 160, move = 'idle', tick = 0, style }: KitsuneProps) {
  const h = size * (850 / 700);
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    y.value = 0;
    rot.value = 0;
    scale.value = 1;
    const ease = Easing.inOut(Easing.sin);

    if (move === 'idle' || move === 'work') {
      y.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 900, easing: ease }),
          withTiming(0, { duration: 900, easing: ease }),
        ),
        -1,
        false,
      );
    }
    if (move === 'hop') {
      y.value = withSequence(
        withTiming(-16, { duration: 160, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
      );
      scale.value = withSequence(
        withTiming(1.06, { duration: 160 }),
        withTiming(1, { duration: 200 }),
      );
    }
    if (move === 'tilt' || move === 'nod') {
      rot.value = withSequence(
        withTiming(move === 'tilt' ? -10 : 0, { duration: 140 }),
        withTiming(move === 'tilt' ? 8 : 0, { duration: 160 }),
        withTiming(0, { duration: 140 }),
      );
      if (move === 'nod') {
        y.value = withSequence(
          withTiming(6, { duration: 140 }),
          withTiming(0, { duration: 140 }),
          withTiming(6, { duration: 140 }),
          withTiming(0, { duration: 140 }),
        );
      }
    }
    if (move === 'wag' || move === 'paw' || move === 'tap') {
      rot.value = withSequence(
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withTiming(-4, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
    }
  }, [move, tick]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: h }, anim, style]}>
      <Image
        source={KITSUNE.full}
        style={{ width: size, height: h }}
        resizeMode="contain"
        // évite un flash blanc pendant le décodage
        fadeDuration={Platform.OS === 'android' ? 0 : undefined}
      />
    </Animated.View>
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
