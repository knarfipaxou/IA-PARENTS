import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { progressColor } from '../lib/progressColor';
import {
  MISSION_ORDER, MISSION_DEFS, MISSION_STATUS_LABELS,
  loadMasteryPath, saveMasteryPath, setOverride,
  missionStatus, missionsValidated, bestPct, lockReason, currentMission,
  type MasteryPath, type MissionStatus,
} from '../lib/masteryPath';

const STATUS_COLORS: Record<MissionStatus, string> = {
  verrouillee: DK.faint,
  a_decouvrir: DK.cyan,
  a_reprendre: DK.red,
  en_progression: DK.gold,
  maitrisee: DK.green,
};

/** Parcours de maîtrise d'une échéance : 4 missions séquentielles à débloquer. */
export default function ParcoursScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ echeanceId?: string }>();
  const echeanceId = typeof params.echeanceId === 'string' ? params.echeanceId : undefined;
  const { child } = useChild();
  const echeance = child?.echeances?.find((e) => e.id === echeanceId);
  const pathKey = child && echeance ? `${child.id}:${echeance.id}` : null;

  const [path, setPath] = useState<MasteryPath>({ missions: {} });
  useFocusEffect(
    useCallback(() => {
      if (pathKey) loadMasteryPath(pathKey).then(setPath);
    }, [pathKey])
  );

  if (!child || !echeance) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <StatusBar style="light" />
          <Text style={{ color: DK.sub, fontWeight: '600' }}>Échéance introuvable.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const validated = missionsValidated(path);
  const current = currentMission(path);

  function unlockException(id: (typeof MISSION_ORDER)[number]) {
    Alert.alert(
      'Débloquer exceptionnellement',
      `Réservé au parent : ${MISSION_DEFS[id].title} sera accessible sans avoir validé la mission précédente. Continuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Débloquer',
          style: 'destructive',
          onPress: async () => {
            const next = setOverride(path, id);
            setPath(next);
            if (pathKey) await saveMasteryPath(pathKey, next);
          },
        },
      ],
    );
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
              <Text style={s.title}>Parcours de maîtrise</Text>
              <Text style={s.sub}>{echeance.type} de {echeance.subj} · {validated}/4 missions validées</Text>
            </View>
          </View>

          {/* jauge globale du parcours */}
          <View style={s.progressTrack}>
            {MISSION_ORDER.map((id, i) => {
              const st = missionStatus(path, id);
              return (
                <View key={id} style={[s.progressSeg, i > 0 && { marginLeft: 5 }, {
                  backgroundColor: st === 'maitrisee' ? DK.green : st === 'verrouillee' ? 'rgba(148,168,255,0.15)' : 'rgba(53,228,210,0.35)',
                }]} />
              );
            })}
          </View>

          {MISSION_ORDER.map((id, i) => {
            const def = MISSION_DEFS[id];
            const st = missionStatus(path, id);
            const locked = st === 'verrouillee';
            const best = bestPct(path, id);
            const reason = lockReason(path, id);
            const isCurrent = current === id;
            return (
              <View
                key={id}
                style={[
                  s.missionCard,
                  locked && s.missionLocked,
                  isCurrent && { borderColor: 'rgba(53,228,210,0.55)' },
                  st === 'maitrisee' && { borderColor: 'rgba(52,214,150,0.5)' },
                ]}
              >
                <View style={s.missionHead}>
                  <View style={[s.missionIcon, { backgroundColor: locked ? 'rgba(148,168,255,0.08)' : `${def.color}22` }]}>
                    <Ionicons name={(locked ? 'lock-closed' : def.icon) as any} size={24} color={locked ? DK.faint : def.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.missionTitle, locked && { color: DK.faint }]}>{i + 1}. {def.title}</Text>
                    <Text style={[s.missionDesc, locked && { color: DK.faint }]}>{def.desc}</Text>
                  </View>
                  <View style={[s.statusChip, { borderColor: STATUS_COLORS[st] }]}>
                    <Text style={[s.statusChipText, { color: STATUS_COLORS[st] }]}>{MISSION_STATUS_LABELS[st]}</Text>
                  </View>
                </View>

                {best !== null && (
                  <View style={s.scoreRow}>
                    <View style={s.scoreTrack}>
                      <View style={[s.scoreFill, { width: `${Math.max(4, best)}%`, backgroundColor: progressColor(best) }]} />
                    </View>
                    <Text style={[s.scoreText, { color: progressColor(best) }]}>{best} %</Text>
                  </View>
                )}

                {locked ? (
                  <>
                    {!!reason && (
                      <View style={s.lockRow}>
                        <Ionicons name="lock-closed-outline" size={13} color={DK.faint} />
                        <Text style={s.lockText}>{reason}</Text>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => unlockException(id)} style={s.overrideRow} activeOpacity={0.8}>
                      <Ionicons name="key-outline" size={14} color={DK.sub} />
                      <Text style={s.overrideText}>Débloquer exceptionnellement (parent)</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => router.push(`/parcours-mission?echeanceId=${echeance.id}&mission=${id}` as any)}
                    activeOpacity={0.88}
                    style={{ marginTop: 12 }}
                  >
                    <LinearGradient
                      colors={st === 'maitrisee' ? ['rgba(52,214,150,0.25)', 'rgba(19,26,58,0.4)'] : ['#1FB8A8', DK.cyan]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={s.missionBtn}
                    >
                      <Text style={[s.missionBtnText, st === 'maitrisee' && { color: DK.green }]}>
                        {st === 'a_decouvrir' ? 'Commencer la mission'
                          : st === 'maitrisee' ? 'Refaire la mission'
                          : 'Continuer la mission'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <Text style={s.hint}>
            Chaque mission se débloque en validant la précédente. Le pourcentage de
            préparation de l'échéance reste basé uniquement sur le devoir blanc complet.
          </Text>
          <View style={{ height: 24 }} />
        </ScrollView>
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
  title: { fontSize: 22, fontWeight: '900', color: DK.ink, letterSpacing: -0.5 },
  sub: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 2 },
  progressTrack: { flexDirection: 'row', marginBottom: 16 },
  progressSeg: { flex: 1, height: 7, borderRadius: 999 },
  missionCard: {
    borderWidth: 1.3, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 24, padding: 16, marginBottom: 13,
  },
  missionLocked: { opacity: 0.55, backgroundColor: 'rgba(12,17,40,0.6)' },
  missionHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  missionIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  missionTitle: { color: DK.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  missionDesc: { color: DK.sub, fontSize: 12, fontWeight: '600', marginTop: 3, lineHeight: 17 },
  statusChip: { borderWidth: 1.1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, marginLeft: 6 },
  statusChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  scoreTrack: { flex: 1, height: 8, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.15)' },
  scoreFill: { height: '100%', borderRadius: 999 },
  scoreText: { fontSize: 13, fontWeight: '900', minWidth: 44, textAlign: 'right' },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 },
  lockText: { flex: 1, color: DK.faint, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  overrideRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
  overrideText: { color: DK.sub, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  missionBtn: { borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  missionBtnText: { color: '#052620', fontSize: 14.5, fontWeight: '800' },
  hint: { color: DK.faint, fontSize: 12, fontWeight: '600', lineHeight: 18, marginTop: 4 },
});
