import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { ProgressRing, ProgressBar } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';
import { getLevel, getLevelProgress, getNextLevelXP, BADGE_DEFS } from '../../lib/gamification';
import { statsByMatiere, fragileCompetences, masteredCompetences } from '../../lib/adaptation';

const NIVEAU_LABELS: Record<string, string> = {
  fragile: 'Fragile', moyen: 'Moyen', bon: 'Bon', avance: 'Avancé', tres_avance: 'Très avancé',
};
const OBJ_LABELS: Record<string, string> = {
  consolidation: 'Consolidation', bon_niveau: 'Bon niveau', excellence: 'Excellence', concours: 'Concours / Prépa',
};
const TON_LABELS: Record<string, string> = { bienveillant: 'Bienveillant', exigeant: 'Exigeant' };

export default function ProfilScreen() {
  const router = useRouter();
  const { child, gamification, getProfile, getDrillResults } = useChild();
  const profile = child ? getProfile(child.id) : undefined;
  const drillResults = child ? getDrillResults(child.id) : [];
  const matStats = statsByMatiere(drillResults);
  const fragiles = fragileCompetences(drillResults);
  const maitrisees = masteredCompetences(drillResults);

  if (!child) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.noChild}>Aucun enfant sélectionné</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gam = gamification(child.id);
  const level = getLevel(gam.xp);
  const levelPct = getLevelProgress(gam.xp);
  const nextXP = getNextLevelXP(gam.xp);

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
          <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.editBtn}>
            <Ionicons name="create-outline" size={19} color={T.ink} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.editRow} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={19} color={T.primaryDeep} />
          <Text style={s.editRowText}>Modifier le profil</Text>
          <Ionicons name="chevron-forward" size={17} color={T.primaryDeep} />
        </TouchableOpacity>

        {/* Profil scolaire personnalisé */}
        {profile ? (
          <>
            <Text style={s.sectionLabel}>PROFIL SCOLAIRE</Text>
            <View style={s.profGrid}>
              <View style={s.profItem}>
                <Ionicons name="bar-chart-outline" size={16} color={T.primary} />
                <Text style={s.profItemLabel}>Niveau</Text>
                <Text style={s.profItemValue}>{NIVEAU_LABELS[profile.niveauEstime]}</Text>
              </View>
              <View style={s.profItem}>
                <Ionicons name="flag-outline" size={16} color={T.primary} />
                <Text style={s.profItemLabel}>Objectif</Text>
                <Text style={s.profItemValue}>{OBJ_LABELS[profile.objectif]}</Text>
              </View>
              <View style={s.profItem}>
                <Ionicons name="time-outline" size={16} color={T.primary} />
                <Text style={s.profItemLabel}>Durée/jour</Text>
                <Text style={s.profItemValue}>{profile.dureeQuotidienne === 'custom' ? 'Libre' : `${profile.dureeQuotidienne} min`}</Text>
              </View>
              <View style={s.profItem}>
                <Ionicons name="heart-outline" size={16} color={T.primary} />
                <Text style={s.profItemLabel}>Ton</Text>
                <Text style={s.profItemValue}>{TON_LABELS[profile.ton]}</Text>
              </View>
            </View>
            {profile.etablissement && (
              <View style={s.profSchool}>
                <Ionicons name="school-outline" size={15} color={T.sub} />
                <Text style={s.profSchoolText}>{profile.etablissement}</Text>
              </View>
            )}
            {profile.noteLibre && (
              <View style={s.profNote}>
                <Text style={s.profNoteLabel}>NOTE POUR L'IA</Text>
                <Text style={s.profNoteText}>{profile.noteLibre}</Text>
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.profEmpty} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={T.primaryDeep} />
            <Text style={s.profEmptyText}>Complétez le profil scolaire pour personnaliser l'IA</Text>
          </TouchableOpacity>
        )}

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

        {/* Progression des drills */}
        {matStats.length > 0 && (
          <>
            <Text style={s.sectionLabel}>PROGRESSION DES DRILLS</Text>
            <Card pad={15} style={{ gap: 12 }}>
              {matStats.map((m) => (
                <View key={m.matiere}>
                  <View style={s.matStatRow}>
                    <Text style={s.matStatName}>{m.matiere}</Text>
                    <Text style={[s.matStatPct, { color: m.taux >= 80 ? T.green.fg : m.taux >= 60 ? T.amber.fg : T.coral.fg }]}>
                      {m.taux}% · {m.total} exo{m.total > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <ProgressBar value={m.taux / 100} color={m.taux >= 80 ? T.green.solid : m.taux >= 60 ? T.amber.solid : T.coral.solid} h={7} />
                </View>
              ))}
            </Card>

            {fragiles.length > 0 && (
              <View style={[s.compBox, { backgroundColor: T.coral.soft }]}>
                <Text style={[s.compLabel, { color: T.coral.fg }]}>À RETRAVAILLER (moins de 60% de réussite)</Text>
                {fragiles.map((f) => (
                  <Text key={`${f.matiere}-${f.competence}`} style={[s.compItem, { color: T.coral.fg }]}>
                    • {f.competence} ({f.matiere}) — {f.taux}%
                  </Text>
                ))}
              </View>
            )}
            {maitrisees.length > 0 && (
              <View style={[s.compBox, { backgroundColor: T.green.soft }]}>
                <Text style={[s.compLabel, { color: T.green.fg }]}>COMPÉTENCES MAÎTRISÉES (plus de 90%)</Text>
                {maitrisees.map((f) => (
                  <Text key={`${f.matiere}-${f.competence}`} style={[s.compItem, { color: T.green.fg }]}>
                    • {f.competence} ({f.matiere}) — {f.taux}%
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

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
        {/* Récompenses */}
        <Text style={s.sectionLabel}>RÉCOMPENSES</Text>
        <Card pad={16} style={s.xpCard}>
          <View style={s.xpHeaderRow}>
            <View style={s.streakBox}>
              <Text style={s.streakFire}>🔥</Text>
              <Text style={s.streakBig}>{gam.streak}</Text>
              <Text style={s.streakLbl}>jours</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={s.xpLabelRow}>
                <Text style={s.xpLevelText}>{level.label}</Text>
                <Text style={s.xpTotal}>{gam.xp} XP</Text>
              </View>
              <ProgressBar value={levelPct} color={level.color} h={8} />
              <Text style={s.xpNextLabel}>Prochain niveau : {nextXP} XP</Text>
            </View>
          </View>
        </Card>
        <View style={s.badgeGrid}>
          {BADGE_DEFS.map((b, i) => {
            const unlocked = gam.badges.includes(b.id);
            return (
              <Animated.View key={b.id} entering={FadeInDown.delay(i * 45).springify().damping(16)} style={[s.badgeTile, !unlocked && s.badgeTileLocked]}>
                <View style={[s.badgeIcon, { backgroundColor: unlocked ? T[b.accent].soft : T.surfaceAlt }]}>
                  <Ionicons name={b.icon as any} size={22} color={unlocked ? T[b.accent].fg : T.faint} />
                </View>
                <Text style={[s.badgeName, !unlocked && { color: T.faint }]} numberOfLines={1}>{b.label}</Text>
                {!unlocked && <Ionicons name="lock-closed" size={11} color={T.faint} style={{ marginTop: 2 }} />}
              </Animated.View>
            );
          })}
        </View>

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
  editBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.primarySoft, borderRadius: 15, padding: 13,
  },
  editRowText: { flex: 1, fontSize: 14.5, fontWeight: '800', color: T.primaryDeep },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginBottom: 11, letterSpacing: 0.2, marginTop: 22 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  profItem: {
    width: '47.5%', backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 16, padding: 13, gap: 3,
  },
  profItemLabel: { fontSize: 11.5, fontWeight: '700', color: T.faint, marginTop: 4 },
  profItemValue: { fontSize: 15, fontWeight: '800', color: T.ink, letterSpacing: -0.3 },
  profSchool: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  profSchoolText: { fontSize: 13.5, fontWeight: '600', color: T.sub },
  profNote: { backgroundColor: T.primarySoft, borderRadius: 14, padding: 13, marginTop: 10 },
  profNoteLabel: { fontSize: 11, fontWeight: '800', color: T.primaryDeep, letterSpacing: 0.3, marginBottom: 5 },
  profNoteText: { fontSize: 13.5, fontWeight: '500', color: T.primaryDeep, lineHeight: 19 },
  profEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.primarySoft, borderRadius: 14, padding: 14,
  },
  profEmptyText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: T.primaryDeep },
  matStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  matStatName: { fontSize: 14, fontWeight: '800', color: T.ink, letterSpacing: -0.2 },
  matStatPct: { fontSize: 12.5, fontWeight: '800' },
  compBox: { borderRadius: 14, padding: 13, marginTop: 10, gap: 4 },
  compLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, marginBottom: 3 },
  compItem: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
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
  xpCard: { marginBottom: 14 },
  xpHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  streakBox: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: T.coral.soft, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  streakFire: { fontSize: 20 },
  streakBig: { fontSize: 22, fontWeight: '900', color: T.coral.fg },
  streakLbl: { fontSize: 11, fontWeight: '700', color: T.coral.fg, marginTop: 4 },
  xpLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  xpLevelText: { fontSize: 15, fontWeight: '800', color: T.ink, letterSpacing: -0.3 },
  xpTotal: { fontSize: 13, fontWeight: '700', color: T.sub },
  xpNextLabel: { fontSize: 11.5, color: T.faint, fontWeight: '600', marginTop: 5 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  badgeTile: { width: '30%', alignItems: 'center', padding: 12, backgroundColor: T.surface, borderRadius: 18, borderWidth: 1, borderColor: T.line },
  badgeTileLocked: { opacity: 0.55 },
  badgeIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  badgeName: { fontSize: 11.5, fontWeight: '700', color: T.ink, textAlign: 'center' },
});
