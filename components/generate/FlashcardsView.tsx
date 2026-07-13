import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { playSfx } from '../../lib/sfx';
import { saveFlashMastery } from '../../lib/flashMastery';
import { CyanBtn, DarkGhostBtn } from './Buttons';
import type { Flashcards } from '../../services/ai';

export function FlashcardsView({
  fc, masteryKey, onFlip,
}: { fc: Flashcards; masteryKey: string; onFlip: () => void }) {
  const cards = fc.cards ?? [];
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardKnown, setCardKnown] = useState<Record<number, boolean>>({});
  const [flashDone, setFlashDone] = useState(false);
  const card = cards[cardIndex];
  const knownCount = Object.values(cardKnown).filter(Boolean).length;

  function answerCard(known: boolean) {
    playSfx(known ? 'correct' : 'wrong');
    const next = { ...cardKnown, [cardIndex]: known };
    setCardKnown(next);
    if (cardIndex < cards.length - 1) {
      setCardIndex(cardIndex + 1);
      setFlipped(false);
    } else {
      // fin de session : mémoriser la maîtrise pour l'échéance/leçon
      const nKnown = Object.values(next).filter(Boolean).length;
      saveFlashMastery(masteryKey, { known: nKnown, total: cards.length, date: new Date().toISOString() });
      playSfx(nKnown / cards.length >= 0.8 ? 'success' : 'correct');
      setFlashDone(true);
    }
  }

  if (flashDone) {
    const pct = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;
    return (
      <View style={{ alignItems: 'center', paddingVertical: 30 }}>
        <Text style={{ fontSize: 52 }}>{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</Text>
        <Text style={{ color: DK.ink, fontSize: 24, fontWeight: '900', marginTop: 10 }}>Session terminée !</Text>
        <Text style={{ color: DK.cyan, fontSize: 34, fontWeight: '900', marginTop: 12 }}>{pct} % maîtrisé</Text>
        <Text style={{ color: DK.sub, fontSize: 14, fontWeight: '600', marginTop: 6 }}>
          {knownCount} carte{knownCount > 1 ? 's' : ''} sue{knownCount > 1 ? 's' : ''} sur {cards.length}
        </Text>
        <CyanBtn
          label="Recommencer les cartes à revoir"
          onPress={() => { setCardKnown({}); setCardIndex(0); setFlipped(false); setFlashDone(false); }}
          style={{ marginTop: 24, alignSelf: 'stretch' }}
        />
      </View>
    );
  }

  if (!card) return null;

  return (
    <>
      <Text style={s.counter}>Carte {cardIndex + 1} / {cards.length}</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => { setFlipped((f) => !f); if (!flipped) onFlip(); }}
      >
        <LinearGradient
          colors={flipped ? ['rgba(20,110,95,0.55)', 'rgba(14,40,50,0.8)'] : ['rgba(85,50,130,0.5)', 'rgba(25,20,60,0.75)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.flashcard, flipped ? s.flashcardBack : null]}
        >
          <Text style={[s.flashLabel, { color: flipped ? DK.cyan : '#C9A0FF' }]}>{flipped ? 'RÉPONSE' : 'QUESTION'}</Text>
          <Text style={s.flashText}>{flipped ? card.verso : card.recto}</Text>
          <View style={s.flipHint}>
            <Ionicons name="sync-outline" size={15} color="rgba(220,210,255,0.6)" />
            <Text style={s.flipHintText}>Touche la carte pour la retourner</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <View style={s.dotsRow}>
        {cards.map((_, di) => (
          <View
            key={di}
            style={[s.dot, di < cardIndex && { backgroundColor: DK.cyan }, di === cardIndex && s.dotActive]}
          />
        ))}
      </View>
      {flipped ? (
        <View style={s.navBtnRow}>
          <TouchableOpacity onPress={() => answerCard(false)} activeOpacity={0.85} style={[s.flashAnswerBtn, s.flashAnswerBtnKo]}>
            <Ionicons name="close" size={18} color="#FF9C8A" />
            <Text style={[s.flashAnswerText, { color: '#FF9C8A' }]}>À revoir</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => answerCard(true)} activeOpacity={0.85} style={[s.flashAnswerBtn, s.flashAnswerBtnOk]}>
            <Ionicons name="checkmark" size={18} color="#9FF0BE" />
            <Text style={[s.flashAnswerText, { color: '#9FF0BE' }]}>Je savais</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.navBtnRow}>
          <DarkGhostBtn
            label="Précédente"
            icon={<Ionicons name="arrow-back" size={18} color="#DDE4FF" />}
            onPress={() => { if (cardIndex > 0) { setCardIndex(cardIndex - 1); setFlipped(false); } }}
            style={{ flex: 1 }}
          />
          <CyanBtn
            label="Suivante"
            icon={<Ionicons name="arrow-forward" size={18} color="#052A26" />}
            onPress={() => { if (cardIndex < cards.length - 1) { setCardIndex(cardIndex + 1); setFlipped(false); } }}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  counter: { alignSelf: 'center', fontSize: 14, fontWeight: '800', color: DK.sub, marginBottom: 14 },
  flashcard: {
    minHeight: 330, borderRadius: 28, padding: 26,
    borderWidth: 1.5, borderColor: 'rgba(190,140,255,0.45)',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    shadowColor: DK.violet, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 40, elevation: 8,
  },
  flashcardBack: { borderColor: 'rgba(53,228,210,0.5)', shadowColor: DK.cyan },
  flashLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  flashText: { fontSize: 21, fontWeight: '800', color: DK.ink, textAlign: 'center', letterSpacing: -0.3, lineHeight: 30 },
  flipHint: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  flipHintText: { fontSize: 12, color: 'rgba(220,210,255,0.6)', fontWeight: '600' },
  dotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 18 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.3)' },
  dotActive: { width: 16, borderRadius: 3, backgroundColor: '#C9A0FF' },
  navBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  flashAnswerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 999, paddingVertical: 14,
  },
  flashAnswerBtnKo: { borderColor: 'rgba(255,107,90,0.6)', backgroundColor: 'rgba(255,107,90,0.08)' },
  flashAnswerBtnOk: { borderColor: 'rgba(110,230,150,0.6)', backgroundColor: 'rgba(110,230,150,0.08)' },
  flashAnswerText: { fontSize: 15, fontWeight: '800' },
});
