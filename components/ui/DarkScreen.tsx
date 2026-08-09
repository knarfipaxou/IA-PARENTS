import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DK } from '../../constants/darkTheme';

/** Fond Kitsune (dégradé radial approximé en LinearGradient). */
export function DarkScreen({
  children,
  style,
  edges = ['top', 'bottom'],
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  return (
    <LinearGradient colors={[DK.bgTop, DK.bg, DK.bgBottom]} locations={[0, 0.45, 1]} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.fill, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
