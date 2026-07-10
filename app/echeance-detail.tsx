import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK, dkIconForSubject } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { formatLessonDate, isControle } from '../lib/matiere';

const GLOBAL_ACTIONS: { kind: string; label: string; icon: string; tint: string }[] = [
  { kind: 'fiche', label: 'Fiche globale', icon: 'document-text-outline', tint: DK.green },
  { kind: 'flashcards', label: 'Flashcards globales', icon: 'albums-outline', tint: DK.violet },
  { kind: 'exercices', label: 'Exercices mélangés', icon: 'pencil-outline', tint: DK.amber },
  { kind: 'minitest', label: 'Mini-test', icon: 'flash-outline', tint: DK.blue },
  { kind: 'controle', label: 'Contrôle blanc', icon: 'school-outline', tint: DK.red },
  { kind: 'piege', label: 'Test piégeux', icon: 'warning-outline', tint: DK.amber },
  { kind: 'planning', label: 'Planning J-10 → J-1', icon: 'calendar-outline', tint: DK.cyan },
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
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={s.safe}>
          <StatusBar style="light" />
          <View style={s.centerBox}>
            <Ionicons name="calendar-outline" size={42} color={DK.faint} />
            <Text style={s.centerText}>Échéance introuvable.</Text>
            <TouchableOpacity onPress={() => router.back()} style={s.ghostBtn} activeOpacity={0.85}>
              <Text style={s.ghostBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const linked = lessons.filter((l) => (echeance.lessonIds ?? []).includes(l.id));
  const noLesson = linked.length === 0;

  function unlink(lessonId: string) {
    if (!child || !echeance) return;
    updateEcheance(child.id, echeance.id, {
      lessonIds: (echeance.lessonIds ?? []).filter((x) => x !== lessonId),
    });
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Détail de l'échéance</Text>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push(`/echeance-edit?id=${echeance.id}` as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color={DK.cyan} />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <LinearGradient
            colors={['rgba(60,45,120,0.5)', 'rgba(19,26,58,0.65)']}
            start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
            style={s.hero}
          >
            <Image source={dkIconForSubject(echeance.subj)} style={s.heroIcon} />
            <Text style={s.heroTitle}>{echeance.titre || `${echeance.type} de ${echeance.subj}`}</Text>
            <Text style={s.heroSub}>{echeance.type} de {echeance.subj} · {echeance.date}</Text>
            <View style={s.heroMetaRow}>
              <View style={s.jPill}>
                <Text style={s.jPillText}>{echeance.days === 0 ? "Auj." : `J-${echeance.days}`}</Text>
              </View>
              <View style={s.metaPill}>
                <Text style={s.metaPillText}>
                  {linked.length} {linked.length > 1 ? 'leçons liées' : 'leçon liée'}
                </Text>
              </View>
              <View style={[s.metaPill, echeance.urg && s.metaPillUrg]}>
                <Text style={[s.metaPillText, echeance.urg && { color: DK.red }]}>
                  Priorité {echeance.urg ? 'haute' : 'normale'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Consigne / note */}
          {!!echeance.consigne && (
            <View style={s.block}>
              <Text style={s.blockLabel}>CONSIGNE DU PROFESSEUR</Text>
              <Text style={s.blockText}>{echeance.consigne}</Text>
            </View>
          )}
          {!!echeance.noteParent && (
            <View style={s.block}>
              <Text style={s.blockLabel}>NOTE DU PARENT</Text>
              <Text style={s.blockText}>{echeance.noteParent}</Text>
            </View>
          )}

          {/* Leçons rattachées */}
          <Text style={s.sectionLabel}>LEÇONS LIÉES</Text>
          {noLesson ? (
            <View style={s.warnBox}>
              <Ionicons name="warning" size={19} color={DK.red} />
              <Text style={s.warnText}>Aucune leçon rattachée. Rattachez les leçons concernées pour générer des révisions fiables.</Text>
            </View>
          ) : (
            <View style={{ gap: 10, marginBottom: 10 }}>
              {linked.map((l) => (
                <LinearGradient
                  key={l.id}
                  colors={['rgba(20,50,90,0.5)', 'rgba(19,26,58,0.65)']}
                  start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
                  style={s.lessonRow}
                >
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => router.push(`/lesson-detail?id=${l.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <Image source={dkIconForSubject(l.matiere)} style={s.lessonIcon} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.lessonTitle} numberOfLines={2}>{l.titre}</Text>
                      <Text style={s.lessonSub}>{l.matiere} · {formatLessonDate(l.createdAt)}</Text>
                    </View>
                    <View style={s.lessonChevron}>
                      <Ionicons name="chevron-forward" size={14} color={DK.cyan} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => unlink(l.id)} style={s.unlinkBtn} activeOpacity={0.8}>
                    <Ionicons name="close" size={15} color={DK.red} />
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push(`/link-lessons?echeanceId=${echeance.id}` as any)}
            style={s.linkBtn}
            activeOpacity={0.85}
          >
            <Text style={s.linkBtnText}>+ Rattacher une leçon</Text>
          </TouchableOpacity>

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
                      <View style={[s.tileIconWrap, { borderColor: a.tint, shadowColor: a.tint }]}>
                        <Ionicons name={a.icon as any} size={19} color={a.tint} />
                      </View>
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
            <TouchableOpacity onPress={() => router.push('/scan' as any)} activeOpacity={0.88}>
              <LinearGradient
                colors={['#1FB8A8', DK.cyan]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.ctaBtn}
              >
                <Ionicons name="scan-outline" size={19} color="#052A26" />
                <Text style={s.ctaBtnText}>Scanner une leçon</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: DK.sub, fontWeight: '600', textAlign: 'center' },
  ghostBtn: {
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderRadius: 999,
    paddingHorizontal: 22, paddingVertical: 11,
  },
  ghostBtnText: { color: '#DDE4FF', fontSize: 14, fontWeight: '700' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, marginBottom: 6 },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  editBtn: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: DK.card,
    borderWidth: 1, borderColor: DK.cardBorder, alignItems: 'center', justifyContent: 'center',
  },

  hero: {
    alignItems: 'center', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(139,124,246,0.35)',
    paddingVertical: 22, paddingHorizontal: 18, marginTop: 14, marginBottom: 8,
  },
  heroIcon: {
    width: 64, height: 64,
    shadowColor: DK.violet, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 14,
  },
  heroTitle: { color: DK.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 12, textAlign: 'center' },
  heroSub: { color: DK.sub, fontSize: 13, fontWeight: '600', marginTop: 3, textAlign: 'center' },
  heroMetaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  jPill: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.1)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 9,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 9,
  },
  jPillText: { color: DK.cyan, fontWeight: '800', fontSize: 15 },
  metaPill: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(10,14,34,0.4)',
    borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, justifyContent: 'center',
  },
  metaPillUrg: { borderColor: 'rgba(255,107,90,0.5)', backgroundColor: 'rgba(255,107,90,0.1)' },
  metaPillText: { color: DK.sub, fontWeight: '700', fontSize: 12.5 },

  block: {
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 15, marginTop: 12,
  },
  blockLabel: { fontSize: 11.5, fontWeight: '800', color: DK.faint, letterSpacing: 1.5, marginBottom: 6 },
  blockText: { fontSize: 14, fontWeight: '600', color: DK.ink, lineHeight: 21 },

  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: 'rgba(200,210,255,0.55)',
    letterSpacing: 2, marginTop: 22, marginBottom: 10,
  },
  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(255,107,90,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.4)',
    borderRadius: 20, padding: 14, marginBottom: 10,
  },
  warnText: { flex: 1, fontSize: 13, fontWeight: '700', color: DK.red, lineHeight: 19 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 20, padding: 13,
  },
  lessonIcon: {
    width: 46, height: 46,
    shadowColor: DK.blue, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  lessonTitle: { fontSize: 14, fontWeight: '800', color: DK.ink, lineHeight: 18 },
  lessonSub: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 2 },
  lessonChevron: {
    width: 26, height: 26, borderRadius: 999, backgroundColor: 'rgba(53,228,210,0.12)',
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.45)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  unlinkBtn: {
    width: 28, height: 28, borderRadius: 999, backgroundColor: 'rgba(255,107,90,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,107,90,0.4)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  linkBtn: {
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderStyle: 'dashed',
    borderRadius: 20, paddingVertical: 15, alignItems: 'center',
  },
  linkBtnText: { color: '#B9C6FF', fontSize: 13, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  tile: {
    width: '47.5%',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 13,
  },
  tileIconWrap: {
    width: 38, height: 38, borderRadius: 13, borderWidth: 1,
    backgroundColor: 'rgba(10,14,34,0.45)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 9, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  tileTitle: { fontWeight: '800', fontSize: 13.5, color: DK.ink, letterSpacing: -0.3 },
  doneBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(52,214,150,0.14)',
    borderWidth: 1, borderColor: 'rgba(52,214,150,0.5)',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 7,
  },
  doneBadgeText: { fontSize: 11, fontWeight: '800', color: DK.green },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 15,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 18,
  },
  ctaBtnText: { color: '#052A26', fontSize: 15, fontWeight: '800' },
});
