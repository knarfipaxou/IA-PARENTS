import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { T } from '../constants/theme';
import { FONT } from '../constants/handoff';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { Btn } from '../components/ui/Btn';

const KEYWORDS = ['Numérateur', 'Dénominateur', 'Comparer'];

export default function MissionRappel() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      {/* Mission progress bar */}
      <View style={s.topBar}>
        <View style={s.closeBtn}>
          <Ionicons name="close" size={20} color={T.sub} />
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: '25%' }]} />
        </View>
        <Text style={s.stepCount}>1/4</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.chipRow}>
          <View style={s.recallChip}>
            <Ionicons name="bulb-outline" size={14} color={T.blue.fg} />
            <Text style={s.recallChipText}>Rappel rapide</Text>
          </View>
        </View>

        <Text style={s.title}>Avant de commencer</Text>

        <Card pad={20} style={{ marginTop: 18 }}>
          <View style={s.cardHeader}>
            <Squircle
              accentKey="green"
              size={42}
              icon={<Ionicons name="flask-outline" size={21} color={T.green.fg} />}
              style={{ marginRight: 11 }}
            />
            <Text style={s.cardHeaderText}>Une fraction, c'est…</Text>
          </View>

          <Text style={s.explainText}>
            une façon de dire <Text style={{ fontWeight: '700' }}>combien de parts</Text> on prend dans un tout.
          </Text>

          {/* SVG fraction visualization */}
          <View style={s.vizBox}>
            <Svg width={92} height={92} viewBox="0 0 92 92">
              <Circle cx={46} cy={46} r={40} fill="none" stroke={T.lineStrong} strokeWidth={3} />
              <Path d="M46 46 L46 6 A40 40 0 1 1 6 46 Z" fill={T.primary} opacity={0.9} />
              <Line x1={46} y1={46} x2={46} y2={6} stroke="#fff" strokeWidth={2.5} />
              <Line x1={46} y1={46} x2={6} y2={46} stroke="#fff" strokeWidth={2.5} />
            </Svg>
            <View>
              <Text style={s.fracText}>3/4</Text>
              <Text style={s.fracSub}>3 parts sur 4</Text>
            </View>
          </View>

          <View style={s.keywordsRow}>
            {KEYWORDS.map((k) => (
              <View key={k} style={s.keyword}>
                <Text style={s.keywordText}>{k}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ minHeight: 20 }} />
        <Btn onPress={() => router.push('/mission-exo' as any)} full icon={<Ionicons name="arrow-forward" size={20} color="#fff" />} iconRight>
          J'ai compris
        </Btn>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: { flex: 1, height: 12, borderRadius: 999, backgroundColor: T.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: T.primary },
  stepCount: { fontFamily: FONT.num, fontSize: 13, color: T.sub },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  chipRow: { marginTop: 18 },
  recallChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: T.blue.soft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
  },
  recallChipText: { fontFamily: FONT.bodySemi, fontSize: 12.5, color: T.blue.fg },
  title: { fontFamily: FONT.title, fontSize: 25, color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardHeaderText: { fontFamily: FONT.num, fontSize: 17, color: T.ink, letterSpacing: -0.3 },
  explainText: { fontFamily: FONT.body, fontSize: 16, color: T.ink, lineHeight: 24, marginBottom: 16 },
  vizBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24,
    padding: 18, backgroundColor: T.surfaceAlt, borderRadius: 18, marginBottom: 16,
  },
  fracText: { fontFamily: FONT.title, fontSize: 40, color: '#3FD694', lineHeight: 44, letterSpacing: -1 },
  fracSub: { fontFamily: FONT.body, fontSize: 13.5, color: T.sub, marginTop: 6 },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyword: { backgroundColor: T.green.soft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  keywordText: { fontFamily: FONT.bodySemi, fontSize: 12.5, color: T.green.fg },
});
