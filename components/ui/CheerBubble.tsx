import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { DK, Fonts } from '../../constants/darkTheme';

/** Bulle d'encouragement Kitsune (ppBubble). */
export function CheerBubble({ text, tick }: { text: string; tick: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = 0;
    v.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [tick, text]);

  const anim = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [
      { translateY: (1 - v.value) * 6 },
      { scale: 0.96 + v.value * 0.04 },
    ],
  }));

  if (!text) return null;
  return (
    <Animated.View style={[styles.bubble, anim]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: DK.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 220,
  },
  text: {
    color: DK.ink,
    fontFamily: Fonts.displayMed,
    fontSize: 14,
    lineHeight: 20,
  },
});
