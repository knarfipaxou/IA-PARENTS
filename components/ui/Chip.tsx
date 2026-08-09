import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { T, AccentKey, accent } from '../../constants/theme';
import { FONT } from '../../constants/handoff';

interface ChipProps {
  children: React.ReactNode;
  accentKey?: AccentKey;
  solid?: boolean;
  style?: ViewStyle;
  fontSize?: number;
}

export function Chip({ children, accentKey = 'green', solid, style, fontSize = 12.5 }: ChipProps) {
  const a = accent(accentKey);
  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: solid ? a.solid : a.soft,
      borderRadius: 999,
      paddingHorizontal: 11, paddingVertical: 5,
    }, style]}>
      {typeof children === 'string'
        ? <Text style={{ color: solid ? '#fff' : a.fg, fontSize, fontFamily: FONT.bodySemi, letterSpacing: 0.1 }}>{children}</Text>
        : children
      }
    </View>
  );
}

export function StatusChip({ status }: { status: 'confirme' | 'incertain' | 'erreur' | 'flou' }) {
  const map = {
    confirme:  { label: 'Confirmé',    accentKey: 'green' as AccentKey },
    incertain: { label: 'À vérifier',  accentKey: 'amber' as AccentKey },
    erreur:    { label: 'À refaire',   accentKey: 'coral' as AccentKey },
    flou:      { label: 'Illisible',   accentKey: 'blue' as AccentKey },
  };
  const { label, accentKey } = map[status];
  const a = accent(accentKey);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: a.soft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: a.solid }} />
      <Text style={{ color: a.fg, fontSize: 12.5, fontFamily: FONT.bodyBold, letterSpacing: 0.1 }}>{label}</Text>
    </View>
  );
}
