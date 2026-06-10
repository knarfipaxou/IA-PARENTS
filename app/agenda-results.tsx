import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { Chip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';
import { useChild } from '../contexts/ChildContext';
import type { AgendaDevoir } from '../services/ai';
import type { Echeance } from '../data/mock';

const ACCENTS: AccentKey[] = ['green', 'violet', 'coral', 'blue', 'amber'];

function iconForMatiere(matiere: string): string {
  const m = matiere.toLowerCase();
  if (m.includes('math')) return 'calculator-outline';
  if (m.includes('fran') || m.includes('lettre')) return 'book-outline';
  if (m.includes('svt') || m.includes('science') || m.includes('physique') || m.includes('chimie')) return 'flask-outline';
  if (m.includes('hist') || m.includes('géo') || m.includes('geo')) return 'globe-outline';
  if (m.includes('angl') || m.includes('espagn') || m.includes('allem') || m.includes('langue')) return 'chatbubble-outline';
  if (m.includes('musi')) return 'musical-notes-outline';
  if (m.includes('sport') || m.includes('eps')) return 'fitness-outline';
  return 'school-outline';
}

function daysFromDate(dateStr: string): number {
  const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    const target = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
    if (!isNaN(diff)) return Math.max(diff, 0);
  }
  return 7;
}

function prioAccent(p: string): AccentKey {
  if (p === 'haute') return 'coral';
  if (p === 'basse') return 'green';
  return 'amber';
}

export default function AgendaResultsScreen() {
  const router = useRouter();
  const { child, getGenerated, addEcheance } = useChild();
  const devoirs: AgendaDevoir[] = (child ? getGenerated(child.id, 'devoirs') : undefined) ?? [];
  const [added, setAdded] = useState<Set<number>>(new Set());

  function toEcheance(d: AgendaDevoir, i: number): Echeance {
    return {
      id: `ech-${Date.now()}-${i}`,
      subj: d.matiere,
      type: d.type,
      date: d.date,
      days: daysFromDate(d.date),
      status: 'confirme',
      accent: ACCENTS[i % ACCENTS.length],
      icon: iconForMatiere(d.matiere),
      urg: d.priorite === 'haute',
    };
  }

  function addOne(i: number) {
    if (!child || added.has(i)) return;
    addEcheance(child.id, toEcheance(devoirs[i], i));
    setAdded((prev) => new Set(prev).add(i));
  }

  function addAll() {
    if (!child) return;
    devoirs.forEach((d, i) => {
      if (!added.has(i)) addEcheance(child.id, toEcheance(d, i));
    });
    setAdded(new Set(devoirs.map((_, i) => i)));
    router.push('/(child-tabs)/echeances' as any);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.blue.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>Analysé</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>Devoirs détectés</Text>
          <Text style={s.sub}>
            {devoirs.length > 0
              ? `${devoirs.length} ${devoirs.length > 1 ? 'échéances trouvées' : 'échéance trouvée'}. Ajoutez-les au suivi.`
              : "Aucun devoir détecté dans l'agenda."}
          </Text>
        </View>

        <View style={s.list}>
          {devoirs.map((d, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const isAdded = added.has(i);
            return (
              <Card key={i} pad={15}>
                <View style={s.itemTop}>
                  <Squircle accentKey={accent} icon={<Ionicons name={iconForMatiere(d.matiere) as any} size={22} color={T[accent].fg} />} size={46} />
                  <View style={{ flex: 1, marginLeft: 13 }}>
                    <View style={s.itemTitleRow}>
                      <Text style={s.itemSubj}>{d.matiere}</Text>
                      <Text style={s.itemType}>· {d.type}</Text>
                    </View>
                    <Text style={s.itemTitre} numberOfLines={2}>{d.titre}</Text>
                    <Text style={s.itemDate}>{d.date}</Text>
                  </View>
                </View>
                <View style={s.itemBottom}>
                  <Chip accentKey={prioAccent(d.priorite)}>
                    {d.priorite === 'haute' ? 'Priorité haute' : d.priorite === 'basse' ? 'Priorité basse' : 'Priorité normale'}
                  </Chip>
                  <TouchableOpacity
                    onPress={() => addOne(i)}
                    disabled={isAdded}
                    style={[s.addBtn, isAdded && s.addBtnDone]}
                  >
                    <Ionicons name={isAdded ? 'checkmark' : 'add'} size={16} color={isAdded ? T.green.fg : '#fff'} />
                    <Text style={[s.addBtnText, isAdded && { color: T.green.fg }]}>
                      {isAdded ? 'Ajouté' : 'Ajouter aux échéances'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ minHeight: 24 }} />
        {devoirs.length > 0 ? (
          <Btn full onPress={addAll} icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}>
            Tout ajouter
          </Btn>
        ) : (
          <GhostBtn full onPress={() => router.back()} icon={<Ionicons name="camera-outline" size={19} color={T.ink} />}>
            Scanner à nouveau
          </GhostBtn>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { marginTop: 18, marginBottom: 0 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500', marginBottom: 16 },
  list: { gap: 11 },
  itemTop: { flexDirection: 'row', alignItems: 'center' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemSubj: { fontWeight: '800', fontSize: 16, color: T.ink, letterSpacing: -0.3 },
  itemType: { fontSize: 13, color: T.sub, fontWeight: '600' },
  itemTitre: { fontSize: 13.5, color: T.ink, fontWeight: '600', marginTop: 2 },
  itemDate: { fontSize: 13, color: T.sub, fontWeight: '600', marginTop: 2 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
  },
  addBtnDone: { backgroundColor: T.green.soft },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
});
