import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import { iconForMatiere, accentForMatiere, formatLessonDate, isControle } from '../lib/matiere';

const GLOBAL_ACTIONS: { kind: string; label: string; icon: string; accent: AccentKey }[] = [
  { kind: 'fiche', label: 'Fiche globale', icon: 'document-text-outline', accent: 'green' },
  { kind: 'flashcards', label: 'Flashcards globales', icon: 'albums-outline', accent: 'violet' },
  { kind: 'exercices', label: 'Exercices mélangés', icon: 'pencil-outline', accent: 'amber' },
  { kind: 'minitest', label: 'Mini-test', icon: 'flash-outline', accent: 'blue' },
  { kind: 'controle', label: 'Contrôle blanc', icon: 'school-outline', accent: 'coral' },
  { kind: 'piege', label: 'Test piégeux', icon: 'warning-outline', accent: 'amber' },
  { kind: 'planning', label: 'Planning J-10 → J-1', icon: 'calendar-outline', accent: 'blue' },
];

export default function EcheanceDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { child, lessons, updateEcheance } = useChild();

  const echeance = id
    ? child?.echeances?.find((e) => e.id === id)
    : child?.echeances?.[0];

  if (!child || !echeance) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.centerBox}>
          <Ionicons name="calendar-outline" size={42} color={T.faint} />
          <Text style={s.centerText}>Échéance introuvable.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

  const linked = lessons.filter((l) => (echeance.lessonIds ?? []).includes(l.id));
  const noLesson = linked.length === 0;
  const stats = [
    { v: echeance.days === 0 ? 'Auj.' : `J-${echeance.days}`, l: 'restants' },
    { v: `${linked.length}`, l: linked.length > 1 ? 'leçons liées' : 'leçon liée' },
    { v: echeance.urg ? 'Haute' : 'Normale', l: 'priorité' },
  ];

  function unlink(lessonId: string) {
    if (!child || !echeance) return;
    updateEcheance(child.id, echeance.id, {
      lessonIds: (echeance.lessonIds ?? []).filter((x) => x !== lessonId),
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar
          onBack={() => router.back()}
          right={
            <TouchableOpacity style={s.editBtn} onPress={() => router.push(`/echeance-edit?id=${echeance.id}` as any)}>
              <Ionicons name="create-outline" size={19} color={T.ink} />
            </TouchableOpacity>
          }
        />

        {/* Hero */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroTop}>
            <Squircle
              accentKey={echeance.accent}
              size={52}
              icon={<Ionicons name={(echeance.icon || 'school-outline') as any} size={24} color="#fff" />}
              style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
            />
            <View style={{ flex: 1, marginLeft: 13 }}>
              <Text style={s.heroTitle}>{echeance.titre || `${echeance.type} de ${echeance.subj}`}</Text>
              <Text style={s.heroSub}>{echeance.type} de {echeance.subj} · {echeance.date}</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            {stats.map((st, i) => (
              <View key={i} style={s.stat}>
                <Text style={s.statV}>{st.v}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Consigne / note */}
        {!!echeance.consigne && (
          <Card pad={15} style={{ marginBottom: 13 }}>
            <Text style={s.blockLabel}>CONSIGNE DU PROFESSEUR</Text>
            <Text style={s.blockText}>{echeance.consigne}</Text>
          </Card>
        )}
        {!!echeance.noteParent && (
          <Card pad={15} soft style={{ marginBottom: 13 }}>
            <Text style={s.blockLabel}>NOTE DU PARENT</Text>
            <Text style={s.blockText}>{echeance.noteParent}</Text>
          </Card>
        )}

        {/* Leçons rattachées */}
        <Text style={s.sectionLabel}>LEÇONS RATTACHÉES</Text>
        {noLesson ? (
          <View style={s.warnBox}>
            <Ionicons name="warning-outline" size={20} color={T.amber.fg} />
            <Text style={s.warnText}>⚠️ Aucune leçon rattachée. Rattachez les leçons concernées pour générer des révisions fiables.</Text>
          </View>
        ) : (
          <View style={{ gap: 9, marginBottom: 13 }}>
            {linked.map((l) => {
              const a = accentForMatiere(l.matiere);
              return (
                <View key={l.id} style={s.lessonRow}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => router.push(`/lesson-detail?id=${l.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <Squircle accentKey={a} size={42} r={13} icon={<Ionicons name={iconForMatiere(l.matiere) as any} size={20} color={T[a].fg} />} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.lessonTitle}>{l.titre}</Text>
                      <Text style={s.lessonSub}>{l.matiere} · {formatLessonDate(l.createdAt)}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => unlink(l.id)} style={s.unlinkBtn}>
                    <Ionicons name="close" size={17} color={T.coral.fg} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
        <GhostBtn full onPress={() => router.push(`/link-lessons?echeanceId=${echeance.id}` as any)} icon={<Ionicons name="link-outline" size={19} color={T.ink} />}>
          Rattacher des leçons
        </GhostBtn>

        {/* Génération globale */}
        {linked.length > 0 && (
          <>
            <Text style={s.sectionLabel}>RÉVISIONS POUR CE CONTRÔLE</Text>
            <View style={s.grid}>
              {GLOBAL_ACTIONS.map((a) => {
                const done = !!echeance.generated?.[a.kind];
                return (
                  <TouchableOpacity
                    key={a.kind}
                    onPress={() => router.push(`/generate?kind=${a.kind}&echeanceId=${echeance.id}` as any)}
                    style={s.tile}
                    activeOpacity={0.88}
                  >
                    <Squircle accentKey={a.accent} size={40} r={13} icon={<Ionicons name={a.icon as any} size={20} color={T[a.accent].fg} />} style={{ marginBottom: 9 }} />
                    <Text style={s.tileTitle}>{a.label}</Text>
                    {done && (
                      <View style={s.doneBadge}>
                        <Text style={s.doneBadgeText}>✓ généré</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 18 }} />
        {isControle(echeance.type) && noLesson && (
          <Btn full onPress={() => router.push('/scan' as any)} icon={<Ionicons name="scan-outline" size={19} color="#fff" />}>
            Scanner une leçon
          </Btn>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: T.sub, fontWeight: '600', textAlign: 'center' },
  editBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  hero: { borderRadius: 24, padding: 20, marginTop: 12, marginBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 22, marginTop: 18 },
  stat: {},
  statV: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 24 },
  statL: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  blockLabel: { fontSize: 12, fontWeight: '800', color: T.sub, letterSpacing: 0.3, marginBottom: 6 },
  blockText: { fontSize: 14, fontWeight: '600', color: T.ink, lineHeight: 21 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginBottom: 11, letterSpacing: 0.2, marginTop: 18 },
  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: T.amber.soft, borderRadius: 16, padding: 14, marginBottom: 13,
  },
  warnText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: T.amber.fg, lineHeight: 19 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, borderRadius: 18, padding: 12,
  },
  lessonTitle: { fontSize: 14.5, fontWeight: '800', color: T.ink, letterSpacing: -0.2 },
  lessonSub: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  unlinkBtn: { width: 32, height: 32, borderRadius: 999, backgroundColor: T.coral.soft, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  tile: {
    width: '47.5%',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 13,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  tileTitle: { fontWeight: '800', fontSize: 13.5, color: T.ink, letterSpacing: -0.3 },
  doneBadge: { alignSelf: 'flex-start', backgroundColor: T.green.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 7 },
  doneBadgeText: { fontSize: 11, fontWeight: '800', color: T.green.fg },
});
