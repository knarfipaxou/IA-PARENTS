import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DarkScreen } from '../components/ui/DarkScreen';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { DK, Fonts, DK_ICONS } from '../constants/darkTheme';

/**
 * Photo illisible — l'IA refuse d'inventer (garde-fou pédagogique).
 * Handoff écran 18.
 */
export default function BlurryScreen() {
  const router = useRouter();
  const { pct } = useLocalSearchParams<{ pct?: string }>();
  const percent = Math.max(40, Math.min(99, Number(pct) || 62));

  return (
    <DarkScreen>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Photo illisible</Text>
        </View>

        <View style={s.preview}>
          <View style={s.blurLines}>
            {[62, 92, 86, 94, 48, 88, 79, 90].map((w, i) => (
              <View key={i} style={[s.line, { width: `${w}%`, opacity: 0.35 + i * 0.07 }]} />
            ))}
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>Flou · reflet</Text>
          </View>
        </View>

        <View style={s.warnCard}>
          <Image source={DK_ICONS.warning} style={{ width: 30, height: 30 }} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={s.warnTitle}>{percent} % de la page est illisible</Text>
            <Text style={s.warnBody}>
              Je ne peux pas inventer ce que je ne lis pas. Reprenez la photo bien cadrée, sans reflet, pour que je prépare une révision fidèle.
            </Text>
          </View>
        </View>

        <View style={s.tips}>
          {[
            'Cadrez toute la page, bords visibles',
            'Éclairez sans flash ni reflet',
            'Tenez le téléphone bien droit',
          ].map((t) => (
            <View key={t} style={s.tipRow}>
              <Text style={s.tipDot}>•</Text>
              <Text style={s.tipText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 20 }} />
        <Btn full onPress={() => router.replace('/scan' as any)}>REPRENDRE LA PHOTO</Btn>
        <GhostBtn dark full onPress={() => router.back()} style={{ marginTop: 12 }}>Annuler</GhostBtn>
      </ScrollView>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontSize: 22, color: DK.sub },
  title: { fontFamily: Fonts.displayMed, fontSize: 17, color: DK.ink },
  preview: {
    height: 250, borderRadius: 24, overflow: 'hidden', backgroundColor: '#D9D3C4',
  },
  blurLines: { flex: 1, padding: 26, gap: 15, opacity: 0.85 },
  line: { height: 10, borderRadius: 4, backgroundColor: '#5A6274' },
  badge: {
    position: 'absolute', right: 14, bottom: 14,
    backgroundColor: 'rgba(15,20,36,0.72)', borderRadius: 99,
    paddingHorizontal: 13, paddingVertical: 7,
  },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: 11.5, color: DK.coralLight },
  warnCard: {
    backgroundColor: 'rgba(255,107,90,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,107,90,0.3)',
    borderRadius: 22, padding: 18, flexDirection: 'row', gap: 14, marginTop: -8,
  },
  warnTitle: { fontFamily: Fonts.displayMed, fontSize: 16, color: DK.coralLight },
  warnBody: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, color: DK.sub },
  tips: { gap: 10, paddingHorizontal: 4 },
  tipRow: { flexDirection: 'row', gap: 10 },
  tipDot: { color: DK.primaryLight, fontSize: 16 },
  tipText: { fontFamily: Fonts.bodyMed, fontSize: 14, color: DK.sub, flex: 1 },
});
