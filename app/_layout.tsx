import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="scan-agenda" />
        <Stack.Screen name="result" />
        <Stack.Screen name="agenda-results" />
        <Stack.Screen name="validation" />
        <Stack.Screen name="photo-floue" />
        <Stack.Screen name="correction" />
        <Stack.Screen name="mock-test" />
        <Stack.Screen name="pdf" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="coming-soon" />
      </Stack>
    </SafeAreaProvider>
  );
}
