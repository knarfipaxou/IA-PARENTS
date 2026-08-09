import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HC, FONT } from '../../constants/handoff';
import { PhysicalButton } from '../../components/ui/PhysicalButton';
import { useChild } from '../../contexts/ChildContext';
import { getApiKey, setApiKey } from '../../services/ai';
import { useScheme, setDarkMode } from '../../lib/useScheme';
import { isVoiceEnabled, setVoiceEnabled } from '../../lib/greeting';
import { logout } from '../../lib/auth';

function Row({ icon, label, value, onPress, showArrow = true }: { icon: string; label: string; value?: string; onPress?: () => void; showArrow?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row} activeOpacity={onPress ? 0.7 : 1}>
      <Ionicons name={icon as any} size={20} color={HC.sub} style={{ marginRight: 14 }} />
      <Text style={s.rowLabel}>{label}</Text>
      {value && <Text style={s.rowValue}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={18} color={HC.faint} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { children } = useChild();
  const activeCount = children.filter((c) => !c.archived).length;
  const archivedCount = children.filter((c) => c.archived).length;
  const dark = useScheme() === 'dark';
  const [notifs, setNotifs] = React.useState(true);
  const [voice, setVoice] = React.useState(true);
  React.useEffect(() => { isVoiceEnabled().then(setVoice); }, []);
  function toggleVoice(on: boolean) { setVoice(on); setVoiceEnabled(on); }
  const [keyInput, setKeyInput] = React.useState('');
  const [keySaved, setKeySaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { getApiKey().then((k) => setKeySaved(!!k)); }, []);

  async function saveKey() {
    if (!keyInput.trim()) return;
    setSaving(true);
    await setApiKey(keyInput.trim());
    setKeyInput('');
    setKeySaved(true);
    setSaving(false);
  }

  async function signOut() {
    await logout();
    router.replace('/(onboarding)/welcome' as any);
  }

  const track = { false: 'rgba(255,255,255,0.12)', true: HC.green };

  return (
    <View style={{ flex: 1, backgroundColor: HC.bgApp }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={HC.sub} />
            </Pressable>
            <Text style={s.title}>Réglages</Text>
          </View>

          <View style={s.profileCard}>
            <View style={s.avatar}>
              <Ionicons name="person" size={26} color={HC.greenLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.profileName}>Franck</Text>
              <Text style={s.profileEmail}>frankipascoet@gmail.com</Text>
            </View>
          </View>

          <Text style={s.sectionLabel}>COMPTE</Text>
          <View style={s.card}>
            <Row icon="people-outline" label="Mes enfants" value={`${activeCount} ${activeCount > 1 ? 'profils' : 'profil'}`} showArrow={false} />
            <View style={s.divider} />
            <Row icon="archive-outline" label="Enfants archivés" value={`${archivedCount}`} onPress={() => router.push('/archived-children' as any)} />
          </View>

          <Text style={s.sectionLabel}>CLÉ API CLAUDE</Text>
          <View style={[s.card, { padding: 16 }]}>
            <View style={s.keyHeader}>
              <Ionicons name="key-outline" size={20} color={HC.sub} />
              <Text style={[s.rowLabel, { flex: 0 }]}>Connexion IA</Text>
              {keySaved && (
                <View style={s.keyBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={HC.greenLight} />
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
                placeholderTextColor={HC.faint}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={s.keyHint}>Obtenez votre clé sur console.anthropic.com</Text>
            <PhysicalButton
              label={saving ? '…' : keySaved ? 'METTRE À JOUR LA CLÉ' : 'ENREGISTRER LA CLÉ'}
              variant="parent"
              disabled={!keyInput.trim() || saving}
              onPress={saveKey}
            />
          </View>

          <Text style={s.sectionLabel}>PRÉFÉRENCES</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Ionicons name="moon-outline" size={20} color={HC.sub} style={{ marginRight: 14 }} />
              <Text style={s.rowLabel}>Mode sombre</Text>
              <Switch value={dark} onValueChange={setDarkMode} trackColor={track} thumbColor="#fff" />
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <Ionicons name="notifications-outline" size={20} color={HC.sub} style={{ marginRight: 14 }} />
              <Text style={s.rowLabel}>Rappels de révision</Text>
              <Switch value={notifs} onValueChange={setNotifs} trackColor={track} thumbColor="#fff" />
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <Ionicons name="volume-high-outline" size={20} color={HC.sub} style={{ marginRight: 14 }} />
              <Text style={s.rowLabel}>Voix de bienvenue</Text>
              <Switch value={voice} onValueChange={toggleVoice} trackColor={track} thumbColor="#fff" />
            </View>
          </View>

          <View style={s.kitFooter}>
            <Ionicons name="paw" size={18} color={HC.cyan} />
            <Text style={s.kitFooterTxt}>Kitsune accompagne vos enfants dans leurs missions.</Text>
          </View>

          <TouchableOpacity onPress={signOut} style={s.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={HC.coral} />
            <Text style={s.logoutTxt}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  title: { fontFamily: FONT.num, fontSize: 24, color: HC.ink },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8,
    backgroundColor: '#1B2238', borderRadius: 22, padding: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(22,178,110,0.16)', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontFamily: FONT.num, fontSize: 18, color: HC.ink },
  profileEmail: { fontFamily: FONT.body, fontSize: 13, color: HC.sub, marginTop: 2 },
  sectionLabel: { fontFamily: FONT.bodySemi, fontSize: 12, letterSpacing: 1.2, color: HC.faint, marginTop: 22, marginBottom: 9, marginLeft: 2 },
  card: { backgroundColor: '#1B2238', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowLabel: { flex: 1, fontFamily: FONT.num, fontSize: 15.5, color: HC.ink },
  rowValue: { fontFamily: FONT.body, fontSize: 14, color: HC.sub, marginRight: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
  keyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  keyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(22,178,110,0.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 'auto' },
  keyBadgeText: { fontFamily: FONT.bodyBold, fontSize: 12, color: HC.greenLight },
  keyInputRow: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 14, paddingHorizontal: 14, backgroundColor: 'rgba(0,0,0,0.25)', marginBottom: 8 },
  keyInput: { fontFamily: FONT.body, fontSize: 15, color: HC.ink, paddingVertical: 12 },
  keyHint: { fontFamily: FONT.body, fontSize: 12.5, color: HC.faint, marginBottom: 14 },
  kitFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 22,
    backgroundColor: '#1B2238', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', padding: 14,
  },
  kitFooterTxt: { flex: 1, fontFamily: FONT.num, fontSize: 14, color: HC.sub, lineHeight: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, paddingVertical: 14 },
  logoutTxt: { fontFamily: FONT.bodyBold, fontSize: 15, color: HC.coral },
});
