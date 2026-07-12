import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DK, DK_ICONS } from '../../constants/darkTheme';
import { useChild } from '../../contexts/ChildContext';
import { formatLessonDate } from '../../lib/matiere';
import { useScheme } from '../../lib/useScheme';
import { subjectIcon } from '../../lib/subjectIcons';

export default function LeconsTab() {
  const router = useRouter();
  const { child, lessons } = useChild();
  const scheme = useScheme();
  const list = child ? lessons.filter((l) => l.childId === child.id) : [];

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Leçons enregistrées</Text>
              <Text style={s.sub}>
                {child
                  ? `${list.length} ${list.length > 1 ? 'leçons scannées' : 'leçon scannée'} pour ${child.name}`
                  : 'Aucun enfant sélectionné'}
              </Text>
            </View>
            <Image source={DK_ICONS.calculator} style={{ width: 44, height: 44 }} />
          </View>

          <View style={{ gap: 10 }}>
            {list.map((l, i) => {
              const genCount = [l.fiche, l.flashcards, l.exercices, l.minitest, l.controleBlanc].filter(Boolean).length;
              return (
                <Animated.View key={l.id} entering={FadeInDown.delay(Math.min(i, 8) * 60).springify().damping(16)}>
                  <TouchableOpacity
                    onPress={() => router.push(`/lesson-detail?id=${l.id}` as any)}
                    style={s.row}
                    activeOpacity={0.85}
                  >
                    <Image source={subjectIcon(l.matiere, scheme)} style={{ width: 54, height: 58, borderRadius: 13 }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.rowMatiere}>{l.matiere}</Text>
                      <Text style={s.rowTitre} numberOfLines={2}>{l.titre}</Text>
                      <Text style={s.rowMeta}>
                        {formatLessonDate(l.createdAt)} · {l.notions.length} {l.notions.length > 1 ? 'notions' : 'notion'}
                        {genCount > 0 ? ` · ${genCount} contenu${genCount > 1 ? 's' : ''} IA` : ''}
                      </Text>
                    </View>
                    <View style={s.rowChevron}>
                      <Ionicons name="chevron-forward" size={14} color={DK.ink} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {list.length === 0 && (
              <View style={s.emptyBox}>
                <Image source={DK_ICONS.scan} style={{ width: 56, height: 56, opacity: 0.8 }} />
                <Text style={s.emptyText}>Aucune leçon enregistrée pour le moment.</Text>
                <Text style={s.emptySub}>Scannez une première leçon pour créer des fiches, QCM et flashcards IA.</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/scan' as any)} activeOpacity={0.88} style={{ marginTop: 18 }}>
            <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.scanBtn}>
              <Ionicons name="scan" size={19} color="#052620" />
              <Text style={s.scanBtnText}>Scanner une nouvelle leçon</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, marginTop: 6 },
  title: { fontSize: 24, fontWeight: '900', color: DK.ink, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: DK.sub, fontWeight: '600', marginTop: 3 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 13,
  },
  rowMatiere: { fontSize: 11.5, fontWeight: '800', color: DK.sub, letterSpacing: 0.3 },
  rowTitre: { fontSize: 15, fontWeight: '800', color: DK.ink, letterSpacing: -0.3, marginTop: 1 },
  rowMeta: { fontSize: 11.5, color: DK.faint, fontWeight: '600', marginTop: 3 },
  rowChevron: {
    width: 26, height: 26, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyBox: { alignItems: 'center', paddingVertical: 34, gap: 9 },
  emptyText: { fontSize: 15, fontWeight: '700', color: DK.sub },
  emptySub: { fontSize: 12.5, color: DK.faint, fontWeight: '500', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderRadius: 999, paddingVertical: 15,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
  },
  scanBtnText: { color: '#052620', fontSize: 15, fontWeight: '800' },
});
