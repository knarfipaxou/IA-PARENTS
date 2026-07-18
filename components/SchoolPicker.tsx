import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { EDUCATION_SOURCE } from '../services/education/api';
import { searchSchools, type EtablissementScolaire } from '../services/education/annuaire';

const MIN_CHARS = 3;
const DEBOUNCE_MS = 350;

/**
 * Recherche assistée de l'établissement scolaire (annuaire officiel de
 * l'Éducation nationale). Autocomplétion avec anti-rebond, annulation des
 * requêtes précédentes, filtre par niveau (élargissable), saisie manuelle
 * exceptionnelle et option « École à la maison / CNED ».
 */
export function SchoolPicker({
  value, onChange, classe,
}: {
  value: EtablissementScolaire | null;
  onChange: (v: EtablissementScolaire | null) => void;
  classe?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EtablissementScolaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widen, setWiden] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    setError(null);
    if (query.trim().length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const list = await searchSchools(query, { classe, widen, signal: controller.signal });
        if (controller.signal.aborted) return;
        setResults(list);
        setLoading(false);
        if (list.length === 0) setError('Aucun établissement trouvé. Essayez la ville, le code postal, ou élargissez la recherche.');
      } catch (e) {
        if (controller.signal.aborted) return;
        setLoading(false);
        setResults([]);
        setError("L'annuaire officiel est momentanément indisponible. Réessayez, ou utilisez la saisie manuelle.");
      }
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, widen, classe]);

  // ── fiche synthétique quand un établissement est enregistré ──
  if (value) {
    return (
      <View style={s.ficheCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.ficheIcon}>
            <Ionicons name={value.manuel ? 'create-outline' : 'school'} size={20} color="#12B886" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.ficheName}>{value.nom}</Text>
            <Text style={s.ficheSub}>
              {[value.type, value.statut ? value.statut.toLowerCase() : null].filter(Boolean).join(' ')}
              {value.codePostal || value.commune ? `\n${[value.codePostal, value.commune].filter(Boolean).join(' ')}` : ''}
              {value.academie ? ` · Académie de ${value.academie.replace(/^Académie de\s*/i, '')}` : ''}
            </Text>
            {!!value.uai && !value.manuel && <Text style={s.ficheUai}>UAI {value.uai}</Text>}
          </View>
          <TouchableOpacity onPress={() => { onChange(null); setQuery(''); setManualMode(false); }} style={s.editBtn}>
            <Text style={s.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── saisie manuelle exceptionnelle ──
  if (manualMode) {
    return (
      <View style={{ gap: 8 }}>
        <View style={s.inputRow}>
          <Ionicons name="create-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
          <TextInput
            style={s.input}
            value={manualName}
            onChangeText={setManualName}
            placeholder="Nom de l'établissement (saisie libre)"
            placeholderTextColor={T.faint}
            autoFocus
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[s.smallBtn, { backgroundColor: '#12B886' }]}
            onPress={() => {
              if (!manualName.trim()) return;
              onChange({
                uai: '', nom: manualName.trim(), type: 'Établissement', statut: '',
                fetchedAt: new Date().toISOString(), source: 'Saisie manuelle', manuel: true,
              });
            }}
          >
            <Text style={[s.smallBtnText, { color: '#fff' }]}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.smallBtn} onPress={() => setManualMode(false)}>
            <Text style={s.smallBtnText}>Retour à la recherche</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── recherche avec autocomplétion ──
  return (
    <View style={{ gap: 8 }}>
      <View style={s.inputRow}>
        <Ionicons name="search" size={19} color={T.faint} style={{ marginRight: 10 }} />
        <TextInput
          style={s.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une école, un collège ou un lycée"
          placeholderTextColor={T.faint}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="#12B886" />}
      </View>
      <Text style={s.hint}>Nom, ville, code postal ou code UAI · annuaire officiel de l'Éducation nationale</Text>

      {!!error && <Text style={s.error}>{error}</Text>}

      {results.map((r) => (
        <TouchableOpacity key={r.uai} style={s.resultRow} onPress={() => onChange(r)} activeOpacity={0.8}>
          <View style={{ flex: 1 }}>
            <Text style={s.resultName}>{r.nom}</Text>
            <Text style={s.resultSub}>
              {[r.type, r.statut ? r.statut.toLowerCase() : null].filter(Boolean).join(' ')}
              {'  ·  '}
              {[r.codePostal, r.commune].filter(Boolean).join(' ')}
              {r.departement ? `  ·  ${r.departement}` : ''}
            </Text>
          </View>
          <Text style={s.resultUai}>{r.uai}</Text>
        </TouchableOpacity>
      ))}

      {query.trim().length >= MIN_CHARS && (
        <TouchableOpacity onPress={() => setWiden((w) => !w)} style={s.linkRow}>
          <Ionicons name={widen ? 'contract-outline' : 'expand-outline'} size={15} color="#12B886" />
          <Text style={s.linkText}>
            {widen ? 'Limiter aux établissements du niveau' : 'Élargir la recherche à tous les types d\'établissements'}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => setManualMode(true)} style={s.linkRow}>
        <Ionicons name="help-circle-outline" size={15} color={T.sub} />
        <Text style={[s.linkText, { color: T.sub }]}>Je ne trouve pas mon établissement (saisie manuelle)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange({
          uai: '', nom: 'École à la maison / CNED / autre situation', type: 'Autre situation', statut: '',
          fetchedAt: new Date().toISOString(), source: 'Déclaration du parent', manuel: true,
        })}
        style={s.linkRow}
      >
        <Ionicons name="home-outline" size={15} color={T.sub} />
        <Text style={[s.linkText, { color: T.sub }]}>École à la maison / CNED / autre situation</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: T.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: T.surfaceAlt,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: T.ink },
  hint: { fontSize: 11.5, color: T.faint, fontWeight: '500' },
  error: { fontSize: 12.5, color: '#C05621', fontWeight: '600', lineHeight: 18 },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: T.line, borderRadius: 14, padding: 12, backgroundColor: T.surface,
  },
  resultName: { fontSize: 14.5, fontWeight: '700', color: T.ink },
  resultSub: { fontSize: 12, color: T.sub, fontWeight: '500', marginTop: 2 },
  resultUai: { fontSize: 10, color: T.faint, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  linkText: { fontSize: 12.5, fontWeight: '700', color: '#12B886' },
  ficheCard: {
    borderWidth: 1.5, borderColor: 'rgba(18,184,134,0.4)', backgroundColor: 'rgba(18,184,134,0.06)',
    borderRadius: 16, padding: 13,
  },
  ficheIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(18,184,134,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  ficheName: { fontSize: 14.5, fontWeight: '800', color: T.ink },
  ficheSub: { fontSize: 12, color: T.sub, fontWeight: '500', marginTop: 3, lineHeight: 17 },
  ficheUai: { fontSize: 10, color: T.faint, fontWeight: '600', marginTop: 3 },
  editBtn: {
    borderWidth: 1, borderColor: T.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: T.ink },
  smallBtn: {
    borderWidth: 1, borderColor: T.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: T.surfaceAlt,
  },
  smallBtnText: { fontSize: 13, fontWeight: '700', color: T.ink },
});
