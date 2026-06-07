// screens5.jsx — PlanScreen, ExercisesScreen, CorrectionScreen, MockTestScreen
// (relies on globals from icons.jsx, ui.jsx, screens1.jsx, screens2.jsx)

function PlanScreen({ go, toast }) {
  const t = useTheme();
  const steps = [
    { d: 'J-7', label: 'Relire la leçon',          state: 'done' },
    { d: 'J-6', label: 'Exercices guidés',          state: 'done' },
    { d: 'J-5', label: 'Problèmes d\u2019application', state: 'today' },
    { d: 'J-4', label: 'Entraînement ciblé',        state: 'next' },
    { d: 'J-3', label: 'Exercices type contrôle',   state: 'next' },
    { d: 'J-2', label: 'Contrôle blanc',            state: 'next', go: 'mockTest' },
    { d: 'J-1', label: 'Révision finale',           state: 'next' },
  ];
  const color = (s) => s === 'done' ? t.primary : s === 'today' ? t.accents.amber.solid : t.lineStrong;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SafeTop h={56} />
        <div style={{ padding: '0 18px 24px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.ink, letterSpacing: -0.6 }}>Plan de révision</div>
          <div style={{ fontSize: 14.5, color: t.sub, marginTop: 3, fontWeight: 500 }}>Adapté au rythme de Maxime.</div>

          {/* exam header card */}
          <div style={{
            marginTop: 16, borderRadius: 22, padding: '16px 18px',
            background: `linear-gradient(150deg, ${t.heroFrom}, ${t.heroTo})`,
            boxShadow: `0 14px 30px ${hexA(t.hero, 0.3)}`, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <Squircle accent="green" icon={<IconSigma />} size={48} style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>Contrôle de Maths</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>Jeudi 24 avril · dans 5 jours</div>
            </div>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>5</div>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700 }}>jours</div>
            </div>
          </div>

          {/* timeline */}
          <div style={{ marginTop: 22, position: 'relative' }}>
            {steps.map((s, i) => (
              <div key={s.d} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                {/* connector + dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 30, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999, flexShrink: 0, zIndex: 1,
                    background: s.state === 'next' ? t.surface : color(s.state),
                    border: s.state === 'next' ? `2px solid ${t.lineStrong}` : 'none',
                    boxShadow: s.state === 'today' ? `0 0 0 5px ${hexA(t.accents.amber.solid, 0.18)}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    {s.state === 'done' ? <IconCheck size={15} sw={3} /> : s.state === 'today' ? <span style={{ width: 7, height: 7, borderRadius: 999, background: '#fff' }} /> : <span style={{ fontSize: 11, fontWeight: 800, color: t.faint }}>{i + 1}</span>}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2.5, flex: 1, minHeight: 26, background: s.state === 'done' ? t.primary : t.line }} />}
                </div>
                {/* card */}
                <button onClick={() => s.go ? go(s.go) : (s.state === 'today' ? go('exercices') : toast(s.label))} style={{
                  flex: 1, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12,
                  background: s.state === 'today' ? t.surface : 'transparent',
                  border: s.state === 'today' ? `1px solid ${t.line}` : 'none',
                  boxShadow: s.state === 'today' ? t.shadowSm : 'none',
                  borderRadius: 16, padding: s.state === 'today' ? '12px 14px' : '4px 0',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: s.state === 'today' ? t.accents.amber.fg : t.faint }}>{s.d}</span>
                      {s.state === 'today' && <Chip accent="amber" style={{ padding: '3px 9px', fontSize: 11 }}>Aujourd'hui</Chip>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.state === 'next' ? t.sub : t.ink, letterSpacing: -0.2, marginTop: 2 }}>{s.label}</div>
                  </div>
                  {(s.state === 'today' || s.go) && <IconChevronRight size={18} style={{ color: t.faint }} />}
                </button>
              </div>
            ))}
          </div>

          <Btn full onClick={() => go('exercices')} icon={<IconArrowRight size={20} />} style={{ flexDirection: 'row-reverse', marginTop: 6 }}>
            Voir les exercices du jour
          </Btn>
        </div>
      </div>
      <TabBar active="revis" go={go} />
    </div>
  );
}

function ExercisesScreen({ go, toast }) {
  const t = useTheme();
  const exos = [
    { q: 'Quelle fraction est la plus grande ?', opts: ['1/2', '3/4', '2/5'], correct: 1, diff: 'Facile' },
    { q: 'Le numérateur de 7/9 est :', opts: ['9', '7', '16'], correct: 1, diff: 'Moyen' },
    { q: 'Fraction équivalente à 1/2 :', opts: ['2/3', '3/6', '4/9'], correct: 1, diff: 'Moyen' },
  ];
  const [picks, setPicks] = React.useState({});
  const diffAccent = (d) => d === 'Facile' ? 'green' : d === 'Moyen' ? 'amber' : 'coral';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SafeTop h={56} />
        <div style={{ padding: '0 18px 24px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.ink, letterSpacing: -0.6 }}>Exercices du jour</div>
          <div style={{ fontSize: 14.5, color: t.sub, marginTop: 3, fontWeight: 500 }}>Fractions · séance de 15 minutes</div>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 11, background: t.primarySoft, borderRadius: 16, padding: '13px 15px' }}>
            <IconTarget size={20} style={{ color: t.primaryDeep }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: t.primaryDeep, flex: 1, letterSpacing: -0.2 }}>Objectif : comparer et reconnaître des fractions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 16 }}>
            {exos.map((ex, i) => (
              <Card key={i} pad={16}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: t.faint }}>EXERCICE {i + 1}</span>
                  <Chip accent={diffAccent(ex.diff)} style={{ fontSize: 11, padding: '4px 10px' }}>{ex.diff}</Chip>
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: t.ink, letterSpacing: -0.2, marginBottom: 12 }}>{ex.q}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ex.opts.map((o, j) => {
                    const picked = picks[i] === j;
                    return (
                      <button key={j} onClick={() => setPicks(p => ({ ...p, [i]: j }))} style={{
                        cursor: 'pointer', fontFamily: 'inherit', borderRadius: 13, padding: '11px 18px',
                        fontWeight: 800, fontSize: 15.5, letterSpacing: -0.2,
                        background: picked ? t.primary : t.surfaceAlt, color: picked ? t.onPrimary : t.ink,
                        border: `1.5px solid ${picked ? t.primary : 'transparent'}`,
                        boxShadow: picked ? `0 3px 0 ${t.primaryDeep}` : 'none', transition: 'all .12s',
                      }}>{o}</button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <Btn full onClick={() => go('correction')} icon={<IconCheckList size={20} />} style={{ marginTop: 18 }}>
            Voir la correction
          </Btn>
          <div style={{ marginTop: 10 }}>
            <GhostBtn full onClick={() => { toast('Repris plus tard'); go('home'); }} icon={<IconClock size={18} />}>Terminer plus tard</GhostBtn>
          </div>
        </div>
      </div>
      <TabBar active="exo" go={go} />
    </div>
  );
}

function CorrectionScreen({ go, toast }) {
  const t = useTheme();
  const Block = ({ accent, icon, title, children }) => (
    <Card pad={16} style={{ marginTop: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 11 }}>
        <Squircle accent={accent} icon={icon} size={34} r={11} iconSize={19} />
        <span style={{ fontWeight: 800, fontSize: 15.5, color: t.ink, letterSpacing: -0.3 }}>{title}</span>
      </div>
      {children}
    </Card>
  );
  const txt = { fontSize: 14.5, color: t.sub, lineHeight: 1.5, fontWeight: 500, margin: 0 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('exercices')} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="Correction détaillée" sub="Pensée pour le parent : claire, sans jargon." />

        <Block accent="blue" icon={<IconText />} title="Énoncé">
          <p style={txt}>Quelle fraction est la plus grande : 1/2, 3/4 ou 2/5 ?</p>
        </Block>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 13, background: t.primarySoft, borderRadius: 16, padding: '15px' }}>
          <IconCheck size={22} sw={3} style={{ color: t.primaryDeep }} />
          <div><div style={{ fontSize: 12.5, fontWeight: 700, color: t.primaryDeep }}>Réponse correcte</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.primaryDeep, letterSpacing: -0.3 }}>3/4</div></div>
        </div>
        <Block accent="green" icon={<IconBulb />} title="Explication simple">
          <p style={txt}>Sur 4 parts, on en prend 3 : c'est presque tout. 1/2 c'est la moitié, et 2/5 c'est moins de la moitié. Donc <strong style={{ color: t.ink }}>3/4 est la plus grande</strong>.</p>
        </Block>
        <Block accent="coral" icon={<IconAlert />} title="Erreurs fréquentes">
          <p style={txt}>Comparer uniquement les numérateurs (3 &gt; 2 &gt; 1) sans regarder le dénominateur.</p>
        </Block>
        <Block accent="amber" icon={<IconHeart />} title="Conseil parent">
          <p style={txt}>Dessinez une pizza coupée en parts : voir aide souvent plus que calculer.</p>
        </Block>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => go('pdf')} icon={<IconDownload size={20} />}>Télécharger en PDF</Btn>
      </div>
    </div>
  );
}

