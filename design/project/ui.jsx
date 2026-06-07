// ui.jsx — theme + primitives for PROF PARENT IA (Brilliant-inspired)
// Exposes: ThemeCtx, makeTheme, Btn, GhostBtn, Squircle, Card, Tile, Chip,
// ProgressRing, ProgressBar, Illustration components, useTheme.

const ThemeCtx = React.createContext(null);
const useTheme = () => React.useContext(ThemeCtx);

// ---- Theme factory -----------------------------------------------------
// brand: one of the curated keys. dark: boolean.
const BRANDS = {
  emeraude: { name: 'Émeraude',  primary: '#0E9D6A', primaryDeep: '#0A7A52', primarySoft: '#E2F3EB', hero: '#0E332A', heroFrom: '#12463A', heroTo: '#0B2A23' },
  cobalt:   { name: 'Cobalt',    primary: '#3B5BD9', primaryDeep: '#2C44AE', primarySoft: '#E7EBFB', hero: '#16204D', heroFrom: '#1E2C66', heroTo: '#121A40' },
  prune:    { name: 'Prune',     primary: '#7A45C7', primaryDeep: '#5F34A0', primarySoft: '#F0E8FB', hero: '#2A1A47', heroFrom: '#39235F', heroTo: '#22143B' },
};

function makeTheme(brandKey = 'emeraude', dark = false) {
  const b = BRANDS[brandKey] || BRANDS.emeraude;
  const accents = {
    blue:  { fg: '#2F5BD0', soft: '#E7EDFB', solid: '#3B5BD9' },
    amber: { fg: '#C7791C', soft: '#FBEEDA', solid: '#EFA02E' },
    green: { fg: b.primaryDeep, soft: b.primarySoft, solid: b.primary },
    violet:{ fg: '#7A45C7', soft: '#F0E8FB', solid: '#7A45C7' },
    coral: { fg: '#D6543F', soft: '#FCE7E1', solid: '#F0654C' },
  };
  if (dark) {
    return {
      brandKey, dark, ...b, accents,
      bg: '#0C1512', surface: '#13201B', surfaceAlt: '#182B23',
      ink: '#F2F6F3', sub: '#A7B7AE', faint: '#6E8278',
      line: 'rgba(255,255,255,0.09)', lineStrong: 'rgba(255,255,255,0.16)',
      shadow: '0 2px 4px rgba(0,0,0,0.4), 0 12px 30px rgba(0,0,0,0.45)',
      shadowSm: '0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.35)',
      onPrimary: '#06140E',
    };
  }
  return {
    brandKey, dark, ...b, accents,
    bg: '#F6F7F5', surface: '#FFFFFF', surfaceAlt: '#F1F4F1',
    ink: '#13241D', sub: '#5C6B63', faint: '#90A097',
    line: 'rgba(19,36,29,0.08)', lineStrong: 'rgba(19,36,29,0.14)',
    shadow: '0 2px 4px rgba(16,40,30,0.05), 0 18px 40px rgba(16,40,30,0.08)',
    shadowSm: '0 1px 2px rgba(16,40,30,0.05), 0 6px 16px rgba(16,40,30,0.07)',
    onPrimary: '#FFFFFF',
  };
}

// ---- Chunky pressable button (Brilliant signature) --------------------
function Btn({ children, onClick, color, deep, fg = '#fff', full, size = 'lg', icon, style }) {
  const t = useTheme();
  const c = color || t.primary;
  const d = deep || t.primaryDeep;
  const [down, setDown] = React.useState(false);
  const pad = size === 'lg' ? '17px 24px' : size === 'sm' ? '11px 16px' : '14px 20px';
  const fs = size === 'lg' ? 17 : size === 'sm' ? 14.5 : 16;
  const lip = size === 'sm' ? 3 : 4;
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        width: full ? '100%' : undefined, border: 'none', cursor: 'pointer',
        background: c, color: fg, borderRadius: 16, padding: pad,
        fontFamily: 'inherit', fontWeight: 700, fontSize: fs, letterSpacing: -0.2,
        boxShadow: down
          ? `0 0 0 ${d}, inset 0 2px 6px rgba(0,0,0,0.18)`
          : `0 ${lip}px 0 ${d}, 0 8px 18px ${hexA(c, 0.30)}`,
        transform: down ? `translateY(${lip}px)` : 'translateY(0)',
        transition: 'transform .08s ease, box-shadow .08s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        ...style,
      }}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, full, size = 'lg', icon, style }) {
  const t = useTheme();
  const [down, setDown] = React.useState(false);
  const pad = size === 'lg' ? '16px 24px' : '13px 18px';
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        width: full ? '100%' : undefined, cursor: 'pointer',
        background: t.surface, color: t.ink, borderRadius: 16, padding: pad,
        border: `1.5px solid ${t.lineStrong}`,
        fontFamily: 'inherit', fontWeight: 600, fontSize: size === 'lg' ? 16 : 14.5,
        letterSpacing: -0.2, transform: down ? 'translateY(1px)' : 'none',
        transition: 'transform .08s ease, background .15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        ...style,
      }}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

