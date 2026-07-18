import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import { SchoolPicker } from '../components/SchoolPicker';
import type { EtablissementScolaire } from '../services/education/annuaire';
import type { Child, CollegeChild, MaternelleChild, MatiereStat } from '../data/mock';
import type { ChildProfile, SchoolLevel, LearningObjective, DrillDuration, WorkRhythm, ParentTone } from '../types/childProfile';

const MATERNELLE_CLASSES = ['PS', 'MS', 'GS'];
const ALL_CLASSES = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const MATIERES_OPTIONS = ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géo', 'Sciences', 'Lecture'];
const ACCENTS: AccentKey[] = ['green', 'violet', 'blue', 'amber', 'coral'];
const MATIERE_ICONS: Record<string, string> = {
  'Mathématiques': 'calculator-outline', 'Français': 'book-outline',
  'Anglais': 'chatbubble-outline', 'Histoire-Géo': 'globe-outline',
  'Sciences': 'flask-outline', 'Lecture': 'library-outline',
};

const NIVEAUX: { key: SchoolLevel; label: string }[] = [
  { key: 'fragile', label: 'Fragile' }, { key: 'moyen', label: 'Moyen' },
  { key: 'bon', label: 'Bon' }, { key: 'avance', label: 'Avancé' },
  { key: 'tres_avance', label: 'Très avancé' },
];

const OBJECTIFS: { key: LearningObjective; label: string; sub: string }[] = [
  { key: 'consolidation', label: 'Consolidation', sub: 'Combler les lacunes, progresser en confiance' },
  { key: 'bon_niveau', label: 'Bon niveau', sub: 'Progresser régulièrement, méthode solide' },
  { key: 'excellence', label: 'Excellence', sub: 'Viser les meilleurs résultats, rigueur max' },
  { key: 'concours', label: 'Concours / Prépa', sub: 'Établissements exigeants, compétitions' },
];

const DUREES: { key: DrillDuration; label: string }[] = [
  { key: 10, label: '10 min' }, { key: 20, label: '20 min' },
  { key: 30, label: '30 min' }, { key: 40, label: '40 min' },
];

const RYTHMES: { key: WorkRhythm; label: string }[] = [
  { key: 'semaine', label: 'Lun–Ven seulement' },
  { key: 'semaine_weekend', label: 'Tous les jours' },
];

const TONS: { key: ParentTone; label: string; icon: string }[] = [
  { key: 'bienveillant', label: 'Bienveillant', icon: 'heart-outline' },
  { key: 'exigeant', label: 'Exigeant', icon: 'ribbon-outline' },
];

function classeTheorique(dateNaissance: string): string | null {
  if (dateNaissance.length < 8) return null;
  const parts = dateNaissance.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2000 || y > 2022) return null;
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) age--;
  const map: Record<number, string> = { 3: 'PS', 4: 'MS', 5: 'GS', 6: 'CP', 7: 'CE1', 8: 'CE2', 9: 'CM1', 10: 'CM2', 11: '6e', 12: '5e', 13: '4e', 14: '3e', 15: '3e' };
  return map[age] ?? null;
}

