// screens3.jsx — ScanScreen + ResultScreen
// (relies on globals from icons.jsx, ui.jsx, art.jsx, screens1.jsx)

function ScanScreen({ go, toast }) {
  const t = useTheme();
  const [scanning, setScanning] = React.useState(false);
  const tips = ['Utilisez une bonne lumière', 'Cadrez toute la page', 'Évitez les photos floues'];

  const capture = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); go('result'); }, 2100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('home')} right={<Chip accent="green" solid><IconSparkle size={13} /> IA</Chip>} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 27, fontWeight: 800, color: t.ink, letterSpacing: -0.6, margin: 0 }}>Scanner une leçon</h1>
        <p style={{ fontSize: 15, color: t.sub, marginTop: 8, fontWeight: 500 }}>Prenez une photo claire de la leçon de votre enfant.</p>

        {/* viewfinder */}
        <div style={{
          marginTop: 20, borderRadius: 26, padding: 12,
          background: `linear-gradient(160deg, ${t.heroFrom}, ${t.heroTo})`,
          boxShadow: `0 18px 40px ${hexA(t.hero, 0.34)}`,
        }}>
          <div style={{
            borderRadius: 18, aspectRatio: '4 / 3', position: 'relative', overflow: 'hidden',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14,
          }}>
            {/* faux paper lines */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.10, padding: 26 }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ height: 2, background: '#fff', borderRadius: 2, margin: '15px 0', width: i % 3 === 2 ? '55%' : '100%' }} />
              ))}
            </div>
            <ScanArt color="#fff" />
            <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 15, letterSpacing: -0.2, position: 'relative' }}>
              {scanning ? 'Analyse en cours…' : 'Placez la leçon dans le cadre'}
            </div>
            {/* scan line */}
            {scanning && (
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, transparent, ${t.primary}, transparent)`,
                boxShadow: `0 0 16px 3px ${t.primary}`,
                animation: 'ppScan 1.1s ease-in-out infinite',
              }} />
            )}
          </div>
        </div>

        {/* tips */}
        <Card pad={6} style={{ marginTop: 16 }}>
          {tips.map((tip, i) => (
            <div key={tip} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
              borderBottom: i < tips.length - 1 ? `1px solid ${t.line}` : 'none',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: t.primarySoft,
                color: t.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><IconCheck size={15} sw={3} /></div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: t.ink, letterSpacing: -0.2 }}>{tip}</span>
            </div>
          ))}
        </Card>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={capture} icon={<IconCamera size={20} />}>
          {scanning ? 'Analyse…' : 'Prendre une photo'}
        </Btn>
        <div style={{ marginTop: 10 }}>
          <GhostBtn full onClick={() => toast('Galerie — bientôt')} icon={<IconGallery size={19} />}>Importer depuis la galerie</GhostBtn>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ go, toast }) {
  const t = useTheme();
  const notions = ['Les fractions', 'Numérateur', 'Dénominateur', 'Comparer des fractions'];
  const exos = [
    'Identifier le numérateur et le dénominateur',
    'Comparer deux fractions simples',
    'Compléter une fraction équivalente',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('scan')} right={<Chip accent="green" solid><IconSparkle size={13} /> Analysé</Chip>} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 27, fontWeight: 800, color: t.ink, letterSpacing: -0.6, margin: 0 }}>Résultat de la leçon</h1>
        <p style={{ fontSize: 15, color: t.sub, marginTop: 8, fontWeight: 500 }}>Voici ce que l'IA a compris. Vérifiez avant de valider.</p>

        {/* confiance — hero ring card */}
        <div style={{
          marginTop: 18, borderRadius: 24, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 18,
          background: `linear-gradient(150deg, ${t.heroFrom}, ${t.heroTo})`,
          boxShadow: `0 16px 36px ${hexA(t.hero, 0.32)}`,
        }}>
          <ProgressRing value={92} size={78} sw={9} color={t.primary}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>92%</span>
          </ProgressRing>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>Confiance de l'analyse</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, marginTop: 4, lineHeight: 1.4, fontWeight: 500 }}>
              Bonne lisibilité. Vérifiez les notions ci-dessous avant de valider.
            </div>
          </div>
        </div>

        {/* notions */}
        <ResultCard accent="green" icon={<IconCheckList />} title="Notions détectées">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {notions.map(n => (
              <span key={n} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, background: t.primarySoft,
                color: t.primaryDeep, borderRadius: 12, padding: '9px 13px', fontSize: 14, fontWeight: 700,
                letterSpacing: -0.2, whiteSpace: 'nowrap',
              }}>
                <IconCheck size={14} sw={3} /> {n}
              </span>
            ))}
          </div>
        </ResultCard>

        {/* résumé */}
        <ResultCard accent="blue" icon={<IconText />} title="Résumé simple">
          <p style={{ margin: 0, fontSize: 14.5, color: t.sub, lineHeight: 1.5, fontWeight: 500 }}>
            Cette leçon explique comment <strong style={{ color: t.ink }}>lire, comprendre et comparer</strong> des fractions, en distinguant le numérateur du dénominateur.
          </p>
        </ResultCard>

        {/* exercices */}
        <ResultCard accent="amber" icon={<IconEdit />} title="Exercices proposés">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {exos.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: t.accents.amber.soft,
                  color: t.accents.amber.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}>{i + 1}</div>
                <span style={{ fontSize: 14.5, color: t.ink, fontWeight: 600, letterSpacing: -0.2 }}>{e}</span>
              </div>
            ))}
          </div>
        </ResultCard>

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => go('validation')} icon={<IconCheck size={20} sw={2.6} />}>
          Valider le contenu
        </Btn>
        <div style={{ marginTop: 10 }}>
          <GhostBtn full onClick={() => toast('Édition — bientôt')} icon={<IconEdit size={19} />}>Modifier</GhostBtn>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ accent, icon, title, children }) {
  const t = useTheme();
  return (
    <Card pad={16} style={{ marginTop: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
        <Squircle accent={accent} icon={icon} size={36} r={11} iconSize={20} />
        <span style={{ fontWeight: 800, fontSize: 16.5, color: t.ink, letterSpacing: -0.3 }}>{title}</span>
      </div>
      {children}
    </Card>
  );
}

// ---- Parent validation -------------------------------------------------
function ValGroup({ status, items, go, toast }) {
  const t = useTheme();
  const s = STATUS[status];
  const a = t.accents[s.accent];
  return (
    <Card pad={16} style={{ marginTop: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 15.5, color: t.ink, letterSpacing: -0.3 }}>
          {status === 'confirme' ? 'Champs confirmés' : status === 'incertain' ? 'À vérifier' : 'À refaire'}
        </span>
        <StatusChip status={status} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
            background: t.dark ? hexA(a.solid, 0.1) : a.soft, borderRadius: 13,
          }}>
            <div style={{ color: a.fg, display: 'flex' }}>
              {status === 'confirme' ? <IconCheck size={18} sw={2.6} /> : status === 'incertain' ? <IconHelp size={18} /> : <IconAlert size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.sub }}>{it.label}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: t.ink, letterSpacing: -0.2 }}>{it.value}</div>
            </div>
            {status === 'incertain' && (
              <button onClick={() => toast('Édition du champ')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.fg, fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>Corriger</button>
            )}
            {status === 'erreur' && (
              <button onClick={() => go('photoFloue')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.fg, fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>Reprendre</button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ValidationScreen({ go, toast }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <SafeTop />
      <TopBar onBack={() => go('result')} />
      <div style={{ padding: '18px 18px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Hd title="Validation de l'analyse" sub="Le parent garde le contrôle. Vérifiez avant de générer le plan." />

        <ValGroup status="confirme" go={go} toast={toast} items={[
          { label: 'Matière', value: 'Mathématiques' },
          { label: 'Notion principale', value: 'Les fractions' },
        ]} />
        <ValGroup status="incertain" go={go} toast={toast} items={[
          { label: 'Date du contrôle', value: 'Jeudi 24 avril ?' },
        ]} />
        <ValGroup status="erreur" go={go} toast={toast} items={[
          { label: 'Bas de page', value: 'Photo trop floue à relire' },
        ]} />

        <div style={{ flex: 1, minHeight: 18 }} />
        <Btn full onClick={() => { toast('Analyse validée'); go('plan'); }} icon={<IconCheck size={20} sw={2.6} />}>
          Tout est correct
        </Btn>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <GhostBtn full onClick={() => toast('Édition')} icon={<IconEdit size={18} />}>Modifier</GhostBtn>
          <GhostBtn full onClick={() => go('photoFloue')} icon={<IconCamera size={18} />}>Reprendre</GhostBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScanScreen, ResultScreen, ResultCard, ValidationScreen, ValGroup });
