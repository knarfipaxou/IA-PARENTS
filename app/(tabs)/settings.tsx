import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';

function Row({ icon, label, value, onPress, showArrow = true }: { icon: string; label: string; value?: string; onPress?: () => void; showArrow?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row} activeOpacity={onPress ? 0.7 : 1}>
      <Ionicons name={icon as any} size={20} color={T.sub} style={{ marginRight: 14 }} />
      <Text style={s.rowLabel}>{label}</Text>
      {value && <Text style={s.rowValue}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={18} color={T.faint} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [dark, setDark] = React.useState(false);
  const [notifs, setNotifs] = React.useState(true);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Profil</Text>

        {/* Account */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Ionicons name="person" size={28} color={T.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>Franck</Text>
            <Text style={s.profileEmail}>frankipascoet@gmail.com</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>Compte</Text>
        <Card pad={0}>
          <Row icon="people-outline" label="Mes enfants" value="2 profils" />
          <View style={s.divider} />
          <Row icon="notifications-outline" label="Notifications" />
        </Card>

        <Text style={s.sectionLabel}>Préférences</Text>
        <Card pad={0}>
          <View style={s.row}>
            <Ionicons name="moon-outline" size={20} color={T.sub} style={{ marginRight: 14 }} />
            <Text style={s.rowLabel}>Mode sombre</Text>
            <Switch value={dark} onValueChange={setDark} trackColor={{ true: T.primary }} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Ionicons name="notifications-outline" size={20} color={T.sub} style={{ marginRight: 14 }} />
            <Text style={s.rowLabel}>Rappels de révision</Text>
            <Switch value={notifs} onValueChange={setNotifs} trackColor={{ true: T.primary }} />
          </View>
          <View style={s.divider} />
          <Row icon="document-text-outline" label="PDF imprimables" />
        </Card>

        <Text style={s.sectionLabel}>Support</Text>
        <Card pad={0}>
          <Row icon="help-circle-outline" label="Aide" />
          <View style={s.divider} />
          <Row icon="star-outline" label="Noter l'application" />
        </Card>

        <TouchableOpacity style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={T.coral.fg} />
          <Text style={[s.rowLabel, { color: T.coral.fg }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6, marginBottom: 18 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: T.line, gap: 14, marginBottom: 24, shadowColor: '#102818', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3 },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 18, fontWeight: '800', color: T.ink, letterSpacing: -0.3 },
  profileEmail: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 9, marginLeft: 2, marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowLabel: { flex: 1, fontSize: 15.5, fontWeight: '600', color: T.ink },
  rowValue: { fontSize: 14, color: T.sub, fontWeight: '500', marginRight: 8 },
  divider: { height: 1, backgroundColor: T.line, marginHorizontal: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, backgroundColor: T.coral.soft, borderRadius: 18, padding: 16 },
});