export default function AddChild() {
  const router = useRouter();
  const { addChild, addProfile, children } = useChild();

  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [classe, setClasse] = useState('');
  const [etablissement, setEtablissement] = useState<EtablissementScolaire | null>(null);
  const [matieres, setMatieres] = useState<string[]>(['Mathématiques', 'Français']);
  const [niveau, setNiveau] = useState<SchoolLevel>('moyen');
  const [objectif, setObjectif] = useState<LearningObjective>('bon_niveau');
  const [duree, setDuree] = useState<DrillDuration>(20);
  const [rythme, setRythme] = useState<WorkRhythm>('semaine_weekend');
  const [ton, setTon] = useState<ParentTone>('bienveillant');
  const [pointsFaibles, setPointsFaibles] = useState('');
  const [pointsForts, setPointsForts] = useState('');
  const [noteLibre, setNoteLibre] = useState('');

  const theorique = classeTheorique(dateNaissance);
  const mismatch = !!(theorique && classe && theorique !== classe);

  function toggleMatiere(m: string) {
    setMatieres((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function save() {
    if (!prenom.trim()) { Alert.alert('Prénom manquant', "Indiquez le prénom de l'enfant."); return; }
    if (!classe) { Alert.alert('Classe manquante', 'Choisissez une classe.'); return; }

    const accent = ACCENTS[children.length % ACCENTS.length];
    const matStats: MatiereStat[] = matieres.map((m, i) => ({
      s: m, v: 50, a: ACCENTS[i % ACCENTS.length], icon: MATIERE_ICONS[m] ?? 'book-outline',
    }));
    const isMaternelle = MATERNELLE_CLASSES.includes(classe);
    const ageMap: Record<string, number> = { PS: 3, MS: 4, GS: 5, CP: 6, CE1: 7, CE2: 8, CM1: 9, CM2: 10, '6e': 11, '5e': 12, '4e': 13, '3e': 14 };
    const ageEstime = ageMap[classe] ?? 10;

    const base = {
      name: prenom.trim(), classe, age: ageEstime, accent, progress: 0,
      matieres: matStats,
      forts: pointsForts.split(',').map((s) => s.trim()).filter(Boolean),
      faibles: pointsFaibles.split(',').map((s) => s.trim()).filter(Boolean),
      echeances: [], history: [],
    };

    let data: Omit<Child, 'id'>;
    if (isMaternelle) {
      data = { ...base, kind: 'maternelle' as const, activity: { label: 'Activité du jour', min: duree as number, obj: 'Première activité' } } as Omit<MaternelleChild, 'id'>;
    } else {
      data = {
        ...base, kind: 'college' as const,
        next: { subj: '—', type: 'À planifier', days: 0, accent },
        mission: { subj: matieres[0] ?? 'Français', min: duree as number, obj: 'Première mission', notion: 'Découverte' },
      } as Omit<CollegeChild, 'id'>;
    }

    const newChild = addChild(data);

    const dnFormatted = (() => {
      const parts = dateNaissance.split('/');
      if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      return undefined;
    })();

    const profile: ChildProfile = {
      childId: newChild.id,
      dateNaissance: dnFormatted,
      etablissement: etablissement?.nom || undefined,
      etablissementInfo: etablissement ?? undefined,
      pays: 'France',
      niveauEstime: niveau,
      objectif,
      matieresPrioritaires: matieres,
      dureeQuotidienne: duree,
      rythme,
      pointsFaibles: pointsFaibles.split(',').map((s) => s.trim()).filter(Boolean),
      pointsForts: pointsForts.split(',').map((s) => s.trim()).filter(Boolean),
      correctionDetaillee: true,
      versionImprimable: false,
      ton,
      noteLibre: noteLibre.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProfile(profile);
    router.back();
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TopBar onBack={() => router.back()} />
        <Text style={s.title}>Ajouter un enfant</Text>
        <Text style={s.sub}>Ces informations permettent à l'IA de personnaliser les exercices quotidiens.</Text>

        {/* ── Identité ── */}
        <Text style={s.sectionLabel}>IDENTITÉ</Text>
        <Card pad={16} style={s.card}>
          <Text style={s.fieldLabel}>Prénom *</Text>
          <View style={s.inputRow}>
            <Ionicons name="person-outline" size={18} color={T.faint} />
            <TextInput style={s.input} value={prenom} onChangeText={setPrenom} placeholder="Lucas" placeholderTextColor={T.faint} />
          </View>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Date de naissance</Text>
          <View style={s.inputRow}>
            <Ionicons name="calendar-outline" size={18} color={T.faint} />
            <TextInput style={s.input} value={dateNaissance} onChangeText={setDateNaissance} placeholder="JJ/MM/AAAA" keyboardType="numeric" placeholderTextColor={T.faint} />
          </View>
          {theorique && <Text style={s.hintGreen}>Classe théorique détectée : {theorique}</Text>}

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Établissement scolaire</Text>
          <SchoolPicker value={etablissement} onChange={setEtablissement} classe={classe} />
        </Card>

        {/* ── Classe ── */}
        <Text style={s.sectionLabel}>CLASSE ACTUELLE *</Text>
        <Card pad={16} style={s.card}>
          <View style={s.pillsRow}>
            {ALL_CLASSES.map((c) => (
              <TouchableOpacity key={c} onPress={() => setClasse(c)} style={[s.pill, classe === c && s.pillOn]}>
                <Text style={[s.pillText, classe === c && s.pillTextOn]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {mismatch && (
            <View style={s.warnBox}>
              <Ionicons name="warning-outline" size={16} color={T.amber.fg} />
              <Text style={s.warnText}>
                D'après la date de naissance, la classe théorique est {theorique}. Confirmez s'il s'agit d'une avance, d'un redoublement ou d'une erreur.
              </Text>
            </View>
          )}
        </Card>

        {/* ── Matières ── */}
        <Text style={s.sectionLabel}>MATIÈRES À TRAVAILLER</Text>
        <Card pad={16} style={s.card}>
          <View style={s.pillsRow}>
            {MATIERES_OPTIONS.map((m) => (
              <TouchableOpacity key={m} onPress={() => toggleMatiere(m)} style={[s.pill, matieres.includes(m) && s.pillOn]}>
                <Text style={[s.pillText, matieres.includes(m) && s.pillTextOn]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── Niveau et objectif ── */}
        <Text style={s.sectionLabel}>NIVEAU ET OBJECTIF</Text>
        <Card pad={16} style={s.card}>
          <Text style={s.fieldLabel}>Niveau estimé de l'enfant</Text>
          <View style={s.pillsRow}>
            {NIVEAUX.map((n) => (
              <TouchableOpacity key={n.key} onPress={() => setNiveau(n.key)} style={[s.pill, niveau === n.key && s.pillOn]}>
                <Text style={[s.pillText, niveau === n.key && s.pillTextOn]}>{n.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 16 }]}>Objectif principal</Text>
          <View style={{ gap: 9 }}>
            {OBJECTIFS.map((o) => (
              <TouchableOpacity key={o.key} onPress={() => setObjectif(o.key)} style={[s.objectifRow, objectif === o.key && s.objectifRowOn]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.objectifLabel, objectif === o.key && { color: T.primary }]}>{o.label}</Text>
                  <Text style={s.objectifSub}>{o.sub}</Text>
                </View>
                {objectif === o.key && <Ionicons name="checkmark-circle" size={20} color={T.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── Rythme ── */}
        <Text style={s.sectionLabel}>RYTHME ET DURÉE</Text>
        <Card pad={16} style={s.card}>
          <Text style={s.fieldLabel}>Durée quotidienne</Text>
          <View style={s.pillsRow}>
            {DUREES.map((d) => (
              <TouchableOpacity key={String(d.key)} onPress={() => setDuree(d.key)} style={[s.pill, duree === d.key && s.pillOn]}>
                <Text style={[s.pillText, duree === d.key && s.pillTextOn]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Jours de travail</Text>
          <View style={s.pillsRow}>
            {RYTHMES.map((r) => (
              <TouchableOpacity key={r.key} onPress={() => setRythme(r.key)} style={[s.pill, rythme === r.key && s.pillOn]}>
                <Text style={[s.pillText, rythme === r.key && s.pillTextOn]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Ton pédagogique</Text>
          <View style={s.pillsRow}>
            {TONS.map((t) => (
              <TouchableOpacity key={t.key} onPress={() => setTon(t.key)} style={[s.pill, ton === t.key && s.pillOn]}>
                <Ionicons name={t.icon as any} size={14} color={ton === t.key ? '#fff' : T.ink} />
                <Text style={[s.pillText, ton === t.key && s.pillTextOn]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── Points forts / faibles ── */}
        <Text style={s.sectionLabel}>POINTS FORTS ET FAIBLES</Text>
        <Card pad={16} style={s.card}>
          <Text style={s.fieldLabel}>Difficultés connues</Text>
          <Text style={s.hint}>Séparés par des virgules · seront injectés dans chaque drill</Text>
          <TextInput
            style={[s.inputRow, s.textArea]}
            value={pointsFaibles} onChangeText={setPointsFaibles}
            placeholder="fractions, tables de multiplication, accord sujet-verbe, retenues"
            placeholderTextColor={T.faint} multiline
          />

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Points forts</Text>
          <TextInput
            style={[s.inputRow, s.textArea]}
            value={pointsForts} onChangeText={setPointsForts}
            placeholder="calcul mental, lecture, géographie"
            placeholderTextColor={T.faint} multiline
          />
        </Card>

        {/* ── Note libre ── */}
        <Text style={s.sectionLabel}>NOTE LIBRE POUR L'IA</Text>
        <Card pad={16} style={s.card}>
          <Text style={s.hint}>Instructions spécifiques, contexte de l'école, méthode particulière, objectifs long terme...</Text>
          <TextInput
            style={[s.inputRow, s.textArea, { marginTop: 10, minHeight: 90 }]}
            value={noteLibre} onChangeText={setNoteLibre}
            placeholder="Ex : L'école est en avance d'un an sur le programme national. Prépare-le pour les concours de maths type Kangourou à partir du CM2."
            placeholderTextColor={T.faint} multiline
          />
        </Card>

        <View style={{ height: 24 }} />
        <Btn onPress={save} full icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Enregistrer le profil
        </Btn>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 14, color: T.sub, fontWeight: '500', marginTop: 6, lineHeight: 20, marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 22, marginBottom: 10, letterSpacing: 0.2 },
  card: { marginBottom: 0 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 8 },
  hint: { fontSize: 12, color: T.faint, fontWeight: '500', marginBottom: 6 },
  hintGreen: { fontSize: 12, color: T.green.fg, fontWeight: '700', marginTop: 5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: T.line, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: T.surfaceAlt,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: T.ink },
  textArea: { alignItems: 'flex-start', minHeight: 60, paddingTop: 12 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 12, paddingVertical: 9, paddingHorizontal: 14,
    backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent',
  },
  pillOn: { backgroundColor: T.primary, borderColor: T.primary },
  pillText: { fontWeight: '700', fontSize: 13.5, color: T.ink },
  pillTextOn: { color: '#fff' },
  objectifRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: T.line, borderRadius: 14,
    padding: 13, backgroundColor: T.surfaceAlt,
  },
  objectifRowOn: { borderColor: T.primary, backgroundColor: T.primarySoft },
  objectifLabel: { fontSize: 14.5, fontWeight: '800', color: T.ink },
  objectifSub: { fontSize: 12.5, color: T.sub, fontWeight: '500', marginTop: 2 },
  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: T.amber.soft, borderRadius: 12, padding: 11, marginTop: 10,
  },
  warnText: { flex: 1, fontSize: 13, fontWeight: '600', color: T.amber.fg, lineHeight: 18 },
});
