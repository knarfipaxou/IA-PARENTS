import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DK } from '../constants/darkTheme';
import { isLoggedIn } from '../lib/auth';

/**
 * Porte d'entrée : session locale active → sélecteur d'enfant ((tabs)),
 * sinon → écran de bienvenue (compte / connexion).
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
    // filet de sécurité : ne jamais rester bloqué
    const t = setTimeout(() => {
      if (!cancelled) setLogged((prev) => (prev === null ? false : prev));
    }, 2500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  if (logged === null) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator color={DK.cyan} size="large" />
          <Text style={{ color: DK.sub, fontSize: 14 }}>Chargement…</Text>
          {err ? <Text style={{ color: DK.coral }}>{err}</Text> : null}
        </View>
      </LinearGradient>
    );
  }

  return <Redirect href={logged ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
