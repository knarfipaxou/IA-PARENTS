import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HC, FONT } from '../../constants/handoff';
import { PhysicalButton } from '../../components/ui/PhysicalButton';
import { Kitsune } from '../../components/ui/Kitsune';

/**
 * Écran de bienvenue — porté depuis le handoff Kitsune (écran 1 « welcome »).
 * Mascotte + pitch + création de famille. Conserve la navigation existante
 * (création de compte via l'espace famille, connexion via login).
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[HC.gradTop, HC.gradBottom]} locations={[0, 0.6]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />

        {/* Mascotte au centre, entourée de deux anneaux */}
        <View style={s.hero}>
          <View style={s.ringOuter} />
          <View style={s.ringInner} />
          <View style={s.mascotWrap}>
            <Kitsune width={196} />
            <View style={s.badgePlus}>
              <Text style={s.badgePlusTxt}>+</Text>
            </View>
            <View style={s.badgeCheck}>
              <Text style={s.badgeCheckTxt}>✓</Text>
            </View>
          </View>
        </View>

        {/* Pitch + actions */}
        <View style={s.bottom}>
          <View style={s.textBlock}>
            <Text style={s.h1}>Une photo du cahier.{'\n'}Une révision sur mesure.</Text>
            <Text style={s.sub}>
              Vous scannez la leçon, l'IA prépare les exercices. Votre enfant révise, vous suivez.
            </Text>
          </View>

          <View style={s.actions}>
            <PhysicalButton
              label="CRÉER MA FAMILLE"
              variant="parent"
              onPress={() => router.push('/(onboarding)/family' as any)}
            />
            <Pressable
              onPress={() => router.push('/(onboarding)/login' as any)}
              style={s.secondary}
            >
              <Text style={s.secondaryTxt}>J'ai déjà un compte</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ringInner: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.11)',
  },
  mascotWrap: { width: 230, height: 230, alignItems: 'center', justifyContent: 'flex-end' },
  badgePlus: {
    position: 'absolute',
    left: -6,
    top: 16,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: HC.amber,
    transform: [{ rotate: '-14deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePlusTxt: { fontFamily: FONT.title, fontSize: 23, color: HC.onAmber },
  badgeCheck: {
    position: 'absolute',
    right: -4,
    bottom: 44,
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: HC.blue,
    transform: [{ rotate: '10deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCheckTxt: { fontFamily: FONT.title, fontSize: 21, color: '#fff' },
  bottom: { paddingHorizontal: 26, paddingBottom: 44, gap: 26 },
  textBlock: { gap: 12, alignItems: 'center' },
  h1: {
    fontFamily: FONT.title,
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: HC.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONT.body,
    fontSize: 15,
    lineHeight: 23,
    color: HC.sub,
    textAlign: 'center',
  },
  actions: { gap: 12 },
  secondary: {
    width: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryTxt: { fontFamily: FONT.title, fontSize: 16, color: HC.sub },
});
