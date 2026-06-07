import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, AccentKey } from '../constants/theme';
import { Btn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { StatusChip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';

const ITEMS = [
  { subj: 'Maths', type: 'Contrôle', date: 'Jeu. 24 avr.', days: 'dans 5 jours', status: 'confirme' as const, accentKey: 'green' as AccentKey, icon: 'calculator-outline' },
  { subj: 'Français', type: 'Dictée', date: 'Mar. 29 avr.', days: 'dans 10 jours', status: 'confirme' as const, accentKey: 'violet' as AccentKey, icon: 'book-outline' },
  { subj: 'SVT', type: 'Interrogation', date: 'Ven. 02 mai', days: 'à vérifier', status: 'incertain' as const, accentKey: 'coral' as AccentKey, icon: 'flask-outline' },
];

export default function AgendaResultsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.blue.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>Analysé</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>Contrôles détectés</Text>
          <Text style={s.sub}>3 échéances trouvées. Confirmez pour les ajouter au suivi.</Text>
        </View>

        <View style={s.list}>
          {ITEMS.map((it, i) => (
            <Card key={i} pad={15}>
              <View style={s.itemTop}>
                <Squircle accentKey={it.accentKey} icon={<Ionicons name={it.icon as any} size={22} color={T[it.accentKey].fg} />} size={46} />
                <View style={{ flex: 1, marginLeft: 13 }}>
                  <View style={s.itemTitleRow}>
                    <Text style={s.itemSubj}>{it.subj}</Text>
                    <Text style={s.itemType}>· {it.type}</Text>
                  </View>
                  <Text style={s.itemDate}>{it.date} · {it.days}</Text>
                </View>
              </View>
              <View style={s.itemBottom}>
                <StatusChip status={it.status} />
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="pencil-outline" size={16} color={T.primary} />
                  <Text style={s.editLink}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.push('/(tabs)')} icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}>
          Confirmer et enregistrer
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { marginTop: 18, marginBottom: 0 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500', marginBottom: 16 },
  list: { gap: 11 },
  itemTop: { flexDirection: 'row', alignItems: 'center' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemSubj: { fontWeight: '800', fontSize: 16, color: T.ink, letterSpacing: -0.3 },
  itemType: { fontSize: 13, color: T.sub, fontWeight: '600' },
  itemDate: { fontSize: 13.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  editLink: { color: T.primary, fontWeight: '800', fontSize: 13.5 },
});
