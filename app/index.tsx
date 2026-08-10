import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { isLoggedIn } from '../lib/auth';
import { BUILD_ID, BUILD_LABEL } from '../constants/buildInfo';

/**
 * Écran de boot volontairement statique (pas de Redirect auto).
 * Si tu vois le vert → JS + React OK. Ensuite tu choisis où aller.
 */
export default function Index() {
  const router = useRouter();
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
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={s.root}>
      <Text style={s.ok}>BOOT OK</Text>
      <Text style={s.label}>{BUILD_LABEL}</Text>
      <Text style={s.hint}>
        Update chargée. Rien n’est perdu.{'\n'}
        Session : {logged === null ? '…' : logged ? 'connecté' : 'invité'}
      </Text>

      <Pressable
        style={s.btn}
        onPress={() => router.replace('/(onboarding)/welcome' as any)}
      >
        <Text style={s.btnText}>Continuer → welcome</Text>
      </Pressable>

      {logged ? (
        <Pressable
          style={[s.btn, s.btnAlt]}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text style={s.btnText}>Continuer → enfants</Text>
        </Pressable>
      ) : null}

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
    gap: 10,
  },
  ok: {
    color: '#062E1E',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  label: {
    color: '#062E1E',
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.85,
  },
  hint: {
    marginTop: 12,
    marginBottom: 8,
    color: '#062E1E',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: 10,
    backgroundColor: '#062E1E',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 260,
    alignItems: 'center',
  },
  btnAlt: { backgroundColor: '#0D8C56' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  build: {
    position: 'absolute',
    bottom: 36,
    color: 'rgba(6,46,30,0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
});
