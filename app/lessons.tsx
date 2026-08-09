import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { FONT } from '../constants/handoff';
import { Btn } from '../components/ui/Btn';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { useChild } from '../contexts/ChildContext';
import { iconForMatiere, accentForMatiere, formatLessonDate } from '../lib/matiere';

export default function LessonsScreen() {
  const router = useRouter();
  const { child, lessons } = useChild();
  const list = child ? lessons.filter((l) => l.childId === child.id) : [];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <View style={s.header}>
          <Text style={s.title}>Leçons enregistrées</Text>
          <Text style={s.sub}>
            {child
              ? `${list.length} ${list.length > 1 ? 'leçons scannées' : 'leçon scannée'} pour ${child.name}.`
              : 'Aucun enfant sélectionné.'}
          </Text>
        </View>

        <View style={s.list}>
          {list.map((l) => {
            const a = accentForMatiere(l.matiere);
            const genCount = [l.fiche, l.exercices, l.minitest, l.controleBlanc].filter(Boolean).length;
            return (
              <TouchableOpacity
                key={l.id}
                onPress={() => router.push(`/lesson-detail?id=${l.id}` as any)}
                style={s.row}
                activeOpacity={0.88}
              >
                <Squircle accentKey={a} size={48} icon={<Ionicons name={iconForMatiere(l.matiere) as any} size={22} color={T[a].fg} />} />
                <View style={{ flex: 1, marginLeft: 13 }}>
                  <Text style={s.rowMatiere}>{l.matiere}</Text>
                  <Text style={s.rowTitre} numberOfLines={2}>{l.titre}</Text>
                  <Text style={s.rowMeta}>
                    {formatLessonDate(l.createdAt)} · {l.notions.length} {l.notions.length > 1 ? 'notions' : 'notion'}
                    {genCount > 0 ? ` · ${genCount} contenu${genCount > 1 ? 's' : ''} IA` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={T.faint} />
              </TouchableOpacity>
            );
          })}

          {list.length === 0 && (
            <View style={s.emptyBox}>
              <Ionicons name="book-outline" size={42} color={T.faint} />
              <Text style={s.emptyText}>Aucune leçon enregistrée pour le moment.</Text>
              <Btn onPress={() => router.push('/scan' as any)} icon={<Ionicons name="scan-outline" size={19} color="#fff" />}>
                Scanner une leçon
              </Btn>
            </View>
          )}
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
  header: { marginTop: 18, marginBottom: 16 },
  title: { fontFamily: FONT.title, fontSize: 27, color: T.ink, letterSpacing: -0.5 },
  sub: { fontFamily: FONT.body, fontSize: 15, color: T.sub, marginTop: 8 },
  list: { gap: 11 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 15,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  rowMatiere: { fontFamily: FONT.bodyBold, fontSize: 13, color: T.sub, letterSpacing: 0.2 },
  rowTitre: { fontFamily: FONT.num, fontSize: 15.5, color: T.ink, letterSpacing: -0.3, marginTop: 2 },
  rowMeta: { fontFamily: FONT.body, fontSize: 12.5, color: T.faint, marginTop: 4 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 16 },
  emptyText: { fontFamily: FONT.num, fontSize: 15, color: T.faint, textAlign: 'center' },
});
