import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { T } from '../../constants/theme';
import { Squircle } from '../../components/ui/Squircle';
import { Breathe } from '../../components/anim/Breathe';
import { useChild } from '../../contexts/ChildContext';
import { getJSON } from '../../lib/storage';
import { type Child } from '../../data/mock';

export default function ParentHome() {
  const router = useRouter();
  const { setChild, children: allChildren } = useChild();
  const children = allChildren.filter((c) => !c.archived);
  const [familyName, setFamilyName] = useState('Ma famille');

  useEffect(() => {
    getJSON<string>('ppia.familyName', 'Ma famille').then(setFamilyName);
  }, []);

  // Dynamic alerts from real children data
  const urgentEcheances = children.flatMap((c) =>
    (c.echeances ?? []).filter((e) => e.days <= 5).map((e) => ({
      accent: e.accent,
      icon: 'alert-circle-outline' as const,
      text: `${e.type} de ${e.subj} pour ${c.name} dans ${e.days === 0 ? "aujourd'hui" : `${e.days} jour${e.days > 1 ? 's' : ''}`}`,
    }))
  ).slice(0, 3);

  function handleSelectChild(c: Child) {
    setChild(c);
    router.push('/(child-tabs)/espace' as any);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={s.greeting}>
          <View style={{ flex: 1 }}>
            <Text style={s.greetTitle}>Bonjour 👋</Text>
            <Text style={s.greetSub}>{familyName} · {children.length} {children.length > 1 ? 'enfants' : 'enfant'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/notifications' as any)}
            style={s.notifBtn}
          >
            <Ionicons name="notifications-outline" size={20} color={T.ink} />
            {urgentEcheances.length > 0 && <View style={s.notifDot} />}
          </TouchableOpacity>
        </View>

        {/* Global alerts summary — only shown when there are urgent items */}
        {urgentEcheances.length > 0 && (
          <View style={s.alertsBox}>
            {urgentEcheances.map((al, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                style={[s.alertRow, i < urgentEcheances.length - 1 && s.alertBorder]}
              >
                <Ionicons name={al.icon} size={20} color={T[al.accent].fg} />
                <Text style={[s.alertText, { color: T.amber.fg }]} numberOfLines={2}>{al.text}</Text>
                <Ionicons name="chevron-forward" size={17} color={T.amber.fg} style={{ opacity: 0.7 }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Child picker */}
        <Text style={s.sectionLabel}>CHOISIR UN ENFANT</Text>
        <View style={s.childList}>
          {children.length === 0 && (
            <View style={s.emptyBox}>
              <Ionicons name="people-outline" size={40} color={T.faint} />
              <Text style={s.emptyText}>Aucun enfant pour l'instant</Text>
              <Text style={s.emptySub}>Ajoutez votre premier enfant ci-dessous.</Text>
            </View>
          )}
          {children.map((c) => {
            const isCollege = c.kind === 'college';
            const tagAccent = isCollege ? (c.next?.accent ?? c.accent) : c.accent;
            const tagLabel = isCollege
              ? `${c.next?.type ?? 'À planifier'}${c.next?.subj ? ` de ${c.next.subj}` : ''}`
              : (c.activity?.label ?? 'Activité');
            const tagSub = isCollege
              ? (c.next && c.next.days > 0 ? `dans ${c.next.days} jours` : 'à planifier')
              : `${c.activity?.min ?? 0} min · activité`;
            const tagIcon = isCollege ? 'flask-outline' : 'star-outline';

            return (
              <Animated.View key={c.id} entering={FadeInDown.delay(children.indexOf(c) * 90).springify().damping(16)}>
              <TouchableOpacity
                onPress={() => handleSelectChild(c)}
                style={s.childCard}
                activeOpacity={0.88}
              >
                <View style={s.childCardTop}>
                  <Breathe>
                    <View style={[s.childInitialCircle, { backgroundColor: T[c.accent].soft }]}>
                      <Text style={[s.childInitialText, { color: T[c.accent].fg }]}>{c.name.charAt(0)}</Text>
                    </View>
                  </Breathe>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={s.childName}>{c.name}</Text>
                    <Text style={s.childClass}>{c.classe} · {c.age} ans</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={T.faint} />
                </View>
                <View style={s.childCardBottom}>
                  <Squircle
                    accentKey={tagAccent}
                    size={32}
                    r={10}
                    icon={<Ionicons name={tagIcon as any} size={17} color={T[tagAccent].fg} />}
                    style={{ marginRight: 9 }}
                  />
                  <Text style={s.tagLabel} numberOfLines={1}>{tagLabel}</Text>
                  <Text style={[s.tagSub, { color: T[tagAccent].fg }]}>{tagSub}</Text>
                </View>
              </TouchableOpacity>
              </Animated.View>
            );
          })}

          <TouchableOpacity style={s.addCard} activeOpacity={0.8} onPress={() => router.push('/add-child' as any)}>
            <View style={s.addIcon}>
              <Ionicons name="add" size={23} color={T.primary} />
            </View>
            <View>
              <Text style={s.addTitle}>Ajouter / gérer les enfants</Text>
              <Text style={s.addSub}>Nouveau profil ou modifications</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  greetTitle: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  greetSub: { fontSize: 13.5, color: T.sub, marginTop: 4, fontWeight: '500' },
  notifBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 9, right: 10, width: 8, height: 8,
    borderRadius: 999, backgroundColor: T.coral.solid, borderWidth: 2, borderColor: T.surface,
  },
  alertsBox: { borderRadius: 22, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: T.amber.soft, marginBottom: 24 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, paddingHorizontal: 10 },
  alertBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(199,121,28,0.15)' },
  alertText: { flex: 1, fontSize: 13.5, fontWeight: '700', letterSpacing: -0.2 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginBottom: 12, letterSpacing: 0.2 },
  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: T.sub },
  emptySub: { fontSize: 13.5, color: T.faint, fontWeight: '500' },
  childList: { gap: 12 },
  childCard: {
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 24, padding: 16,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3,
  },
  childCardTop: { flexDirection: 'row', alignItems: 'center' },
  childInitialCircle: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  childInitialText: { fontSize: 22, fontWeight: '800' },
  childName: { fontWeight: '800', fontSize: 19, color: T.ink, letterSpacing: -0.4 },
  childClass: { fontSize: 13.5, color: T.sub, fontWeight: '600', marginTop: 1 },
  childCardBottom: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: T.line,
  },
  tagLabel: { flex: 1, fontSize: 13.5, fontWeight: '700', color: T.ink },
  tagSub: { fontSize: 12.5, fontWeight: '700' },
  addCard: {
    backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.lineStrong,
    borderStyle: 'dashed', borderRadius: 22, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 13,
  },
  addIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  addTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  addSub: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 1 },
});
