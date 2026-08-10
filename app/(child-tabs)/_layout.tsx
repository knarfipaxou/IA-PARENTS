import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useScheme } from '../../lib/useScheme';

// Barre d'onglets bi-thème (maquettes clair/sombre) : actif teal + soulignement
const THEMES = {
  dark: { bg: '#0B1023', border: 'rgba(148,168,255,0.16)', active: '#35E4D2', inactive: 'rgba(210,220,255,0.65)' },
  light: { bg: '#FFFFFF', border: 'rgba(27,37,89,0.08)', active: '#12B886', inactive: '#6B7699' },
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name={name as any} size={24} color={color} />
      <View style={{
        width: 26, height: 3, borderRadius: 2, marginTop: 4,
        backgroundColor: focused ? color : 'transparent',
      }} />
    </View>
  );
}

export default function ChildTabsLayout() {
  const scheme = useScheme();
  const T = scheme === 'light' ? THEMES.light : THEMES.dark;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.active,
        tabBarInactiveTintColor: T.inactive,
        tabBarStyle: {
          backgroundColor: T.bg,
          borderTopColor: T.border,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 10,
          height: 84,
        },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600', letterSpacing: -0.1 },
      }}
    >
      <Tabs.Screen
        name="espace"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="echeances"
        options={{
          title: 'Échéances',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lecons"
        options={{
          title: 'Leçons',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
