import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { isLoggedIn } from '../lib/auth';
import { BUILD_ID, BUILD_LABEL } from '../constants/buildInfo';

/**
 * Porte d'entrée : tampon BOOT visible, puis redirection session.
 */
export default function Index() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await isLoggedIn();
        if (!cancelled) setLogged(v);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Erreur session');
          setLogged(false);
        }
      }
    })();
    const t = setTimeout(() => {
      if (!cancelled) setLogged((prev) => (prev === null ? false : prev));
    }, 2500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  if (logged === null) {
    return (
      <View style={s.root}>
        <Text style={s.ok}>BOOT OK</Text>
        <Text style={s.label}>{BUILD_LABEL}</Text>
        <ActivityIndicator color="#062E1E" size="large" style={{ marginTop: 24 }} />
        {err ? <Text style={s.err}>{err}</Text> : null}
        <Text style={s.build}>{BUILD_ID}</Text>
      </View>
    );
  }

  return <Redirect href={logged ? '/(tabs)' : '/(onboarding)/welcome'} />;
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#16B26E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  ok: { color: '#062E1E', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  label: { marginTop: 8, color: '#062E1E', fontSize: 16, fontWeight: '700', opacity: 0.85 },
  err: { marginTop: 16, color: '#3B0000', fontWeight: '700', textAlign: 'center' },
  build: {
    position: 'absolute',
    bottom: 36,
    color: 'rgba(6,46,30,0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
});
