// screens4.jsx — ScanAgendaScreen, AgendaResultsScreen, PhotoFloueScreen
// (relies on globals from icons.jsx, ui.jsx, art.jsx, screens1.jsx)

function ScanAgendaScreen({ go, toast }) {
  const t = useTheme();
  const [scanning, setScanning] = React.useState(false);
  const tips = ['Bonne lumière, sans reflet', 'Cadrez la semaine entière', 'Texte bien lisible'];
  const capture = () => { setScanning(true); setTimeout(() => { setScanning(false); go('agendaResults'); }, 2000); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('home')} right={<Chip accent="blue" solid><IconSparkle size={13} /> IA</Chip>} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="Scanner l'agenda" sub="Prenez une photo nette de l'agenda ou du cahier de texte." />

        <div style={{
          marginTop: 16, borderRadius: 26, padding: 12,
          background: `linear-gradient(160deg, #1E2C66, #121A40)`,
          boxShadow: `0 18px 40px ${hexA('#16204D', 0.34)}`,
        }}>
          <div style={{
            borderRadius: 18, aspectRatio: '4 / 3', position: 'relative', overflow: 'hidden',
            background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.10, padding: 26 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, margin: '17px 0', alignItems: 'center' }}>
                  <div style={{ width: 38, height: 6, background: '#fff', borderRadius: 3 }} />
                  <div style={{ flex: 1, height: 6, background: '#fff', borderRadius: 3, opacity: 0.6 }} />
                </div>
              ))}
            </div>
            <ScanArt color="#fff" />
            <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 15, position: 'relative' }}>
              {scanning ? 'Lecture de l\u2019agenda…' : 'Placez l\u2019agenda dans le cadre'}
            </div>
            {scanning && <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #6E8BFF, transparent)', boxShadow: '0 0 16px 3px #6E8BFF', animation: 'ppScan 1.1s ease-in-out infinite' }} />}
          </div>
        </div>

        <Card pad={6} style={{ marginTop: 16 }}>
          {tips.map((tip, i) => (
            <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderBottom: i < tips.length - 1 ? `1px solid ${t.line}` : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: t.accents.blue.soft, color: t.accents.blue.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck size={15} sw={3} /></div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: t.ink }}>{tip}</span>
            </div>
          ))}
        </Card>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={capture} color={t.accents.blue.solid} deep="#2C44AE" icon={<IconCamera size={20} />}>
          {scanning ? 'Lecture…' : 'Prendre une photo'}
        </Btn>
        <div style={{ marginTop: 10 }}>
          <GhostBtn full onClick={() => toast('Galerie — bientôt')} icon={<IconGallery size={19} />}>Importer depuis la galerie</GhostBtn>
        </div>
      </div>
    </div>
  );
}

function AgendaResultsScreen({ go, toast }) {
  const t = useTheme();
  const items = [
    { subj: 'Maths',    type: 'Contrôle',      date: 'Jeu. 24 avr.', days: 'dans 5 jours', status: 'confirme', accent: 'green', icon: <IconSigma /> },
    { subj: 'Français', type: 'Dictée',        date: 'Mar. 29 avr.', days: 'dans 10 jours', status: 'confirme', accent: 'violet', icon: <IconBook /> },
    { subj: 'SVT',      type: 'Interrogation', date: 'Ven. 02 mai',  days: 'à vérifier', status: 'incertain', accent: 'coral', icon: <IconFlask /> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('scanAgenda')} right={<Chip accent="blue" solid><IconSparkle size={13} /> Analysé</Chip>} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="Contrôles détectés" sub="3 échéances trouvées. Confirmez pour les ajouter au suivi." />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 16 }}>
          {items.map((it, i) => (
            <Card key={i} pad={15}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <Squircle accent={it.accent} icon={it.icon} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: t.ink, letterSpacing: -0.3 }}>{it.subj}</span>
                    <span style={{ fontSize: 13, color: t.sub, fontWeight: 600 }}>· {it.type}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: t.sub, fontWeight: 600, marginTop: 2 }}>{it.date} · {it.days}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatusChip status={it.status} />
                <button onClick={() => toast('Modifier l\u2019échéance')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.primary, fontWeight: 800, fontSize: 13.5, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconEdit size={16} /> Modifier
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => { toast('Échéances enregistrées'); go('home'); }} icon={<IconCalendarCheck size={20} />}>
          Confirmer et enregistrer
        </Btn>
      </div>
    </div>
  );
}

function PhotoFloueScreen({ go, toast }) {
  const t = useTheme();
  const tips = ['Tenez le téléphone bien à plat', 'Évitez les ombres et reflets', 'Approchez-vous du texte'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('scan')} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4 }}>
          <Squircle accent="coral" icon={<IconAlert />} size={44} r={14} />
          <Hd title="Photo difficile à lire" />
        </div>
        <p style={{ fontSize: 15, color: t.sub, marginTop: 4, fontWeight: 500, lineHeight: 1.45 }}>
          La photo semble floue ou incomplète. Voici les zones à reprendre.
        </p>

        {/* mock page with highlighted blur zones */}
        <div style={{ marginTop: 16, borderRadius: 22, padding: 14, background: t.surfaceAlt, border: `1px solid ${t.line}` }}>
          <div style={{ borderRadius: 14, background: t.surface, padding: 16, position: 'relative', border: `1px solid ${t.line}` }}>
            {[100, 85, 92, 70].map((w, i) => (
              <div key={i} style={{ height: 9, width: `${w}%`, borderRadius: 4, background: t.lineStrong, margin: '12px 0' }} />
            ))}
            <div style={{ position: 'relative', marginTop: 14 }}>
              {[60, 48].map((w, i) => (
                <div key={i} style={{ height: 9, width: `${w}%`, borderRadius: 4, background: t.lineStrong, margin: '12px 0', filter: 'blur(2.5px)', opacity: 0.7 }} />
              ))}
              <div style={{
                position: 'absolute', inset: '-8px -10px', borderRadius: 12,
                border: `2px solid ${t.accents.coral.solid}`, background: hexA(t.accents.coral.solid, 0.08),
                display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
              }}>
                <span style={{ background: t.accents.coral.solid, color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999, transform: 'translateY(-50%)' }}>Flou</span>
              </div>
            </div>
          </div>
        </div>

        <Card pad={6} style={{ marginTop: 16 }}>
          {tips.map((tip, i) => (
            <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderBottom: i < tips.length - 1 ? `1px solid ${t.line}` : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: t.primarySoft, color: t.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck size={15} sw={3} /></div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: t.ink }}>{tip}</span>
            </div>
          ))}
        </Card>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => go('scan')} icon={<IconCamera size={20} />}>Reprendre la photo</Btn>
        <div style={{ marginTop: 10 }}>
          <GhostBtn full onClick={() => toast('Import d\u2019une autre image')} icon={<IconGallery size={19} />}>Importer une autre image</GhostBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScanAgendaScreen, AgendaResultsScreen, PhotoFloueScreen });
