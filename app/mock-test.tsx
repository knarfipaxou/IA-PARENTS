import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';

const PARTS = [
  { icon: 'calculator-outline', a: 'green' as const, title: 'Calculs et automatismes', q: 4 },
  { icon: 'help-circle-outline', a: 'blue' as const, title: 'Problèmes', q: 5 },
  { icon: 'shapes-outline', a: 'violet' as const, title: 'Géométrie', q: 3 },
];

export default function MockTestScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={[s.heroIcon, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
            <Ionicons name="school-outline" size={28} color="#fff" />
          </View>
          <Text style={s.heroTitle}>Contrôle blanc</Text>
          <Text style={s.heroSub}>Mathématiques · conditions réelles</Text>
          <View style={s.heroMeta}>
            <View style={s.metaBadge}>
              <Ionicons name="time-outline" size={15} color="rgba(255,255,255,0.8)" />
              <Text style={s.metaText}>45 min</Text>
            </View>
            <View style={s.metaBadge}>
              <Ionicons name="list-outline" size={15} color="rgba(255,255,255,0.8)" />
              <Text style={s.metaText}>12 questions</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={s.sectionLabel}>
          <Text style={s.sectionLabelText}>CONTENU DU CONTRÔLE</Text>
        </View>

        <View style={s.parts}>
          {PARTS.map((p, i) => (
            <Card key={i} pad={14} style={s.partCard}>
              <Squircle accentKey={p.a} icon={<Ionicons name={p.icon as any} size={20} color={T[p.a].fg} />} size={44} />
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text style={s.partTitle}>{p.title}</Text>
                <Text style={s.partQ}>{p.q} questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={T.faint} />
            </Card>
          ))}
        </View>

        <View style={s.warningBox}>
          <Ionicons name="information-circle-outline" size={19} color={T.blue.fg} />
          <Text style={s.warningText}>
            Simulez les conditions réelles : pas d'aide, chronométrez-vous.
          </Text>
        </View>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.push('/(tabs)/exercises')} icon={<Ionicons name="play" size={20} color="#fff" />}>
          Commencer
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  hero: { borderRadius: 24, padding: 22, marginTop: 16, alignItems: 'center' },
  heroIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { color: '#fff', fontWeight: '800', fontSize: 24, letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: 4 },
  heroMeta: { flexDirection: 'row', gap: 12, marginTop: 16 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  metaText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700' },
  sectionLabel: { marginTop: 20, marginBottom: 11 },
  sectionLabelText: { fontSize: 13, fontWeight: '800', color: T.sub, marginLeft: 2 },
  parts: { gap: 10 },
  partCard: { flexDirection: 'row', alignItems: 'center' },
  partTitle: { fontWeight: '700', fontSize: 15, color: T.ink, letterSpacing: -0.2 },
  partQ: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 1 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.blue.soft, borderRadius: 15, padding: 13, marginTop: 14 },
  warningText: { flex: 1, fontSize: 13.5, fontWeight: '600', color: T.blue.fg, lineHeight: 19 },
});
