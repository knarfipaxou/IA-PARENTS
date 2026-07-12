import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const C = {
  bg: '#141B33',
  card: 'rgba(148,168,255,0.07)',
  border: 'rgba(148,168,255,0.18)',
  ink: '#FFFFFF',
  sub: '#96A3CC',
  faint: '#5D6890',
  cyan: '#35E4D2',
};

function pad(n: number) { return String(n).padStart(2, '0'); }

/**
 * Sélecteur de date par calendrier mensuel. Aucun clavier, aucun raccourci :
 * navigation entre les mois + choix direct du jour, puis validation.
 * Renvoie la date au format JJ/MM/AAAA.
 */
export function CalendarModal({
  visible, initial, onClose, onConfirm,
}: {
  visible: boolean;
  initial?: string; // JJ/MM/AAAA
  onClose: () => void;
  onConfirm: (date: string) => void;
}) {
  const parse = (): { y: number; m: number; d: number } => {
    const mt = (initial ?? '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (mt) return { d: +mt[1], m: +mt[2] - 1, y: +mt[3] };
    // sans Date.now() dispo côté script, on part d'un repère fixe raisonnable
    return { d: 1, m: 6, y: 2026 };
  };
  const start = parse();
  const [view, setView] = useState({ y: start.y, m: start.m });
  const [sel, setSel] = useState<{ y: number; m: number; d: number } | null>(initial ? start : null);

  const firstDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function shiftMonth(delta: number) {
    let m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setView({ y, m });
  }
  function confirm() {
    if (!sel) return;
    onConfirm(`${pad(sel.d)}/${pad(sel.m + 1)}/${sel.y}`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.hBtn}><Ionicons name="close" size={22} color={C.ink} /></TouchableOpacity>
            <Text style={s.hTitle}>Choisir une date</Text>
            <TouchableOpacity onPress={confirm} disabled={!sel} style={[s.hBtn, s.hBtnOk, !sel && { opacity: 0.4 }]}>
              <Ionicons name="checkmark" size={22} color="#052A26" />
            </TouchableOpacity>
          </View>

          <View style={s.monthNav}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} style={s.navBtn}><Ionicons name="chevron-back" size={20} color={C.cyan} /></TouchableOpacity>
            <Text style={s.monthLabel}>{MONTHS[view.m]} {view.y}</Text>
            <TouchableOpacity onPress={() => shiftMonth(1)} style={s.navBtn}><Ionicons name="chevron-forward" size={20} color={C.cyan} /></TouchableOpacity>
          </View>

          <View style={s.dowRow}>
            {DOW.map((d, i) => <Text key={i} style={s.dow}>{d}</Text>)}
          </View>

          <View style={s.grid}>
            {cells.map((d, i) => {
              const isSel = !!sel && d === sel.d && sel.m === view.m && sel.y === view.y;
              return (
                <View key={i} style={s.cell}>
                  {d !== null && (
                    <TouchableOpacity
                      onPress={() => setSel({ y: view.y, m: view.m, d })}
                      style={[s.day, isSel && s.daySel]}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.dayText, isSel && s.dayTextSel]}>{d}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4,7,20,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 34,
    borderTopWidth: 1, borderColor: C.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  hBtn: {
    width: 42, height: 42, borderRadius: 999, backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  hBtnOk: { backgroundColor: C.cyan, borderColor: C.cyan },
  hTitle: { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: { flex: 1, textAlign: 'center', color: C.faint, fontSize: 12.5, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  daySel: {
    backgroundColor: C.cyan,
    shadowColor: C.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10, elevation: 6,
  },
  dayText: { color: C.ink, fontSize: 16, fontWeight: '600' },
  dayTextSel: { color: '#052A26', fontWeight: '900' },
});
