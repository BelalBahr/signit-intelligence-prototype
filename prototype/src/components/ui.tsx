import type { ReactNode, CSSProperties, MouseEvent } from 'react';
import type { RiskLevel } from '../data/contracts';

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const colors = {
  primary: '#6366f1',
  primaryHover: '#5558e8',
  primaryLight: '#eef2ff',
  primaryBorder: '#c7d2fe',
  navy: '#18181b',
  secondary: '#52525b',
  muted: '#71717a',
  placeholder: '#a1a1aa',
  border: '#e4e4e7',
  borderLight: '#f4f4f5',
  subtle: '#fafafa',
  bg: '#f7f8fa',
  white: '#ffffff',
} as const;

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  lg: '0 8px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)',
} as const;

// ─── Diamond Icon (Signit AI mark) ────────────────────────────────────────────
export function DiamondIcon({ size = 16, color = '#6366f1', className = '', style }: {
  size?: number; color?: string; className?: string; style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className} style={{ flexShrink: 0, ...style }}>
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill={color} />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    'Active':         { bg: '#f0fdf4', color: '#15803d' },
    'Expiring Soon':  { bg: '#fffbeb', color: '#b45309' },
    'Pending Review': { bg: '#eef2ff', color: '#4338ca' },
    'Expired':        { bg: '#fef2f2', color: '#b91c1c' },
    'Draft':          { bg: '#f4f4f5', color: '#71717a' },
  };
  const { bg, color } = cfg[status] ?? { bg: '#f4f4f5', color: '#71717a' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: bg, color, lineHeight: 1.5, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg: Record<RiskLevel, { bg: string; color: string }> = {
    High:   { bg: '#fef2f2', color: '#dc2626' },
    Medium: { bg: '#fffbeb', color: '#d97706' },
    Low:    { bg: '#f0fdf4', color: '#16a34a' },
  };
  const { bg, color } = cfg[risk];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: bg, color, whiteSpace: 'nowrap',
    }}>
      {risk} Risk
    </span>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: 'Critical' | 'Major' | 'Minor' }) {
  const cfg = {
    Critical: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
    Major:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    Minor:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  };
  const { bg, color, border } = cfg[severity];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: bg, color, border: `1px solid ${border}`,
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    }}>
      {severity}
    </span>
  );
}

// ─── PDPL Status Badge ────────────────────────────────────────────────────────
export function PDPLStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    'Open':           { bg: '#fef2f2', color: '#dc2626' },
    'Confirmed':      { bg: '#fffbeb', color: '#d97706' },
    'Escalated':      { bg: '#f5f3ff', color: '#7c3aed' },
    'False Positive': { bg: '#f0fdf4', color: '#15803d' },
    'Needs Review':   { bg: '#fff7ed', color: '#c2410c' },
  };
  const { bg, color } = cfg[status] ?? { bg: '#f4f4f5', color: '#71717a' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: bg, color, whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

// ─── Contract Tag ─────────────────────────────────────────────────────────────
export function ContractTag({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 500,
      background: '#f4f4f5', color: '#52525b', border: '1px solid #e4e4e7',
      lineHeight: 1.5, whiteSpace: 'nowrap',
    }}>
      <DiamondIcon size={8} color="#6366f1" />
      {label}
    </span>
  );
}

// ─── AI Badge ─────────────────────────────────────────────────────────────────
export function AIBadge({ label = 'AI' }: { label?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe',
    }}>
      <DiamondIcon size={9} color="#7c3aed" />
      {label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', style }: {
  children: ReactNode; className?: string; style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: '#fff',
        border: '1px solid #e4e4e7',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub?: string; accent?: string; icon?: ReactNode;
}) {
  return (
    <Card style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            {label}
          </p>
          <p style={{ fontSize: 22, fontWeight: 600, color: accent ?? '#18181b', lineHeight: 1.2 }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{
            width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: accent ? `${accent}14` : '#f0f0ff', color: accent ?? '#6366f1', flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── KV Row ───────────────────────────────────────────────────────────────────
export function KVRow({ label, value, children, last }: {
  label: string; value?: string; children?: ReactNode; last?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: last ? 'none' : '1px solid #f4f4f5',
      gap: 16,
    }}>
      <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      {children ? children : (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b', textAlign: 'right' }}>{value}</span>
      )}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.09em', color: '#a1a1aa', marginBottom: 12,
    }}>
      {children}
    </p>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: '#f4f4f5', ...style }} />;
}

