import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import { SchoolPicker } from '../components/SchoolPicker';
import type { EtablissementScolaire } from '../services/education/annuaire';
import type { MatiereStat } from '../data/mock';
import type { ChildProfile, SchoolLevel, LearningObjective, DrillDuration, WorkRhythm, ParentTone } from '../types/childProfile';

const CLASSES = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const MATIERES = ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géo', 'Anglais', 'Langage', 'Graphisme', 'Nombres'];
const ACCENTS: AccentKey[] = ['green', 'violet', 'blue', 'amber', 'coral'];

const NIVEAUX: { key: SchoolLevel; label: string }[] = [
  { key: 'fragile', label: 'Fragile' }, { key: 'moyen', label: 'Moyen' },
  { key: 'bon', label: 'Bon' }, { key: 'avance', label: 'Avancé' },
  { key: 'tres_avance', label: 'Très avancé' },
];
const OBJECTIFS: { key: LearningObjective; label: string }[] = [
  { key: 'consolidation', label: 'Consolidation' }, { key: 'bon_niveau', label: 'Bon niveau' },
  { key: 'excellence', label: 'Excellence' }, { key: 'concours', label: 'Concours / Prépa' },
];
const DUREES: { key: DrillDuration; label: string }[] = [
  { key: 10, label: '10 min' }, { key: 20, label: '20 min' },
  { key: 30, label: '30 min' }, { key: 40, label: '40 min' },
];
const RYTHMES: { key: WorkRhythm; label: string }[] = [
  { key: 'semaine', label: 'Lun–Ven' }, { key: 'semaine_weekend', label: 'Tous les jours' },
];
const TONS: { key: ParentTone; label: string; icon: string }[] = [
  { key: 'bienveillant', label: 'Bienveillant', icon: 'heart-outline' },
  { key: 'exigeant', label: 'Exigeant', icon: 'ribbon-outline' },
];
const MATIERE_ICONS: Record<string, string> = {
  'Mathématiques': 'calculator-outline',
  'Français': 'book-outline',
  'Sciences': 'flask-outline',
  'Histoire-Géo': 'globe-outline',
  'Anglais': 'chatbubble-outline',
  'Langage': 'chatbubble-outline',
  'Graphisme': 'pencil-outline',
  'Nombres': 'calculator-outline',
};

