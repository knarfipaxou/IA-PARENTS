import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ChildProvider } from '../contexts/ChildContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Ne PAS bloquer le démarrage sur les fonts Google (cause fréquente d'écran noir).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    // Chargement fonts en arrière-plan, non bloquant
    (async () => {
      try {
        const Font = await import('expo-font');
        const fredoka = await import('@expo-google-fonts/fredoka');
        const jakarta = await import('@expo-google-fonts/plus-jakarta-sans');
        await Font.loadAsync({
          Fredoka_400Regular: fredoka.Fredoka_400Regular,
          Fredoka_500Medium: fredoka.Fredoka_500Medium,
          Fredoka_600SemiBold: fredoka.Fredoka_600SemiBold,
          Fredoka_700Bold: fredoka.Fredoka_700Bold,
          PlusJakartaSans_400Regular: jakarta.PlusJakartaSans_400Regular,
          PlusJakartaSans_500Medium: jakarta.PlusJakartaSans_500Medium,
          PlusJakartaSans_600SemiBold: jakarta.PlusJakartaSans_600SemiBold,
          PlusJakartaSans_700Bold: jakarta.PlusJakartaSans_700Bold,
          PlusJakartaSans_800ExtraBold: jakarta.PlusJakartaSans_800ExtraBold,
        });
      } catch (e) {
        console.warn('Fonts optionnelles non chargées', e);
      }
    })();
  }, []);

  return (
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
  );
}
