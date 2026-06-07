import React from 'react';
import { View, ViewStyle } from 'react-native';
import { T } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  pad?: number;
  soft?: boolean;
  style?: ViewStyle;
}

export function Card({ children, pad = 18, soft, style }: CardProps) {
  return (
    <View style={[{
      backgroundColor: soft ? T.surfaceAlt : T.surface,
      borderRadius: 24,
      padding: pad,
      borderWidth: 1,
      borderColor: T.line,
      shadowColor: '#102818',
      shadowOffset: { width: 0, height: soft ? 0 : 6 },
      shadowOpacity: soft ? 0 : 0.07,
      shadowRadius: soft ? 0 : 16,
      elevation: soft ? 0 : 3,
    }, style]}>
      {children}
    </View>
  );
}
