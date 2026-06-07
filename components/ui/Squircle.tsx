import React from 'react';
import { View, ViewStyle } from 'react-native';
import { T, AccentKey, accent } from '../../constants/theme';

interface SquircleProps {
  accentKey?: AccentKey;
  size?: number;
  r?: number;
  icon?: React.ReactNode;
  iconSize?: number;
  style?: ViewStyle;
}

export function Squircle({ accentKey = 'green', size = 46, r = 15, icon, style }: SquircleProps) {
  const a = accent(accentKey);
  return (
    <View style={[{
      width: size, height: size, borderRadius: r,
      backgroundColor: a.soft,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }, style]}>
      {icon}
    </View>
  );
}
