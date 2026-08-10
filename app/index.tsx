import { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { isLoggedIn } from '../lib/auth';
import { BUILD_ID, BUILD_LABEL } from '../constants/buildInfo';

/**
 * Porte d'entrée ultra-visible.
 * Si tu vois cet écran cyan → le JS EAS est bien chargé (plus d'écran blanc silencieux).
 */
export default function Index() {
  const router = useRouter();
  const [phase, setPhase] = useState<'boot' | 'loading' | 'go'>('boot');
  const [logged, setLogged] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Laisse 1 frame peindre le tampon BOOT avant toute logique async.
    const t = setTimeout(() => setPhase('loading'), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;
    let cancelled = false;
    (async () => {
      try {
        const v = await isLoggedIn();
        if (!cancelled) {
          setLogged(v);
          setPhase('go');
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Erreur session');
          setLogged(false);
          setPhase('go');
        }
      }
    })();
    const safety = setTimeout(() => {
      if (!cancelled) setPhase((p) => (p === 'loading' ? 'go' : p));
    }, 2500);
    return () => { cancelled = true; clearTimeout(safety); };
  }, [phase]);

  if (phase === 'go') {
    return <Redirect href={logged ? '/(tabs)' : '/(onboarding)/welcome'} />;
  }

  return (
    <View style={s.root}>
      <Text style={s.ok}>BOOT OK</Text>
      <Text style={s.label}>{BUILD_LABEL}</Text>
      <Text style={s.hint}>
        Si tu lis ceci, l’app n’est PAS cassée.{'\n'}
        Tes données locales (ppia.*) sont intactes.
      </Text>
      {phase === 'loading' ? (
        <ActivityIndicator color="#062E1E" size="large" style={{ marginTop: 28 }} />
      ) : null}
      {err ? <Text style={s.err}>{err}</Text> : null}
      <Pressable
        style={s.btn}
        onPress={() => router.replace('/(onboarding)/welcome' as any)}
      >
        <Text style={s.btnText}>Continuer → welcome</Text>
      </Pressable>
      <Text style={s.build}>{BUILD_ID}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#16B26E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  ok: {
    color: '#062E1E',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  label: {
    marginTop: 8,
    color: '#062E1E',
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.85,
  },
  hint: {
    marginTop: 22,
    color: '#062E1E',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  err: { marginTop: 16, color: '#3B0000', fontWeight: '700', textAlign: 'center' },
  btn: {
    marginTop: 32,
    backgroundColor: '#062E1E',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  build: {
    position: 'absolute',
    bottom: 36,
    color: 'rgba(6,46,30,0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
});
