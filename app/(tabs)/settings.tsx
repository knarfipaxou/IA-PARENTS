import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useChild } from '../../contexts/ChildContext';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { Btn } from '../../components/ui/Btn';
import { getApiKey, setApiKey } from '../../services/ai';
import { useScheme, setDarkMode } from '../../lib/useScheme';
import { isVoiceEnabled, setVoiceEnabled } from '../../lib/greeting';

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
  const router = useRouter();
  const { children } = useChild();
  const activeCount = children.filter((c) => !c.archived).length;
  const archivedCount = children.filter((c) => c.archived).length;
  const dark = useScheme() === 'dark';
  const setDark = setDarkMode;
  const [notifs, setNotifs] = React.useState(true);
  const [voice, setVoice] = React.useState(true);
  React.useEffect(() => { isVoiceEnabled().then(setVoice); }, []);
  function toggleVoice(on: boolean) { setVoice(on); setVoiceEnabled(on); }
  const [keyInput, setKeyInput] = React.useState('');
  const [keySaved, setKeySaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getApiKey().then((k) => setKeySaved(!!k));
  }, []);

  async function saveKey() {
    if (!keyInput.trim()) return;
    setSaving(true);
    await setApiKey(keyInput.trim());
    setKeyInput('');
    setKeySaved(true);
    setSaving(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 999, backgroundColor: T.surface,
              borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={T.ink} />
          </TouchableOpacity>
          <Text style={s.title}>Profil</Text>
        </View>

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
          <Row icon="people-outline" label="Mes enfants" value={`${activeCount} ${activeCount > 1 ? 'profils' : 'profil'}`} />
          <View style={s.divider} />
          <Row
            icon="archive-outline"
            label="Enfants archivés"
            value={`${archivedCount}`}
            onPress={() => router.push('/archived-children' as any)}
          />
          <View style={s.divider} />
          <Row icon="notifications-outline" label="Notifications" />
        </Card>

        <Text style={s.sectionLabel}>Clé API Claude</Text>
        <Card pad={16}>
          <View style={s.keyHeader}>
            <Ionicons name="key-outline" size={20} color={T.sub} />
            <Text style={s.rowLabel}>Connexion IA</Text>
            {keySaved && (
              <View style={s.keyBadge}>
                <Ionicons name="checkmark-circle" size={14} color={T.green.fg} />
                <Text style={s.keyBadgeText}>Connectée</Text>
              </View>
            )}
          </View>
          <View style={s.keyInputRow}>
            <TextInput
              style={s.keyInput}
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={T.faint}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={s.keyHint}>Obtenez votre clé sur console.anthropic.com</Text>
          <Btn full size="sm" onPress={saveKey} loading={saving} disabled={!keyInput.trim()}>
            {keySaved ? 'Mettre à jour la clé' : 'Enregistrer la clé'}
          </Btn>
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
          <View style={s.row}>
            <Ionicons name="volume-high-outline" size={20} color={T.sub} style={{ marginRight: 14 }} />
            <Text style={s.rowLabel}>Voix de bienvenue</Text>
            <Switch value={voice} onValueChange={toggleVoice} trackColor={{ true: T.primary }} />
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
  keyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  keyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.green.soft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  keyBadgeText: { fontSize: 12, fontWeight: '800', color: T.green.fg },
  keyInputRow: { borderWidth: 1, borderColor: T.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: T.surfaceAlt, marginBottom: 8 },
  keyInput: { fontSize: 15, fontWeight: '500', color: T.ink },
  keyHint: { fontSize: 12.5, color: T.faint, fontWeight: '500', marginBottom: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, backgroundColor: T.coral.soft, borderRadius: 18, padding: 16 },
});
