import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { isLoggedIn } from '../lib/auth';
import { BUILD_ID } from '../constants/buildInfo';

/**
 * Porte d'entrée : chargement court puis welcome / sélecteur enfant.
 */
export default function Index() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await isLoggedIn();
        if (!cancelled) setLogged(v);
      } catch {
        if (!cancelled) setLogged(false);
      }
    })();
    const t = setTimeout(() => {
      if (!cancelled) setLogged((prev) => (prev === null ? false : prev));
    }, 1800);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  if (logged === null) {
    return (
      <View style={s.root}>
        <ActivityIndicator color="#35E4D2" size="large" />
        <Text style={s.label}>Chargement…</Text>
        <Text style={s.build}>{BUILD_ID}</Text>
      </View>
    );
  }

  return <Redirect href={logged ? '/(tabs)' : '/(onboarding)/welcome'} />;
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1424',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  label: { color: '#96A3CC', fontSize: 15, fontWeight: '600' },
  build: {
    position: 'absolute',
    bottom: 28,
    color: 'rgba(255,255,255,0.28)',
    fontSize: 11,
    fontWeight: '700',
  },
});
