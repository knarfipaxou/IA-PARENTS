// screens2.jsx — HomeScreen + TabBar
// (relies on globals from icons.jsx, ui.jsx, art.jsx, screens1.jsx)

const TAB_ROUTE = { home: 'home', enfant: 'children', revis: 'plan', exo: 'exercices', profil: 'settings' };

function TabBar({ active = 'home', go }) {
  const t = useTheme();
  const tabs = [
    { id: 'home',   label: 'Accueil',   icon: IconHome },
    { id: 'enfant', label: 'Enfant',    icon: IconUsers },
    { id: 'revis',  label: 'Révisions', icon: IconReview },
    { id: 'exo',    label: 'Exercices', icon: IconEdit },
    { id: 'profil', label: 'Profil',    icon: IconUser },
  ];
  return (
    <div style={{
      flexShrink: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      padding: '10px 6px 22px', background: t.surface,
      borderTop: `1px solid ${t.line}`, boxShadow: '0 -6px 20px rgba(16,40,30,0.04)',
    }}>
      {tabs.map(tb => {
        const on = tb.id === active;
        const Icon = tb.icon;
        return (
          <button key={tb.id} onClick={() => go && go(TAB_ROUTE[tb.id])} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '2px 6px',
            color: on ? t.primary : t.faint, flex: 1,
          }}>
            <div style={{
              padding: '5px 16px', borderRadius: 999,
              background: on ? t.primarySoft : 'transparent', transition: 'background .2s',
            }}>
              <Icon size={23} sw={on ? 2.1 : 1.8} />
            </div>
            <span style={{ fontSize: 11, fontWeight: on ? 800 : 600, letterSpacing: -0.1 }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ActionTile({ accent, icon, title, desc, onClick, wide }) {
  const t = useTheme();
  const a = t.accents[accent];
  const [down, setDown] = React.useState(false);
  return (
    <button onClick={onClick}
      onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      style={{
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%',
        background: t.surface, border: `1px solid ${t.line}`, borderRadius: 22,
        padding: wide ? '16px 18px' : 14, boxShadow: t.shadowSm,
        transform: down ? 'translateY(2px)' : 'none', transition: 'transform .1s',
        display: 'flex', alignItems: 'center', gap: wide ? 14 : 0,
        flexDirection: wide ? 'row' : 'column',
      }}>
      <Squircle accent={accent} icon={icon} size={wide ? 50 : 44}
        style={wide ? {} : { marginBottom: 10, alignSelf: 'flex-start' }} />
      <div style={{ flex: wide ? 1 : undefined }}>
        <div style={{ fontWeight: 800, fontSize: wide ? 16 : 14, color: t.ink, letterSpacing: -0.3, lineHeight: 1.2, minHeight: wide ? undefined : 34 }}>{title}</div>
        <div style={{ fontSize: wide ? 13 : 11.5, color: t.sub, marginTop: 3, lineHeight: 1.3, fontWeight: 500 }}>{desc}</div>
      </div>
      {wide && <div style={{ color: a.fg }}><IconArrowRight size={20} /></div>}
    </button>
  );
}

function HomeScreen({ go, state, toast }) {
  const t = useTheme();
  const prenom = state.prenom || 'Maxime';
  const upcoming = [
    { accent: 'green', icon: <IconSigma />,    subj: 'Maths',    info: 'Contrôle', days: 5 },
    { accent: 'violet',icon: <IconBook />,     subj: 'Français', info: 'Dictée',   days: 7 },
    { accent: 'coral', icon: <IconFlask />,    subj: 'Sciences', info: 'Exposé',    days: 10 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SafeTop h={56} />
        <div style={{ padding: '0 18px 24px' }}>
          {/* greeting */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.ink, letterSpacing: -0.6 }}>Bonjour, Franck</div>
              <div style={{ fontSize: 14.5, color: t.sub, marginTop: 3, fontWeight: 500 }}>Voici le suivi de votre enfant.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button onClick={() => go('notifications')} aria-label="Notifications" style={{
                width: 42, height: 42, borderRadius: 13, cursor: 'pointer', position: 'relative',
                background: t.surface, border: `1px solid ${t.line}`, boxShadow: t.shadowSm,
                color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconBell size={20} />
                <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 999, background: t.accents.coral.solid, border: `2px solid ${t.surface}` }} />
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, background: t.accents.amber.soft,
                color: t.accents.amber.fg, borderRadius: 999, padding: '8px 13px',
                fontWeight: 800, fontSize: 14,
              }}>
                <IconBolt size={17} /> 5 j
              </div>
            </div>
          </div>

          {/* primary action */}
          <div style={{ marginTop: 18 }}>
            <ActionTile wide accent="green" icon={<IconCamera />} title="Scanner une leçon"
              desc="Extraire notions, formules et exercices" onClick={() => go('scan')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 11 }}>
            <ActionTile accent="blue" icon={<IconCalendar />} title="Scanner l'agenda" desc="Contrôles & échéances" onClick={() => go('scanAgenda')} />
            <ActionTile accent="amber" icon={<IconTarget />} title="Préparer un contrôle" desc="Plan de révision" onClick={() => go('plan')} />
          </div>

          {/* mon enfant */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 12px' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: t.ink, letterSpacing: -0.4 }}>Mon enfant</span>
            <button onClick={() => go('children')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: t.primary, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 2 }}>
              Tous <IconChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => go('progress')} style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Card pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Squircle accent="green" icon={<IconCap />} size={50} r={16} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: t.ink, letterSpacing: -0.3 }}>{prenom}</div>
                <div style={{ fontSize: 13, color: t.sub, fontWeight: 600 }}>{state.classe || 'CM2'} · 10 ans</div>
              </div>
              <Chip accent="green"><IconCheck size={13} sw={3} /> À jour</Chip>
            </div>

            <div style={{
              marginTop: 15, display: 'flex', alignItems: 'center', gap: 11,
              background: t.primarySoft, borderRadius: 15, padding: '13px 15px',
            }}>
              <IconClock size={20} style={{ color: t.primaryDeep, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: t.primaryDeep, letterSpacing: -0.2 }}>
                Aujourd'hui · réviser les fractions
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.primaryDeep }}>15 min</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <ProgressRing value={65} size={66} sw={8}>
                <span style={{ fontSize: 17, fontWeight: 800, color: t.ink }}>65%</span>
              </ProgressRing>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>Progression de la révision</div>
                <div style={{ fontSize: 12.5, color: t.sub, marginTop: 2, lineHeight: 1.35, fontWeight: 500 }}>
                  Plus que 2 notions avant le contrôle de maths.
                </div>
              </div>
            </div>
          </Card>
          </button>

          {/* à venir */}
          <SectionTitle>À venir cette semaine</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(u => (
              <Card key={u.subj} pad={13} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <Squircle accent={u.accent} icon={u.icon} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: t.ink, letterSpacing: -0.3 }}>{u.subj}</div>
                  <div style={{ fontSize: 13, color: t.sub, fontWeight: 500 }}>{u.info}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: t.accents[u.accent].fg, lineHeight: 1 }}>{u.days}</div>
                  <div style={{ fontSize: 11, color: t.faint, fontWeight: 600 }}>jours</div>
                </div>
              </Card>
            ))}
          </div>

          {/* conseil */}
          <div style={{
            marginTop: 18, borderRadius: 22, padding: '16px 18px',
            background: `linear-gradient(150deg, ${t.heroFrom}, ${t.heroTo})`,
            display: 'flex', gap: 13, alignItems: 'flex-start',
            boxShadow: `0 14px 30px ${hexA(t.hero, 0.3)}`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13, flexShrink: 0, color: t.accents.amber.solid,
              background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><IconSparkle size={22} /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14.5, letterSpacing: -0.2 }}>Conseil du jour</div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13.5, marginTop: 3, lineHeight: 1.4, fontWeight: 500 }}>
                Réviser 15 minutes chaque jour vaut mieux que 2 heures la veille.
              </div>
            </div>
          </div>
        </div>
      </div>
      <TabBar active="home" go={go} />
    </div>
  );
}

