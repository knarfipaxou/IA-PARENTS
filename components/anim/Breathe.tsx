import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';

/** Balancement doux et continu (respiration) pour rendre un avatar/emoji vivant. */
export function Breathe({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);
  const anim = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + t.value * 0.045 },
      { rotate: `${(t.value - 0.5) * 4}deg` },
    ],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
