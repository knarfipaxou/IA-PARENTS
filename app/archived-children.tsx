import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { FONT } from '../constants/handoff';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { useChild } from '../contexts/ChildContext';

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArchivedChildren() {
  const router = useRouter();
  const { children, restoreChild, deleteChildPermanently } = useChild();
  const archived = children.filter((c) => c.archived);

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      `Supprimer définitivement ${name} ?`,
      'Cette action est définitive. Toutes les données de cet enfant seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer définitivement', style: 'destructive', onPress: () => deleteChildPermanently(id) },
      ]
    );
  }

  function confirmEmpty() {
    Alert.alert(
      'Vider la corbeille ?',
      'Voulez-vous vraiment vider la corbeille ? Cette action supprimera définitivement tous les enfants archivés et leurs données.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider la corbeille',
          style: 'destructive',
          onPress: () => archived.forEach((c) => deleteChildPermanently(c.id)),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Enfants archivés</Text>
        <Text style={s.sub}>
          {archived.length > 0
            ? `${archived.length} ${archived.length > 1 ? 'profils archivés' : 'profil archivé'}. Restaurez ou supprimez définitivement.`
            : 'La corbeille est vide.'}
        </Text>

        <View style={{ gap: 12, marginTop: 16 }}>
          {archived.map((c) => (
            <Card key={c.id} pad={15}>
              <View style={s.rowTop}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{c.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 13 }}>
                  <Text style={s.name}>{c.name}</Text>
                  <Text style={s.meta}>{c.classe} · {c.age} ans</Text>
                  {!!c.archivedAt && <Text style={s.metaFaint}>Archivé le {formatDate(c.archivedAt)}</Text>}
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity onPress={() => restoreChild(c.id)} style={s.restoreBtn} activeOpacity={0.85}>
                  <Ionicons name="refresh-outline" size={17} color={T.green.fg} />
                  <Text style={s.restoreText}>Restaurer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(c.id, c.name)} style={s.deleteBtn} activeOpacity={0.85}>
                  <Ionicons name="trash-outline" size={17} color={T.coral.fg} />
                  <Text style={s.deleteText}>Supprimer définitivement</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}

          {archived.length === 0 && (
            <View style={s.emptyBox}>
              <Ionicons name="archive-outline" size={42} color={T.faint} />
              <Text style={s.emptyText}>Aucun enfant dans la corbeille.</Text>
            </View>
          )}
        </View>

        {archived.length > 0 && (
          <TouchableOpacity onPress={confirmEmpty} style={s.emptyTrashRow} activeOpacity={0.85}>
            <Ionicons name="trash-bin-outline" size={19} color={T.coral.fg} />
            <Text style={s.deleteText}>Vider la corbeille</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { fontFamily: FONT.title, fontSize: 24, color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontFamily: FONT.body, fontSize: 14, color: T.sub, marginTop: 6 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: T.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONT.title, fontSize: 20, color: T.sub },
  name: { fontFamily: FONT.num, fontSize: 16.5, color: T.ink, letterSpacing: -0.3 },
  meta: { fontFamily: FONT.body, fontSize: 13, color: T.sub, marginTop: 2 },
  metaFaint: { fontFamily: FONT.body, fontSize: 12, color: T.faint, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 13 },
  restoreBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: T.green.soft, borderRadius: 13, paddingVertical: 11,
  },
  restoreText: { fontFamily: FONT.bodyBold, fontSize: 13.5, color: T.green.fg },
  deleteBtn: {
    flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: T.coral.soft, borderRadius: 13, paddingVertical: 11,
  },
  deleteText: { fontFamily: FONT.bodyBold, fontSize: 13.5, color: T.coral.fg },
  emptyTrashRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.coral.soft, borderRadius: 16, padding: 15, marginTop: 20,
  },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontFamily: FONT.num, fontSize: 15, color: T.faint },
});
