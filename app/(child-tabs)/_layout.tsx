import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Thème sombre néon de l'espace enfant (cf. maquette)
const DK = {
  bg: '#0B1023',
  border: 'rgba(148,168,255,0.16)',
  active: '#2EE6D6',
  inactive: '#5D6890',
};

export default function ChildTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: DK.active,
        tabBarInactiveTintColor: DK.inactive,
        tabBarStyle: {
          backgroundColor: DK.bg,
          borderTopColor: DK.border,
          borderTopWidth: 1,
          paddingBottom: 22,
          paddingTop: 10,
          height: 80,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: -0.1 },
      }}
    >
      <Tabs.Screen
        name="espace"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="echeances"
        options={{
          title: 'Échéances',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
