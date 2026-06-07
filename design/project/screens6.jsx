// screens6.jsx — ProgressScreen, NotificationsScreen, SettingsScreen, PdfScreen, ComingSoonScreen
// (relies on globals from icons.jsx, ui.jsx, screens1.jsx, screens2.jsx)

function Seg({ options, value, onChange }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', background: t.surfaceAlt, borderRadius: 12, padding: 4, gap: 4 }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            flex: 1, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderRadius: 9,
            padding: '9px 6px', fontWeight: 700, fontSize: 13.5, letterSpacing: -0.2,
            background: on ? t.surface : 'transparent', color: on ? t.ink : t.sub,
            boxShadow: on ? t.shadowSm : 'none', transition: 'all .15s',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

function ProgressScreen({ go }) {
  const t = useTheme();
  const [range, setRange] = React.useState('Semaine');
  const bars = [40, 65, 55, 80, 70, 90, 60];
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const max = 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('children')} />
      <div style={{ padding: '14px 18px 28px', flex: 1 }}>
        <Hd title="Suivi de Maxime" sub="Progression et points clés." />
        <div style={{ marginTop: 14 }}><Seg options={['Semaine', 'Mois', 'Trimestre']} value={range} onChange={setRange} /></div>

        {/* global progress */}
        <Card pad={18} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProgressRing value={72} size={72} sw={8}><span style={{ fontSize: 18, fontWeight: 800, color: t.ink }}>72%</span></ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: t.ink }}>Progression globale</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, color: t.primaryDeep, fontWeight: 700, fontSize: 13.5 }}>
              <IconTrendUp size={17} /> +12% cette {range.toLowerCase()}
            </div>
          </div>
        </Card>

        {/* chart */}
        <Card pad={18} style={{ marginTop: 13 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: t.ink, marginBottom: 14 }}>Temps de révision</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 110 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', height: 90, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${(b / max) * 100}%`, borderRadius: 7, background: i === 5 ? `linear-gradient(${t.primary}, ${t.primaryDeep})` : t.primarySoft }} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: t.faint }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* points forts / à améliorer */}
        <div style={{ display: 'flex', gap: 11, marginTop: 13 }}>
          <Card pad={15} style={{ flex: 1 }}>
            <Squircle accent="green" icon={<IconTrendUp />} size={38} r={12} iconSize={20} />
            <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, marginTop: 10 }}>POINT FORT</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, marginTop: 2, letterSpacing: -0.2 }}>Calcul mental</div>
          </Card>
          <Card pad={15} style={{ flex: 1 }}>
            <Squircle accent="coral" icon={<IconTarget />} size={38} r={12} iconSize={20} />
            <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, marginTop: 10 }}>À AMÉLIORER</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, marginTop: 2, letterSpacing: -0.2 }}>Problèmes</div>
          </Card>
        </div>

        {/* matières */}
        <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, margin: '20px 2px 11px' }}>MATIÈRES SUIVIES</div>
        <Card pad={8}>
          {[{ s: 'Mathématiques', v: 78, a: 'green', i: <IconSigma /> }, { s: 'Français', v: 64, a: 'violet', i: <IconBook /> }, { s: 'Sciences', v: 71, a: 'coral', i: <IconFlask /> }].map((m, i, arr) => (
            <div key={m.s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderBottom: i < arr.length - 1 ? `1px solid ${t.line}` : 'none' }}>
              <Squircle accent={m.a} icon={m.i} size={38} r={12} iconSize={20} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: t.ink }}>{m.s}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: t.accents[m.a].fg }}>{m.v}%</span>
                </div>
                <ProgressBar value={m.v} color={t.accents[m.a].solid} h={7} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function NotificationsScreen({ go, toast }) {
  const t = useTheme();
  const groups = [
    { when: "Aujourd'hui", items: [
      { icon: <IconBolt />, a: 'amber', title: 'Exercice du jour prêt', body: 'Fractions · séance de 15 min', unread: true, to: 'exercices' },
      { icon: <IconClock />, a: 'green', title: 'Rappel de révision', body: 'Pensez à réviser avec Maxime ce soir', unread: true },
    ]},
    { when: 'Cette semaine', items: [
      { icon: <IconAlert />, a: 'coral', title: 'Contrôle dans 3 jours', body: 'Maths · jeudi 24 avril', to: 'plan' },
      { icon: <IconStar />, a: 'green', title: 'Objectif atteint 🎉', body: 'Maxime a terminé 5 jours d\u2019affilée' },
    ]},
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('home')} right={
        <button onClick={() => go('settings')} aria-label="Réglages" style={{ width: 44, height: 44, borderRadius: 14, cursor: 'pointer', background: t.surface, border: `1px solid ${t.line}`, boxShadow: t.shadowSm, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconGear size={20} /></button>
      } />
      <div style={{ padding: '14px 18px 28px', flex: 1 }}>
        <Hd title="Notifications" />
        {groups.map(g => (
          <div key={g.when}>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, margin: '20px 2px 10px' }}>{g.when.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.items.map((it, i) => (
                <button key={i} onClick={() => it.to ? go(it.to) : toast('Ouvert')} style={{
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
                  background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18, padding: 14, boxShadow: t.shadowSm,
                  display: 'flex', alignItems: 'center', gap: 13, position: 'relative',
                }}>
                  <Squircle accent={it.a} icon={it.icon} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: t.ink, letterSpacing: -0.2 }}>{it.title}</div>
                    <div style={{ fontSize: 13, color: t.sub, fontWeight: 500, marginTop: 2 }}>{it.body}</div>
                  </div>
                  {it.unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: t.accents.coral.solid, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => go('settings')} style={{ marginTop: 22, width: '100%', cursor: 'pointer', fontFamily: 'inherit', background: t.surfaceAlt, border: 'none', borderRadius: 16, padding: '15px', display: 'flex', alignItems: 'center', gap: 11, color: t.ink, fontWeight: 700, fontSize: 14.5 }}>
          <IconGear size={20} style={{ color: t.primary }} /> Paramètres de rappel <span style={{ flex: 1 }} /> <IconChevronRight size={18} style={{ color: t.faint }} />
        </button>
      </div>
    </div>
  );
}

function SettingsScreen({ go, toast, dark, onToggleDark }) {
  const t = useTheme();
  const Row = ({ icon, a, label, detail, control, onClick, danger, last }) => (
    <button onClick={onClick} style={{
      cursor: onClick ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left', width: '100%', background: 'none',
      border: 'none', padding: '13px 12px', display: 'flex', alignItems: 'center', gap: 13,
      borderBottom: last ? 'none' : `1px solid ${t.line}`,
    }}>
      <Squircle accent={a} icon={icon} size={36} r={11} iconSize={19} />
      <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: danger ? t.accents.coral.fg : t.ink, letterSpacing: -0.2 }}>{label}</span>
      {detail && <span style={{ fontSize: 13.5, color: t.faint, fontWeight: 600 }}>{detail}</span>}
      {control}
      {onClick && !control && <IconChevronRight size={18} style={{ color: t.faint }} />}
    </button>
  );
  const Toggle = ({ on, onClick }) => (
    <span onClick={(e) => { e.stopPropagation(); onClick(); }} style={{ width: 46, height: 28, borderRadius: 999, background: on ? t.primary : t.lineStrong, position: 'relative', transition: 'background .2s', flexShrink: 0, cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left .2s' }} />
    </span>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SafeTop h={56} />
        <div style={{ padding: '0 18px 24px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.ink, letterSpacing: -0.6 }}>Profil</div>

          {/* account card */}
          <Card pad={16} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(150deg, ${t.heroFrom}, ${t.heroTo})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>F</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: t.ink }}>Franck Martin</div>
              <div style={{ fontSize: 13.5, color: t.sub, fontWeight: 500 }}>Famille Martin · 2 enfants</div>
            </div>
            <Chip accent="green" solid style={{ fontSize: 11 }}>Premium</Chip>
          </Card>

          <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, margin: '20px 2px 10px' }}>COMPTE</div>
          <Card pad={6}>
            <Row icon={<IconUser />} a="blue" label="Compte" onClick={() => toast('Compte')} />
            <Row icon={<IconUsers />} a="green" label="Enfants" detail="2" onClick={() => go('children')} />
            <Row icon={<IconBell />} a="amber" label="Notifications" onClick={() => go('notifications')} last />
          </Card>

          <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, margin: '20px 2px 10px' }}>PRÉFÉRENCES</div>
          <Card pad={6}>
            <Row icon={<IconMoon />} a="violet" label="Mode sombre" control={<Toggle on={dark} onClick={onToggleDark} />} />
            <Row icon={<IconPdf />} a="coral" label="PDF imprimables" onClick={() => go('pdf')} />
            <Row icon={<IconLayers />} a="green" label="Bientôt disponible" onClick={() => go('coming')} last />
          </Card>

          <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, margin: '20px 2px 10px' }}>ASSISTANCE</div>
          <Card pad={6}>
            <Row icon={<IconHelp />} a="blue" label="Aide" onClick={() => toast('Centre d\u2019aide')} />
            <Row icon={<IconLogout />} a="coral" label="Déconnexion" danger onClick={() => { toast('Déconnecté'); go('welcome'); }} last />
          </Card>
        </div>
      </div>
      <TabBar active="profil" go={go} />
    </div>
  );
}

