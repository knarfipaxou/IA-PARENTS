import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';

interface TopBarProps {
  onBack: () => void;
  right?: React.ReactNode;
}

export function TopBar({ onBack, right }: TopBarProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 4 }}>
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
        }}
      >
        <Ionicons name="arrow-back" size={21} color={T.ink} />
      </TouchableOpacity>
      {right && <View>{right}</View>}
    </View>
  );
}

export function StepPill({ n, total }: { n: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{
          width: i + 1 === n ? 22 : 8, height: 8, borderRadius: 999,
          backgroundColor: i + 1 <= n ? T.primary : T.lineStrong,
        }} />
      ))}
    </View>
  );
}
