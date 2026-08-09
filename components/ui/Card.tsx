import React from 'react';
import { View, ViewStyle } from 'react-native';
import { DK } from '../../constants/darkTheme';
import { T } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  pad?: number;
  soft?: boolean;
  style?: ViewStyle;
  /** dark = Kitsune (défaut) · light = legacy */
  variant?: 'dark' | 'light';
}

export function Card({ children, pad = 18, soft, style, variant = 'light' }: CardProps) {
  const dark = variant === 'dark';
  return (
    <View style={[{
      backgroundColor: soft
        ? (dark ? 'rgba(255,255,255,0.04)' : T.surfaceAlt)
        : (dark ? DK.card : T.surface),
      borderRadius: dark ? DK.radiusCard : 24,
      padding: pad,
      borderWidth: 1,
      borderColor: dark ? DK.cardBorder : T.line,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: soft ? 0 : 10 },
      shadowOpacity: soft ? 0 : 0.14,
      shadowRadius: soft ? 0 : 26,
      elevation: soft ? 0 : 4,
    }, style]}>
      {children}
    </View>
  );
}
