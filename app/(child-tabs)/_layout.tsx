import { Tabs } from 'expo-router';
import { Image, View, Text, StyleSheet } from 'react-native';
import { DK, Fonts, DK_ICONS } from '../../constants/darkTheme';

function TabIcon({ source, focused, label }: { source: any; focused: boolean; label: string }) {
  return (
    <View style={styles.tabItem}>
      <Image source={source} style={[styles.icon, { opacity: focused ? 1 : 0.55 }]} />
      <Text style={[styles.label, { color: focused ? DK.cyan : DK.faint }]}>{label}</Text>
      <View style={[styles.underline, { backgroundColor: focused ? DK.cyan : 'transparent' }]} />
    </View>
  );
}

export default function ChildTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: DK.nav,
          borderTopColor: DK.cardBorder,
          borderTopWidth: 1,
          paddingBottom: 18,
          paddingTop: 10,
          height: 84,
        },
      }}
    >
      <Tabs.Screen
        name="espace"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={DK_ICONS.navHome} focused={focused} label="Accueil" />
          ),
        }}
      />
      <Tabs.Screen
        name="echeances"
        options={{
          title: 'Échéances',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={DK_ICONS.navCalendar} focused={focused} label="Échéances" />
          ),
        }}
      />
      <Tabs.Screen
        name="lecons"
        options={{
          title: 'Leçons',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={DK_ICONS.book} focused={focused} label="Leçons" />
          ),
        }}
      />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={DK_ICONS.navProfile} focused={focused} label="Profil" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', minWidth: 64 },
  icon: { width: 24, height: 24, resizeMode: 'contain' },
  label: { fontFamily: Fonts.bodySemi, fontSize: 11, marginTop: 3 },
  underline: { width: 26, height: 3, borderRadius: 2, marginTop: 3 },
});
