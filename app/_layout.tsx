import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ChildProvider } from '../contexts/ChildContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ChildProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
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
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1424' },
});
