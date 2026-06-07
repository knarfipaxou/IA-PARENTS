import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { ProgressRing } from '../../components/ui/Progress';

const KIDS = [
  { name: 'Maxime', classe: 'CM2', age: 10, progress: 65, next: 'Contrôle de maths', inDays: 5, accentKey: 'green' as const, icon: 'calculator-outline' },
  { name: 'Léa', classe: '6e', age: 11, progress: 82, next: 'Dictée de français', inDays: 7, accentKey: 'violet' as const, icon: 'book-outline' },
];

export default function ChildrenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Mes enfants</Text>
            <Text style={s.sub}>2 profils suivis</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(onboarding)/profile')} style={s.addBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={s.list}>
          {KIDS.map(k => (
            <TouchableOpacity key={k.name} onPress={() => router.push('/progress')} activeOpacity={0.9}>
              <Card pad={16} style={s.childCard}>
                <View style={s.childTop}>
                  <ProgressRing value={k.progress} size={56} sw={7}>
                    <Text style={s.ringText}>{k.progress}%</Text>
                  </ProgressRing>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={s.childName}>{k.name}</Text>
                    <Text style={s.childClass}>{k.classe} · {k.age} ans</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={T.faint} />
                </View>
                <View style={s.childBottom}>
                  <Squircle accentKey={k.accentKey} icon={<Ionicons name={k.icon as any} size={18} color={T[k.accentKey].fg} />} size={32} r={10} />
                  <Text style={s.childNext}>Prochain : {k.next}</Text>
                  <Text style={[s.childDays, { color: T[k.accentKey].fg }]}>J-{k.inDays}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => router.push('/(onboarding)/profile')} style={s.addChildBtn} activeOpacity={0.85}>
            <View style={s.addChildIcon}>
              <Ionicons name="add" size={24} color={T.primary} />
            </View>
            <View>
              <Text style={s.addChildTitle}>Ajouter un enfant</Text>
              <Text style={s.addChildSub}>Créer un nouveau profil</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 14.5, color: T.sub, marginTop: 3, fontWeight: '500' },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: T.primary, alignItems: 'center', justifyContent: 'center', shadowColor: T.primaryDeep, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  list: { gap: 12 },
  childCard: {},
  childTop: { flexDirection: 'row', alignItems: 'center' },
  ringText: { fontSize: 13.5, fontWeight: '800', color: T.ink },
  childName: { fontWeight: '800', fontSize: 17, color: T.ink, letterSpacing: -0.3 },
  childClass: { fontSize: 13, color: T.sub, fontWeight: '600', marginTop: 1 },
  childBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: T.line },
  childNext: { flex: 1, fontSize: 13.5, fontWeight: '600', color: T.ink },
  childDays: { fontSize: 13, fontWeight: '800' },
  addChildBtn: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: T.surfaceAlt, borderRadius: 22, padding: 18, borderWidth: 1.5, borderColor: T.lineStrong, borderStyle: 'dashed' },
  addChildIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  addChildTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  addChildSub: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 1 },
});
