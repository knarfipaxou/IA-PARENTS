import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { ProgressRing } from '../components/ui/Progress';
import { TopBar } from '../components/ui/TopBar';

const NOTIONS = ['Les fractions', 'Numérateur', 'Dénominateur', 'Comparer des fractions'];
const EXERCICES = [
  'Identifier le numérateur et le dénominateur',
  'Comparer deux fractions simples',
  'Compléter une fraction équivalente',
];

export default function ResultScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.green.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>Analysé</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>Résultat de la leçon</Text>
          <Text style={s.sub}>Voici ce que l'IA a compris. Vérifiez avant de valider.</Text>
        </View>

        {/* Confidence ring */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.confidenceCard}>
          <ProgressRing value={92} size={78} sw={9} color={T.primary}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>92%</Text>
          </ProgressRing>
          <View style={{ flex: 1, marginLeft: 18 }}>
            <Text style={s.confidenceTitle}>Confiance de l'analyse</Text>
            <Text style={s.confidenceSub}>
              Bonne lisibilité. Vérifiez les notions ci-dessous avant de valider.
            </Text>
          </View>
        </LinearGradient>

        {/* Notions */}
        <Card pad={16} style={{ marginTop: 13 }}>
          <View style={s.cardHeader}>
            <Squircle accentKey="green" icon={<Ionicons name="checkmark-done-outline" size={20} color={T.green.fg} />} size={36} r={11} />
            <Text style={s.cardTitle}>Notions détectées</Text>
          </View>
          <View style={s.notionsList}>
            {NOTIONS.map(n => (
              <View key={n} style={s.notionChip}>
                <Ionicons name="checkmark" size={14} color={T.primaryDeep} />
                <Text style={s.notionText}>{n}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Résumé */}
        <Card pad={16} style={{ marginTop: 13 }}>
          <View style={s.cardHeader}>
            <Squircle accentKey="blue" icon={<Ionicons name="text-outline" size={20} color={T.blue.fg} />} size={36} r={11} />
            <Text style={s.cardTitle}>Résumé simple</Text>
          </View>
          <Text style={s.resumeText}>
            Cette leçon explique comment{' '}
            <Text style={{ color: T.ink, fontWeight: '700' }}>lire, comprendre et comparer</Text>
            {' '}des fractions, en distinguant le numérateur du dénominateur.
          </Text>
        </Card>

        {/* Exercices */}
        <Card pad={16} style={{ marginTop: 13 }}>
          <View style={s.cardHeader}>
            <Squircle accentKey="amber" icon={<Ionicons name="pencil-outline" size={20} color={T.amber.fg} />} size={36} r={11} />
            <Text style={s.cardTitle}>Exercices proposés</Text>
          </View>
          <View style={s.exoList}>
            {EXERCICES.map((e, i) => (
              <View key={i} style={s.exoRow}>
                <View style={s.exoNum}>
                  <Text style={s.exoNumText}>{i + 1}</Text>
                </View>
                <Text style={s.exoText}>{e}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.push('/validation')} icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Valider le contenu
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn full onPress={() => router.back()} icon={<Ionicons name="pencil-outline" size={19} color={T.ink} />}>
            Modifier
          </GhostBtn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { marginTop: 18, marginBottom: 0 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500' },
  confidenceCard: { borderRadius: 24, padding: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  confidenceTitle: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },
  confidenceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13.5, marginTop: 4, lineHeight: 20, fontWeight: '500' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 13 },
  cardTitle: { fontWeight: '800', fontSize: 16.5, color: T.ink, letterSpacing: -0.3 },
  notionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notionChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: T.primarySoft, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 },
  notionText: { fontSize: 14, fontWeight: '700', color: T.primaryDeep, letterSpacing: -0.2 },
  resumeText: { fontSize: 14.5, color: T.sub, lineHeight: 22, fontWeight: '500' },
  exoList: { gap: 11 },
  exoRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  exoNum: { width: 24, height: 24, borderRadius: 8, backgroundColor: T.amber.soft, alignItems: 'center', justifyContent: 'center' },
  exoNumText: { fontSize: 13, fontWeight: '800', color: T.amber.fg },
  exoText: { flex: 1, fontSize: 14.5, color: T.ink, fontWeight: '600', letterSpacing: -0.2 },
});
