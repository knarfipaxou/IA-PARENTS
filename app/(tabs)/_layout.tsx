import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Barre d'onglets parent en sombre, cohérente avec le sélecteur d'enfant.
const DKTAB = { bg: '#0B1023', border: 'rgba(148,168,255,0.16)', active: '#35E4D2', inactive: 'rgba(210,220,255,0.65)' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: DKTAB.active,
        tabBarInactiveTintColor: DKTAB.inactive,
        tabBarStyle: {
          backgroundColor: DKTAB.bg,
          borderTopColor: DKTAB.border,
          borderTopWidth: 1,
          paddingBottom: 22,
          paddingTop: 10,
          height: 80,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: -0.1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