// ---- Containers --------------------------------------------------------
function Card({ children, style, pad = 18, soft }) {
  const t = useTheme();
  return (
    <div style={{
      background: soft ? t.surfaceAlt : t.surface, borderRadius: 24, padding: pad,
      boxShadow: soft ? 'none' : t.shadowSm,
      border: `1px solid ${t.line}`, ...style,
    }}>{children}</div>
  );
}

// colored rounded icon tile (Brilliant uses these everywhere)
function Squircle({ accent = 'green', size = 46, r = 15, icon, iconSize, style }) {
  const t = useTheme();
  const a = t.accents[accent] || t.accents.green;
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: t.dark ? hexA(a.solid, 0.18) : a.soft, color: a.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      {icon && React.cloneElement(icon, { size: iconSize || Math.round(size * 0.5) })}
    </div>
  );
}

function Chip({ children, accent = 'green', solid, style }) {
  const t = useTheme();
  const a = t.accents[accent] || t.accents.green;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: solid ? a.solid : (t.dark ? hexA(a.solid, 0.2) : a.soft),
      color: solid ? '#fff' : a.fg,
      borderRadius: 999, padding: '5px 11px', fontSize: 12.5, fontWeight: 700,
      letterSpacing: 0.1, ...style,
    }}>{children}</span>
  );
}

// ---- Progress ----------------------------------------------------------
function ProgressBar({ value, color, track, h = 9 }) {
  const t = useTheme();
  return (
    <div style={{ height: h, borderRadius: 999, background: track || t.surfaceAlt, overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`, height: '100%', borderRadius: 999,
        background: color || `linear-gradient(90deg, ${t.primary}, ${t.primaryDeep})`,
        transition: 'width .6s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  );
}

function ProgressRing({ value, size = 64, sw = 7, color, children }) {
  const t = useTheme();
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.surfaceAlt} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color || t.primary}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
      }}>{children}</div>
    </div>
  );
}

// ---- Status system (confirmé / incertain / erreur / flou) -------------
const STATUS = {
  confirme: { key: 'confirme', label: 'Confirmé',  accent: 'green' },
  incertain:{ key: 'incertain',label: 'À vérifier',accent: 'amber' },
  erreur:   { key: 'erreur',   label: 'À refaire', accent: 'coral' },
  flou:     { key: 'flou',     label: 'Illisible', accent: 'blue'  },
};

function StatusChip({ status = 'confirme', label, style }) {
  const t = useTheme();
  const s = STATUS[status] || STATUS.confirme;
  const a = t.accents[s.accent];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.dark ? hexA(a.solid, 0.2) : a.soft, color: a.fg,
      borderRadius: 999, padding: '5px 11px 5px 9px', fontSize: 12.5, fontWeight: 800,
      letterSpacing: 0.1, whiteSpace: 'nowrap', ...style,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: a.solid, display: 'inline-block' }} />
      {label || s.label}
    </span>
  );
}

function Divider({ style }) {
  const t = useTheme();
  return <div style={{ height: 1, background: t.line, ...style }} />;
}

// ---- helpers -----------------------------------------------------------
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

Object.assign(window, {
  ThemeCtx, useTheme, makeTheme, BRANDS, hexA,
  Btn, GhostBtn, Card, Squircle, Chip, ProgressBar, ProgressRing,
  STATUS, StatusChip, Divider,
});
