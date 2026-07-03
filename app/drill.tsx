import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { TopBar } from '../components/ui/TopBar';
import { Squircle } from '../components/ui/Squircle';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useChild } from '../contexts/ChildContext';
import { buildSystemPrompt } from '../lib/systemPrompt';
import { buildDrillHtml } from '../lib/drillPrint';
import { buildAdaptationConsignes } from '../lib/adaptation';
import { generateDrill, AiError } from '../services/ai';
import type { DrillExerciseAI } from '../services/ai';
import type { DrillSession, DrillExercise, DrillResult, ErrorType } from '../types/childProfile';

const ERROR_TYPES: { key: ErrorType; label: string }[] = [
  { key: 'calcul', label: 'Calcul' },
  { key: 'methode', label: 'Méthode' },
  { key: 'consigne', label: 'Consigne' },
  { key: 'orthographe', label: 'Orthographe' },
  { key: 'accord', label: 'Accord' },
  { key: 'justification', label: 'Justification' },
  { key: 'soin', label: 'Soin' },
  { key: 'raisonnement', label: 'Autre' },
];

const LEVEL_MAP: Record<string, string> = {
  fragile: 'Fragile', moyen: 'Moyen', bon: 'Bon', avance: 'Avancé', tres_avance: 'Très avancé',
};
const OBJ_MAP: Record<string, string> = {
  consolidation: 'Consolidation', bon_niveau: 'Bon niveau', excellence: 'Excellence', concours: 'Concours',
};
const TYPE_ACCENT: Record<string, string> = {
  calcul: 'amber', geometrie: 'blue', francais: 'violet', lecture: 'violet',
  science: 'green', histoire: 'amber', anglais: 'coral', autre: 'blue',
};
const TYPE_ICON: Record<string, string> = {
  calcul: 'calculator-outline', geometrie: 'shapes-outline', francais: 'book-outline',
  lecture: 'library-outline', science: 'flask-outline', histoire: 'earth-outline',
  anglais: 'chatbubble-outline', autre: 'help-circle-outline',
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function todayFr() {
  const d = new Date();
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}
function jourSemaine() {
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return jours[new Date().getDay()];
}

export default function DrillScreen() {
  const router = useRouter();
  const { child, getProfile, getDrillResults, getDrillSessions, addDrillSession, addDrillResult, addXP } = useChild();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<DrillSession | null>(null);
  const [showCorrection, setShowCorrection] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, 'ok' | 'err'>>({});
  const [errorTypes, setErrorTypes] = useState<Record<number, ErrorType>>({});
  const [done, setDone] = useState(false);

  const profile = child ? getProfile(child.id) : undefined;
  const pastSessions = child ? getDrillSessions(child.id).filter((ds) => ds.status === 'done') : [];
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!child) return;
    setLoading(true);
    setError(null);
    setSession(null);
    setShowCorrection({});
    setResults({});
    setErrorTypes({});
    setDone(false);
    try {
      const prof = getProfile(child.id);
      const systemPrompt = prof
        ? buildSystemPrompt(child, prof)
        : `Tu es un professeur particulier pour ${child.name}, ${child.age} ans, classe de ${child.classe}.`;

      const allResults = getDrillResults(child.id);
      const recentErrors = allResults
        .slice(0, 10)
        .filter((r) => !r.reussite && r.typeErreur)
        .map((r) => `${r.competence} (${r.typeErreur})`);
      const consignesAdaptation = buildAdaptationConsignes(allResults);

      const urgentEcheance = (child.echeances ?? [])
        .filter((e) => e.days <= 7)
        .map((e) => `${e.type} de ${e.subj} dans ${e.days} jour${e.days > 1 ? 's' : ''}`)[0];

      const drill = await generateDrill({
        childName: child.name,
        classe: child.classe,
        date: todayFr(),
        jourSemaine: jourSemaine(),
        dureeMin: prof ? (prof.dureeQuotidienne === 'custom' ? 30 : prof.dureeQuotidienne as number) : 20,
        matieres: prof ? prof.matieresPrioritaires : (child.matieres?.map((m) => m.s) ?? ['Mathématiques', 'Français']),
        niveauEstime: prof ? LEVEL_MAP[prof.niveauEstime] : 'Moyen',
        objectif: prof ? OBJ_MAP[prof.objectif] : 'Bon niveau',
        pointsFaibles: prof ? prof.pointsFaibles : (child.faibles ?? []),
        recentErrors: recentErrors.slice(0, 5),
        controleAVenir: urgentEcheance,
        consignesAdaptation,
      }, systemPrompt);

      const exercises: DrillExercise[] = drill.exercises.map((ex: DrillExerciseAI, i) => ({
        id: `ex-${Date.now()}-${i}`,
        matiere: ex.matiere,
        competence: ex.competence,
        niveau: ex.niveau,
        consigne: ex.consigne,
        correction: ex.correction,
        phraseParent: ex.phraseParent,
        type: ex.type,
      }));

      const s: DrillSession = {
        id: `drill-${Date.now()}`,
        childId: child.id,
        date: todayStr(),
        dureeMin: drill.dureeEstimee,
        exercises,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setSession(s);
    } catch (e) {
      if (e instanceof AiError && e.code === 'NO_KEY') {
        setError('Clé API manquante. Ajoutez votre clé dans Réglages.');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur lors de la génération du drill.');
      }
    } finally {
      setLoading(false);
    }
  }, [child, getProfile, getDrillResults]);

  function toggleCorrection(i: number) {
    setShowCorrection((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function markResult(i: number, ok: boolean) {
    setResults((prev) => ({ ...prev, [i]: ok ? 'ok' : 'err' }));
    if (ok) setErrorTypes((prev) => { const next = { ...prev }; delete next[i]; return next; });
  }

  const [printing, setPrinting] = useState(false);
  async function printDrill() {
    if (!session || !child) return;
    setPrinting(true);
    try {
      const html = buildDrillHtml(session, child.name, child.classe, todayFr());
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Drill imprimable' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert('Impression impossible', "La génération du PDF a échoué. Réessayez.");
    } finally {
      setPrinting(false);
    }
  }

  function finish() {
    if (!session || !child) return;
    const total = session.exercises.length;
    const ok = Object.values(results).filter((v) => v === 'ok').length;
    const score = total > 0 ? Math.round((ok / total) * 100) : 0;
    const finalSession: DrillSession = { ...session, status: 'done', scoreGlobal: score };
    addDrillSession(finalSession);

    session.exercises.forEach((ex, i) => {
      const reussite = results[i] === 'ok';
      const r: DrillResult = {
        id: `result-${Date.now()}-${i}`,
        sessionId: session.id,
        exerciseId: ex.id,
        childId: child.id,
        date: todayStr(),
        matiere: ex.matiere,
        competence: ex.competence,
        reussite,
        typeErreur: reussite ? undefined : errorTypes[i],
      };
      addDrillResult(r);
    });

    addXP(child.id, Math.max(5, ok * 3), 'exercise');
    setDone(true);
  }

  if (!child) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Text style={s.noChild}>Aucun enfant sélectionné</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done && session) {
    const total = session.exercises.length;
    const ok = Object.values(results).filter((v) => v === 'ok').length;
    const score = total > 0 ? Math.round((ok / total) * 100) : 0;
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content}>
          <TopBar onBack={() => router.back()} />
          <View style={s.doneBox}>
            <Text style={s.doneEmoji}>{score >= 80 ? '🎉' : score >= 50 ? '💪' : '📚'}</Text>
            <Text style={s.doneTitle}>Séance terminée !</Text>
            <Text style={s.doneSub}>{ok}/{total} exercices réussis — {score}%</Text>
            <View style={s.scoreBar}>
              <View style={[s.scoreBarFill, { width: `${score}%` as any, backgroundColor: score >= 80 ? T.green.solid : score >= 50 ? T.amber.solid : T.coral.solid }]} />
            </View>
            <Text style={s.doneXP}>+{Math.max(5, ok * 3)} XP gagnés ✨</Text>
          </View>
          <Btn full onPress={() => router.back()} icon={<Ionicons name="checkmark" size={19} color="#fff" />}>Retour à l'espace</Btn>
          <GhostBtn full onPress={() => { setDone(false); generate(); }} style={{ marginTop: 12 }}>Nouveau drill</GhostBtn>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Drill du jour</Text>
            <Text style={s.dateLine}>{todayFr()}</Text>
          </View>
          <View style={[s.avatarCircle, { backgroundColor: T[child.accent].soft }]}>
            <Text style={[s.avatarText, { color: T[child.accent].fg }]}>{child.name.charAt(0)}</Text>
          </View>
        </View>

        {/* Profile summary or CTA to complete profile */}
        {!profile ? (
          <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.profileCTA}>
            <Ionicons name="person-add-outline" size={20} color={T.primaryDeep} />
            <View style={{ flex: 1 }}>
              <Text style={s.profileCTATitle}>Complétez le profil de {child.name}</Text>
              <Text style={s.profileCTASub}>Niveau, objectif, difficultés → drills ultra-personnalisés</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={T.primaryDeep} />
          </TouchableOpacity>
        ) : (
          <View style={s.profileSummary}>
            <Ionicons name="school-outline" size={16} color={T.sub} />
            <Text style={s.profileSummaryText}>
              {LEVEL_MAP[profile.niveauEstime]} · {OBJ_MAP[profile.objectif]} · {profile.dureeQuotidienne === 'custom' ? 'Durée libre' : `${profile.dureeQuotidienne} min`}
            </Text>
          </View>
        )}

        {/* Generate button or loading */}
        {!session && !loading && (
          <View style={s.generateSection}>
            <Btn full onPress={generate} icon={<Ionicons name="flash" size={20} color="#fff" />}>
              Générer le drill du jour
            </Btn>
            <Text style={s.generateHint}>L'IA adapte les exercices au profil de {child.name}</Text>
          </View>
        )}

        {/* Historique des séances */}
        {!session && !loading && pastSessions.length > 0 && (
          <>
            <Text style={s.histSectionLabel}>SÉANCES PRÉCÉDENTES</Text>
            {pastSessions.slice(0, 15).map((ds) => {
              const open = openHistory === ds.id;
              const scoreColor = (ds.scoreGlobal ?? 0) >= 80 ? T.green.fg : (ds.scoreGlobal ?? 0) >= 50 ? T.amber.fg : T.coral.fg;
              const d = new Date(ds.date + 'T12:00:00');
              const dateLabel = `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
              return (
                <TouchableOpacity
                  key={ds.id}
                  onPress={() => setOpenHistory(open ? null : ds.id)}
                  style={s.histCard}
                  activeOpacity={0.85}
                >
                  <View style={s.histHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.histDate}>{dateLabel}</Text>
                      <Text style={s.histMeta}>{ds.exercises.length} exercices · ~{ds.dureeMin} min</Text>
                    </View>
                    <Text style={[s.histScore, { color: scoreColor }]}>{ds.scoreGlobal ?? 0}%</Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color={T.sub} style={{ marginLeft: 8 }} />
                  </View>
                  {open && (
                    <View style={s.histDetail}>
                      {ds.exercises.map((ex, i) => (
                        <Text key={ex.id} style={s.histExo} numberOfLines={2}>
                          {i + 1}. [{ex.matiere}] {ex.competence}
                        </Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={T.primary} />
            <Text style={s.loadingText}>Génération des exercices en cours…</Text>
            <Text style={s.loadingHint}>L'IA personnalise le drill pour {child.name}</Text>
          </View>
        )}

        {error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={22} color={T.coral.fg} />
            <Text style={s.errorText}>{error}</Text>
            <Btn onPress={generate} icon={<Ionicons name="refresh" size={18} color="#fff" />} style={{ marginTop: 12 }}>Réessayer</Btn>
          </View>
        )}

        {/* Drill exercises */}
        {session && (
          <>
            <View style={s.drillMeta}>
              <Text style={s.drillTitle}>{session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}</Text>
              <Text style={s.drillDuree}>~{session.dureeMin} min</Text>
            </View>

            {session.exercises.map((ex, i) => {
              const accent = TYPE_ACCENT[ex.type] ?? 'blue';
              const icon = TYPE_ICON[ex.type] ?? 'help-circle-outline';
              const res = results[i];
              const corrShown = showCorrection[i];

              return (
                <Card key={ex.id} pad={16} style={s.exCard}>
                  {/* Exercise header */}
                  <View style={s.exHeader}>
                    <Squircle accentKey={accent as any} size={36} r={11} icon={<Ionicons name={icon as any} size={18} color={(T as any)[accent].fg} />} style={{ marginRight: 11 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.exMatiere}>{ex.matiere.toUpperCase()}</Text>
                      <Text style={s.exCompetence} numberOfLines={1}>{ex.competence}</Text>
                    </View>
                    <View style={s.exNumber}>
                      <Text style={s.exNumberText}>{i + 1}</Text>
                    </View>
                  </View>

                  {/* Consigne */}
                  <Text style={s.consigne}>{ex.consigne}</Text>

                  {/* Correction toggle */}
                  <TouchableOpacity onPress={() => toggleCorrection(i)} style={s.corrToggle} activeOpacity={0.8}>
                    <Ionicons name={corrShown ? 'eye-off-outline' : 'eye-outline'} size={16} color={T.sub} />
                    <Text style={s.corrToggleText}>{corrShown ? 'Masquer la correction' : 'Afficher la correction parent'}</Text>
                  </TouchableOpacity>

                  {corrShown && (
                    <View style={s.corrBox}>
                      <Text style={s.corrTitle}>CORRECTION</Text>
                      <Text style={s.corrText}>{ex.correction}</Text>
                      {ex.phraseParent && (
                        <View style={s.phraseParentBox}>
                          <Ionicons name="chatbubble-outline" size={14} color={T.primaryDeep} />
                          <Text style={s.phraseParentText}>{ex.phraseParent}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Result buttons */}
                  <View style={s.resultRow}>
                    <TouchableOpacity
                      onPress={() => markResult(i, true)}
                      style={[s.resultBtn, res === 'ok' && s.resultBtnOk]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle-outline" size={17} color={res === 'ok' ? T.green.fg : T.sub} />
                      <Text style={[s.resultBtnText, res === 'ok' && { color: T.green.fg }]}>Réussi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => markResult(i, false)}
                      style={[s.resultBtn, res === 'err' && s.resultBtnErr]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle-outline" size={17} color={res === 'err' ? T.coral.fg : T.sub} />
                      <Text style={[s.resultBtnText, res === 'err' && { color: T.coral.fg }]}>Erreur</Text>
                    </TouchableOpacity>
                  </View>

                  {res === 'err' && (
                    <View style={s.errTypeBox}>
                      <Text style={s.errTypeLabel}>Type d'erreur (aide l'IA à adapter les prochains drills)</Text>
                      <View style={s.errTypeRow}>
                        {ERROR_TYPES.map((et) => {
                          const on = errorTypes[i] === et.key;
                          return (
                            <TouchableOpacity
                              key={et.key}
                              onPress={() => setErrorTypes((prev) => ({ ...prev, [i]: et.key }))}
                              style={[s.errTypeChip, on && s.errTypeChipOn]}
                              activeOpacity={0.8}
                            >
                              <Text style={[s.errTypeChipText, on && s.errTypeChipTextOn]}>{et.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </Card>
              );
            })}

            <View style={{ height: 8 }} />
            <Btn
              full
              onPress={finish}
              icon={<Ionicons name="checkmark-done" size={20} color="#fff" />}
            >
              Terminer la séance
            </Btn>
            <GhostBtn
              full
              onPress={printDrill}
              style={{ marginTop: 12 }}
              icon={<Ionicons name="print-outline" size={19} color={T.ink} />}
            >
              {printing ? 'Génération du PDF…' : 'Version imprimable'}
            </GhostBtn>
            <GhostBtn full onPress={generate} style={{ marginTop: 12 }}>
              Régénérer les exercices
            </GhostBtn>
            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  noChild: { fontSize: 16, color: T.sub, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5 },
  dateLine: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
  avatarCircle: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800' },
  profileCTA: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: T.primarySoft, borderRadius: 18, padding: 14, marginBottom: 18,
  },
  profileCTATitle: { fontSize: 14.5, fontWeight: '800', color: T.primaryDeep },
  profileCTASub: { fontSize: 12.5, color: T.primaryDeep, fontWeight: '500', marginTop: 2, opacity: 0.8 },
  profileSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.surfaceAlt, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9, marginBottom: 16,
  },
  profileSummaryText: { fontSize: 13, color: T.sub, fontWeight: '600' },
  generateSection: { marginBottom: 20 },
  generateHint: { fontSize: 12.5, color: T.faint, fontWeight: '500', textAlign: 'center', marginTop: 8 },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 16, fontWeight: '700', color: T.ink },
  loadingHint: { fontSize: 13.5, color: T.sub, fontWeight: '500' },
  errorBox: { alignItems: 'center', backgroundColor: T.coral.soft, borderRadius: 20, padding: 20, gap: 8 },
  errorText: { fontSize: 14, color: T.coral.fg, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  drillMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  drillTitle: { fontSize: 16, fontWeight: '800', color: T.ink, letterSpacing: -0.3 },
  drillDuree: { fontSize: 13, color: T.sub, fontWeight: '700' },
  exCard: {
    marginBottom: 14,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  exHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exMatiere: { fontSize: 11, fontWeight: '800', color: T.sub, letterSpacing: 0.3 },
  exCompetence: { fontSize: 13, fontWeight: '700', color: T.ink, marginTop: 1 },
  exNumber: { width: 28, height: 28, borderRadius: 9, backgroundColor: T.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  exNumberText: { fontSize: 13, fontWeight: '800', color: T.sub },
  consigne: { fontSize: 15, color: T.ink, fontWeight: '500', lineHeight: 23, marginBottom: 14 },
  corrToggle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  corrToggleText: { fontSize: 13, color: T.sub, fontWeight: '700' },
  corrBox: { backgroundColor: T.surfaceAlt, borderRadius: 14, padding: 14, marginBottom: 12 },
  corrTitle: { fontSize: 11, fontWeight: '800', color: T.sub, letterSpacing: 0.3, marginBottom: 7 },
  corrText: { fontSize: 14, color: T.ink, fontWeight: '500', lineHeight: 22 },
  phraseParentBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10, backgroundColor: T.primarySoft, borderRadius: 10, padding: 10 },
  phraseParentText: { flex: 1, fontSize: 13, color: T.primaryDeep, fontWeight: '600', lineHeight: 19 },
  resultRow: { flexDirection: 'row', gap: 10 },
  resultBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: T.line, borderRadius: 13, paddingVertical: 10,
    backgroundColor: T.surfaceAlt,
  },
  resultBtnOk: { borderColor: T.green.fg, backgroundColor: T.green.soft },
  resultBtnErr: { borderColor: T.coral.fg, backgroundColor: T.coral.soft },
  resultBtnText: { fontSize: 14, fontWeight: '700', color: T.sub },
  errTypeBox: { marginTop: 12 },
  errTypeLabel: { fontSize: 12, color: T.faint, fontWeight: '600', marginBottom: 8 },
  errTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  errTypeChip: {
    borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent',
  },
  errTypeChipOn: { backgroundColor: T.coral.soft, borderColor: T.coral.fg },
  errTypeChipText: { fontSize: 12.5, fontWeight: '700', color: T.sub },
  errTypeChipTextOn: { color: T.coral.fg },
  histSectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 8, marginBottom: 11, letterSpacing: 0.2 },
  histCard: {
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 18, padding: 14, marginBottom: 10,
  },
  histHead: { flexDirection: 'row', alignItems: 'center' },
  histDate: { fontSize: 14.5, fontWeight: '800', color: T.ink, letterSpacing: -0.2 },
  histMeta: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  histScore: { fontSize: 17, fontWeight: '900' },
  histDetail: { marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: T.line, gap: 5 },
  histExo: { fontSize: 13, color: T.sub, fontWeight: '600', lineHeight: 18 },
  doneBox: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  doneEmoji: { fontSize: 52 },
  doneTitle: { fontSize: 26, fontWeight: '900', color: T.ink, letterSpacing: -0.6 },
  doneSub: { fontSize: 16, color: T.sub, fontWeight: '600' },
  scoreBar: { width: '80%', height: 10, backgroundColor: T.line, borderRadius: 999, overflow: 'hidden', marginVertical: 6 },
  scoreBarFill: { height: 10, borderRadius: 999 },
  doneXP: { fontSize: 15, fontWeight: '800', color: T.green.fg },
});