function PdfScreen({ go, toast }) {
  const t = useTheme();
  const lines = ['Plan de révision · Maths', 'Notions : les fractions', 'Exercices du jour (3)', 'Correction parent détaillée', 'Conseils d\u2019accompagnement'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('correction')} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="PDF prêt à imprimer" sub="Tout le nécessaire pour réviser hors écran." />

        {/* document preview */}
        <div style={{ marginTop: 18, alignSelf: 'center', width: 230, background: '#fff', borderRadius: 14, boxShadow: '0 18px 40px rgba(16,40,30,0.16)', border: `1px solid ${t.line}`, padding: 22, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, right: -10 }}><Squircle accent="coral" icon={<IconPdf />} size={40} r={12} iconSize={22} style={{ boxShadow: t.shadowSm, background: t.accents.coral.solid, color: '#fff' }} /></div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: t.primarySoft, color: t.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><IconCap size={24} /></div>
          <div style={{ height: 11, width: '75%', background: '#1F2A24', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 7, width: '55%', background: '#C9D2CC', borderRadius: 4, marginBottom: 18 }} />
          {[100, 92, 96, 70, 88].map((w, i) => <div key={i} style={{ height: 6, width: `${w}%`, background: '#E4E9E5', borderRadius: 3, margin: '9px 0' }} />)}
        </div>

        <Card pad={8} style={{ marginTop: 20 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 10px', borderBottom: i < lines.length - 1 ? `1px solid ${t.line}` : 'none' }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: t.primarySoft, color: t.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconCheck size={14} sw={3} /></div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: t.ink }}>{l}</span>
            </div>
          ))}
        </Card>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => toast('Téléchargement du PDF')} icon={<IconDownload size={20} />}>Télécharger le PDF</Btn>
        <div style={{ marginTop: 10 }}><GhostBtn full onClick={() => toast('Partage')} icon={<IconShare size={18} />}>Partager</GhostBtn></div>
      </div>
    </div>
  );
}

