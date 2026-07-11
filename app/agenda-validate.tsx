import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS, dkIconForSubject } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import type { AgendaDevoir } from '../services/ai';
import { iconForMatiere, daysFromDate, ACCENT_CYCLE } from '../lib/matiere';
import type { Echeance } from '../data/mock';

const TYPES = ['Contrôle', 'Devoir', 'Récitation', 'Exposé', 'Autre'];

// pilule de type teintée (comme la maquette : CONTRÔLE violet, DEVOIR rose…)
const TYPE_TINT: Record<string, { bg: string; border: string; fg: string }> = {
  'Contrôle': { bg: 'rgba(139,124,246,0.15)', border: 'rgba(139,124,246,0.5)', fg: '#C9A0FF' },
  'Devoir': { bg: 'rgba(255,61,138,0.13)', border: 'rgba(255,61,138,0.5)', fg: '#FF8DB8' },
  'Récitation': { bg: 'rgba(53,228,210,0.12)', border: 'rgba(53,228,210,0.5)', fg: DK.cyan },
  'Exposé': { bg: 'rgba(255,158,44,0.13)', border: 'rgba(255,158,44,0.5)', fg: '#FFB868' },
  'Autre': { bg: 'rgba(148,168,255,0.1)', border: 'rgba(148,168,255,0.35)', fg: 'rgba(200,210,255,0.7)' },
};

interface DraftItem {
  type: string;
  matiere: string;
  titre: string;
  date: string;
  consigne: string;
  validated: boolean;
  urg: boolean;
}

