import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DarkScreen } from '../../components/ui/DarkScreen';
import { Btn, GhostBtn } from '../../components/ui/Btn';
import { Kitsune, type KitsuneMove } from '../../components/Kitsune';
import { DK, Fonts } from '../../constants/darkTheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [move, setMove] = useState<KitsuneMove>('idle');

  function poke() {
    const moves: KitsuneMove[] = ['wag', 'hop', 'nod', 'paw'];
    setMove(moves[tick % moves.length]);
    setTick((t) => t + 1);
  }

  return (
    <DarkScreen style={s.safe}>
      <View style={s.hero}>
        <View style={s.ringOuter} />
        <View style={s.ringInner} />
        <TouchableOpacity activeOpacity={0.9} onPress={poke} style={s.kitsuneWrap}>
          <Kitsune size={196} move={move} tick={tick} />
          <View style={[s.badge, s.badgePlus]}><Text style={s.badgePlusText}>+</Text></View>
          <View style={[s.badge, s.badgeOk]}><Text style={s.badgeOkText}>✓</Text></View>
        </TouchableOpacity>
      </View>

      <View style={s.bottom}>
        <Text style={s.title}>Une photo du cahier.{"\n"}Une révision sur mesure.</Text>
        <Text style={s.sub}>
          Vous scannez la leçon, l'IA prépare les exercices. Votre enfant révise, vous suivez.
        </Text>
        <View style={s.actions}>
          <Btn full onPress={() => router.push('/(onboarding)/family' as any)}>CRÉER MA FAMILLE</Btn>
          <GhostBtn dark full onPress={() => router.push('/(onboarding)/login' as any)}>J'ai déjà un compte</GhostBtn>
        </View>
      </View>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    position: 'absolute', width: 290, height: 290, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)',
  },
  ringInner: {
    position: 'absolute', width: 196, height: 196, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.11)', borderStyle: 'dashed',
  },
  kitsuneWrap: { width: 230, height: 230, alignItems: 'center', justifyContent: 'flex-end' },
  badge: {
    position: 'absolute', width: 46, height: 46, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  badgePlus: { left: -6, top: 16, backgroundColor: DK.amber, transform: [{ rotate: '-14deg' }] },
  badgePlusText: { fontFamily: Fonts.display, fontSize: 23, color: DK.onAmber },
  badgeOk: { right: -4, bottom: 44, width: 44, height: 44, borderRadius: 15, backgroundColor: DK.blue, transform: [{ rotate: '10deg' }] },
  badgeOkText: { fontFamily: Fonts.display, fontSize: 21, color: '#fff' },
  bottom: { paddingHorizontal: DK.screenPadXWelcome, paddingBottom: 44, gap: 26 },
  title: {
    fontFamily: Fonts.display, fontSize: 31, lineHeight: 36, letterSpacing: -0.3,
    color: DK.ink, textAlign: 'center',
  },
  sub: {
    fontFamily: Fonts.body, fontSize: 15, lineHeight: 23,
    color: DK.sub, textAlign: 'center', marginTop: -10,
  },
  actions: { gap: 12 },
});