function MockTestScreen({ go, toast }) {
  const t = useTheme();
  const parts = [
    { n: 'Calculs et automatismes', q: 4, icon: <IconSigma />, accent: 'green' },
    { n: 'Problèmes',               q: 5, icon: <IconBulb />, accent: 'amber' },
    { n: 'Géométrie',               q: 3, icon: <IconTarget />, accent: 'blue' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('plan')} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="Contrôle blanc" sub="Simulé dans les conditions du contrôle de maths." />

        <div style={{ display: 'flex', gap: 11, marginTop: 16 }}>
          {[{ v: '45', u: 'minutes', icon: <IconClock /> }, { v: '12', u: 'questions', icon: <IconCheckList /> }].map((s, i) => (
            <Card key={i} pad={16} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: t.primary, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{React.cloneElement(s.icon, { size: 24 })}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.ink, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12.5, color: t.sub, fontWeight: 600, marginTop: 3 }}>{s.u}</div>
            </Card>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: t.sub, margin: '20px 2px 11px', letterSpacing: 0.2 }}>3 PARTIES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {parts.map((p, i) => (
            <Card key={i} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Squircle accent={p.accent} icon={p.icon} size={44} />
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15.5, color: t.ink, letterSpacing: -0.2 }}>{p.n}</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: t.faint }}>{p.q} Q</span>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, background: t.accents.blue.soft, color: t.accents.blue.fg, borderRadius: 15, padding: '13px 15px' }}>
          <IconInfo size={19} />
          <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>Correction parent fournie à la fin, question par question.</span>
        </div>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => toast('Contrôle blanc — démarrage')} icon={<IconPlay size={18} />}>Commencer</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { PlanScreen, ExercisesScreen, CorrectionScreen, MockTestScreen });