function SectionTitle({ children }) {
  const t = useTheme();
  return <div style={{ fontSize: 18, fontWeight: 800, color: t.ink, letterSpacing: -0.4, margin: '24px 0 12px' }}>{children}</div>;
}

// Reusable child card
function ChildCard({ child, go }) {
  const t = useTheme();
  return (
    <button onClick={() => go && go('progress')} style={{
      display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 22, padding: 16, boxShadow: t.shadowSm,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <ProgressRing value={child.progress} size={56} sw={7}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: t.ink }}>{child.progress}%</span>
        </ProgressRing>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: t.ink, letterSpacing: -0.3 }}>{child.name}</div>
          <div style={{ fontSize: 13, color: t.sub, fontWeight: 600 }}>{child.classe} · {child.age} ans</div>
        </div>
        <IconChevronRight size={20} style={{ color: t.faint }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13, paddingTop: 13, borderTop: `1px solid ${t.line}` }}>
        <Squircle accent={child.accent} icon={child.icon} size={32} r={10} iconSize={18} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: t.ink, flex: 1 }}>Prochain : {child.next}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: t.accents[child.accent].fg }}>J-{child.inDays}</span>
      </div>
    </button>
  );
}

function ChildrenScreen({ go }) {
  const t = useTheme();
  const kids = [
    { name: 'Maxime', classe: 'CM2', age: 10, progress: 65, next: 'Contrôle de maths', inDays: 5, accent: 'green', icon: <IconSigma /> },
    { name: 'Léa',    classe: '6e',  age: 11, progress: 82, next: 'Dictée de français', inDays: 7, accent: 'violet', icon: <IconBook /> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SafeTop h={56} />
        <div style={{ padding: '0 18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.ink, letterSpacing: -0.6 }}>Mes enfants</div>
              <div style={{ fontSize: 14.5, color: t.sub, marginTop: 3, fontWeight: 500 }}>2 profils suivis</div>
            </div>
            <button onClick={() => go('profile')} aria-label="Ajouter" style={{
              width: 44, height: 44, borderRadius: 14, cursor: 'pointer', color: '#fff',
              background: t.primary, border: 'none', boxShadow: `0 3px 0 ${t.primaryDeep}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><IconPlus size={22} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {kids.map(k => <ChildCard key={k.name} child={k} go={go} />)}

            <button onClick={() => go('profile')} style={{
              cursor: 'pointer', fontFamily: 'inherit', width: '100%',
              background: t.surfaceAlt, borderRadius: 22, padding: 18,
              border: `1.5px dashed ${t.lineStrong}`, display: 'flex', alignItems: 'center', gap: 13,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0, color: t.primary,
                background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><IconPlus size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, color: t.ink, letterSpacing: -0.3 }}>Ajouter un enfant</div>
                <div style={{ fontSize: 13, color: t.sub, fontWeight: 500, marginTop: 1 }}>Créer un nouveau profil</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <TabBar active="enfant" go={go} />
    </div>
  );
}

Object.assign(window, { TabBar, TAB_ROUTE, ActionTile, HomeScreen, SectionTitle, ChildCard, ChildrenScreen });
