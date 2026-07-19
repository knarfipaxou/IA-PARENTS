import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChildProvider } from '../contexts/ChildContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ChildProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
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
        </Stack>
      </ChildProvider>
    </SafeAreaProvider>
  );
}