export default function EditChild() {
  const router = useRouter();
  const { child, setChild, updateChild, archiveChild, getProfile, addProfile, updateProfile } = useChild();
  const existingProfile = child ? getProfile(child.id) : undefined;

  const [prenom, setPrenom] = useState(child?.name ?? '');
  const [classe, setClasse] = useState(child?.classe.replace('Maternelle ', '') ?? '');
  const [age, setAge] = useState(child ? String(child.age) : '');
  const [matieres, setMatieres] = useState<string[]>(child ? child.matieres.map((m) => m.s) : []);

  // Profil personnalisé
  const [etablissement, setEtablissement] = useState<EtablissementScolaire | null>(
    existingProfile?.etablissementInfo
      ?? (existingProfile?.etablissement
        ? { uai: '', nom: existingProfile.etablissement, type: 'Établissement', statut: '', fetchedAt: '', source: 'Saisie manuelle', manuel: true }
        : null),
  );
  const [niveau, setNiveau] = useState<SchoolLevel>(existingProfile?.niveauEstime ?? 'moyen');
  const [objectif, setObjectif] = useState<LearningObjective>(existingProfile?.objectif ?? 'bon_niveau');
  const [duree, setDuree] = useState<DrillDuration>(existingProfile?.dureeQuotidienne ?? 20);
  const [rythme, setRythme] = useState<WorkRhythm>(existingProfile?.rythme ?? 'semaine_weekend');
  const [ton, setTon] = useState<ParentTone>(existingProfile?.ton ?? 'bienveillant');
  const [pointsFaibles, setPointsFaibles] = useState((existingProfile?.pointsFaibles ?? child?.faibles ?? []).join(', '));
  const [pointsForts, setPointsForts] = useState((existingProfile?.pointsForts ?? child?.forts ?? []).join(', '));
  const [noteLibre, setNoteLibre] = useState(existingProfile?.noteLibre ?? '');

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

  function toggleMatiere(m: string) {
    setMatieres((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function save() {
    if (!child) return;
    if (!prenom.trim()) { Alert.alert('Prénom manquant', "Indiquez le prénom de l'enfant."); return; }
    if (!classe) { Alert.alert('Classe manquante', 'Choisissez une classe.'); return; }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 2 || ageNum > 18) { Alert.alert('Âge invalide', 'Indiquez un âge entre 2 et 18 ans.'); return; }

    const existing = child.matieres;
    const matStats: MatiereStat[] = matieres.map((m, i) => {
      const found = existing.find((x) => x.s === m);
      return found ?? { s: m, v: 50, a: ACCENTS[i % ACCENTS.length], icon: MATIERE_ICONS[m] ?? 'book-outline' };
    });
    const isMaternelle = ['PS', 'MS', 'GS'].includes(classe);
    const faiblesArr = pointsFaibles.split(',').map((x) => x.trim()).filter(Boolean);
    const fortsArr = pointsForts.split(',').map((x) => x.trim()).filter(Boolean);
    updateChild(child.id, {
      name: prenom.trim(),
      classe: isMaternelle ? `Maternelle ${classe}` : classe,
      age: ageNum,
      matieres: matStats,
      faibles: faiblesArr,
      forts: fortsArr,
    });

    // Profil personnalisé pour l'IA
    if (existingProfile) {
      updateProfile(child.id, {
        etablissement: etablissement?.nom || undefined,
        etablissementInfo: etablissement ?? undefined,
        niveauEstime: niveau,
        objectif,
        matieresPrioritaires: matieres,
        dureeQuotidienne: duree,
        rythme,
        ton,
        pointsFaibles: faiblesArr,
        pointsForts: fortsArr,
        noteLibre: noteLibre.trim() || undefined,
      });
    } else {
      const profile: ChildProfile = {
        childId: child.id,
        etablissement: etablissement?.nom || undefined,
        etablissementInfo: etablissement ?? undefined,
        pays: 'France',
        niveauEstime: niveau,
        objectif,
        matieresPrioritaires: matieres,
        dureeQuotidienne: duree,
        rythme,
        pointsFaibles: faiblesArr,
        pointsForts: fortsArr,
        correctionDetaillee: true,
        versionImprimable: false,
        ton,
        noteLibre: noteLibre.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProfile(profile);
    }
    router.back();
  }

  function confirmArchive() {
    Alert.alert(
      'Êtes-vous sûr de vouloir supprimer cet enfant ?',
      "L'enfant sera déplacé dans les archives. Vous pourrez le restaurer plus tard.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: "Archiver l'enfant",
          style: 'destructive',
          onPress: () => {
            archiveChild(child!.id);
            setChild(null);
            router.replace('/(tabs)/' as any);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Modifier le profil</Text>
        <Text style={s.sub}>Mettez à jour les informations de {child.name}.</Text>

        <Card pad={18} style={{ marginTop: 14, gap: 18 }}>
          <View>
            <Text style={s.fieldLabel}>Prénom</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput style={s.input} value={prenom} onChangeText={setPrenom} placeholder="Lucas" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Classe</Text>
            <View style={s.pillsRow}>
              {CLASSES.map((cl) => {
                const on = classe === cl;
                return (
                  <TouchableOpacity key={cl} onPress={() => setClasse(cl)} style={[s.pill, on && s.pillOn]}>
                    <Text style={[s.pillText, on && s.pillTextOn]}>{cl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Âge</Text>
            <View style={s.inputRow}>
              <Ionicons name="calendar-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput style={s.input} value={age} onChangeText={setAge} placeholder="11" keyboardType="number-pad" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Matières suivies</Text>
            <View style={s.pillsRow}>
              {MATIERES.map((m) => {
                const on = matieres.includes(m);
                return (
                  <TouchableOpacity key={m} onPress={() => toggleMatiere(m)} style={[s.pill, on && s.pillOn]}>
                    <Text style={[s.pillText, on && s.pillTextOn]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        {/* ── Profil personnalisé pour l'IA ── */}
        <Text style={s.section}>PROFIL POUR L'IA</Text>
        <Text style={s.sectionHint}>Ces informations personnalisent les drills et exercices générés.</Text>
        <Card pad={18} style={{ marginTop: 12, gap: 18 }}>
          <View>
            <Text style={s.fieldLabel}>Établissement scolaire</Text>
            <SchoolPicker value={etablissement} onChange={setEtablissement} classe={classe} />
          </View>

          <View>
            <Text style={s.fieldLabel}>Niveau estimé</Text>
            <View style={s.pillsRow}>
              {NIVEAUX.map((n) => (
                <TouchableOpacity key={n.key} onPress={() => setNiveau(n.key)} style={[s.pill, niveau === n.key && s.pillOn]}>
                  <Text style={[s.pillText, niveau === n.key && s.pillTextOn]}>{n.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Objectif principal</Text>
            <View style={s.pillsRow}>
              {OBJECTIFS.map((o) => (
                <TouchableOpacity key={o.key} onPress={() => setObjectif(o.key)} style={[s.pill, objectif === o.key && s.pillOn]}>
                  <Text style={[s.pillText, objectif === o.key && s.pillTextOn]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Durée quotidienne</Text>
            <View style={s.pillsRow}>
              {DUREES.map((d) => (
                <TouchableOpacity key={String(d.key)} onPress={() => setDuree(d.key)} style={[s.pill, duree === d.key && s.pillOn]}>
                  <Text style={[s.pillText, duree === d.key && s.pillTextOn]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Jours de travail</Text>
            <View style={s.pillsRow}>
              {RYTHMES.map((r) => (
                <TouchableOpacity key={r.key} onPress={() => setRythme(r.key)} style={[s.pill, rythme === r.key && s.pillOn]}>
                  <Text style={[s.pillText, rythme === r.key && s.pillTextOn]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Ton pédagogique</Text>
            <View style={s.pillsRow}>
              {TONS.map((t) => (
                <TouchableOpacity key={t.key} onPress={() => setTon(t.key)} style={[s.pill, ton === t.key && s.pillOn]}>
                  <Ionicons name={t.icon as any} size={14} color={ton === t.key ? '#fff' : T.ink} style={{ marginRight: 5 }} />
                  <Text style={[s.pillText, ton === t.key && s.pillTextOn]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Difficultés connues</Text>
            <Text style={s.miniHint}>Séparées par des virgules · injectées dans chaque drill</Text>
            <TextInput
              style={[s.inputRow, s.textArea]} value={pointsFaibles} onChangeText={setPointsFaibles}
              placeholder="fractions, retenues, accord sujet-verbe" placeholderTextColor={T.faint} multiline
            />
          </View>

          <View>
            <Text style={s.fieldLabel}>Points forts</Text>
            <TextInput
              style={[s.inputRow, s.textArea]} value={pointsForts} onChangeText={setPointsForts}
              placeholder="calcul mental, lecture" placeholderTextColor={T.faint} multiline
            />
          </View>

          <View>
            <Text style={s.fieldLabel}>Note libre pour l'IA</Text>
            <Text style={s.miniHint}>Contexte de l'école, méthode, objectifs long terme...</Text>
            <TextInput
              style={[s.inputRow, s.textArea, { minHeight: 90 }]} value={noteLibre} onChangeText={setNoteLibre}
              placeholder="Ex : École en avance d'un an. Préparer aux concours type Kangourou."
              placeholderTextColor={T.faint} multiline
            />
          </View>
        </Card>

        <View style={{ height: 20 }} />
        <Btn onPress={save} full icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Enregistrer les modifications
        </Btn>
        <View style={{ height: 10 }} />
        <TouchableOpacity onPress={confirmArchive} style={s.deleteRow} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={19} color={T.coral.fg} />
          <Text style={s.deleteText}>Supprimer cet enfant</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: T.sub, fontWeight: '600', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 14, color: T.sub, fontWeight: '500', marginTop: 6 },
  section: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 24, letterSpacing: 0.2 },
  sectionHint: { fontSize: 13, color: T.faint, fontWeight: '500', marginTop: 5, lineHeight: 18 },
  miniHint: { fontSize: 12, color: T.faint, fontWeight: '500', marginBottom: 7, marginTop: -3 },
  textArea: { alignItems: 'flex-start', minHeight: 56, paddingTop: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 9 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: T.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: T.surfaceAlt,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: T.ink },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 15,
    backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent',
  },
  pillOn: { backgroundColor: T.primary, borderColor: T.primary },
  pillText: { fontWeight: '700', fontSize: 14, color: T.ink },
  pillTextOn: { color: '#fff' },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.coral.soft, borderRadius: 16, padding: 15,
  },
  deleteText: { fontWeight: '800', fontSize: 15, color: T.coral.fg },
});
