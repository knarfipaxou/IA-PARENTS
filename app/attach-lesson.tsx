import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { subjectIcon } from '../lib/subjectIcons';

/**
 * Rattacher une ou plusieurs leçons EXISTANTES à une échéance : simple liste
 * des leçons enregistrées de l'enfant, cochables, sans suggestion IA.
 */
export default function AttachLessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ echeanceId?: string }>();
  const echeanceId = typeof params.echeanceId === 'string' ? params.echeanceId : undefined;
  const { child, lessons, updateEcheance } = useChild();
  const echeance = echeanceId ? child?.echeances?.find((e) => e.id === echeanceId) : undefined;
  const childLessons = child ? lessons.filter((l) => l.childId === child.id) : [];

  const [selected, setSelected] = useState<Set<string>>(new Set(echeance?.lessonIds ?? []));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function save() {
    if (!child || !echeance) return;
    updateEcheance(child.id, echeance.id, { lessonIds: Array.from(selected) });
    router.back();
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.navRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Rattacher une leçon existante</Text>
              {!!echeance && <Text style={s.sub}>{echeance.type} de {echeance.subj} · {echeance.date}</Text>}
            </View>
          </View>

          {childLessons.length === 0 ? (
            <View style={s.emptyBox}>
              <Ionicons name="book-outline" size={42} color={DK.faint} />
              <Text style={s.emptyText}>Aucune leçon enregistrée pour l'instant.</Text>
              <TouchableOpacity
                onPress={() => router.replace(`/scan?echeanceId=${echeanceId}` as any)}
                style={s.scanBtnGhost} activeOpacity={0.85}
              >
                <Ionicons name="scan-outline" size={18} color={DK.cyan} />
                <Text style={s.scanBtnGhostText}>Scanner une leçon</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10, marginTop: 6 }}>
              {childLessons.map((l) => {
                const on = selected.has(l.id);
                return (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => toggle(l.id)}
                    style={[s.row, on && s.rowOn]}
                    activeOpacity={0.85}
                  >
                    <View style={[s.check, on && s.checkOn]}>
                      {on && <Ionicons name="checkmark" size={15} color="#052A26" />}
                    </View>
                    <Image source={subjectIcon(l.matiere, 'dark')} style={s.rowIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.rowTitle, on && { color: '#9FF0BE' }]} numberOfLines={1}>{l.titre}</Text>
                      <Text style={s.rowSub}>
                        {l.matiere}
                        {l.createdAt ? ` · ${l.createdAt.slice(0, 10).split('-').reverse().join('/')}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {childLessons.length > 0 && (
          <View style={s.footer}>
            <TouchableOpacity onPress={save} activeOpacity={0.88}>
              <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtn}>
                <Ionicons name="checkmark" size={19} color="#052A26" />
                <Text style={s.saveBtnText}>Enregistrer ({selected.size})</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  content: { padding: 18, paddingBottom: 32 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 14 },
  backCircle: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 19, fontWeight: '900', color: DK.ink, letterSpacing: -0.4 },
  sub: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.2, borderColor: DK.cardBorder, backgroundColor: 'rgba(20,27,51,0.75)',
    borderRadius: 18, padding: 12,
  },
  rowOn: { borderColor: 'rgba(110,230,150,0.65)', backgroundColor: 'rgba(110,230,150,0.08)' },
  check: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { backgroundColor: DK.green, borderColor: DK.green },
  rowIcon: { width: 46, height: 50, borderRadius: 13 },
  rowTitle: { fontSize: 14.5, fontWeight: '800', color: DK.ink, letterSpacing: -0.2 },
  rowSub: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14.5, color: DK.sub, fontWeight: '600', textAlign: 'center' },
  scanBtnGhost: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.5)', borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  scanBtnGhostText: { color: DK.cyan, fontSize: 14, fontWeight: '800' },
  footer: { position: 'absolute', left: 18, right: 18, bottom: 24 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  saveBtnText: { color: '#052A26', fontSize: 15.5, fontWeight: '900' },
});
