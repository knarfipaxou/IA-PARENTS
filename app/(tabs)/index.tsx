import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { Chip } from '../../components/ui/Chip';
import { ProgressRing } from '../../components/ui/Progress';
import { Btn } from '../../components/ui/Btn';

const UPCOMING = [
  { accentKey: 'green' as const, icon: 'calculator-outline', subj: 'Maths', info: 'Contrôle', days: 5 },
  { accentKey: 'violet' as const, icon: 'book-outline', subj: 'Français', info: 'Dictée', days: 7 },
  { accentKey: 'coral' as const, icon: 'flask-outline', subj: 'Sciences', info: 'Exposé', days: 10 },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={s.greeting}>
          <View style={{ flex: 1 }}>
            <Text style={s.greetTitle}>Bonjour, Franck</Text>
            <Text style={s.greetSub}>Voici le suivi de votre enfant.</Text>
          </View>
          <View style={s.greetRight}>
            <TouchableOpacity onPress={() => router.push('/notifications' as any)} style={s.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color={T.ink} />
              <View style={s.notifDot} />
            </TouchableOpacity>
            <View style={s.streakBadge}>
              <Ionicons name="flash" size={17} color={T.amber.fg} />
              <Text style={s.streakText}>5 j</Text>
            </View>
          </View>
        </View>

        {/* Primary action */}
        <TouchableOpacity onPress={() => router.push('/scan')} style={s.primaryTile} activeOpacity={0.85}>
          <Squircle accentKey="green" icon={<Ionicons name="camera-outline" size={25} color={T.green.fg} />} size={50} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.primaryTileTitle}>Scanner une leçon</Text>
            <Text style={s.primaryTileSub}>Extraire notions, formules et exercices</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={T.green.fg} />
        </TouchableOpacity>

        <View style={s.secondaryRow}>
          <TouchableOpacity onPress={() => router.push('/scan-agenda')} style={s.secondaryTile} activeOpacity={0.85}>
            <Squircle accentKey="blue" icon={<Ionicons name="calendar-outline" size={20} color={T.blue.fg} />} size={44} style={{ marginBottom: 10 }} />
            <Text style={s.secondaryTitle}>Scanner l'agenda</Text>
            <Text style={s.secondarySub}>Contrôles & échéances</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/plan')} style={s.secondaryTile} activeOpacity={0.85}>
            <Squircle accentKey="amber" icon={<Ionicons name="trophy-outline" size={20} color={T.amber.fg} />} size={44} style={{ marginBottom: 10 }} />
            <Text style={s.secondaryTitle}>Préparer un contrôle</Text>
            <Text style={s.secondarySub}>Plan de révision</Text>
          </TouchableOpacity>
        </View>

        {/* Mon enfant */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Mon enfant</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/children')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ color: T.primary, fontWeight: '700', fontSize: 14 }}>Tous</Text>
            <Ionicons name="chevron-forward" size={16} color={T.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/progress')} activeOpacity={0.9}>
          <Card pad={18}>
            <View style={s.childRow}>
              <Squircle accentKey="green" icon={<Ionicons name="school-outline" size={24} color={T.green.fg} />} size={50} r={16} />
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text style={s.childName}>Maxime</Text>
                <Text style={s.childClass}>CM2 · 10 ans</Text>
              </View>
              <Chip accentKey="green"><Text style={{ color: T.green.fg, fontSize: 12.5, fontWeight: '700' }}>✓ À jour</Text></Chip>
            </View>

            <View style={s.todayBanner}>
              <Ionicons name="time-outline" size={20} color={T.primaryDeep} style={{ flexShrink: 0 }} />
              <Text style={s.todayText}>Aujourd'hui · réviser les fractions</Text>
              <Text style={s.todayDuration}>15 min</Text>
            </View>

            <View style={s.progressRow}>
              <ProgressRing value={65} size={66} sw={8}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink }}>65%</Text>
              </ProgressRing>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.progressTitle}>Progression de la révision</Text>
                <Text style={s.progressSub}>Plus que 2 notions avant le contrôle de maths.</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* À venir */}
        <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>À venir cette semaine</Text>
        <View style={s.upcomingList}>
          {UPCOMING.map(u => (
            <Card key={u.subj} pad={13} style={s.upcomingCard}>
              <Squircle accentKey={u.accentKey} icon={<Ionicons name={u.icon as any} size={20} color={T[u.accentKey].fg} />} size={44} />
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text style={s.upcomingSubj}>{u.subj}</Text>
                <Text style={s.upcomingInfo}>{u.info}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.upcomingDays, { color: T[u.accentKey].fg }]}>{u.days}</Text>
                <Text style={s.upcomingDaysLabel}>jours</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Conseil du jour */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.conseil}>
          <View style={s.conseilIcon}>
            <Ionicons name="sparkles" size={22} color={T.amber.solid} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.conseilTitle}>Conseil du jour</Text>
            <Text style={s.conseilBody}>
              Réviser 15 minutes chaque jour vaut mieux que 2 heures la veille.
            </Text>
          </View>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  greeting: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  greetTitle: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  greetSub: { fontSize: 14.5, color: T.sub, marginTop: 3, fontWeight: '500' },
  greetRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  notifBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center', shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  notifDot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 999, backgroundColor: T.coral.solid, borderWidth: 2, borderColor: T.surface },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.amber.soft, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  streakText: { fontWeight: '800', fontSize: 14, color: T.amber.fg },
  primaryTile: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, borderRadius: 22, padding: 16, shadowColor: '#102818', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3 },
  primaryTileTitle: { fontWeight: '800', fontSize: 16, color: T.ink, letterSpacing: -0.3, lineHeight: 20 },
  primaryTileSub: { fontSize: 13, color: T.sub, marginTop: 3, lineHeight: 18, fontWeight: '500' },
  secondaryRow: { flexDirection: 'row', gap: 11, marginTop: 11 },
  secondaryTile: { flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, borderRadius: 22, padding: 14, shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  secondaryTitle: { fontWeight: '800', fontSize: 14, color: T.ink, letterSpacing: -0.3, lineHeight: 18, minHeight: 34 },
  secondarySub: { fontSize: 11.5, color: T.sub, marginTop: 3, lineHeight: 16, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: T.ink, letterSpacing: -0.4 },
  childRow: { flexDirection: 'row', alignItems: 'center' },
  childName: { fontWeight: '800', fontSize: 18, color: T.ink, letterSpacing: -0.3 },
  childClass: { fontSize: 13, color: T.sub, fontWeight: '600', marginTop: 1 },
  todayBanner: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: T.primarySoft, borderRadius: 15, padding: 13, marginTop: 15 },
  todayText: { flex: 1, fontSize: 14, fontWeight: '700', color: T.primaryDeep, letterSpacing: -0.2 },
  todayDuration: { fontSize: 13, fontWeight: '800', color: T.primaryDeep },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  progressTitle: { fontSize: 14, fontWeight: '700', color: T.ink },
  progressSub: { fontSize: 12.5, color: T.sub, marginTop: 2, lineHeight: 18, fontWeight: '500' },
  upcomingList: { gap: 10 },
  upcomingCard: { flexDirection: 'row', alignItems: 'center' },
  upcomingSubj: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  upcomingInfo: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 1 },
  upcomingDays: { fontSize: 19, fontWeight: '800', lineHeight: 22 },
  upcomingDaysLabel: { fontSize: 11, color: T.faint, fontWeight: '600' },
  conseil: { marginTop: 18, borderRadius: 22, padding: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  conseilIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  conseilTitle: { color: '#fff', fontWeight: '800', fontSize: 14.5, letterSpacing: -0.2 },
  conseilBody: { color: 'rgba(255,255,255,0.72)', fontSize: 13.5, marginTop: 3, lineHeight: 20, fontWeight: '500' },
});
