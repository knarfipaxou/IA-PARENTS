import React, { useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { DK, Fonts } from '../../constants/darkTheme';
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
  /** parent = vert Kitsune · child = cyan */
  tone?: 'parent' | 'child' | 'light';
}

export function Btn({
  children, onPress, full, size = 'lg', color, deep, fg,
  loading, disabled, icon, iconRight, style, tone = 'parent',
}: BtnProps) {
  const [pressed, setPressed] = useState(false);
  const palette = tone === 'child'
    ? { c: DK.cyan, d: DK.cyanDeep, f: DK.onCyan }
    : tone === 'light'
      ? { c: T.primary, d: T.primaryDeep, f: T.onPrimary }
      : { c: DK.primary, d: DK.primaryDeep, f: DK.onPrimary };
  const c = color || palette.c;
  const d = deep || palette.d;
  const textColor = fg ?? palette.f;
  const lip = size === 'sm' ? 3 : 5;
  const pad = size === 'lg' ? { paddingVertical: 17, paddingHorizontal: 24 }
    : size === 'sm' ? { paddingVertical: 11, paddingHorizontal: 16 }
    : { paddingVertical: 14, paddingHorizontal: 20 };
  const fs = size === 'lg' ? 18 : size === 'sm' ? 14.5 : 16;

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
          ? { transform: [{ translateY: lip }, { scale: 0.98 }], shadowOpacity: 0, elevation: 0 }
          : { transform: [{ translateY: 0 }, { scale: 1 }], shadowColor: d, shadowOffset: { width: 0, height: lip }, shadowOpacity: 1, shadowRadius: 0, elevation: lip },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: iconRight ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
          {icon}
          <Text style={{ color: textColor, fontSize: fs, fontFamily: Fonts.display, letterSpacing: -0.2 }}>{children}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function GhostBtn({
  children, onPress, full, icon, style, dark = false,
}: {
  children: string; onPress: () => void; full?: boolean; icon?: React.ReactNode; style?: object; dark?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          paddingVertical: 16, paddingHorizontal: 24,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: dark ? DK.inputBorder : T.lineStrong,
          width: full ? '100%' : undefined,
        },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        {icon}
        <Text style={{
          color: dark ? DK.sub : T.ink,
          fontSize: 16,
          fontFamily: Fonts.display,
          letterSpacing: -0.2,
        }}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: DK.radiusBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
