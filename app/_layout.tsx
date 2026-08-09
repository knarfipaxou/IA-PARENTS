import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { ChildProvider } from '../contexts/ChildContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const ready = loaded || !!fontError || timedOut;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    // Fond sombre pendant le chargement — plus d'écran blanc
    return (
      <View style={{ flex: 1, backgroundColor: '#0F1424', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#35E4D2" />
      </View>
    );
  }

  return (
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
  );
}
