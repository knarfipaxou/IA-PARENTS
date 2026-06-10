import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { ProgressRing } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';

type ActionItem = {
  accent: keyof typeof T;
  iconName: string;
  title: string;
  desc: string;
  route: string;
};

const COLLEGE_ACTIONS: ActionItem[] = [
  { accent: 'coral', iconName: 'scan-outline', title: 'Scanner une leçon', desc: 'Fiches, QCM, flashcards IA', route: '/scan' },
  { accent: 'green', iconName: 'camera-outline', title: "Scanner l'agenda", desc: 'Contrôles & échéances', route: '/scan-agenda' },
  { accent: 'amber', iconName: 'trophy-outline', title: 'Préparer un contrôle', desc: 'Manuel ou par photo', route: '/prepare-control' },
  { accent: 'violet', iconName: 'book-outline', title: 'Révisions', desc: 'Missions de révision', route: '/(child-tabs)/plan' },
  { accent: 'blue', iconName: 'calendar-outline', title: 'Planning', desc: 'Voir les échéances', route: '/(child-tabs)/echeances' },
];

export default function EspaceScreen() {
  const router = useRouter();
  const { child, setChild } = useChild();

  if (!child) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.noChildText}>Aucun enfant sélectionné</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/' as any)} style={s.backBtn}>
            <Text style={s.backBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCollege = child.kind === 'college';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Back nav */}
        <View style={s.topNav}>
          <TouchableOpacity
            onPress={() => { setChild(null); router.replace('/(tabs)/' as any); }}
            style={s.backLink}
          >
            <Ionicons name="arrow-back" size={19} color={T.sub} />
            <Text style={s.backLinkText}>Retour aux enfants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(child-tabs)/profil' as any)}
            style={s.profileBtn}
          >
            <Ionicons name="person-outline" size={20} color={T.ink} />
          </TouchableOpacity>
        </View>

        {/* Hero panel */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroContent}>
            <View style={s.heroAvatar}>
              <Text style={s.heroAvatarText}>{child.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroName}>{child.name}</Text>
              <Text style={s.heroClass}>{child.classe} · {child.age} ans</Text>
            </View>
            <ProgressRing value={child.progress} size={56} sw={7} color={T.primary}>
              <Text style={s.heroProgress}>{child.progress}%</Text>
            </ProgressRing>
          </View>
          {isCollege && child.next && (
            <View style={s.heroAlert}>
              <Ionicons name="alert-circle-outline" size={19} color="#fff" />
              <Text style={s.heroAlertText}>{child.next.type} de {child.next.subj}</Text>
              <View style={[s.jBadge, { backgroundColor: T[child.next.accent].solid }]}>
                <Text style={s.jBadgeText}>J-{child.next.days}</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Mission / Activité du jour */}
        <TouchableOpacity
          onPress={() => router.push('/mission' as any)}
          style={s.missionBtn}
          activeOpacity={0.88}
        >
          <Squircle
            accentKey={isCollege ? 'green' : 'violet'}
            size={48}
            icon={<Ionicons name="play-circle-outline" size={24} color={isCollege ? T.green.fg : T.violet.fg} />}
            style={{ marginRight: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.missionLabel}>{isCollege ? 'MISSION DU JOUR' : 'ACTIVITÉ DU JOUR'}</Text>
            <Text style={s.missionTitle}>
              {isCollege ? child.mission?.notion ?? child.mission?.obj : child.activity?.label}
            </Text>
          </View>
          <View style={s.missionBadge}>
            <Ionicons name="time-outline" size={13} color={T.amber.fg} />
            <Text style={s.missionMin}>{isCollege ? child.mission?.min : child.activity?.min} min</Text>
          </View>
        </TouchableOpacity>

        {/* School actions */}
        <Text style={s.sectionLabel}>ACTIONS SCOLAIRES</Text>
        <View style={s.actionsGrid}>
          {(isCollege ? COLLEGE_ACTIONS : COLLEGE_ACTIONS.slice(2, 4)).map((ac, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(ac.route as any)}
              style={s.actionTile}
              activeOpacity={0.88}
            >
              <Squircle
                accentKey={ac.accent as any}
                size={44}
                r={14}
                icon={<Ionicons name={ac.iconName as any} size={22} color={(T as any)[ac.accent].fg} />}
                style={{ marginBottom: 10 }}
              />
              <Text style={s.actionTitle}>{ac.title}</Text>
              <Text style={s.actionDesc}>{ac.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weak points */}
        {child.faibles && child.faibles.length > 0 && (
          <>
            <Text style={s.sectionLabel}>À RENFORCER</Text>
            <Card pad={15}>
              <View style={s.weakRow}>
                {child.faibles.map((f) => (
                  <View key={f} style={s.weakChip}>
                    <Ionicons name="radio-button-off-outline" size={14} color={T.coral.fg} />
                    <Text style={s.weakText}>{f}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  noChildText: { fontSize: 16, color: T.sub, textAlign: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: T.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 8 },
  backLinkText: { color: T.sub, fontWeight: '700', fontSize: 14 },
  profileBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  hero: { borderRadius: 26, padding: 20, marginBottom: 14 },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroAvatar: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroAvatarText: { color: '#fff', fontWeight: '800', fontSize: 24 },
  heroName: { color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: -0.5 },
  heroClass: { color: 'rgba(255,255,255,0.66)', fontSize: 14, fontWeight: '600', marginTop: 2 },
  heroProgress: { fontSize: 15, fontWeight: '800', color: '#fff' },
  heroAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 12,
  },
  heroAlertText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  jBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  jBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11.5 },
  missionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, borderRadius: 22, padding: 15, marginBottom: 20,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  missionLabel: { fontSize: 12, fontWeight: '800', color: T.faint, letterSpacing: 0.3 },
  missionTitle: { fontWeight: '800', fontSize: 16, color: T.ink, letterSpacing: -0.3, marginTop: 2 },
  missionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: T.amber.soft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  missionMin: { fontSize: 12.5, fontWeight: '700', color: T.amber.fg },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginBottom: 12, letterSpacing: 0.2, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 20 },
  actionTile: {
    width: '47.5%',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 22, padding: 14,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  actionTitle: { fontWeight: '800', fontSize: 14, color: T.ink, letterSpacing: -0.3, marginBottom: 3 },
  actionDesc: { fontSize: 12, color: T.sub, fontWeight: '500' },
  weakRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  weakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.coral.soft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 13,
  },
  weakText: { fontSize: 13.5, fontWeight: '700', color: T.coral.fg },
});
