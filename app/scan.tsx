import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { pickImage, pickManyFromLibrary } from '../lib/camera';
import { extractDocxText } from '../lib/docText';
import { analyzeLessonSources, AiError, type LessonSources } from '../services/ai';

const MAX_PAGES = 20;
const TIPS = ['Utilisez une bonne lumière', 'Cadrez toute la page', `Jusqu'à ${MAX_PAGES} pages par leçon`];

export default function ScanScreen() {
  const router = useRouter();
  const { child, addLesson, addXP } = useChild();
  const [scanning, setScanning] = useState(false);
  // pages photographiées ou importées (base64), dans l'ordre
  const [pages, setPages] = useState<string[]>([]);

  function guardChild(): boolean {
    if (!child) {
      Alert.alert('Aucun enfant sélectionné', "Sélectionnez d'abord un enfant depuis l'accueil.");
      return false;
    }
    return true;
  }

  function addPages(newOnes: string[]) {
    setPages((prev) => {
      const merged = [...prev, ...newOnes].slice(0, MAX_PAGES);
      if (prev.length + newOnes.length > MAX_PAGES) {
        Alert.alert('Limite atteinte', `${MAX_PAGES} pages maximum par leçon.`);
      }
      return merged;
    });
  }

  async function takePhoto() {
    if (!guardChild() || scanning) return;
    if (pages.length >= MAX_PAGES) {
      Alert.alert('Limite atteinte', `${MAX_PAGES} pages maximum par leçon.`);
      return;
    }
    const base64 = await pickImage();
    if (base64) addPages([base64]);
  }

  async function importFromGallery() {
    if (!guardChild() || scanning) return;
    const remaining = MAX_PAGES - pages.length;
    if (remaining <= 0) {
      Alert.alert('Limite atteinte', `${MAX_PAGES} pages maximum par leçon.`);
      return;
    }
    const picked = await pickManyFromLibrary(remaining);
    if (picked.length > 0) addPages(picked);
  }

  async function importFile() {
    if (!guardChild() || scanning) return;
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'text/plain',
        'image/*',
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    const name = (asset.name ?? '').toLowerCase();
    const mime = asset.mimeType ?? '';
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      if (mime === 'application/pdf' || name.endsWith('.pdf')) {
        await analyze({ pdfBase64: base64 });
      } else if (mime.startsWith('image/') || /\.(jpe?g|png|heic|webp)$/.test(name)) {
        addPages([base64]);
      } else if (mime === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md')) {
        const text = await FileSystem.readAsStringAsync(asset.uri);
        await analyze({ text });
      } else if (name.endsWith('.docx') || mime.includes('wordprocessingml')) {
        const text = extractDocxText(base64);
        if (!text) {
          Alert.alert('Document illisible', "Le texte de ce fichier Word n'a pas pu être extrait. Exportez-le en PDF puis réessayez.");
          return;
        }
        await analyze({ text });
      } else {
        Alert.alert('Format non pris en charge', 'Formats acceptés : PDF, Word (.docx), texte (.txt) et images. Pour un autre format, exportez le document en PDF.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Fichier illisible.';
      Alert.alert('Import impossible', msg);
    }
  }

  async function analyze(sources?: LessonSources) {
    if (!child) return;
    const src: LessonSources = sources ?? { images: pages };
    if (!src.pdfBase64 && !src.text && (src.images ?? []).length === 0) return;
    setScanning(true);
    try {
      const result = await analyzeLessonSources(src, child);
      const firstImage = (src.images ?? [])[0];
      // auto-save: the lesson is persisted immediately so it never disappears
      const lesson = addLesson({
        childId: child.id,
        matiere: result.matiere,
        titre: result.titre,
        niveau: result.niveau,
        notions: result.notions ?? [],
        resume: result.resume,
        imageBase64: firstImage && firstImage.length < 1500000 ? firstImage : undefined,
      });
      addXP(child.id, 10, 'lesson_scan');
      setScanning(false);
      setPages([]);
      router.push(`/result?lessonId=${lesson.id}` as any);
    } catch (e) {
      setScanning(false);
      if (e instanceof AiError && e.code === 'NO_KEY') {
        Alert.alert('Clé API manquante', 'Ajoutez votre clé API dans Réglages.');
      } else {
        const msg = e instanceof Error ? e.message : 'Erreur inattendue.';
        Alert.alert('Analyse impossible', msg, [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réessayer', onPress: () => analyze(sources) },
        ]);
      }
    }
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* nav */}
          <View style={s.navRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Scanner une leçon</Text>
              <Text style={s.sub}>Photos, galerie ou fichier (PDF, Word…)</Text>
            </View>
            <View style={s.iaPill}>
              <Ionicons name="sparkles" size={13} color={DK.cyan} />
              <Text style={s.iaPillText}>IA</Text>
            </View>
          </View>

          {/* viseur */}
          <LinearGradient colors={['#060915', '#0B1128']} style={s.viewfinder}>
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />
            <View style={s.scanLine} />
            <View style={s.viewfinderCenter}>
              <Image source={DK_ICONS.scan} style={s.scanIcon} />
              <Text style={s.viewfinderText}>
                {scanning
                  ? 'Analyse en cours…'
                  : pages.length > 0
                    ? `${pages.length} page${pages.length > 1 ? 's' : ''} prête${pages.length > 1 ? 's' : ''} — ajoutez-en\nou lancez l'analyse`
                    : "Placez la leçon dans le cadre,\nl'IA détecte le texte"}
              </Text>
              {scanning && <ActivityIndicator color={DK.cyan} style={{ marginTop: 10 }} />}
            </View>
          </LinearGradient>

          {/* pages capturées */}
          {pages.length > 0 && (
            <View style={s.pagesCard}>
              <View style={s.pagesHead}>
                <Text style={s.pagesTitle}>Pages de la leçon</Text>
                <Text style={s.pagesCount}>{pages.length}/{MAX_PAGES}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9 }}>
                {pages.map((p, i) => (
                  <View key={i} style={s.thumbWrap}>
                    <Image source={{ uri: `data:image/jpeg;base64,${p}` }} style={s.thumb} />
                    <Text style={s.thumbNum}>{i + 1}</Text>
                    <TouchableOpacity
                      onPress={() => setPages((prev) => prev.filter((_, j) => j !== i))}
                      style={s.thumbDel} activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={13} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* conseils */}
          {pages.length === 0 && (
            <View style={s.tipsCard}>
              {TIPS.map((tip, i) => (
                <View key={tip} style={[s.tip, i < TIPS.length - 1 && s.tipBorder]}>
                  <View style={s.tipCheck}>
                    <Ionicons name="checkmark" size={15} color={DK.cyan} />
                  </View>
                  <Text style={s.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ minHeight: 18 }} />

          {/* analyser (dès qu'il y a des pages) */}
          {pages.length > 0 && (
            <TouchableOpacity onPress={() => analyze()} disabled={scanning} activeOpacity={0.88}>
              <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                {scanning
                  ? <ActivityIndicator color="#052A26" />
                  : <Ionicons name="sparkles" size={19} color="#052A26" />}
                <Text style={s.primaryBtnText}>
                  {scanning ? 'Analyse…' : `Analyser la leçon (${pages.length} page${pages.length > 1 ? 's' : ''})`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* prendre une photo */}
          <TouchableOpacity onPress={takePhoto} disabled={scanning} activeOpacity={0.88} style={pages.length > 0 ? { marginTop: 10 } : undefined}>
            {pages.length === 0 ? (
              <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
                <Ionicons name="camera-outline" size={20} color="#052A26" />
                <Text style={s.primaryBtnText}>Prendre une photo</Text>
              </LinearGradient>
            ) : (
              <View style={s.ghostBtn}>
                <Ionicons name="camera-outline" size={18} color="#DDE4FF" />
                <Text style={s.ghostBtnText}>Ajouter une photo ({pages.length}/{MAX_PAGES})</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* import galerie (multi) */}
          <TouchableOpacity onPress={importFromGallery} style={s.ghostBtn} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={18} color="#DDE4FF" />
            <Text style={s.ghostBtnText}>Importer depuis la galerie ({MAX_PAGES} max)</Text>
          </TouchableOpacity>

          {/* import fichier */}
          <TouchableOpacity onPress={importFile} style={s.ghostBtn} activeOpacity={0.85}>
            <Ionicons name="document-attach-outline" size={18} color="#DDE4FF" />
            <Text style={s.ghostBtnText}>Charger un fichier (PDF, Word, texte…)</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CORNER = {
  position: 'absolute' as const,
  width: 34,
  height: 34,
  borderColor: DK.cyan,
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 18 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  sub: { fontSize: 12.5, color: DK.sub, marginTop: 2, fontWeight: '600' },
  iaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.09)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  iaPillText: { color: DK.cyan, fontSize: 12.5, fontWeight: '800' },

  viewfinder: {
    height: 330, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(148,168,255,0.2)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  corner: { ...CORNER, borderRadius: 2 },
  cornerTL: { left: 22, top: 22, borderLeftWidth: 3.5, borderTopWidth: 3.5, borderTopLeftRadius: 8 },
  cornerTR: { right: 22, top: 22, borderRightWidth: 3.5, borderTopWidth: 3.5, borderTopRightRadius: 8 },
  cornerBL: { left: 22, bottom: 22, borderLeftWidth: 3.5, borderBottomWidth: 3.5, borderBottomLeftRadius: 8 },
  cornerBR: { right: 22, bottom: 22, borderRightWidth: 3.5, borderBottomWidth: 3.5, borderBottomRightRadius: 8 },
  scanLine: {
    position: 'absolute', left: 24, right: 24, top: '52%', height: 2, backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16,
  },
  viewfinderCenter: { alignItems: 'center' },
  scanIcon: {
    width: 64, height: 64, borderRadius: 14, opacity: 0.9,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 14,
  },
  viewfinderText: {
    color: 'rgba(200,212,255,0.55)', fontWeight: '600', fontSize: 12.5,
    marginTop: 10, maxWidth: 220, textAlign: 'center', lineHeight: 18,
  },

  pagesCard: {
    marginTop: 14, backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 13,
  },
  pagesHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  pagesTitle: { color: DK.ink, fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2 },
  pagesCount: { color: DK.cyan, fontSize: 13, fontWeight: '800' },
  thumbWrap: { width: 74, height: 96 },
  thumb: {
    width: 74, height: 96, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.3)',
  },
  thumbNum: {
    position: 'absolute', left: 5, bottom: 5, color: '#fff', fontSize: 11, fontWeight: '800',
    backgroundColor: 'rgba(10,14,34,0.75)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden',
  },
  thumbDel: {
    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 999,
    backgroundColor: DK.red, borderWidth: 1.5, borderColor: '#0B1023',
    alignItems: 'center', justifyContent: 'center',
  },

  tipsCard: {
    marginTop: 16, backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 6,
  },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(148,168,255,0.12)' },
  tipCheck: {
    width: 26, height: 26, borderRadius: 999, backgroundColor: 'rgba(53,228,210,0.12)',
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tipText: { fontSize: 14.5, fontWeight: '600', color: DK.ink, letterSpacing: -0.2 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 8,
  },
  primaryBtnText: { color: '#052A26', fontSize: 15.5, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderRadius: 999,
    paddingVertical: 14, marginTop: 10,
  },
  ghostBtnText: { color: '#DDE4FF', fontSize: 14, fontWeight: '700' },
});
