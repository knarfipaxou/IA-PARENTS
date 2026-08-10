import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DK } from '../constants/darkTheme';
import { isLoggedIn } from '../lib/auth';

/**
 * Porte d'entrée : session locale active → sélecteur d'enfant ((tabs)),
 * sinon → écran de bienvenue (compte / connexion).
 */
export default function Index() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    isLoggedIn().then(setLogged);
  }, []);

  if (logged === null) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={DK.cyan} />
        </View>
      </LinearGradient>
    );
  }

  return <Redirect href={logged ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
