import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/Progress';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';

const NOTIONS = ['Les fractions', 'Numérateur', 'Dénominateur', 'Comparer des fractions'];
const STATS = [{ v: 'J-5', l: 'restants' }, { v: '65%', l: 'révisé' }, { v: 'Haute', l: 'priorité' }];

export default function EcheanceDetail() {
  const router = useRouter();
  const { child } = useChild();

  const echeance = child?.echeances[0];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar
          onBack={() => router.back()}
          right={
            <TouchableOpacity style={s.editBtn}>
              <Ionicons name="create-outline" size={19} color={T.ink} />
            </TouchableOpacity>
          }
        />

        {/* Hero */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroTop}>
            <Squircle
              accentKey={echeance?.accent ?? 'green'}
              size={52}
              icon={<Ionicons name={(echeance?.icon ?? 'calculator-outline') as any} size={24} color="#fff" />}
              style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
            />
            <View style={{ flex: 1, marginLeft: 13 }}>
              <Text style={s.heroTitle}>{echeance ? `${echeance.type} de ${echeance.subj}` : 'Contrôle de Maths'}</Text>
              <Text style={s.heroSub}>{echeance?.date ?? 'Jeudi 24 avril'}</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            {STATS.map((st, i) => (
              <View key={i} style={s.stat}>
                <Text style={s.statV}>{st.v}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Notions */}
        <Text style={s.sectionLabel}>NOTIONS À RÉVISER</Text>
        <View style={s.notionsRow}>
          {NOTIONS.map((n) => (
            <View key={n} style={s.notionChip}>
              <Ionicons name="checkmark" size={14} color={T.primaryDeep} />
              <Text style={s.notionText}>{n}</Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        <Text style={s.sectionLabel}>PROGRESSION DU PLAN</Text>
        <Card pad={16} style={s.progressCard}>
          <ProgressRing value={65} size={62} sw={8}>
            <Text style={s.ringText}>65%</Text>
          </ProgressRing>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.progressTitle}>2 missions sur 5 terminées</Text>
            <Text style={s.progressSub}>Prochaine : problèmes d'application</Text>
          </View>
        </Card>

        <View style={{ flex: 1, minHeight: 24 }} />
        <Btn onPress={() => router.push('/(child-tabs)/plan' as any)} full icon={<Ionicons name="arrow-forward" size={20} color="#fff" />} iconRight>
          Voir le planning
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn onPress={() => router.push('/mission' as any)} full icon={<Ionicons name="play-outline" size={17} color={T.ink} />}>
            Lancer la mission du jour
          </GhostBtn>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  editBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  hero: { borderRadius: 24, padding: 20, marginTop: 12, marginBottom: 20 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 22, marginTop: 18 },
  stat: {},
  statV: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 24 },
  statL: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginBottom: 11, letterSpacing: 0.2 },
  notionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  notionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.primarySoft, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13,
  },
  notionText: { fontSize: 14, fontWeight: '700', color: T.primaryDeep },
  progressCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  ringText: { fontSize: 16, fontWeight: '800', color: T.ink },
  progressTitle: { fontSize: 15, fontWeight: '800', color: T.ink },
  progressSub: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
});