// ─── Confidence Bar ───────────────────────────────────────────────────────────
export function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? '#6366f1' : value >= 70 ? '#d97706' : '#a1a1aa';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <div style={{ width: 52, height: 4, borderRadius: 99, background: '#f4f4f5', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 99, background: color, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 28 }}>{value}%</span>
    </div>
  );
}

// ─── Leverage Bar ─────────────────────────────────────────────────────────────
export function LeverageBar({ score }: { score: number }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#a1a1aa';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>Negotiation Leverage</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color }}>{score}</span>
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>/100</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#f4f4f5', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 99, background: color, transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
const btnBase: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontWeight: 500, borderRadius: 8, transition: 'all 0.15s ease',
  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1,
};
const btnSizes: Record<string, CSSProperties> = {
  sm: { padding: '5px 10px', fontSize: 12 },
  md: { padding: '7px 14px', fontSize: 13 },
  lg: { padding: '9px 18px', fontSize: 14 },
};
const btnVariants: Record<string, CSSProperties> = {
  primary: { background: '#6366f1', color: '#fff' },
  secondary: { background: '#18181b', color: '#fff' },
  ghost: { background: 'transparent', color: '#52525b' },
  outline: { background: '#fff', color: '#374151', border: '1px solid #e4e4e7' },
  danger: { background: '#ef4444', color: '#fff' },
  'outline-primary': { background: '#fff', color: '#6366f1', border: '1px solid #c7d2fe' },
};

export function Btn({ children, variant = 'outline', size = 'md', onClick, disabled, title, demoOnly, style, className }: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'outline-primary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Native browser tooltip (shows on hover). */
  title?: string;
  /**
   * Marks the button as a non-functional demo affordance: visually softened,
   * never invokes onClick, and surfaces a "Demo only" tooltip. Use this
   * instead of `disabled` so screen readers still announce intent.
   */
  demoOnly?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const inert = disabled || demoOnly;
  const tooltip = demoOnly
    ? (title ?? 'Demo only — not implemented in this prototype')
    : title;
  return (
    <button
      onClick={(e) => {
        if (inert) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      disabled={disabled}
      title={tooltip}
      aria-disabled={inert}
      data-demo-only={demoOnly ? '' : undefined}
      className={className}
      style={{
        ...btnBase,
        ...btnSizes[size],
        ...btnVariants[variant],
        opacity: inert ? (demoOnly ? 0.55 : 0.4) : 1,
        cursor: inert ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────
export function fmt(n: number): string {
  if (n >= 1_000_000) {
    const m = (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '');
    return `SAR ${m}M`;
  }
  if (n >= 1_000) return `SAR ${(n / 1_000).toFixed(0)}K`;
  return `SAR ${n.toLocaleString()}`;
}

export function fmtFull(n: number): string {
  return `SAR ${n.toLocaleString('en-SA')}`;
}

/** Returns a human-readable countdown from an ISO date string vs. today (also ISO). */
export function daysFrom(iso: string, fromIso: string): number {
  const t0 = new Date(fromIso + 'T00:00:00').getTime();
  const t1 = new Date(iso + 'T00:00:00').getTime();
  return Math.ceil((t1 - t0) / 86_400_000);
}

export function countdownLabel(
  iso: string,
  fromIso: string,
  opts?: { compact?: boolean },
): string {
  const d = daysFrom(iso, fromIso);
  const c = opts?.compact;

  if (c) {
    if (d < 0) return `${Math.abs(d)}d ago`;
    if (d === 0) return 'today';
    if (d === 1) return 'tomorrow';
    if (d <= 30) return `${d}d`;
    if (d <= 90) return `~${Math.ceil(d / 7)}w`;
    return `~${Math.ceil(d / 30)}mo`;
  }

  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d <= 7) return `in ${d}d`;
  if (d <= 30) return `in ${d}d`;
  if (d <= 90) return `in ~${Math.ceil(d / 7)}w`;
  return `in ~${Math.ceil(d / 30)}mo`;
}
