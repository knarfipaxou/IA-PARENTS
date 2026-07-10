import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK, dkIconForSubject } from '../../constants/darkTheme';
import { useChild } from '../../contexts/ChildContext';
import { isControle } from '../../lib/matiere';

export default function EcheancesScreen() {
  const router = useRouter();
  const { child } = useChild();

  const echeances = child?.echeances ?? [];

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Échéances</Text>
          {child ? (
            <Text style={s.sub}>Tous tes contrôles et devoirs à venir</Text>
          ) : (
            <Text style={s.sub}>Aucun enfant sélectionné</Text>
          )}
          {child && (
            <Text style={s.count}>
              {echeances.length} {echeances.length > 1 ? 'évaluations à venir' : 'évaluation à venir'} pour {child.name}
            </Text>
          )}

          <View style={s.list}>
            {echeances.map((it) => {
              const noLesson = isControle(it.type) && (it.lessonIds ?? []).length === 0;
              const nb = (it.lessonIds ?? []).length;
              return (
                <TouchableOpacity
                  key={it.id}
                  onPress={() => router.push(`/echeance-detail?id=${it.id}` as any)}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
                    start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
                    style={s.row}
                  >
                    <Image source={dkIconForSubject(it.subj)} style={s.rowIcon} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={s.titleRow}>
                        <Text style={s.rowTitle} numberOfLines={1}>{it.type} de {it.subj}</Text>
                        <View style={[s.typeChip, isControle(it.type) ? s.typeChipControle : s.typeChipDevoir]}>
                          <Text style={[s.typeChipText, { color: isControle(it.type) ? '#C9A0FF' : '#FF8DB8' }]}>
                            {it.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.rowSub}>
                        {it.date} • {nb} {nb > 1 ? 'leçons liées' : 'leçon liée'}
                      </Text>
                      <View style={s.statusRow}>
                        <View style={[s.statusDot, { backgroundColor: it.status === 'confirme' ? DK.green : DK.amber }]} />
                        <Text style={s.statusText}>{it.status === 'confirme' ? 'Confirmé' : 'À vérifier'}</Text>
                        {it.urg && (
                          <View style={s.urgChip}>
                            <Text style={s.urgText}>Urgent</Text>
                          </View>
                        )}
                      </View>
                      {noLesson && (
                        <View style={s.warnRow}>
                          <Ionicons name="warning" size={12} color={DK.red} />
                          <Text style={s.warnText}>Aucune leçon rattachée</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.jPill}>
                      <Text style={s.jPillText}>{it.days === 0 ? 'Auj.' : `J-${it.days}`}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}

            {echeances.length === 0 && (
              <View style={s.emptyBox}>
                <Ionicons name="calendar-outline" size={42} color={DK.faint} />
                <Text style={s.emptyText}>Aucune échéance à venir</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/manual-deadline' as any)}
            style={s.addBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={19} color={'#B9C6FF'} />
            <Text style={s.addBtnText}>Ajouter une échéance manuellement</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: DK.ink, letterSpacing: -0.6 },
  sub: { fontSize: 13, color: DK.sub, marginTop: 2, fontWeight: '500' },
  count: { fontSize: 12, color: DK.faint, marginTop: 6, fontWeight: '700', marginBottom: 16 },
  list: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 13,
  },
  rowIcon: {
    width: 46, height: 46,
    shadowColor: DK.blue, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowTitle: { fontWeight: '800', fontSize: 14.5, color: DK.ink, letterSpacing: -0.2, flexShrink: 1 },
  typeChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  typeChipControle: { backgroundColor: 'rgba(139,124,246,0.15)', borderColor: 'rgba(139,124,246,0.5)' },
  typeChipDevoir: { backgroundColor: 'rgba(255,61,138,0.13)', borderColor: 'rgba(255,61,138,0.5)' },
  typeChipText: { fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  rowSub: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  statusText: { fontSize: 11.5, fontWeight: '800', color: DK.sub },
  urgChip: {
    backgroundColor: 'rgba(255,107,90,0.14)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.5)',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4,
  },
  urgText: { color: DK.red, fontWeight: '800', fontSize: 10.5 },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  warnText: { fontSize: 11.5, fontWeight: '700', color: DK.red },
  jPill: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.1)',
    borderRadius: 12, paddingHorizontal: 11, paddingVertical: 8, marginLeft: 8,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  jPillText: { color: DK.cyan, fontWeight: '800', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15, color: DK.faint, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderStyle: 'dashed',
    borderRadius: 20, paddingVertical: 15, marginTop: 18,
  },
  addBtnText: { color: '#B9C6FF', fontSize: 13.5, fontWeight: '700' },
});