export default function AgendaValidateScreen() {
  const router = useRouter();
  const { child, getGenerated, addEcheance } = useChild();
  const devoirs: AgendaDevoir[] = (child ? getGenerated(child.id, 'devoirs') : undefined) ?? [];

  const [items, setItems] = useState<DraftItem[]>(() =>
    devoirs.map((d) => ({
      type: TYPES.includes(d.type) ? d.type : /contr|compo|ds|interro|dict/i.test(d.type ?? '') ? 'Contrôle' : 'Autre',
      matiere: d.matiere ?? '',
      titre: d.titre ?? '',
      date: d.date ?? '',
      consigne: (d.notions ?? []).join(', '),
      validated: false,
      urg: d.priorite === 'haute',
    }))
  );

  const validCount = items.filter((it) => it.validated).length;

  function patch(i: number, p: Partial<DraftItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addBlank() {
    setItems((prev) => [...prev, { type: 'Contrôle', matiere: '', titre: '', date: '', consigne: '', validated: false, urg: false }]);
  }

  function saveAll() {
    if (!child) {
      Alert.alert('Aucun enfant sélectionné', "Sélectionnez d'abord un enfant depuis l'accueil.");
      return;
    }
    const valid = items.filter((it) => it.validated);
    if (valid.length === 0) {
      Alert.alert('Aucune échéance validée', 'Validez au moins une carte (coche verte) avant d’enregistrer.');
      return;
    }
    valid.forEach((it, i) => {
      const e: Echeance = {
        id: `ech-${Date.now()}-${i}`,
        subj: it.matiere.trim() || 'Matière',
        type: it.type,
        date: it.date.trim() || 'À définir',
        days: daysFromDate(it.date),
        status: 'confirme',
        accent: ACCENT_CYCLE[i % ACCENT_CYCLE.length],
        icon: iconForMatiere(it.matiere),
        urg: it.urg,
        titre: it.titre.trim() || undefined,
        consigne: it.consigne.trim() || undefined,
        lessonIds: [],
      };
      addEcheance(child.id, e);
    });
    router.push('/(child-tabs)/echeances' as any);
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View style={s.headRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Scanner l'agenda</Text>
              <Text style={s.detected}>
                ✓ {items.length} {items.length > 1 ? 'échéances détectées' : 'échéance détectée'}
              </Text>
            </View>
            <Image source={DK_ICONS.agenda} style={s.headIcon} />
          </View>

          <Text style={s.sectionLabel}>ÉCHÉANCES À VALIDER</Text>

          <View style={{ gap: 11 }}>
            {items.map((it, i) => {
              const tint = TYPE_TINT[it.type] ?? TYPE_TINT['Autre'];
              return (
                <LinearGradient
                  key={i}
                  colors={it.validated
                    ? ['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']
                    : ['rgba(19,26,58,0.4)', 'rgba(19,26,58,0.4)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[s.card, it.validated ? s.cardOn : s.cardOff]}
                >
                  {/* rangée du haut : coche, icône matière, matière + type */}
                  <View style={s.cardHead}>
                    <TouchableOpacity
                      onPress={() => patch(i, { validated: !it.validated })}
                      style={[s.check, it.validated ? s.checkOn : s.checkOff]}
                      activeOpacity={0.8}
                    >
                      {it.validated && <Ionicons name="checkmark" size={16} color="#052A26" />}
                    </TouchableOpacity>
                    <Image source={dkIconForSubject(it.matiere)} style={s.cardIcon} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <Text style={s.cardMatiere}>{it.matiere.trim() || 'Matière ?'}</Text>
                        <View style={[s.typeBadge, { backgroundColor: tint.bg, borderColor: tint.border }]}>
                          <Text style={[s.typeBadgeText, { color: tint.fg }]}>{it.type.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={s.cardMeta} numberOfLines={1}>
                        {(it.date.trim() || 'Date à définir')}{it.titre.trim() ? ` — « ${it.titre.trim()} »` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => remove(i)} style={s.delBtn} activeOpacity={0.8}>
                      <Ionicons name="trash-outline" size={17} color={DK.red} />
                    </TouchableOpacity>
                  </View>

                  {/* type chips */}
                  <View style={s.pillsRow}>
                    {TYPES.map((ty) => {
                      const on = it.type === ty;
                      return (
                        <TouchableOpacity key={ty} onPress={() => patch(i, { type: ty })} style={[s.pill, on && s.pillOn]}>
                          <Text style={[s.pillText, on && s.pillTextOn]}>{ty}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={s.fieldLabel}>Matière</Text>
                  <TextInput style={s.input} value={it.matiere} onChangeText={(v) => patch(i, { matiere: v })} placeholder="Mathématiques" placeholderTextColor={DK.faint} />

                  <Text style={s.fieldLabel}>Titre</Text>
                  <TextInput style={s.input} value={it.titre} onChangeText={(v) => patch(i, { titre: v })} placeholder="Les fractions" placeholderTextColor={DK.faint} />

                  <Text style={s.fieldLabel}>Date (JJ/MM/AAAA)</Text>
                  <TextInput style={s.input} value={it.date} onChangeText={(v) => patch(i, { date: v })} placeholder="18/06/2026" placeholderTextColor={DK.faint} />

                  <Text style={s.fieldLabel}>Consigne</Text>
                  <TextInput style={s.input} value={it.consigne} onChangeText={(v) => patch(i, { consigne: v })} placeholder="Réviser les notions vues en classe" placeholderTextColor={DK.faint} multiline />
                </LinearGradient>
              );
            })}

            {items.length === 0 && (
              <View style={s.emptyBox}>
                <Ionicons name="calendar-outline" size={42} color={DK.faint} />
                <Text style={s.emptyText}>Aucune échéance détectée. Ajoutez-en une manuellement.</Text>
              </View>
            )}
          </View>

          {/* Ajout manuel (pointillés, comme la maquette) */}
          <TouchableOpacity onPress={addBlank} style={s.addDashed} activeOpacity={0.85}>
            <Text style={s.addDashedText}>+ Ajouter une échéance manuellement</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, minHeight: 16 }} />

          {/* CTA */}
          <TouchableOpacity onPress={saveAll} activeOpacity={0.88}>
            <LinearGradient colors={['#1FB8A8', '#35E4D2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cta}>
              <Text style={s.ctaText}>
                {validCount > 0
                  ? `Valider ${validCount} ${validCount > 1 ? 'échéances' : 'échéance'}`
                  : 'Valider les échéances'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 8 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32, flexGrow: 1 },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 8 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  detected: { fontSize: 12.5, color: DK.cyan, fontWeight: '700', marginTop: 2 },
  headIcon: {
    width: 44, height: 44,
    shadowColor: DK.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12,
  },

  sectionLabel: {
    fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(200,210,255,0.55)',
    marginTop: 14, marginBottom: 10, marginLeft: 4,
  },

  card: { borderRadius: 20, padding: 14 },
  cardOn: {
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.5)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.12, shadowRadius: 18,
  },
  cardOff: { borderWidth: 1, borderColor: 'rgba(148,168,255,0.16)' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  check: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkOn: {
    backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  checkOff: { borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)' },
  cardIcon: { width: 42, height: 42, borderRadius: 12 },
  cardMatiere: { fontSize: 14, fontWeight: '800', color: DK.ink },
  typeBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  typeBadgeText: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.4 },
  cardMeta: { fontSize: 11.5, color: 'rgba(210,220,255,0.65)', fontWeight: '600', marginTop: 2 },
  delBtn: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,107,90,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,107,90,0.35)', alignItems: 'center', justifyContent: 'center',
  },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 },
  pill: {
    borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: 'rgba(10,14,34,0.5)', borderWidth: 1.2, borderColor: 'rgba(148,168,255,0.22)',
  },
  pillOn: {
    backgroundColor: 'rgba(53,228,210,0.12)', borderColor: 'rgba(53,228,210,0.55)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 7,
  },
  pillText: { fontWeight: '700', fontSize: 12.5, color: DK.sub },
  pillTextOn: { color: DK.cyan },

  fieldLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(200,210,255,0.55)', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.2)', borderRadius: 14,
    paddingHorizontal: 13, paddingVertical: 11,
    backgroundColor: 'rgba(10,14,34,0.6)', fontSize: 14.5, fontWeight: '500', color: DK.ink,
  },

  addDashed: {
    marginTop: 12, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(148,168,255,0.35)', borderRadius: 18,
  },
  addDashedText: { fontSize: 13, fontWeight: '700', color: '#B9C6FF' },

  emptyBox: { alignItems: 'center', paddingVertical: 36, gap: 12 },
  emptyText: { fontSize: 14.5, color: DK.sub, fontWeight: '600', textAlign: 'center' },

  cta: {
    alignItems: 'center', borderRadius: 999, paddingVertical: 15, marginTop: 16,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
  },
  ctaText: { color: '#052A26', fontSize: 15, fontWeight: '800' },
});
