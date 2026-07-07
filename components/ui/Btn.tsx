import React, { useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { T } from '../../constants/theme';

interface BtnProps {
  children: string;
  onPress: () => void;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  deep?: string;
  fg?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
  style?: object;
}

export function Btn({
  children, onPress, full, size = 'lg', color, deep, fg = '#fff',
  loading, disabled, icon, iconRight, style,
}: BtnProps) {
  const [pressed, setPressed] = useState(false);
  const c = color || T.primary;
  const d = deep || T.primaryDeep;
  const lip = size === 'sm' ? 3 : 4;
  const pad = size === 'lg' ? { paddingVertical: 17, paddingHorizontal: 24 }
    : size === 'sm' ? { paddingVertical: 11, paddingHorizontal: 16 }
    : { paddingVertical: 14, paddingHorizontal: 20 };
  const fs = size === 'lg' ? 17 : size === 'sm' ? 14.5 : 16;

  return (
    <TouchableOpacity
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.base,
        pad,
        { backgroundColor: c, width: full ? '100%' : undefined, opacity: disabled ? 0.5 : 1 },
        pressed
          ? { transform: [{ translateY: lip }, { scale: 0.98 }], shadowOpacity: 0 }
          : { transform: [{ translateY: 0 }, { scale: 1 }], shadowColor: d, shadowOffset: { width: 0, height: lip }, shadowOpacity: 1, shadowRadius: 0, elevation: lip },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: iconRight ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
          {icon}
          <Text style={{ color: fg, fontSize: fs, fontWeight: '700', letterSpacing: -0.2 }}>{children}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function GhostBtn({ children, onPress, full, icon, style }: { children: string; onPress: () => void; full?: boolean; icon?: React.ReactNode; style?: object }) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.8}
      style={[
        styles.base,
        { paddingVertical: 16, paddingHorizontal: 24, backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.lineStrong, width: full ? '100%' : undefined },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        {icon}
        <Text style={{ color: T.ink, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 }}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
