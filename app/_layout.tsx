import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ChildProvider } from '../contexts/ChildContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BUILD_ID } from '../constants/buildInfo';

// Ne PAS appeler preventAutoHideAsync : un splash bloqué = écran figé.
SplashScreen.hideAsync().catch(() => {});

/** Filet JS global — les erreurs hors React finissent aussi à l'écran si possible. */
function installGlobalHandlers() {
  const g = globalThis as any;
  const prev = g.ErrorUtils?.getGlobalHandler?.();
  g.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    console.error('GlobalError', isFatal, error);
    if (typeof prev === 'function') prev(error, isFatal);
  });
}

export default function RootLayout() {
  useEffect(() => {
    installGlobalHandlers();
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    // ErrorBoundary DOIT rester le plus à l'extérieur — sinon crash = écran blanc.
    <ErrorBoundary>
      <View style={styles.root}>
        <SafeAreaProvider>
          <ChildProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#0F1424' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(child-tabs)" />
              <Stack.Screen name="scan" />
              <Stack.Screen name="scan-agenda" />
              <Stack.Screen name="result" />
              <Stack.Screen name="echeance-detail" />
              <Stack.Screen name="attach-lesson" />
              <Stack.Screen name="prepare-control" />
              <Stack.Screen name="manual-deadline" />
              <Stack.Screen name="add-child" />
              <Stack.Screen name="generate" />
              <Stack.Screen name="lessons" />
              <Stack.Screen name="lesson-detail" />
              <Stack.Screen name="agenda-validate" />
              <Stack.Screen name="echeance-edit" />
              <Stack.Screen name="edit-child" />
              <Stack.Screen name="archived-children" />
              <Stack.Screen name="mission" />
              <Stack.Screen name="mission-rappel" />
              <Stack.Screen name="mission-exo" />
              <Stack.Screen name="mission-result" />
              <Stack.Screen name="drill" />
              <Stack.Screen name="blurry" />
            </Stack>
          </ChildProvider>
        </SafeAreaProvider>
        {/* Filigrane discrète : confirme que le JS de CETTE update tourne */}
        <Text style={styles.buildTag} pointerEvents="none">{BUILD_ID}</Text>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1424' },
  buildTag: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '700',
  },
});
