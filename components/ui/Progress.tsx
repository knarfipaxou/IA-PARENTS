import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { T } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const FILL_TIMING = { duration: 800, easing: Easing.out(Easing.cubic) };

export function ProgressBar({ value, color, h = 9 }: { value: number; color?: string; h?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(pct, FILL_TIMING); }, [pct]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={{ height: h, borderRadius: 999, backgroundColor: T.surfaceAlt, overflow: 'hidden' }}>
      <Animated.View style={[{
        height: '100%', borderRadius: 999,
        backgroundColor: color || T.primary,
      }, fill]} />
    </View>
  );
}

export function ProgressRing({
  value, size = 64, sw = 7, color, children,
}: { value: number; size?: number; sw?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(value, FILL_TIMING); }, [value]);
  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - v.value / 100),
  }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surfaceAlt} strokeWidth={sw} />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color || T.primary} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={animProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
