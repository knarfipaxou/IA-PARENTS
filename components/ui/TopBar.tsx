import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { T } from '../../constants/theme';

interface TopBarProps {
  onBack: () => void;
  right?: React.ReactNode;
  dark?: boolean;
}

export function TopBar({ onBack, right, dark = false }: TopBarProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 4 }}>
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: dark ? 'rgba(255,255,255,0.06)' : T.surface,
          borderWidth: 1,
          borderColor: dark ? DK.cardBorder : T.line,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Ionicons name="arrow-back" size={21} color={dark ? DK.ink : T.ink} />
      </TouchableOpacity>
      {right && <View>{right}</View>}
    </View>
  );
}

export function StepPill({ n, total, dark = true }: { n: number; total: number; dark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{
          width: i + 1 === n ? 22 : 8, height: 8, borderRadius: 999,
          backgroundColor: i + 1 <= n
            ? (dark ? DK.primary : T.primary)
            : (dark ? DK.inputBorder : T.lineStrong),
        }} />
      ))}
    </View>
  );
}