function ComingSoonScreen({ go }) {
  const t = useTheme();
  const items = [
    { icon: <IconChart />, a: 'green', title: 'Rapport mensuel', body: 'Un bilan clair envoyé chaque mois.' },
    { icon: <IconTrendUp />, a: 'blue', title: 'Comparaison et évolution', body: 'Suivez les progrès dans le temps.' },
    { icon: <IconSparkle />, a: 'amber', title: 'Intelligence pédagogique', body: 'Des conseils adaptés à chaque enfant.' },
    { icon: <IconShare />, a: 'violet', title: 'Partage professeur', body: 'Transmettez le suivi à l\u2019enseignant.' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('settings')} />
      <div style={{ padding: '14px 18px 28px', flex: 1 }}>
        <Hd title="À venir" sub="Ce qui arrive bientôt dans PROF PARENT IA." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {items.map((it, i) => (
            <Card key={i} pad={16} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Squircle accent={it.a} icon={it.icon} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, color: t.ink, letterSpacing: -0.3 }}>{it.title}</div>
                <div style={{ fontSize: 13, color: t.sub, fontWeight: 500, marginTop: 2, lineHeight: 1.35 }}>{it.body}</div>
              </div>
              <Chip accent="amber" style={{ fontSize: 11, flexShrink: 0 }}>Bientôt</Chip>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Seg, ProgressScreen, NotificationsScreen, SettingsScreen, PdfScreen, ComingSoonScreen });
