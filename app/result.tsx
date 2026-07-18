import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { useChild, type SavedLesson } from '../contexts/ChildContext';
import { ProgramCard } from '../components/ProgramCard';

const ACTIONS: { kind: string; label: string; desc: string; icon: string; accent: AccentKey }[] = [
  { kind: 'fiche', label: 'Créer la fiche de révision', desc: 'Résumé structuré avec points clés', icon: 'document-text-outline', accent: 'green' },
  { kind: 'exercices', label: 'Exercices', desc: '5 QCM interactifs', icon: 'pencil-outline', accent: 'amber' },
  { kind: 'minitest', label: 'Mini-test', desc: '3 questions avec score', icon: 'flash-outline', accent: 'blue' },
  { kind: 'controle', label: 'Devoir blanc complet', desc: 'Comme en classe, corrigé par critères', icon: 'school-outline', accent: 'coral' },
];

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const { child, lessons, updateLesson } = useChild();
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : undefined;
  const lesson: SavedLesson | undefined = lessonId
    ? lessons.find((l) => l.id === lessonId)
    : child
      ? lessons.find((l) => l.childId === child.id)
      : undefined;

  if (!child || !lesson) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.empty}>
          <Ionicons name="scan-outline" size={42} color={T.faint} />
          <Text style={s.emptyText}>Aucune leçon analysée. Scannez une leçon d'abord.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={s.sub}>Voici ce que l'IA a compris. Choisissez une activité.</Text>
          <View style={s.savedChip}>
            <Ionicons name="checkmark-circle" size={15} color={T.primaryDeep} />
            <Text style={s.savedChipText}>Leçon enregistrée ✓</Text>
          </View>
        </View>

        {/* Lesson summary */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.lessonCard}>
          <View style={s.lessonBadgeRow}>
            <View style={s.lessonBadge}>
              <Text style={s.lessonBadgeText}>{lesson.matiere}</Text>
            </View>
            {!!lesson.niveau && (
              <View style={[s.lessonBadge, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                <Text style={s.lessonBadgeText}>{lesson.niveau}</Text>
              </View>
            )}
          </View>
          <Text style={s.lessonTitle}>{lesson.titre}</Text>
        </LinearGradient>

        {/* Notions */}
        <Card pad={16} style={{ marginTop: 13 }}>
          <View style={s.cardHeader}>
            <Squircle accentKey="green" icon={<Ionicons name="checkmark-done-outline" size={20} color={T.green.fg} />} size={36} r={11} />
            <Text style={s.cardTitle}>Notions détectées</Text>
          </View>
          <View style={s.notionsList}>
            {(lesson.notions ?? []).map((n) => (
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
          <Text style={s.resumeText}>{lesson.resume}</Text>
        </Card>

        {/* Programme officiel identifié (data.education.gouv.fr) */}
        {lesson.programme && (
          <ProgramCard
            programme={lesson.programme}
            onUpdate={(p) => updateLesson(lesson.id, { programme: p })}
          />
        )}

        {/* Actions */}
        <Text style={s.sectionLabel}>QUE GÉNÉRER POUR {child.name.toUpperCase()} ?</Text>
        <View style={s.actionsList}>
          {ACTIONS.map((a) => (
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
              <Ionicons name="chevron-forward" size={20} color={T.faint} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <GhostBtn full onPress={() => router.back()} icon={<Ionicons name="camera-outline" size={19} color={T.ink} />}>
            Scanner une autre leçon
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  emptyText: { fontSize: 15, color: T.sub, fontWeight: '600', textAlign: 'center' },
  header: { marginTop: 18, marginBottom: 0 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500' },
  savedChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.primarySoft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5, marginTop: 10 },
  savedChipText: { fontSize: 12.5, fontWeight: '800', color: T.primaryDeep },
  lessonCard: { borderRadius: 24, padding: 20, marginTop: 18 },
  lessonBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  lessonBadge: { backgroundColor: T.primary, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  lessonBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  lessonTitle: { color: '#fff', fontWeight: '800', fontSize: 20, letterSpacing: -0.4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 13 },
  cardTitle: { fontWeight: '800', fontSize: 16.5, color: T.ink, letterSpacing: -0.3 },
  notionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notionChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: T.primarySoft, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 },
  notionText: { fontSize: 14, fontWeight: '700', color: T.primaryDeep, letterSpacing: -0.2 },
  resumeText: { fontSize: 14.5, color: T.sub, lineHeight: 22, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 22, marginBottom: 12, letterSpacing: 0.2 },
  actionsList: { gap: 11 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 14,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  actionTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  actionDesc: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
});
