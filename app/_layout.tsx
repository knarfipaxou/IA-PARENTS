import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ChildProvider } from '../contexts/ChildContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BUILD_ID } from '../constants/buildInfo';

SplashScreen.hideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <ChildProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'none',
                gestureEnabled: false,
                fullScreenGestureEnabled: false,
                contentStyle: { backgroundColor: '#0F1424' },
              }}
            />
          </ChildProvider>
        </SafeAreaProvider>
        <Text style={styles.buildTag} pointerEvents="none">{BUILD_ID}</Text>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1424' },
  buildTag: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    color: 'rgba(255,255,255,0.28)',
    fontSize: 10,
    fontWeight: '700',
  },
});
