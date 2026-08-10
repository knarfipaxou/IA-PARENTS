import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import { KITSUNE } from '../constants/darkTheme';

export type KitsuneMove = 'idle' | 'nod' | 'tilt' | 'wag' | 'paw' | 'blink' | 'hop' | 'tap' | 'work';

interface KitsuneProps {
  size?: number;
  move?: KitsuneMove;
  tick?: number;
  style?: ViewStyle;
}

/**
 * Mascotte Kitsune — expo-image + préchargement Asset (plus fiable sous EAS Update / Expo Go).
 */
export function Kitsune({ size = 160, style }: KitsuneProps) {
  const h = size * (850 / 700);
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(KITSUNE.full);
        await asset.downloadAsync();
        if (!cancelled) setUri(asset.localUri ?? asset.uri);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={[{ width: size, height: h, alignItems: 'center', justifyContent: 'center' }, style]}>
      {failed ? (
        <View style={[styles.fallback, { width: size * 0.85, height: size * 0.85 }]}>
          <Text style={styles.fallbackText}>Kitsune</Text>
        </View>
      ) : (
        <Image
          source={uri ? { uri } : KITSUNE.full}
          style={{ width: size, height: h }}
          contentFit="contain"
          transition={0}
          onError={() => setFailed(true)}
          accessibilityLabel="Kitsune"
        />
      )}
    </View>
  );
}

export function KitsuneStatic({ size = 120, style }: { size?: number; style?: ViewStyle }) {
  return <Kitsune size={size} style={style} />;
}

const styles = StyleSheet.create({
  fallback: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,176,32,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: { color: '#FFB020', fontWeight: '800', fontSize: 16 },
});
