import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, AccentKey } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { StatusChip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';

type Status = 'confirme' | 'incertain' | 'erreur';

function ValGroup({ status, items }: { status: Status; items: { label: string; value: string }[] }) {
  const router = useRouter();
  const titles: Record<Status, string> = { confirme: 'Champs confirmés', incertain: 'À vérifier', erreur: 'À refaire' };
  const accentKeys: Record<Status, AccentKey> = { confirme: 'green', incertain: 'amber', erreur: 'coral' };
  const icons: Record<Status, string> = { confirme: 'checkmark', incertain: 'help-circle-outline', erreur: 'alert-circle-outline' };
  const a = T[accentKeys[status]];

  return (
    <Card pad={16} style={{ marginTop: 13 }}>
      <View style={s.groupHeader}>
        <Text style={s.groupTitle}>{titles[status]}</Text>
        <StatusChip status={status} />
      </View>
      <View style={{ gap: 10 }}>
        {items.map((it, i) => (
          <View key={i} style={[s.fieldRow, { backgroundColor: a.soft }]}>
            <Ionicons name={icons[status] as any} size={18} color={a.fg} />
            <View style={{ flex: 1 }}>
              <Text style={[s.fieldLabel, { color: a.fg }]}>{it.label}</Text>
              <Text style={s.fieldValue}>{it.value}</Text>
            </View>
            {status === 'incertain' && <TouchableOpacity><Text style={[s.actionLink, { color: a.fg }]}>Corriger</Text></TouchableOpacity>}
            {status === 'erreur' && <TouchableOpacity onPress={() => router.push('/photo-floue')}><Text style={[s.actionLink, { color: a.fg }]}>Reprendre</Text></TouchableOpacity>}
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function ValidationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />
        <View style={s.header}>
          <Text style={s.title}>Validation de l'analyse</Text>
          <Text style={s.sub}>Le parent garde le contrôle. Vérifiez avant de générer le plan.</Text>
        </View>

        <ValGroup status="confirme" items={[
          { label: 'Matière', value: 'Mathématiques' },
          { label: 'Notion principale', value: 'Les fractions' },
        ]} />
        <ValGroup status="incertain" items={[
          { label: 'Date du contrôle', value: 'Jeudi 24 avril ?' },
        ]} />
        <ValGroup status="erreur" items={[
          { label: 'Bas de page', value: 'Photo trop floue à relire' },
        ]} />

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.push('/(tabs)/plan')} icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Tout est correct
        </Btn>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <GhostBtn full onPress={() => router.back()} icon={<Ionicons name="pencil-outline" size={18} color={T.ink} />}>
              Modifier
            </GhostBtn>
          </View>
          <View style={{ flex: 1 }}>
            <GhostBtn full onPress={() => router.push('/photo-floue')} icon={<Ionicons name="camera-outline" size={18} color={T.ink} />}>
              Reprendre
            </GhostBtn>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { marginTop: 18 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6, lineHeight: 32 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500', lineHeight: 22 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  groupTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 13, padding: 11 },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  fieldValue: { fontSize: 14.5, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  actionLink: { fontWeight: '800', fontSize: 13 },
});
