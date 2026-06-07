import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.faint,
        tabBarStyle: {
          backgroundColor: T.surface,
          borderTopColor: T.line,
          borderTopWidth: 1,
          paddingBottom: 22,
          paddingTop: 10,
          height: 80,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: -0.1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="children" options={{ title: 'Enfant', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="plan" options={{ title: 'Révisions', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="exercises" options={{ title: 'Exercices', tabBarIcon: ({ color, size }) => <Ionicons name="pencil-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
