import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
  Easing, cancelAnimation,
} from 'react-native-reanimated';
import { KITSUNE } from '../constants/darkTheme';

export type KitsuneMove = 'idle' | 'nod' | 'tilt' | 'wag' | 'paw' | 'blink' | 'hop' | 'tap' | 'work';

interface KitsuneProps {
  size?: number;
  move?: KitsuneMove;
  /** remount / restart animation trigger */
  tick?: number;
  style?: object;
}

/**
 * Mascotte Kitsune articulée (4 calques).
 * Spec : design/handoff/Kitsune.dc.html
 */
export function Kitsune({ size = 160, move = 'idle', tick = 0, style }: KitsuneProps) {
  const h = size * (850 / 700);
  const breathe = useSharedValue(0);
  const headY = useSharedValue(0);
  const headRot = useSharedValue(0);
  const tailRot = useSharedValue(0);
  const pawY = useSharedValue(0);
  const hopY = useSharedValue(0);
  const blink = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(breathe);
    cancelAnimation(headY);
    cancelAnimation(headRot);
    cancelAnimation(tailRot);
    cancelAnimation(pawY);
    cancelAnimation(hopY);
    cancelAnimation(blink);
    headY.value = 0;
    headRot.value = 0;
    tailRot.value = 0;
    pawY.value = 0;
    hopY.value = 0;
    blink.value = 0;

    const ease = Easing.inOut(Easing.sin);

    // idle breathe always
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: ease }),
        withTiming(0, { duration: 1600, easing: ease }),
      ),
      -1,
      false,
    );
    tailRot.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 900, easing: ease }),
        withTiming(-4, { duration: 900, easing: ease }),
      ),
      -1,
      false,
    );

    if (move === 'nod' || move === 'work') {
      headY.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 220 }),
          withTiming(0, { duration: 220 }),
        ),
        move === 'work' ? -1 : 2,
        false,
      );
    }
    if (move === 'tilt') {
      headRot.value = withSequence(
        withTiming(-12, { duration: 180 }),
        withTiming(8, { duration: 220 }),
        withTiming(0, { duration: 200 }),
      );
    }
    if (move === 'wag') {
      tailRot.value = withRepeat(
        withSequence(
          withTiming(18, { duration: 120 }),
          withTiming(-14, { duration: 120 }),
        ),
        6,
        false,
      );
    }
    if (move === 'paw' || move === 'work' || move === 'tap') {
      pawY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 160 }),
          withTiming(0, { duration: 160 }),
        ),
        move === 'work' ? -1 : 3,
        false,
      );
    }
    if (move === 'hop') {
      hopY.value = withSequence(
        withTiming(-18, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }),
        withTiming(-10, { duration: 140 }),
        withTiming(0, { duration: 160 }),
      );
    }
    if (move === 'blink' || move === 'work') {
      blink.value = withRepeat(
        withSequence(
          withTiming(0, { duration: move === 'work' ? 900 : 400 }),
          withTiming(1, { duration: 80 }),
          withTiming(0, { duration: 80 }),
        ),
        move === 'work' ? -1 : 1,
        false,
      );
    }
  }, [move, tick]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hopY.value + breathe.value * 3 },
      { scaleY: 1 + breathe.value * 0.02 },
    ],
  }));
  const headStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: headY.value },
      { rotate: `${headRot.value}deg` },
    ],
  }));
  const tailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tailRot.value}deg` }],
  }));
  const pawStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pawY.value }],
  }));
  const lidStyle = useAnimatedStyle(() => ({
    opacity: blink.value,
    transform: [{ scaleY: 0.2 + blink.value * 0.8 }],
  }));

  return (
    <View style={[{ width: size, height: h }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, bodyStyle]}>
        <Animated.Image source={KITSUNE.tail} style={[styles.layer, tailStyle, { zIndex: 1 }]} resizeMode="contain" />
        <Image source={KITSUNE.body} style={[styles.layer, { zIndex: 2 }]} resizeMode="contain" />
        <Animated.Image source={KITSUNE.paw} style={[styles.layer, pawStyle, { zIndex: 3 }]} resizeMode="contain" />
        <Animated.View style={[StyleSheet.absoluteFill, headStyle, { zIndex: 4 }]}>
          <Image source={KITSUNE.head} style={styles.layer} resizeMode="contain" />
          {/* paupières */}
          <Animated.View style={[styles.lid, styles.lidL, lidStyle]} />
          <Animated.View style={[styles.lid, styles.lidR, lidStyle]} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Fallback image unique (chargement / taille très petite). */
export function KitsuneStatic({ size = 120, style }: { size?: number; style?: object }) {
  return (
    <Image
      source={KITSUNE.full}
      style={[{ width: size, height: size * (850 / 700) }, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  lid: {
    position: 'absolute',
    width: '12%',
    height: '8%',
    backgroundColor: '#E8894F',
    borderRadius: 999,
    top: '38%',
  },
  lidL: { left: '32%' },
  lidR: { right: '32%' },
});
