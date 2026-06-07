// art.jsx — Brilliant-style geometric illustrations for PROF PARENT IA
// Exposes: BrandMark, HeroArt, ScanArt, MethodBadge

// Rounded squircle brand mark with a geometric "spark" glyph.
function BrandMark({ size = 64, r, style }) {
  const t = useTheme();
  const rad = r != null ? r : size * 0.30;
  return (
    <div style={{
      width: size, height: size, borderRadius: rad, position: 'relative',
      background: `linear-gradient(150deg, ${t.heroFrom}, ${t.hero})`,
      boxShadow: `0 ${size*0.09}px ${size*0.22}px ${hexA(t.hero, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.12)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style,
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40">
        {/* four-petal spark */}
        <g fill={t.primary}>
          <path d="M20 2c1.5 7 4 9.5 11 11-7 1.5-9.5 4-11 11-1.5-7-4-9.5-11-11 7-1.5 9.5-4 11-11Z" opacity="0.95"/>
        </g>
        <circle cx="20" cy="20" r="3.4" fill="#fff"/>
        <circle cx="32.5" cy="9" r="2.1" fill={t.accents.amber.solid}/>
        <circle cx="8" cy="31" r="1.7" fill="#fff" opacity="0.85"/>
      </svg>
    </div>
  );
}

// Hero geometric scene — floating learning tokens. Designed to sit on a deep panel.
function HeroArt({ height = 168 }) {
  const t = useTheme();
  const ink = '#fff';
  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <svg viewBox="0 0 320 168" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        {/* soft orbit rings */}
        <circle cx="160" cy="86" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
        <circle cx="160" cy="86" r="54" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" strokeDasharray="2 7"/>

        {/* central concept disc — a fraction pie */}
        <g transform="translate(160 86)">
          <circle r="40" fill={hexA(t.primary, 0.16)} stroke={t.primary} strokeWidth="2.5"/>
          <path d="M0 0 L0 -40 A40 40 0 0 1 34.6 20 Z" fill={t.primary} opacity="0.9"/>
          <line x1="0" y1="0" x2="0" y2="-40" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="0" y1="0" x2="34.6" y2="20" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          <circle r="3" fill="#fff"/>
        </g>

        {/* orbiting tokens */}
        {/* plus */}
        <g transform="translate(64 44)">
          <rect x="-15" y="-15" width="30" height="30" rx="9" fill={t.accents.amber.solid}/>
          <path d="M0 -7V7M-7 0H7" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
        </g>
        {/* triangle */}
        <g transform="translate(252 50) rotate(12)">
          <rect x="-16" y="-16" width="32" height="32" rx="10" fill={t.accents.blue.solid}/>
          <path d="M0 -8 L8 7 H-8 Z" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round"/>
        </g>
        {/* star */}
        <g transform="translate(244 132)">
          <rect x="-14" y="-14" width="28" height="28" rx="9" fill="#fff"/>
          <path d="M0 -8l2.2 4.7 5.1.6-3.8 3.5 1 5L0 8.7l-4.5 2.6 1-5-3.8-3.5 5.1-.6Z" fill={t.accents.amber.solid}/>
        </g>
        {/* check */}
        <g transform="translate(70 128)">
          <rect x="-15" y="-15" width="30" height="30" rx="9" fill={t.primary}/>
          <path d="M-6 0l4 4 8-8.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
    </div>
  );
}

// Scan viewfinder corner brackets (for the scan screen)
function ScanArt({ color }) {
  const t = useTheme();
  const c = color || t.primary;
  return (
    <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
      <g stroke={c} strokeWidth="3.4" strokeLinecap="round">
        <path d="M4 18V8a4 4 0 0 1 4-4h10"/>
        <path d="M44 4h10a4 4 0 0 1 4 4v10"/>
        <path d="M58 44v10a4 4 0 0 1-4 4H44"/>
        <path d="M18 58H8a4 4 0 0 1-4-4V44"/>
      </g>
      <g stroke={c} strokeWidth="2.6" strokeLinecap="round" opacity="0.85">
        <path d="M20 24h22"/><path d="M20 31h22"/><path d="M20 38h14"/>
      </g>
    </svg>
  );
}

Object.assign(window, { BrandMark, HeroArt, ScanArt });
