import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BUILD_ID, BUILD_LABEL } from '../constants/buildInfo';

SplashScreen.hideAsync().catch(() => {});

/**
 * DIAGNOSTIC — aucun Stack / ChildProvider / GestureHandler / SafeArea.
 * Si cet écran s'affiche, React + EAS Update fonctionnent.
 * La navigation sera réactivée juste après confirmation.
 */
export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <View style={styles.root}>
        <Text style={styles.ok}>ROOT OK</Text>
        <Text style={styles.label}>{BUILD_LABEL}</Text>
        <Text style={styles.hint}>
          Rien n’est perdu.{'\n'}
          Stack temporairement coupé pour isoler le crash.{'\n'}
          Dis-moi si tu vois cet écran vert.
        </Text>
        <Pressable style={styles.pill}>
          <Text style={styles.pillText}>JS vivant ✓</Text>
        </Pressable>
        <Text style={styles.build}>{BUILD_ID}</Text>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#16B26E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  ok: {
    color: '#062E1E',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  label: {
    marginTop: 8,
    color: '#062E1E',
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.85,
  },
  hint: {
    marginTop: 22,
    color: '#062E1E',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  pill: {
    marginTop: 28,
    backgroundColor: '#062E1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pillText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  build: {
    position: 'absolute',
    bottom: 36,
    color: 'rgba(6,46,30,0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
});
