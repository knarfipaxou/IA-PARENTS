import { useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

/**
 * Thème clair/sombre du téléphone, avec écoute directe du système
 * (plus fiable que useColorScheme dans Expo Go : réagit au basculement
 * du réglage iOS/Android pendant que l'app est ouverte).
 */
export function useScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setScheme(colorScheme));
    return () => sub.remove();
  }, []);
  return scheme === 'light' ? 'light' : 'dark';
}
