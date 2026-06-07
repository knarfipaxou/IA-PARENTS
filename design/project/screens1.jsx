// screens1.jsx — SafeTop, TopBar, WelcomeScreen, ProfileScreen
// (relies on globals from icons.jsx, ui.jsx, art.jsx)

function SafeTop({ h = 52 }) { return <div style={{ height: h, flexShrink: 0 }} />; }

// Back bar with optional step pill
function TopBar({ onBack, right }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 0' }}>
      <button onClick={onBack} aria-label="Retour" style={{
        width: 44, height: 44, borderRadius: 14, cursor: 'pointer',
        background: t.surface, border: `1px solid ${t.line}`, boxShadow: t.shadowSm,
        color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconArrowLeft size={21} />
      </button>
      {right}
    </div>
  );
}

function StepPill({ n, total }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i + 1 === n ? 22 : 8, height: 8, borderRadius: 999,
          background: i + 1 <= n ? t.primary : t.lineStrong, transition: 'all .3s',
        }} />
      ))}
    </div>
  );
}

// Shared page header (title + subtitle)
function Hd({ title, sub }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 4 }}>
      <h1 style={{ fontSize: 27, fontWeight: 800, color: t.ink, letterSpacing: -0.6, lineHeight: 1.12, margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 15, color: t.sub, marginTop: 8, lineHeight: 1.45, fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

// ---- Welcome -----------------------------------------------------------
function WelcomeScreen({ go }) {
  const t = useTheme();
  const features = [
    { k: 'blue',  icon: <IconScan />, label: 'Scanner',    desc: 'la leçon' },
    { k: 'amber', icon: <IconBulb />, label: 'Comprendre', desc: 'la méthode' },
    { k: 'green', icon: <IconCap />,  label: 'Réviser',     desc: 'ensemble' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <div style={{ padding: '8px 18px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* hero panel */}
        <div style={{
          borderRadius: 30, padding: '22px 22px 26px',
          background: `linear-gradient(160deg, ${t.heroFrom}, ${t.heroTo})`,
          boxShadow: `0 20px 44px ${hexA(t.hero, 0.40)}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 160, height: 160,
            borderRadius: '50%', background: hexA(t.primary, 0.16),
          }} />
          <HeroArt height={156} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 14 }}>
            <BrandMark size={52} />
            <div>
              <div style={{ color: '#fff', fontSize: 23, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>
                PROF PARENT <span style={{ color: t.primary }}>IA</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.66)', fontSize: 13, fontWeight: 600, marginTop: 5 }}>
                Le parent garde l'humain.
              </div>
            </div>
          </div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, lineHeight: 1.4, marginTop: 16, letterSpacing: -0.2 }}>
            L'IA apporte la méthode.<span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}> Scannez une leçon, vérifiez ce que l'IA a compris, puis révisez avec votre enfant.</span>
          </div>
        </div>

        {/* feature tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 18 }}>
          {features.map(f => (
            <Card key={f.label} pad={14} style={{ borderRadius: 20, textAlign: 'center' }}>
              <Squircle accent={f.k} icon={f.icon} size={44} style={{ margin: '0 auto 9px' }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: t.ink, letterSpacing: -0.2 }}>{f.label}</div>
              <div style={{ fontSize: 11.5, color: t.faint, marginTop: 1 }}>{f.desc}</div>
            </Card>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 18 }} />

        <Btn full onClick={() => go('family')} icon={<IconArrowRight size={20} />} style={{ flexDirection: 'row-reverse' }}>
          Commencer
        </Btn>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: t.sub, fontWeight: 500 }}>
          Déjà un compte ? <span style={{ color: t.primary, fontWeight: 700 }}>Se connecter</span>
        </div>
      </div>
    </div>
  );
}

// ---- Profile -----------------------------------------------------------
function Field({ label, value, placeholder, onChange, icon }) {
  const t = useTheme();
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.sub, marginBottom: 7, marginLeft: 2 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: t.surfaceAlt,
        borderRadius: 15, padding: '0 14px',
        border: `1.5px solid ${focus ? t.primary : 'transparent'}`,
        transition: 'border-color .15s', boxShadow: focus ? `0 0 0 4px ${hexA(t.primary, 0.12)}` : 'none',
      }}>
        {icon && <span style={{ color: focus ? t.primary : t.faint, display: 'flex' }}>{icon}</span>}
        <input value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            padding: '15px 0', fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
            color: t.ink, letterSpacing: -0.2,
          }} />
      </div>
    </label>
  );
}

function ProfileScreen({ go, state, setState }) {
  const t = useTheme();
  const classes = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
  const goals = [
    { id: 'comprendre', label: 'Mieux comprendre', sub: 'Saisir les notions en profondeur' },
    { id: 'controles',  label: 'Réussir les contrôles', sub: 'Être prêt le jour J' },
    { id: 'autonomie',  label: 'Gagner en autonomie', sub: 'Réviser seul, sereinement' },
  ];
  const set = (k, v) => setState(s => ({ ...s, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('family')} right={<StepPill n={2} total={2} />} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 27, fontWeight: 800, color: t.ink, letterSpacing: -0.6, lineHeight: 1.12, margin: 0 }}>
          Créer le profil<br />de votre enfant
        </h1>
        <p style={{ fontSize: 15, color: t.sub, marginTop: 9, lineHeight: 1.45, fontWeight: 500 }}>
          Ces informations nous aident à proposer des révisions adaptées.
        </p>

        <Card pad={18} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Prénom de l'enfant" value={state.prenom} placeholder="Maxime"
            onChange={v => set('prenom', v)} icon={<IconUser size={19} />} />

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.sub, marginBottom: 9, marginLeft: 2 }}>Classe</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {classes.map(c => {
                const on = state.classe === c;
                return (
                  <button key={c} onClick={() => set('classe', c)} style={{
                    cursor: 'pointer', borderRadius: 12, padding: '10px 15px',
                    fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, letterSpacing: -0.2,
                    background: on ? t.primary : t.surfaceAlt, color: on ? t.onPrimary : t.ink,
                    border: `1.5px solid ${on ? t.primary : 'transparent'}`,
                    boxShadow: on ? `0 3px 0 ${t.primaryDeep}` : 'none',
                    transform: on ? 'translateY(-1px)' : 'none', transition: 'all .12s',
                  }}>{c}</button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.sub, marginBottom: 9, marginLeft: 2 }}>Objectif principal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {goals.map(g => {
                const on = state.goal === g.id;
                return (
                  <button key={g.id} onClick={() => set('goal', g.id)} style={{
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    borderRadius: 15, padding: '13px 14px', fontFamily: 'inherit',
                    background: on ? t.primarySoft : t.surfaceAlt,
                    border: `1.5px solid ${on ? t.primary : 'transparent'}`, transition: 'all .14s',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                      border: `2px solid ${on ? t.primary : t.lineStrong}`,
                      background: on ? t.primary : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>{on && <IconCheck size={13} sw={3} />}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: t.ink, letterSpacing: -0.2 }}>{g.label}</div>
                      <div style={{ fontSize: 12.5, color: t.sub, marginTop: 1 }}>{g.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
          background: t.accents.blue.soft, color: t.accents.blue.fg,
          borderRadius: 15, padding: '13px 15px',
        }}>
          <IconInfo size={19} />
          <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>
            Vous pourrez modifier ces informations plus tard.
          </span>
        </div>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => go('home')} icon={<IconArrowRight size={20} />} style={{ flexDirection: 'row-reverse' }}>
          Continuer
        </Btn>
      </div>
    </div>
  );
}

// ---- Family creation ---------------------------------------------------
function FamilyScreen({ go, state, setState }) {
  const t = useTheme();
  const set = (k, v) => setState(s => ({ ...s, [k]: v }));
  const hasChild = state.prenom && state.prenom.trim();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('welcome')} right={<StepPill n={1} total={2} />} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="Créer ma famille" sub="Regroupez vos enfants dans un espace privé et sécurisé." />

        <Card pad={18} style={{ marginTop: 14 }}>
          <Field label="Nom de la famille" value={state.familyName} placeholder="Famille Martin"
            onChange={v => set('familyName', v)} icon={<IconUsers size={19} />} />
        </Card>

        <div style={{ fontSize: 13, fontWeight: 700, color: t.sub, margin: '20px 2px 9px' }}>Premier enfant</div>
        <button onClick={() => go('profile')} style={{
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
          background: hasChild ? t.surface : t.surfaceAlt, borderRadius: 20, padding: 16,
          border: hasChild ? `1px solid ${t.line}` : `1.5px dashed ${t.lineStrong}`,
          boxShadow: hasChild ? t.shadowSm : 'none',
          display: 'flex', alignItems: 'center', gap: 13,
        }}>
          {hasChild ? (
            <Squircle accent="green" icon={<IconCap />} size={48} r={15} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 15, flexShrink: 0, color: t.primary,
              background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><IconPlus size={24} /></div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: t.ink, letterSpacing: -0.3 }}>
              {hasChild ? state.prenom : 'Ajouter un enfant'}
            </div>
            <div style={{ fontSize: 13, color: t.sub, marginTop: 2, fontWeight: 500 }}>
              {hasChild ? `${state.classe || 'CM2'} · profil créé` : 'Prénom, classe et objectif'}
            </div>
          </div>
          <IconChevronRight size={20} style={{ color: t.faint }} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
          background: t.primarySoft, color: t.primaryDeep, borderRadius: 15, padding: '13px 15px',
        }}>
          <IconShield size={19} />
          <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>
            Vos données restent privées. Vous pourrez ajouter d'autres enfants plus tard.
          </span>
        </div>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => go('profile')} icon={<IconArrowRight size={20} />} style={{ flexDirection: 'row-reverse' }}>
          Continuer
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { SafeTop, TopBar, StepPill, Hd, WelcomeScreen, ProfileScreen, FamilyScreen });
