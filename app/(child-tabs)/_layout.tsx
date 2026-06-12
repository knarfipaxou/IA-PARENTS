import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { T } from '../../constants/theme';
import { useChild } from '../../contexts/ChildContext';

export default function ChildTabsLayout() {
  const router = useRouter();
  const { child, setChild } = useChild();

  function goBack() {
    setChild(null);
    router.replace('/(tabs)/' as any);
  }

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
