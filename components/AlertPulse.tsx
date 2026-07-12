import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation,
} from 'react-native-reanimated';

/**
 * Enveloppe une carte en état d'alerte rouge : bordure/halo rouge lumineux,
 * fond teinté (bordeaux en sombre, rosé en clair) et micro-oscillation
 * horizontale très discrète type « vibreur d'alerte ». Sobre dans les deux
 * thèmes. `active=false` → rendu neutre passé via `neutralStyle`.
 */
export function AlertPulse({
  active, scheme, neutralStyle, borderRadius = 22, children,
}: {
  active: boolean;
  scheme: 'light' | 'dark';
  neutralStyle: ViewStyle;
  borderRadius?: number;
  children: React.ReactNode;
}) {
  const glow = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (active) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ), -1,
      );
      // micro-oscillation : brève salve toutes les ~3,4 s, très faible amplitude
      shake.value = withRepeat(
        withSequence(
          withTiming(-1.4, { duration: 55 }), withTiming(1.4, { duration: 55 }),
          withTiming(-1, { duration: 55 }), withTiming(1, { duration: 55 }),
          withTiming(0, { duration: 55 }),
          withTiming(0, { duration: 3000 }),
        ), -1,
      );
    } else {
      cancelAnimation(glow); cancelAnimation(shake);
      glow.value = 0; shake.value = 0;
    }
    return () => { cancelAnimation(glow); cancelAnimation(shake); };
  }, [active]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
    shadowOpacity: active ? 0.35 + glow.value * 0.4 : 0,
    shadowRadius: active ? 12 + glow.value * 10 : 0,
    borderColor: active
      ? `rgba(255,${60 + glow.value * 40},${60 + glow.value * 40},${0.75 + glow.value * 0.25})`
      : (neutralStyle.borderColor as string) ?? 'transparent',
  }));

  if (!active) {
    return <Animated.View style={[neutralStyle, { borderRadius }]}>{children}</Animated.View>;
  }

  return (
    <Animated.View
      style={[
        {
          borderRadius,
          borderWidth: 1.5,
          backgroundColor: scheme === 'dark' ? 'rgba(70,18,24,0.55)' : '#FDECEC',
          shadowColor: '#FF3B3B',
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        anim,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export const alertPulseStyles = StyleSheet.create({});
