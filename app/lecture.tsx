import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { TopBar } from '../components/ui/TopBar';
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
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Text style={s.centerText}>Aucun enfant sélectionné.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TopBar onBack={() => router.back()} />
        <Text style={s.title}>Carnet de lecture</Text>
        <Text style={s.sub}>Suivi de lecture de {child.name} — les questions portent uniquement sur les pages lues.</Text>

        {/* Nouvelle séance */}
        <Text style={s.sectionLabel}>NOUVELLE SÉANCE</Text>
        <Card pad={16} style={{ gap: 14 }}>
          <View>
            <View style={s.rowBetween}>
              <Text style={s.fieldLabel}>Œuvre en cours</Text>
              {lastOeuvre && !oeuvre && (
                <TouchableOpacity onPress={prefillFromLast}>
                  <Text style={s.prefill}>Reprendre « {lastOeuvre.oeuvre} »</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={s.inputRow}>
              <Ionicons name="book-outline" size={18} color={T.faint} />
              <TextInput style={s.input} value={oeuvre} onChangeText={setOeuvre} placeholder="Le Tour du monde en 80 jours" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Auteur (optionnel)</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color={T.faint} />
              <TextInput style={s.input} value={auteur} onChangeText={setAuteur} placeholder="Jules Verne" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Ce qui vient d'être lu</Text>
            <View style={s.inputRow}>
              <Ionicons name="bookmark-outline" size={18} color={T.faint} />
              <TextInput style={s.input} value={pagesLues} onChangeText={setPagesLues} placeholder="Chapitres 3 et 4 / pages 25 à 40" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Résumé écrit par l'enfant (optionnel)</Text>
            <TextInput
              style={[s.inputRow, s.textArea]} value={resumeEnfant} onChangeText={setResumeEnfant}
              placeholder="5 lignes recopiées depuis son carnet papier…" placeholderTextColor={T.faint} multiline
            />
          </View>

          <View>
            <Text style={s.fieldLabel}>Son impression personnelle (optionnel)</Text>
            <TextInput
              style={[s.inputRow, s.textArea, { minHeight: 50 }]} value={impression} onChangeText={setImpression}
              placeholder="Ce qu'il a aimé, pas aimé, ressenti…" placeholderTextColor={T.faint} multiline
            />
          </View>
        </Card>

        <View style={{ height: 14 }} />
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={T.primary} />
            <Text style={s.loadingText}>Génération des questions…</Text>
          </View>
        ) : (
          <Btn full onPress={generate} icon={<Ionicons name="sparkles-outline" size={19} color="#fff" />}>
            Générer les questions de lecture
          </Btn>
        )}
        {error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color={T.coral.fg} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Historique */}
        {history.length > 0 && (
          <>
            <Text style={s.sectionLabel}>SÉANCES PRÉCÉDENTES</Text>
            {history.map((entry) => {
              const open = openEntry === entry.id;
              return (
                <Card key={entry.id} pad={15} style={{ marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => setOpenEntry(open ? null : entry.id)} style={s.entryHead} activeOpacity={0.8}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.entryTitle}>{entry.oeuvre}</Text>
                      <Text style={s.entryMeta}>{entry.pagesLues} · {formatDate(entry.createdAt)}</Text>
                    </View>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={19} color={T.sub} />
                  </TouchableOpacity>

                  {open && entry.questions && (
                    <View style={{ marginTop: 12, gap: 12 }}>
                      {entry.resumeEnfant && (
                        <View style={s.resumeBox}>
                          <Text style={s.blockLabel}>RÉSUMÉ DE L'ENFANT</Text>
                          <Text style={s.blockText}>{entry.resumeEnfant}</Text>
                        </View>
                      )}

                      <Text style={s.blockLabel}>QUESTIONS DE COMPRÉHENSION</Text>
                      {entry.questions.questions.map((q, qi) => {
                        const key = `${entry.id}-${qi}`;
                        const shown = shownAnswers.has(key);
                        return (
                          <View key={qi} style={s.questionBox}>
                            <Text style={s.questionText}>{qi + 1}. {q.question}</Text>
                            <TouchableOpacity onPress={() => toggleAnswer(key)} style={s.answerToggle}>
                              <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={14} color={T.sub} />
                              <Text style={s.answerToggleText}>{shown ? 'Masquer la réponse modèle' : 'Réponse modèle (parent)'}</Text>
                            </TouchableOpacity>
                            {shown && <Text style={s.answerText}>{q.reponseModele}</Text>}
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
                        <Ionicons name="trash-outline" size={15} color={T.coral.fg} />
                        <Text style={s.deleteText}>Supprimer cette séance</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              );
            })}
          </>
        )}

        {history.length === 0 && !loading && (
          <View style={s.emptyBox}>
            <Ionicons name="library-outline" size={36} color={T.faint} />
            <Text style={s.emptyText}>Aucune séance de lecture pour l'instant.</Text>
            <Text style={s.emptySub}>Renseignez l'œuvre et les pages lues, puis générez les questions.</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: T.sub, fontWeight: '600', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 14, color: T.sub, fontWeight: '500', marginTop: 6, lineHeight: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 22, marginBottom: 10, letterSpacing: 0.2 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 8 },
  prefill: { fontSize: 12.5, fontWeight: '700', color: T.primary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: T.line, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: T.surfaceAlt,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: T.ink },
  textArea: { alignItems: 'flex-start', minHeight: 70, paddingTop: 12 },
  loadingBox: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  loadingText: { fontSize: 14.5, fontWeight: '700', color: T.ink },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: T.coral.soft, borderRadius: 14, padding: 13, marginTop: 12,
  },
  errorText: { flex: 1, fontSize: 13.5, color: T.coral.fg, fontWeight: '600', lineHeight: 19 },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  entryTitle: { fontSize: 15.5, fontWeight: '800', color: T.ink, letterSpacing: -0.3 },
  entryMeta: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  resumeBox: { backgroundColor: T.surfaceAlt, borderRadius: 12, padding: 12 },
  blockLabel: { fontSize: 11, fontWeight: '800', color: T.sub, letterSpacing: 0.3 },
  blockText: { fontSize: 13.5, color: T.ink, fontWeight: '500', lineHeight: 20, marginTop: 5 },
  questionBox: { backgroundColor: T.surfaceAlt, borderRadius: 12, padding: 12 },
  questionText: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  answerToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  answerToggleText: { fontSize: 12.5, color: T.sub, fontWeight: '700' },
  answerText: { fontSize: 13.5, color: T.ink, fontWeight: '500', lineHeight: 20, marginTop: 8, backgroundColor: T.primarySoft, borderRadius: 10, padding: 10 },
  vocabRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  vocabMot: { fontSize: 13.5, fontWeight: '800', color: T.primaryDeep, minWidth: 90 },
  vocabDef: { flex: 1, fontSize: 13.5, color: T.ink, fontWeight: '500', lineHeight: 19 },
  oraleBox: { backgroundColor: T.violet.soft, borderRadius: 14, padding: 13 },
  oraleLabel: { fontSize: 11, fontWeight: '800', color: T.violet.fg, letterSpacing: 0.3 },
  oraleText: { fontSize: 14, fontWeight: '700', color: T.violet.fg, lineHeight: 20, marginTop: 6 },
  oraleHint: { fontSize: 12, fontWeight: '600', color: T.violet.fg, opacity: 0.8, marginTop: 5 },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 4 },
  deleteText: { fontSize: 12.5, fontWeight: '700', color: T.coral.fg },
  emptyBox: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: T.sub },
  emptySub: { fontSize: 13, color: T.faint, fontWeight: '500', textAlign: 'center', lineHeight: 18 },
});
