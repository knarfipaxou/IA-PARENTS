import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import type { LessonProgram } from '../services/education/programmes';

function confianceLabel(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: 'élevée', color: '#0A8A64' };
  if (pct >= 45) return { label: 'moyenne', color: '#C08A0E' };
  return { label: 'faible', color: '#C05621' };
}

/**
 * « Programme identifié » — présentation synthétique du rattachement de la
 * leçon aux programmes officiels, avec validation/correction par le parent.
 */
export function ProgramCard({
  programme, onUpdate,
}: {
  programme: LessonProgram;
  onUpdate: (p: LessonProgram) => void;
}) {
  const [open, setOpen] = useState(false);
  const conf = confianceLabel(programme.confiance);
  const parent = programme.parent;

  const classeLine = parent?.classe
    ? `${parent.classe} (corrigé par le parent)`
    : parent?.cycleSeul
      ? `${programme.cycleLabel} (classe non précisée)`
      : programme.classeEstimee
        ? `${programme.classeEstimee} probable`
        : 'classe indéterminée';

  function setParent(p: NonNullable<LessonProgram['parent']>) {
    onUpdate({ ...programme, parent: p });
  }

  return (
    <View style={[s.card, parent?.statut === 'incorrect' && { borderColor: 'rgba(192,86,33,0.5)' }]}>
      <View style={s.head}>
        <View style={s.headIcon}>
          <Ionicons name="ribbon-outline" size={18} color="#0A8A64" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Programme identifié</Text>
          <Text style={s.line1}>
            {programme.matiere ?? 'Matière inconnue'} • {classeLine}
          </Text>
          <Text style={s.line2}>
            {programme.cycleLabel}
            {programme.domaine ? ` • ${programme.domaine}` : ''}
          </Text>
          <Text style={[s.conf, { color: conf.color }]}>Confiance : {conf.label} ({programme.confiance} %)</Text>
        </View>
        {parent?.statut === 'confirme' && (
          <View style={s.okBadge}><Ionicons name="checkmark" size={13} color="#fff" /></View>
        )}
      </View>

      <TouchableOpacity onPress={() => setOpen((o) => !o)} style={s.detailToggle}>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={T.sub} />
        <Text style={s.detailToggleText}>{open ? 'Masquer les détails' : 'Voir les détails'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={{ gap: 10, marginTop: 10 }}>
          <Text style={s.explication}>{programme.explication}</Text>

          {programme.classesPossibles.length > 1 && (
            <Text style={s.metaText}>Niveaux possibles : {programme.classesPossibles.join(', ')}</Text>
          )}

          {programme.extraits.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={s.metaLabel}>RÉFÉRENCES OFFICIELLES</Text>
              {programme.extraits.slice(0, 2).map((ex, i) => (
                <Text key={i} style={s.extrait}>
                  « {ex.texte.slice(0, 160)}… »{ex.reference ? `\n— ${ex.reference}` : ''}
                </Text>
              ))}
            </View>
          )}
          <Text style={s.metaText}>
            Source : data.education.gouv.fr{programme.syncDate ? ` · synchronisé le ${programme.syncDate.slice(0, 10).split('-').reverse().join('/')}` : ''}
          </Text>

          {/* validation / correction du parent */}
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, parent?.statut === 'confirme' && s.actionBtnOn]}
              onPress={() => setParent({ statut: 'confirme', date: new Date().toISOString() })}
            >
              <Text style={[s.actionText, parent?.statut === 'confirme' && { color: '#fff' }]}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => setParent({ statut: 'corrige', cycleSeul: true, date: new Date().toISOString() })}
            >
              <Text style={s.actionText}>Cycle seulement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, parent?.statut === 'incorrect' && { borderColor: '#C05621' }]}
              onPress={() => setParent({ statut: 'incorrect', date: new Date().toISOString() })}
            >
              <Text style={[s.actionText, parent?.statut === 'incorrect' && { color: '#C05621' }]}>Incorrect</Text>
            </TouchableOpacity>
          </View>
          {programme.classesPossibles.length > 1 && (
            <View style={s.actionsRow}>
              {programme.classesPossibles.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.actionBtn, parent?.classe === c && s.actionBtnOn]}
                  onPress={() => setParent({ statut: 'corrige', classe: c, date: new Date().toISOString() })}
                >
                  <Text style={[s.actionText, parent?.classe === c && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1.5, borderColor: 'rgba(18,184,134,0.35)', backgroundColor: 'rgba(18,184,134,0.05)',
    borderRadius: 18, padding: 14, marginTop: 13,
  },
  head: { flexDirection: 'row', gap: 10 },
  headIcon: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(18,184,134,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 12, fontWeight: '800', color: '#0A8A64', letterSpacing: 0.5, textTransform: 'uppercase' },
  line1: { fontSize: 15, fontWeight: '800', color: T.ink, marginTop: 3, letterSpacing: -0.2 },
  line2: { fontSize: 13, fontWeight: '600', color: T.sub, marginTop: 2 },
  conf: { fontSize: 12.5, fontWeight: '800', marginTop: 4 },
  okBadge: {
    width: 22, height: 22, borderRadius: 999, backgroundColor: '#12B886',
    alignItems: 'center', justifyContent: 'center',
  },
  detailToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  detailToggleText: { fontSize: 12.5, fontWeight: '700', color: T.sub },
  explication: { fontSize: 13, color: T.sub, fontWeight: '500', lineHeight: 19 },
  metaLabel: { fontSize: 10.5, fontWeight: '800', color: T.faint, letterSpacing: 0.8 },
  metaText: { fontSize: 12, color: T.faint, fontWeight: '500', lineHeight: 17 },
  extrait: { fontSize: 12, color: T.sub, fontWeight: '500', fontStyle: 'italic', lineHeight: 17 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    borderWidth: 1.2, borderColor: T.line, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8,
    backgroundColor: T.surface,
  },
  actionBtnOn: { backgroundColor: '#12B886', borderColor: '#12B886' },
  actionText: { fontSize: 12.5, fontWeight: '700', color: T.ink },
});
