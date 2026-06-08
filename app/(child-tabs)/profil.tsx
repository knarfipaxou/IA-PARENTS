import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { ProgressRing } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';

export default function ProfilScreen() {
  const { child } = useChild();

  if (!child) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.noChild}>Aucun enfant sélectionné</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={s.identity}>
          <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.avatar}>
            <Text style={s.avatarText}>{child.name.charAt(0)}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{child.name}</Text>
            <Text style={s.classe}>{child.classe} · {child.age} ans</Text>
          </View>
        </View>

        {/* Matieres */}
        <Text style={s.sectionLabel}>MATIÈRES SUIVIES</Text>
        <View style={s.chipsRow}>
          {child.matieres.map((m) => (
            <View key={m.s} style={[s.chip, { backgroundColor: T[m.a].soft }]}>
              <Ionicons name={m.icon as any} size={14} color={T[m.a].fg} />
              <Text style={[s.chipText, { color: T[m.a].fg }]}>{m.s}</Text>
              <Text style={[s.chipPct, { color: T[m.a].fg }]}>{m.v}%</Text>
            </View>
          ))}
        </View>

        {/* Forts / Faibles */}
        <View style={s.row2}>
          <Card pad={15} style={{ flex: 1 }}>
            <Squircle
              accentKey="green"
              size={36}
              r={11}
              icon={<Ionicons name="trending-up-outline" size={19} color={T.green.fg} />}
              style={{ marginBottom: 10 }}
            />
            <Text style={s.cardLabel}>POINTS FORTS</Text>
            {child.forts.map((f) => (
              <Text key={f} style={s.cardItem}>{f}</Text>
            ))}
          </Card>
          <Card pad={15} style={{ flex: 1 }}>
            <Squircle
              accentKey="coral"
              size={36}
              r={11}
              icon={<Ionicons name="radio-button-off-outline" size={19} color={T.coral.fg} />}
              style={{ marginBottom: 10 }}
            />
            <Text style={s.cardLabel}>À AMÉLIORER</Text>
            {child.faibles.map((f) => (
              <Text key={f} style={s.cardItem}>{f}</Text>
            ))}
          </Card>
        </View>

        {/* Progression */}
        <Text style={s.sectionLabel}>PROGRESSION</Text>
        <Card pad={16} style={s.progressCard}>
          <ProgressRing value={child.progress} size={64} sw={8}>
            <Text style={s.ringText}>{child.progress}%</Text>
          </ProgressRing>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.progressTitle}>Bon rythme de révision</Text>
            <Text style={s.progressSub}>Régulier sur les 2 dernières semaines.</Text>
          </View>
        </Card>

        {/* History */}
        {child.history.length > 0 && (
          <>
            <Text style={s.sectionLabel}>ÉVALUATIONS PASSÉES</Text>
            <Card pad={8}>
              {child.history.map((h, i) => (
                <View
                  key={i}
                  style={[s.histRow, i < child.history.length - 1 && s.histBorder]}
                >
                  <Squircle
                    accentKey={h.accent}
                    size={36}
                    r={11}
                    icon={<Ionicons name="book-outline" size={18} color={T[h.accent].fg} />}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.histTitle}>{h.subj} · {h.type}</Text>
                    <Text style={s.histDate}>{h.date}</Text>
                  </View>
                  <Text style={[s.histScore, { color: T[h.accent].fg }]}>{h.score}</Text>
                </View>
              ))}
            </Card>
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
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noChild: { fontSize: 16, color: T.sub },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  name: { fontSize: 25, fontWeight: '800', color: T.ink, letterSpacing: -0.5 },
  classe: { fontSize: 14, color: T.sub, fontWeight: '600', marginTop: 1 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginBottom: 11, letterSpacing: 0.2, marginTop: 22 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  chipText: { fontSize: 13.5, fontWeight: '700' },
  chipPct: { fontSize: 12, fontWeight: '800' },
  row2: { flexDirection: 'row', gap: 11 },
  cardLabel: { fontSize: 12.5, fontWeight: '800', color: T.sub, marginBottom: 6 },
  cardItem: { fontSize: 14, fontWeight: '700', color: T.ink, marginTop: 3 },
  progressCard: { flexDirection: 'row', alignItems: 'center' },
  ringText: { fontSize: 17, fontWeight: '800', color: T.ink },
  progressTitle: { fontSize: 15, fontWeight: '800', color: T.ink },
  progressSub: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  histBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  histTitle: { fontSize: 14.5, fontWeight: '700', color: T.ink },
  histDate: { fontSize: 12.5, color: T.faint, fontWeight: '600', marginTop: 1 },
  histScore: { fontSize: 16, fontWeight: '800' },
});
