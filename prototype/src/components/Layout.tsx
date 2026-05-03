import type { ReactElement, CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Briefcase,
  ClipboardList,
  Clock,
  BarChart3,
  GitCompareArrows,
  ChevronDown,
  Search,
  ChevronRight,
  Layers,
  PlayCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import { TODAY_LABEL, vendorIntelligence, pdplClauses, contracts } from '../data/contracts';
import { usePersona, type DemoFlow } from '../context/Persona';
import { SemanticSearchPanel } from './SemanticSearchPanel';

const S = {
  stripeBg: '#eef0f4',
  navBg: '#f5f6f9',
  border: '#e2e4e9',
  textInactive: '#71717a',
  textActive: '#18181b',
  activeBg: '#e8eaff',
  activeText: '#4338ca',
  activeIcon: '#6366f1',
  sectionLabel: '#a1a1aa',
  mutedText: '#9ca3af',
};

function savingsBadgeTotal() {
  const t = vendorIntelligence.reduce((s, v) => s + v.potentialSaving, 0);
  if (t >= 1_000_000) {
    const rounded = `${(t / 1_000_000).toFixed(2)}`.replace(/\.?0+$/, '');
    return `SAR ${rounded}M`;
  }
  return `SAR ${Math.round(t / 1000)}K`;
}

function DemoInstruction(flow: DemoFlow | null, step: number): { title: string; body: string; route?: string; cta?: string } | null {
  if (!flow || step < 0) return null;
  const m: Record<DemoFlow, { title: string; body: string; route?: string; cta?: string }[]> = {
    renegotiation: [
      {
        title: '1 · Trigger detected',
        body: `Al‑Jazirah Supplies enters a 30‑day renewal notice lane on ${TODAY_LABEL}. Procurement normally only sees calendar ticks - Intelligence turns one into leverage math.`,
        route: '/timeline',
        cta: 'Open Obligation Timeline',
      },
      {
        title: '2 · Leverage surfaced',
        body: 'Hover any monetary chip on an obligation card - SAR values carry clause quotes, benchmark derivations and confidence routed from the extractor.',
        route: '/timeline',
        cta: 'Explore timeline',
      },
      {
        title: '3 · Intelligence card opened',
        body: `Vendor benchmarking shows ${savingsBadgeTotal()} of identified savings tied to BATNAs vs. commodity alternatives.`,
        route: '/procurement',
        cta: 'Vendor pipeline',
      },
      {
        title: '4 · Micro‑brief at document',
        body: `Open Microsoft's contract - SAR 480K saving is clickable; every figure must trace to Clause 12.2 (diagnostic telemetry) plus Gartner comps.`,
        route: '/contract/c-001',
        cta: 'Microsoft agreement',
      },
      {
        title: '5 · Human closure',
        body: '"Initiate renegotiation" hands off to playbook - Procurement exports a SAR‑denominated briefing with precedent clauses already cited.',
      },
    ],
    'pdpl-sweep': [
      {
        title: '1 · Compliance trigger',
        body: 'STC introduces a materially non-compliant breach-notification article (PDPL Art. 26 § 72h). System runs a corpus-wide sweep versus NCA.',
        route: '/legal',
        cta: 'Open PDPL sweep',
      },
      {
        title: '2 · Ranked triage deck',
        body: `Confirm / escalate / false‑positive workflows feed the evaluator - ${pdplClauses.filter(p => ['Open', 'Needs Review'].includes(p.status)).length} live items.`,
        route: '/legal',
        cta: 'Review queue',
      },
      {
        title: '3 · Compare matrix',
        body: '"Clause Compare" overlays every indemnity/latency datapoint vertically - outliers jump without opening PDFs.',
        route: '/compare',
        cta: 'Clause compare matrix',
      },
      {
        title: '4 · Low certainty path',
        body: '"Human Review Queue" holds Bayan ingestion at 38% confidence - incompleteness never leaks downstream silently.',
        route: '/review',
        cta: 'Mandatory review queue',
      },
    ],
    'weekly-brief': [
      {
        title: '1 · Monday synthesizer',
        body: `Executive (Nora, CFO) receives SAR exposure, renewal pipeline, PDPL regressions automatically - simulated week of "${TODAY_LABEL}"`,
        route: '/executive',
        cta: 'Executive Brief',
      },
      {
        title: '2 · Concentration optics',
        body: `${contracts.filter(c => c.value >= 2_400_000).length} SAR 2M+ vendors explain >60% capex volatility - clickable savings chips remain cited.`,
        route: '/executive',
      },
      {
        title: '3 · Delegation arcs',
        body: `Highlights deep-link Procurement & Legal workspaces without manual reporting - SAR ${(19.2).toFixed(1)}M portfolio echoed from live obligations.`,
      },
      {
        title: '4 · Confidence overlay',
        body: `Every KPI still surfaces hover → clause provenance. Switch the Portfolio lens (Legal · Procurement · Executive) on Obligation Timeline to see the rail remixed.`,
      },
    ],
  };
  return m[flow][step] ?? null;
}

function IconStrip({ path }: { path: string }) {
  const navIcons: { to: string; label: string; svg: ReactElement }[] = [
    { to: '/timeline', label: 'Obligation Timeline', svg: <Clock size={17} strokeWidth={1.75} /> },
    { to: '/vault', label: 'Contract Vault', svg: <Layers size={17} strokeWidth={1.75} /> },
    { to: '/procurement', label: 'Procurement', svg: <Briefcase size={17} strokeWidth={1.75} /> },
    { to: '/legal', label: 'Legal Counsel', svg: <Shield size={17} strokeWidth={1.75} /> },
    { to: '/executive', label: 'Executive Brief', svg: <BarChart3 size={17} strokeWidth={1.75} /> },
    { to: '/compare', label: 'Clause Compare', svg: <GitCompareArrows size={17} strokeWidth={1.75} /> },
    { to: '/review', label: 'Review Queue', svg: <ClipboardList size={17} strokeWidth={1.75} /> },
  ];

  const isActive = (to: string) => path.startsWith(to);

  return (
    <div style={{
      width: 44, background: S.stripeBg, borderRight: `1px solid ${S.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 0', gap: 6, flexShrink: 0,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
      }}>
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
          <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="white" />
        </svg>
      </div>

      {navIcons.map(item => {
        const active = isActive(item.to);
        return (
          <NavLink key={item.to} to={item.to} title={item.label} style={{
            width: 34, height: 34, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: active ? S.activeIcon : S.textInactive,
            background: active ? S.activeBg : 'transparent',
            transition: 'all 0.15s', margin: '1px 0', textDecoration: 'none',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: active ? S.activeIcon : S.textInactive }}>{item.svg}</span>
            </span>
          </NavLink>
        );
      })}
    </div>
  );
}

type NavSidebarItemProps = {
  pathname: string;
  to: string;
  label: string;
  badge?: string | number;
  badgeVariant?: 'neutral' | 'red' | 'indigo';
};

function NavSidebarItem({ pathname, to, label, badge, badgeVariant = 'neutral' }: NavSidebarItemProps) {
  const active = pathname.startsWith(to);
  const badgeStyle: Record<string, CSSProperties> = {
    neutral: { background: '#eaecf0', color: '#71717a' },
    red: { background: '#fef2f2', color: '#dc2626' },
    indigo: { background: '#eef2ff', color: '#4338ca' },
  };
  return (
    <NavLink to={to} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 12px', borderRadius: 7, fontSize: 13,
      fontWeight: active ? 600 : 400,
      color: active ? S.activeText : S.textInactive,
      background: active ? S.activeBg : 'transparent',
      transition: 'all 0.15s', textDecoration: 'none', margin: '1px 4px',
    }}>
      {label}
      {badge !== undefined && (
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
          ...badgeStyle[badgeVariant],
        }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function NavPanel() {
  const loc = useLocation();
  const crit = pdplClauses.filter(p => p.severity === 'Critical' && ['Open', 'Needs Review', 'Escalated'].includes(p.status)).length;

  return (
    <div className="sidebar-scroll" style={{
      width: 228, background: S.navBg, borderRight: `1px solid ${S.border}`,
      display: 'flex', flexDirection: 'column', padding: '14px 0',
      overflowY: 'auto', flexShrink: 0,
    }}>
      <div style={{ padding: '2px 16px 16px' }}>
        <span style={{
          fontSize: 15, fontWeight: 700, color: '#18181b', letterSpacing: '-0.02em',
        }}>Signit</span>
        <p style={{ fontSize: 10, fontWeight: 500, color: S.mutedText, marginTop: 4 }}>
          Portfolio intelligence · simulated {TODAY_LABEL}
        </p>
      </div>

      <div style={{ marginBottom: 6 }}>
        <NavSidebarItem pathname={loc.pathname} to="/timeline" label="Obligation Timeline" />
        <NavSidebarItem pathname={loc.pathname} to="/vault" label="Contract Vault" badge={contracts.length} />
      </div>

      <div style={{ height: 1, background: S.border, margin: '6px 16px 12px' }} />

      <div>
        <div style={{ padding: '0 16px 6px' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: S.sectionLabel, textTransform: 'uppercase', letterSpacing: '0.09em',
          }}>
            Persona workspaces
          </span>
        </div>
        <NavSidebarItem pathname={loc.pathname} to="/procurement" label="Procurement Intelligence" badge={savingsBadgeTotal()} badgeVariant="indigo" />
        <NavSidebarItem pathname={loc.pathname} to="/legal" label="Legal · PDPL sweep" badge={crit > 0 ? `${crit} critical` : 'clear'} badgeVariant={crit ? 'red' : 'neutral'} />
        <NavSidebarItem pathname={loc.pathname} to="/executive" label="Executive Weekly Brief" badge="digest" badgeVariant="neutral" />
      </div>

      <div style={{ height: 1, background: S.border, margin: '12px 16px' }} />

      <div style={{ padding: '0 16px 6px' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: S.sectionLabel, textTransform: 'uppercase', letterSpacing: '0.09em',
        }}>
          Cross-contract
        </span>
      </div>
      <NavSidebarItem pathname={loc.pathname} to="/compare" label="Clause Compare" badge="Δ" badgeVariant="indigo" />
      {(() => {
        const cnt =
          contracts.filter(c => (c.completenessScore ?? 100) < 85).length +
          pdplClauses.filter(p => p.status === 'Needs Review' || p.needsReview === true).length;
        return (
          <NavSidebarItem
            pathname={loc.pathname}
            to="/review"
            label="Human Review Queue"
            {...(cnt ? { badge: cnt, badgeVariant: 'red' as const } : {})}
          />
        );
      })()}
    </div>
  );
}

function TopBar({ onOpenSemanticSearch }: { onOpenSemanticSearch: () => void }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { demoFlow, endDemo, startDemo } = usePersona();

  const crumbMap: Record<string, string[]> = {
    '/timeline': ['Obligation Timeline'],
    '/vault': ['Contract Vault'],
    '/contract': ['Contract Vault', 'Contract Detail'],
    '/procurement': ['Procurement Intelligence'],
    '/legal': ['Legal Counsel · PDPL sweep'],
    '/executive': ['Executive Brief'],
    '/compare': ['Clause Compare'],
    '/review': ['Human Review Queue'],
  };
  const key = Object.keys(crumbMap).find(k => loc.pathname.startsWith(k)) ?? '/timeline';
  const crumbs = crumbMap[key] ?? ['Obligation Timeline'];

  return (
    <div style={{
      height: 52,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'saturate(160%) blur(10px)',
      WebkitBackdropFilter: 'saturate(160%) blur(10px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', flexShrink: 0, gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, flexShrink: 0 }}>
          {crumbs.map((c, i) => (
            <span key={c + i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {i > 0 && <ChevronRight size={12} color="#d4d4d8" />}
              <span style={{
                color: i === crumbs.length - 1 ? '#18181b' : '#a1a1aa',
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
                whiteSpace: 'nowrap',
              }}>
                {c}
              </span>
            </span>
          ))}
        </div>

        {/* Scenario walk-through */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          paddingRight: 12,
          borderRight: '1px solid #f4f4f5',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Scenario
          </div>
          {(['renegotiation', 'pdpl-sweep', 'weekly-brief'] as const).map(flow => (
            <button
              key={flow}
              onClick={() => {
                startDemo(flow);
                if (flow === 'renegotiation') navigate('/timeline');
                else if (flow === 'pdpl-sweep') navigate('/legal');
                else navigate('/executive');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 9px',
                borderRadius: 999,
                fontSize: 11, fontWeight: 600,
                border: demoFlow === flow ? '1px solid #6366f1' : '1px solid #e4e4e7',
                background: demoFlow === flow ? '#eef2ff' : '#fafafa',
                color: demoFlow === flow ? '#4338ca' : '#52525b',
                cursor: 'pointer',
              }}
              title={`Start guided walkthrough`}
            >
              <PlayCircle size={12} color={demoFlow === flow ? '#4338ca' : '#71717a'} />
              <span>{
                flow === 'renegotiation'
                  ? 'Reneg brief'
                  : flow === 'pdpl-sweep'
                    ? 'PDPL sweep'
                    : 'Executive brief'}
              </span>
            </button>
          ))}
        </div>

        {demoFlow !== null && (
          <button
            type="button"
            onClick={endDemo}
            title="Exit the guided scenario walkthrough"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 500,
              flexShrink: 0,
              border: '1px solid #e4e4e7',
              background: '#fff',
              color: '#71717a',
              cursor: 'pointer',
            }}
          >
            <X size={11} strokeWidth={2.25} />
            End scenario
          </button>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          title="Semantic search · Ctrl/Cmd K"
          onClick={onOpenSemanticSearch}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 9999, background: '#f7f8fa',
            border: '1px solid #e4e4e7', cursor: 'pointer',
            flex: '1 1 auto',
            minWidth: 200,
            maxWidth: 'min(340px, 36vw)',
          }}
        >
          <Search size={13} color="#a1a1aa" strokeWidth={2} />
          <span style={{
            flex: 1,
            fontSize: 13,
            color: '#71717a',
            textAlign: 'left',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            Search agreements & obligations…
          </span>
        </button>

        <span style={{
          padding: '2px 7px',
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
          color: '#92400e',
          background: '#fffbeb',
        }}>
          {TODAY_LABEL}
        </span>
      </div>
    </div>
  );
}

function DemoRibbon() {
  const { persona, demoFlow, demoStep, nextDemo, endDemo } = usePersona();
  const navigate = useNavigate();

  const info = DemoInstruction(demoFlow, demoStep);
  if (!info) return null;

  const flowsMax: Record<DemoFlow, number> = {
    renegotiation: 5,
    'pdpl-sweep': 4,
    'weekly-brief': 4,
  };
  const max = demoFlow ? flowsMax[demoFlow] : 1;
  const isLast = demoStep >= max - 1;

  const handleAdvance = () => {
    if (isLast) {
      endDemo();
      navigate('/timeline');
      return;
    }

    const upcoming = DemoInstruction(demoFlow!, demoStep + 1);
    if (!upcoming) {
      endDemo();
      navigate('/timeline');
      return;
    }

    nextDemo();
    if (upcoming.route) navigate(upcoming.route);
  };

  return (
    <div style={{
      borderBottom: '1px solid #e4e4e7',
      background: 'linear-gradient(90deg,#f5f3ff,#eef2ff)',
      padding: '8px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 14,
      fontSize: 12,
      color: '#4b5563',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, overflow: 'hidden' }}>
        <PlayCircle size={16} color="#6366f1" style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <p style={{
            fontWeight: 700,
            color: '#4c1d95',
            marginBottom: 2,
          }}>
            {info.title}{' '}· {persona.name}
          </p>
          <p style={{
            lineHeight: 1.5,
          }}>
            {info.body}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => info.route && navigate(info.route)}
          style={{
            padding: '5px 10px',
            borderRadius: 999,
            border: '1px solid #c7d2fe',
            fontSize: 11,
            fontWeight: 600,
            background: '#fff',
            color: '#4338ca',
            display: info.cta && info.route ? 'inline-flex' : 'none',
            alignItems: 'center',
            gap: 6,
          }}
          title={info.cta}
        >
          {info.cta}
          <ArrowRight size={12} />
        </button>
        <button
          onClick={handleAdvance}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid #6366f1',
            fontSize: 11,
            fontWeight: 600,
            background: '#6366f1',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isLast ? 'Done' : <>Next<ChevronDown size={12} /></>}
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const loc = useLocation();
  const { demoFlow, demoStep } = usePersona();
  const [semanticOpen, setSemanticOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSemanticOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showRibbon = DemoInstruction(demoFlow, demoStep) !== null && demoFlow !== null && demoStep >= 0;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #f3f5f9 0%, #f7f8fa 38%, #f6f8fc 100%)',
    }}>
      <div style={{
        display: 'flex',
        flexShrink: 0,
        zIndex: 20,
      }}>
        <IconStrip path={loc.pathname} />
        <NavPanel />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar onOpenSemanticSearch={() => setSemanticOpen(true)} />
        {semanticOpen && (
          <SemanticSearchPanel onClose={() => setSemanticOpen(false)} />
        )}
        {showRibbon && (
          <div className="anim-fade">
            <DemoRibbon />
          </div>
        )}
        <main className="anim-fade" style={{ flex: 1, overflowY: 'auto', padding: 24 }} key={loc.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
