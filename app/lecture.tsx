import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { generateReadingQuestions, AiError } from '../services/ai';
import type { LectureEntry } from '../types/childProfile';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function LectureScreen() {
  const router = useRouter();
  const { child, addLecture, removeLecture, getLectures } = useChild();

  const [oeuvre, setOeuvre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [pagesLues, setPagesLues] = useState('');
  const [resumeEnfant, setResumeEnfant] = useState('');
  const [impression, setImpression] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const [shownAnswers, setShownAnswers] = useState<Set<string>>(new Set());

  const history = child ? getLectures(child.id) : [];
  const lastOeuvre = history[0];

  if (!child) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={s.safe}>
          <StatusBar style="light" />
          <View style={s.center}>
            <Text style={s.centerText}>Aucun enfant sélectionné.</Text>
            <TouchableOpacity onPress={() => router.back()} style={s.ghostBtn}>
              <Text style={s.ghostBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  function prefillFromLast() {
    if (!lastOeuvre) return;
    setOeuvre(lastOeuvre.oeuvre);
    setAuteur(lastOeuvre.auteur ?? '');
  }

  async function generate() {
    if (!child) return;
    if (!oeuvre.trim()) { Alert.alert('Œuvre manquante', "Indiquez le titre du livre."); return; }
    if (!pagesLues.trim()) { Alert.alert('Pages manquantes', "Indiquez ce que l'enfant vient de lire (chapitres ou pages)."); return; }
    setLoading(true);
    setError(null);
    try {
      const questions = await generateReadingQuestions(
        oeuvre.trim(), auteur.trim() || undefined, pagesLues.trim(),
        resumeEnfant.trim() || undefined, child
      );
      const entry: LectureEntry = {
        id: `lecture-${Date.now()}`,
        childId: child.id,
        oeuvre: oeuvre.trim(),
        auteur: auteur.trim() || undefined,
        pagesLues: pagesLues.trim(),
        resumeEnfant: resumeEnfant.trim() || undefined,
        impression: impression.trim() || undefined,
        questions,
        createdAt: new Date().toISOString(),
      };
      addLecture(entry);
      setOpenEntry(entry.id);
      setPagesLues('');
      setResumeEnfant('');
      setImpression('');
    } catch (e) {
      if (e instanceof AiError && e.code === 'NO_KEY') {
        setError('Clé API manquante. Ajoutez votre clé dans Réglages.');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur lors de la génération.');
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleAnswer(key: string) {
    setShownAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function confirmDelete(id: string) {
    Alert.alert('Supprimer cette séance de lecture ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeLecture(id) },
    ]);
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* En-tête (wireframe 4d) */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Carnet de lecture</Text>
              <Text style={s.sub}>Questions IA sur les pages lues par {child.name}</Text>
            </View>
            <Image source={DK_ICONS.book} style={{ width: 42, height: 42 }} />
          </View>

          {/* Livre en cours */}
          <LinearGradient
            colors={['rgba(85,50,130,0.4)', 'rgba(19,26,58,0.65)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.formCard}
          >
            <View style={s.rowBetween}>
              <Text style={s.formLabel}>LIVRE EN COURS</Text>
              {lastOeuvre && !oeuvre && (
                <TouchableOpacity onPress={prefillFromLast}>
                  <Text style={s.prefill}>Reprendre « {lastOeuvre.oeuvre} »</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={s.inputRow}>
              <Ionicons name="book-outline" size={17} color={DK.faint} />
              <TextInput style={s.input} value={oeuvre} onChangeText={setOeuvre} placeholder="Le Petit Prince" placeholderTextColor={DK.faint} />
            </View>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={17} color={DK.faint} />
              <TextInput style={s.input} value={auteur} onChangeText={setAuteur} placeholder="Auteur (optionnel)" placeholderTextColor={DK.faint} />
            </View>
            <View style={s.inputRow}>
              <Ionicons name="bookmark-outline" size={17} color={DK.faint} />
              <TextInput style={s.input} value={pagesLues} onChangeText={setPagesLues} placeholder="Pages lues : chap. 3-4 / p. 42 à 63" placeholderTextColor={DK.faint} />
            </View>
            <TextInput
              style={[s.inputRow, s.textArea]} value={resumeEnfant} onChangeText={setResumeEnfant}
              placeholder="Résumé écrit par l'enfant (optionnel)" placeholderTextColor={DK.faint} multiline
            />
            <TextInput
              style={[s.inputRow, s.textArea, { minHeight: 52 }]} value={impression} onChangeText={setImpression}
              placeholder="Son impression personnelle (optionnel)" placeholderTextColor={DK.faint} multiline
            />
            {loading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator size="small" color="#C9A0FF" />
                <Text style={s.loadingText}>Génération des questions…</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={generate} activeOpacity={0.88}>
                <LinearGradient colors={['#8B7CF6', '#C9A0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.genBtn}>
                  <Text style={s.genBtnText}>Générer les questions</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>

          {error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={19} color={DK.red} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Historique + questions */}
          {history.length > 0 && (
            <>
              <Text style={s.sectionLabel}>HISTORIQUE DES LECTURES</Text>
              {history.map((entry) => {
                const open = openEntry === entry.id;
                return (
                  <View key={entry.id} style={s.entryCard}>
                    <TouchableOpacity onPress={() => setOpenEntry(open ? null : entry.id)} style={s.entryHead} activeOpacity={0.8}>
                      <Image source={DK_ICONS.book} style={{ width: 34, height: 34 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.entryTitle}>{entry.oeuvre} • {entry.pagesLues}</Text>
                        <Text style={s.entryMeta}>{formatDate(entry.createdAt)}</Text>
                      </View>
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={DK.sub} />
                    </TouchableOpacity>

                    {open && entry.questions && (
                      <View style={{ marginTop: 13, gap: 11 }}>
                        {entry.resumeEnfant && (
                          <View style={s.resumeBox}>
                            <Text style={s.blockLabel}>RÉSUMÉ DE L'ENFANT</Text>
                            <Text style={s.blockText}>{entry.resumeEnfant}</Text>
                          </View>
                        )}

                        <Text style={s.blockLabel}>QUESTIONS DE COMPRÉHENSION</Text>
                        {entry.questions.questions.map((qq, qi) => {
                          const key = `${entry.id}-${qi}`;
                          const shown = shownAnswers.has(key);
                          return (
                            <View key={qi} style={s.questionBox}>
                              <Text style={s.questionText}>{qi + 1}. {qq.question}</Text>
                              <TouchableOpacity onPress={() => toggleAnswer(key)} style={s.answerToggle} activeOpacity={0.8}>
                                <Text style={s.answerToggleText}>Réponse attendue (parent)</Text>
                                <Ionicons name={shown ? 'chevron-up' : 'chevron-down'} size={14} color={DK.cyan} />
                              </TouchableOpacity>
                              {shown && <Text style={s.answerText}>{qq.reponseModele}</Text>}
                            </View>
                          );
                        })}

                        <Text style={s.blockLabel}>VOCABULAIRE À NOTER DANS LE CARNET</Text>
                        <View style={{ gap: 6 }}>
                          {entry.questions.vocabulaire.map((v, vi) => (
                            <View key={vi} style={s.vocabRow}>
                              <Text style={s.vocabMot}>{v.mot}</Text>
                              <Text style={s.vocabDef}>{v.definition}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={s.oraleBox}>
                          <Text style={s.oraleLabel}>QUESTION ORALE DE LA SEMAINE</Text>
                          <Text style={s.oraleText}>{entry.questions.questionOrale}</Text>
                          <Text style={s.oraleHint}>À traiter à l'oral en 3 points structurés.</Text>
                        </View>

                        <TouchableOpacity onPress={() => confirmDelete(entry.id)} style={s.deleteRow}>
                          <Ionicons name="trash-outline" size={15} color={DK.red} />
                          <Text style={s.deleteText}>Supprimer cette séance</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {history.length === 0 && !loading && (
            <View style={s.emptyBox}>
              <Image source={DK_ICONS.book} style={{ width: 52, height: 52, opacity: 0.7 }} />
              <Text style={s.emptyText}>Aucune séance de lecture pour l'instant.</Text>
              <Text style={s.emptySub}>Renseignez l'œuvre et les pages lues, puis générez les questions.</Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: DK.sub, fontWeight: '600', textAlign: 'center' },
  ghostBtn: {
    borderWidth: 1.5, borderColor: DK.cardBorder, borderRadius: 999,
    paddingHorizontal: 22, paddingVertical: 11,
  },
  ghostBtnText: { color: DK.ink, fontWeight: '700', fontSize: 14.5 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    width: 38, height: 38, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  sub: { fontSize: 12, color: DK.sub, fontWeight: '500', marginTop: 2 },

  formCard: { borderWidth: 1, borderColor: 'rgba(190,140,255,0.3)', borderRadius: 22, padding: 16, gap: 9 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: 'rgba(200,210,255,0.5)' },
  prefill: { fontSize: 12, fontWeight: '700', color: '#C9A0FF' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.2)', borderRadius: 14,
    paddingHorizontal: 13, paddingVertical: 12, backgroundColor: 'rgba(10,14,34,0.6)',
  },
  input: { flex: 1, fontSize: 14.5, fontWeight: '600', color: DK.ink },
  textArea: { alignItems: 'flex-start', minHeight: 68, paddingTop: 12, fontSize: 14.5, fontWeight: '600', color: DK.ink },
  genBtn: {
    borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 3,
    shadowColor: '#8B7CF6', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
  },
  genBtnText: { color: '#1B1040', fontSize: 14.5, fontWeight: '800' },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  loadingText: { fontSize: 13.5, fontWeight: '700', color: DK.ink },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: 'rgba(255,107,90,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.4)',
    borderRadius: 14, padding: 13, marginTop: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: '#FFB3A8', fontWeight: '600', lineHeight: 19 },

  sectionLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(200,210,255,0.55)', letterSpacing: 2, marginTop: 22, marginBottom: 10 },
  entryCard: {
    backgroundColor: 'rgba(19,26,58,0.5)', borderWidth: 1, borderColor: 'rgba(148,168,255,0.16)',
    borderRadius: 18, padding: 14, marginBottom: 10,
  },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  entryTitle: { fontSize: 13.5, fontWeight: '700', color: DK.ink, letterSpacing: -0.2 },
  entryMeta: { fontSize: 11.5, color: DK.sub, fontWeight: '600', marginTop: 2 },
  resumeBox: { backgroundColor: 'rgba(10,14,34,0.55)', borderRadius: 13, padding: 12 },
  blockLabel: { fontSize: 10.5, fontWeight: '800', color: 'rgba(200,210,255,0.5)', letterSpacing: 0.7 },
  blockText: { fontSize: 13, color: DK.ink, fontWeight: '500', lineHeight: 19, marginTop: 5 },
  questionBox: {
    backgroundColor: 'rgba(19,26,58,0.55)', borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 16, padding: 13,
  },
  questionText: { fontSize: 13.5, fontWeight: '700', color: DK.ink, lineHeight: 20 },
  answerToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 10, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11,
    backgroundColor: 'rgba(53,228,210,0.06)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(53,228,210,0.4)',
  },
  answerToggleText: { fontSize: 12, color: DK.cyan, fontWeight: '700' },
  answerText: { fontSize: 12.5, color: 'rgba(230,236,255,0.85)', fontWeight: '500', lineHeight: 19, marginTop: 8, paddingHorizontal: 3 },
  vocabRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  vocabMot: { fontSize: 13, fontWeight: '800', color: '#C9A0FF', minWidth: 90 },
  vocabDef: { flex: 1, fontSize: 13, color: 'rgba(230,236,255,0.85)', fontWeight: '500', lineHeight: 19 },
  oraleBox: {
    backgroundColor: 'rgba(139,124,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,124,246,0.4)',
    borderRadius: 15, padding: 13,
  },
  oraleLabel: { fontSize: 10.5, fontWeight: '800', color: '#C9A8FF', letterSpacing: 0.7 },
  oraleText: { fontSize: 13.5, fontWeight: '700', color: DK.ink, lineHeight: 20, marginTop: 6 },
  oraleHint: { fontSize: 11.5, fontWeight: '600', color: 'rgba(201,168,255,0.8)', marginTop: 5 },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 3 },
  deleteText: { fontSize: 12.5, fontWeight: '700', color: '#FF9C8A' },
  emptyBox: { alignItems: 'center', paddingVertical: 28, gap: 9 },
  emptyText: { fontSize: 14.5, fontWeight: '700', color: DK.sub },
  emptySub: { fontSize: 12.5, color: DK.faint, fontWeight: '500', textAlign: 'center', lineHeight: 18 },
});
