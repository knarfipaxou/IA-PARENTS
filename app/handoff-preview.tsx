import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HC, FONT, TYPE, SP, R, tintBg, AI_STATUS } from '../constants/handoff';
import { PhysicalButton } from '../components/ui/PhysicalButton';

/**
 * Écran de prévisualisation (dev) de la nouvelle voie graphique (handoff Kitsune) :
 * dégradé de fond, polices Fredoka + Plus Jakarta Sans, tokens couleurs,
 * bouton « touche physique ». Non relié à la navigation de production.
 */
export default function HandoffPreview() {
  const [count, setCount] = useState(0);

  return (
    <LinearGradient colors={[HC.gradTop, HC.bgApp]} locations={[0, 0.6]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.kicker}>NOUVELLE VOIE GRAPHIQUE</Text>
          <Text style={s.h1}>Bonjour Kitsune 🦊</Text>
          <Text style={s.body}>
            Fondation posée : polices Fredoka & Plus Jakarta Sans, palette du handoff et
            bouton « touche physique ». Les 21 écrans arrivent dès le push.
          </Text>

          {/* Boutons physiques */}
          <View style={s.block}>
            <Text style={s.section}>Bouton principal (effet Duolingo)</Text>
            <PhysicalButton label={`Action parent · ${count}`} variant="parent" onPress={() => setCount((n) => n + 1)} />
            <View style={{ height: SP.m }} />
            <PhysicalButton label="Action enfant" variant="enfant" onPress={() => setCount((n) => n + 1)} />
          </View>

          {/* Carte verre */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Carte verre</Text>
            <Text style={s.meta}>Surface rgba(255,255,255,.06) · bordure .08 · rayon 16px</Text>
            <View style={s.chipsRow}>
              <View style={[s.chip, { backgroundColor: tintBg.green }]}>
                <Text style={[s.chipTxt, { color: HC.greenLight }]}>Lu ✓</Text>
              </View>
              <View style={[s.chip, { backgroundColor: tintBg.amber }]}>
                <Text style={[s.chipTxt, { color: HC.amber }]}>À vérifier</Text>
              </View>
              <View style={[s.chip, { backgroundColor: tintBg.coral }]}>
                <Text style={[s.chipTxt, { color: HC.coralLight }]}>Erreur</Text>
              </View>
            </View>
          </View>

          {/* Code couleur IA */}
          <View style={s.block}>
            <Text style={s.section}>Code couleur IA</Text>
            <View style={s.swatches}>
              {([
                ['Lu', AI_STATUS.lu],
                ['À vérifier', AI_STATUS.aVerifier],
                ['Erreur', AI_STATUS.erreur],
              ] as const).map(([label, v]) => (
                <View key={label} style={s.swatch}>
                  <View style={[s.dot, { backgroundColor: v }]} />
                  <Text style={s.swatchTxt}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: SP.xl, paddingTop: SP.h, paddingBottom: SP.screenBottom },
  kicker: { fontFamily: FONT.bodySemi, fontSize: 11.5, letterSpacing: 1, color: HC.cyan },
  h1: { ...TYPE.h1, color: HC.ink, marginTop: SP.s },
  body: { ...TYPE.body, color: HC.sub, marginTop: SP.m },
  block: { marginTop: SP.xxl },
  section: { fontFamily: FONT.bodyBold, fontSize: 13, color: HC.sub, marginBottom: SP.md },
  card: {
    marginTop: SP.xxl,
    backgroundColor: HC.cardTo,
    borderColor: HC.cardBorder,
    borderWidth: 1,
    borderRadius: R.card,
    padding: SP.l,
  },
  cardTitle: { fontFamily: FONT.bodyBold, fontSize: 16, color: HC.ink },
  meta: { ...TYPE.meta, marginTop: SP.xs },
  chipsRow: { flexDirection: 'row', gap: SP.s, marginTop: SP.md, flexWrap: 'wrap' },
  chip: { borderRadius: R.chip, paddingHorizontal: SP.md, paddingVertical: SP.s },
  chipTxt: { fontFamily: FONT.bodySemi, fontSize: 12 },
  swatches: { flexDirection: 'row', gap: SP.l },
  swatch: { alignItems: 'center', gap: SP.s },
  dot: { width: 34, height: 34, borderRadius: R.chip },
  swatchTxt: { fontFamily: FONT.bodyMed, fontSize: 12, color: HC.sub },
});
