import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  Easing, interpolateColor, useAnimatedStyle, useSharedValue,
  withRepeat, withSequence, withTiming, cancelAnimation,
} from 'react-native-reanimated';

/**
 * Enveloppe une carte en état d'alerte rouge : bordure/halo rouge lumineux,
 * fond teinté (bordeaux en sombre, rosé en clair) et micro-oscillation
 * horizontale très discrète type « vibreur d'alerte ». Dès que l'alerte
 * retombe (active=false), la carte redevient strictement neutre.
 *
 * Toujours un seul et même Animated.View : toutes les propriétés (fond,
 * bordure, ombre) sont pilotées par l'animation, ce qui évite tout reliquat
 * visuel de bordure/halo rouge quand l'état repasse à normal.
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
  const on = useSharedValue(active ? 1 : 0);
  const glow = useSharedValue(0);
  const shake = useSharedValue(0);

  const neutralBg = (neutralStyle.backgroundColor as string) ?? 'transparent';
  const neutralBorder = (neutralStyle.borderColor as string) ?? 'transparent';
  const alertBg = scheme === 'dark' ? '#46121888' : '#FDECEC';
  const alertBorder = '#FF3B3B';

  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: 220 });
    if (active) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ), -1,
      );
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
      glow.value = withTiming(0, { duration: 200 });
      shake.value = withTiming(0, { duration: 120 });
    }
    return () => { cancelAnimation(glow); cancelAnimation(shake); };
  }, [active]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
    backgroundColor: interpolateColor(on.value, [0, 1], [neutralBg, alertBg]),
    borderColor: interpolateColor(on.value, [0, 1], [neutralBorder, alertBorder]),
    shadowColor: '#FF3B3B',
    shadowOpacity: on.value * (0.35 + glow.value * 0.4),
    shadowRadius: on.value * (12 + glow.value * 10),
  }));

  return (
    <Animated.View
      style={[
        { borderRadius, borderWidth: 1.5, shadowOffset: { width: 0, height: 0 }, elevation: active ? 6 : 0 },
        anim,
      ]}
    >
      {children}
    </Animated.View>
  );
}
