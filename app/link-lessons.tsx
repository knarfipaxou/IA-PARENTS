import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { useChild } from '../contexts/ChildContext';
import { iconForMatiere, accentForMatiere, formatLessonDate } from '../lib/matiere';
import { suggestLessons, AiError } from '../services/ai';

export default function LinkLessonsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ echeanceId?: string }>();
  const echeanceId = typeof params.echeanceId === 'string' ? params.echeanceId : undefined;
  const { child, lessons, updateEcheance } = useChild();
  const echeance = child?.echeances?.find((e) => e.id === echeanceId);
  const childLessons = child ? lessons.filter((l) => l.childId === child.id) : [];

  const [checked, setChecked] = useState<Set<string>>(new Set(echeance?.lessonIds ?? []));
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string> | null>(null);

  if (!child || !echeance) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Ionicons name="calendar-outline" size={42} color={T.faint} />
          <Text style={s.centerText}>Échéance introuvable.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function runSuggest() {
    if (!child || !echeance || childLessons.length === 0) return;
    setSuggesting(true);
    try {
      const res = await suggestLessons(
        { subj: echeance.subj, type: echeance.type, date: echeance.date, titre: echeance.titre, consigne: echeance.consigne },
        childLessons.map((l) => ({ id: l.id, matiere: l.matiere, titre: l.titre, notions: l.notions, resume: l.resume })),
        child
      );
      const map: Record<string, string> = {};
      (res.suggestions ?? []).forEach((sg) => {
        if (childLessons.some((l) => l.id === sg.lessonId)) map[sg.lessonId] = sg.raison;
      });
      setSuggestions(map);
      // pre-check the suggested boxes — the parent always validates manually
      setChecked((prev) => {
        const next = new Set(prev);
        Object.keys(map).forEach((id) => next.add(id));
        return next;
      });
    } catch (e) {
      if (e instanceof AiError && e.code === 'NO_KEY') {
        Alert.alert('Clé API manquante', 'Ajoutez votre clé API dans Réglages.');
      } else {
        Alert.alert('Suggestion impossible', e instanceof Error ? e.message : 'Erreur inattendue.');
      }
    }
    setSuggesting(false);
  }

  function save() {
    if (!child || !echeance) return;
    updateEcheance(child.id, echeance.id, { lessonIds: Array.from(checked) });
    router.back();
  }

  const suggestedIds = suggestions ? Object.keys(suggestions) : [];
  const suggested = childLessons.filter((l) => suggestedIds.includes(l.id));
  const others = suggestions ? childLessons.filter((l) => !suggestedIds.includes(l.id)) : childLessons;

  const renderRow = (l: (typeof childLessons)[number], raison?: string) => {
    const a = accentForMatiere(l.matiere);
    const on = checked.has(l.id);
    return (
      <TouchableOpacity key={l.id} onPress={() => toggle(l.id)} style={s.row} activeOpacity={0.85}>
        <Ionicons name={on ? 'checkbox' : 'square-outline'} size={24} color={on ? T.primary : T.faint} style={{ marginRight: 11 }} />
        <Squircle accentKey={a} size={42} r={13} icon={<Ionicons name={iconForMatiere(l.matiere) as any} size={20} color={T[a].fg} />} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle}>{l.titre}</Text>
          <Text style={s.rowSub}>{l.matiere} · {formatLessonDate(l.createdAt)}</Text>
          {!!raison && (
            <View style={s.raisonBox}>
              <Ionicons name="sparkles" size={12} color={T.violet.fg} />
              <Text style={s.raisonText}>{raison}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <View style={s.header}>
          <Text style={s.title}>Rattacher des leçons</Text>
          <Text style={s.sub}>{echeance.type} de {echeance.subj} · {echeance.date}</Text>
        </View>

        {childLessons.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="book-outline" size={42} color={T.faint} />
            <Text style={s.centerText}>Aucune leçon enregistrée pour {child.name}.</Text>
            <Btn onPress={() => router.push('/scan' as any)} icon={<Ionicons name="scan-outline" size={19} color="#fff" />}>
              Scanner une leçon
            </Btn>
          </View>
        ) : (
          <>
            <GhostBtn
              full
              onPress={() => { if (!suggesting) runSuggest(); }}
              icon={suggesting ? <ActivityIndicator size="small" color={T.violet.fg} /> : <Ionicons name="sparkles" size={18} color={T.violet.fg} />}
            >
              {suggesting ? 'Analyse en cours…' : "Suggérer avec l'IA"}
            </GhostBtn>

            {suggestions && suggested.length > 0 && (
              <>
                <Text style={s.sectionLabel}>LEÇONS PROBABLEMENT CONCERNÉES</Text>
                <Card pad={6}>
                  {suggested.map((l) => renderRow(l, suggestions[l.id]))}
                </Card>
              </>
            )}
            {suggestions && suggested.length === 0 && (
              <Text style={[s.centerText, { marginTop: 14 }]}>L'IA n'a trouvé aucune leçon correspondant à ce contrôle.</Text>
            )}

            <Text style={s.sectionLabel}>{suggestions ? 'AUTRES LEÇONS' : 'LEÇONS ENREGISTRÉES'}</Text>
            <Card pad={6}>
              {others.map((l) => renderRow(l))}
              {others.length === 0 && <Text style={[s.rowSub, { padding: 12 }]}>Toutes les leçons sont déjà listées ci-dessus.</Text>}
            </Card>

            <View style={{ height: 20 }} />
            <Btn full onPress={save} icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
              {`Enregistrer (${checked.size})`}
            </Btn>
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
  content: { padding: 18, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 14.5, color: T.sub, fontWeight: '600', textAlign: 'center' },
  header: { marginTop: 18, marginBottom: 16 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 20, marginBottom: 11, letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 11 },
  rowTitle: { fontSize: 14.5, fontWeight: '800', color: T.ink, letterSpacing: -0.2 },
  rowSub: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  raisonBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: T.violet.soft, borderRadius: 10, padding: 8, marginTop: 6 },
  raisonText: { flex: 1, fontSize: 12, fontWeight: '600', color: T.violet.fg, lineHeight: 17 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 16 },
});
