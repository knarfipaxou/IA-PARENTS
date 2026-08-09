import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { FONT } from '../constants/handoff';
import { GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { useChild, type SavedLesson } from '../contexts/ChildContext';
import { formatLessonDate } from '../lib/matiere';

const ACTIONS: { kind: string; field: keyof SavedLesson; label: string; desc: string; icon: string; accent: AccentKey }[] = [
  { kind: 'controle', field: 'controleBlanc', label: 'Devoir blanc complet', desc: 'Comme en classe, corrigé par critères', icon: 'school-outline', accent: 'coral' },
];

export default function LessonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { child, lessons, removeLesson, updateEcheance } = useChild();
  const lesson = lessons.find((l) => l.id === id);
  const [linkOpen, setLinkOpen] = useState(false);

  if (!lesson) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Ionicons name="book-outline" size={42} color={T.faint} />
          <Text style={s.centerText}>Leçon introuvable.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

  const echeances = (child?.echeances ?? []);
  const linkedTo = echeances.filter((e) => (e.lessonIds ?? []).includes(lesson.id));

  function confirmDelete() {
    Alert.alert('Supprimer la leçon ?', 'La leçon et ses contenus générés seront supprimés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { removeLesson(lesson!.id); router.back(); } },
    ]);
  }

  function toggleLink(echeanceId: string) {
    if (!child) return;
    const e = echeances.find((x) => x.id === echeanceId);
    if (!e) return;
    const ids = e.lessonIds ?? [];
    const next = ids.includes(lesson!.id) ? ids.filter((x) => x !== lesson!.id) : [...ids, lesson!.id];
    updateEcheance(child.id, echeanceId, { lessonIds: next });
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <TouchableOpacity onPress={confirmDelete} style={s.trashBtn}>
            <Ionicons name="trash-outline" size={19} color={T.coral.fg} />
          </TouchableOpacity>
        } />

        {/* Hero */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.badgeRow}>
            <View style={s.badge}><Text style={s.badgeText}>{lesson.matiere}</Text></View>
            {!!lesson.niveau && (
              <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                <Text style={s.badgeText}>{lesson.niveau}</Text>
              </View>
            )}
          </View>
          <Text style={s.heroTitle}>{lesson.titre}</Text>
          <Text style={s.heroDate}>Scannée le {formatLessonDate(lesson.createdAt)}</Text>
        </LinearGradient>

        {/* Résumé */}
        <Card pad={16} style={{ marginTop: 13 }}>
          <View style={s.cardHeader}>
            <Squircle accentKey="blue" icon={<Ionicons name="text-outline" size={20} color={T.blue.fg} />} size={36} r={11} />
            <Text style={s.cardTitle}>Résumé</Text>
          </View>
          <Text style={s.resumeText}>{lesson.resume}</Text>
        </Card>

        {/* Notions */}
        <Card pad={16} style={{ marginTop: 13 }}>
          <View style={s.cardHeader}>
            <Squircle accentKey="green" icon={<Ionicons name="checkmark-done-outline" size={20} color={T.green.fg} />} size={36} r={11} />
            <Text style={s.cardTitle}>Notions</Text>
          </View>
          <View style={s.notionsList}>
            {lesson.notions.map((n) => (
              <View key={n} style={s.notionChip}>
                <Ionicons name="checkmark" size={14} color={T.primaryDeep} />
                <Text style={s.notionText}>{n}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contenus IA */}
        <Text style={s.sectionLabel}>CONTENU IA</Text>
        <Text style={s.sectionHint}>
          Le parcours de maîtrise (missions Mémoire, Compréhension, Application, Défi)
          se lance en rattachant cette leçon à un contrôle, ci-dessous.
        </Text>
        <View style={s.actionsList}>
          {ACTIONS.map((a) => {
            const done = !!lesson[a.field];
            return (
              <TouchableOpacity
                key={a.kind}
                onPress={() => router.push(`/generate?kind=${a.kind}&lessonId=${lesson.id}` as any)}
                style={s.actionRow}
                activeOpacity={0.88}
              >
                <Squircle accentKey={a.accent} size={46} icon={<Ionicons name={a.icon as any} size={22} color={T[a.accent].fg} />} style={{ marginRight: 13 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>{a.label}</Text>
                  <Text style={s.actionDesc}>{a.desc}</Text>
                </View>
                {done && (
                  <View style={s.doneBadge}>
                    <Text style={s.doneBadgeText}>✓ généré</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={T.faint} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rattacher à un contrôle */}
        <Text style={s.sectionLabel}>CONTRÔLES LIÉS</Text>
        {linkedTo.length > 0 && (
          <View style={{ gap: 8, marginBottom: 11 }}>
            {linkedTo.map((e) => (
              <TouchableOpacity key={e.id} onPress={() => router.push(`/echeance-detail?id=${e.id}` as any)} style={s.linkedRow} activeOpacity={0.85}>
                <Ionicons name="link-outline" size={18} color={T.primaryDeep} />
                <Text style={s.linkedText}>{e.type} de {e.subj} · {e.date}</Text>
                <Ionicons name="chevron-forward" size={17} color={T.faint} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <GhostBtn full onPress={() => setLinkOpen((o) => !o)} icon={<Ionicons name="link-outline" size={19} color={T.ink} />}>
          Rattacher à un contrôle
        </GhostBtn>

        {linkOpen && (
          <Card pad={8} style={{ marginTop: 11 }}>
            {echeances.length === 0 && (
              <Text style={[s.actionDesc, { padding: 10 }]}>Aucune échéance enregistrée pour le moment.</Text>
            )}
            {echeances.map((e, i) => {
              const on = (e.lessonIds ?? []).includes(lesson.id);
              return (
                <TouchableOpacity key={e.id} onPress={() => toggleLink(e.id)} style={[s.pickRow, i < echeances.length - 1 && s.pickBorder]} activeOpacity={0.8}>
                  <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? T.primary : T.faint} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.pickTitle}>{e.type} de {e.subj}</Text>
                    <Text style={s.actionDesc}>{e.date}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={() => router.push('/manual-deadline' as any)} style={[s.pickRow, { borderTopWidth: 1, borderTopColor: T.line }]} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={22} color={T.primary} />
              <Text style={[s.pickTitle, { color: T.green.fg }]}>Créer un contrôle</Text>
            </TouchableOpacity>
          </Card>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontFamily: FONT.num, fontSize: 15, color: T.sub, textAlign: 'center' },
  trashBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: T.coral.soft,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { borderRadius: 24, padding: 20, marginTop: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { backgroundColor: T.primary, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  badgeText: { color: '#fff', fontFamily: FONT.bodyBold, fontSize: 12.5 },
  heroTitle: { color: '#fff', fontFamily: FONT.title, fontSize: 20, letterSpacing: -0.4 },
  heroDate: { color: 'rgba(255,255,255,0.66)', fontFamily: FONT.body, fontSize: 13, marginTop: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 13 },
  cardTitle: { fontFamily: FONT.num, fontSize: 16.5, color: T.ink, letterSpacing: -0.3 },
  resumeText: { fontFamily: FONT.body, fontSize: 14.5, color: T.sub, lineHeight: 22 },
  notionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notionChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: T.primarySoft, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 },
  notionText: { fontFamily: FONT.num, fontSize: 14, color: T.green.fg, letterSpacing: -0.2 },
  sectionLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: T.sub, marginTop: 22, marginBottom: 8, letterSpacing: 0.5 },
  sectionHint: { fontFamily: FONT.body, fontSize: 12.5, color: T.faint, lineHeight: 18, marginBottom: 12 },
  actionsList: { gap: 11 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 14,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  actionTitle: { fontFamily: FONT.num, fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  actionDesc: { fontFamily: FONT.body, fontSize: 13, color: T.sub, marginTop: 2 },
  doneBadge: { backgroundColor: T.green.soft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, marginRight: 8 },
  doneBadgeText: { fontFamily: FONT.bodyBold, fontSize: 11.5, color: T.green.fg },
  linkedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: T.primarySoft, borderRadius: 14, padding: 12,
  },
  linkedText: { flex: 1, fontFamily: FONT.num, fontSize: 13.5, color: T.green.fg },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12 },
  pickBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  pickTitle: { fontFamily: FONT.num, fontSize: 14.5, color: T.ink },
});
