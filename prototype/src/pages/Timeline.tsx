import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Calendar, Layers, Zap, Scale, AlertTriangle } from 'lucide-react';
import {
  obligationEvents, TODAY_ISO, TODAY_LABEL, contracts,
  vendorIntelligence, pdplClauses, type ObligationKind, type ObligationEvent, type PersonaId,
} from '../data/contracts';
import { usePersona, type DemoFlow } from '../context/Persona';
import {
  Card, DiamondIcon, Btn, fmt, countdownLabel,
} from '../components/ui';
import { Citation } from '../components/Citation';

const KIND_LABEL: Record<ObligationKind, string> = {
  expiration: 'Expiration',
  auto_renewal: 'Auto-renew',
  notice_deadline: 'Notice deadline',
  renewal_window: 'Renewal window',
  payment: 'Payment',
  sla_review: 'SLA review',
  compliance_audit: 'Compliance audit',
  pdpl_remediation: 'PDPL remediation',
};

/** Generate ['2026-05', '2026-06', ...] from start iso through +monthCount months */
function monthRange(startIso: string, monthCount: number): string[] {
  const d = new Date(startIso + 'T00:00:00');
  const ys: string[] = [];
  for (let i = 0; i < monthCount; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    ys.push(`${y}-${m}`);
    d.setMonth(d.getMonth() + 1);
  }
  return ys;
}

function monthPretty(ym: string): string {
  const [y, m] = ym.split('-');
  const d = new Date(+y!, +(+m!) - 1, 1);
  return d.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
}

function ymOf(isoDate: string) {
  return isoDate.slice(0, 7);
}

/** Demo highlighting per flow */
function isDemoHighlighted(flow: DemoFlow | null, step: number, e: ObligationEvent): boolean {
  if (!flow) return false;
  if (flow === 'renegotiation') {
    if (step <= 2) return e.contractId === 'c-003' && (e.kind === 'notice_deadline' || e.kind === 'expiration');
    if (step <= 4) return e.contractId === 'c-001' && e.kind === 'renewal_window';
  }
  if (flow === 'pdpl-sweep') {
    if (step <= 3) return e.contractId === 'c-005' && e.kind === 'pdpl_remediation';
  }
  if (flow === 'weekly-brief') {
    return (
      e.severity === 'critical'
      || (e.personaPriority.cfo === 3 && typeof e.amount === 'number' && e.amount >= 3_100_000)
    );
  }
  return false;
}

function lensAccent(personaId: string) {
  if (personaId === 'cfo') return { bg: '#f0fdf4', border: '#bbf7d0', icon: Layers, color: '#15803d' };
  if (personaId === 'legal') return { bg: '#f5f3ff', border: '#ddd6fe', icon: Scale, color: '#7c3aed' };
  return { bg: '#eef2ff', border: '#c7d2fe', icon: Zap, color: '#6366f1' };
}

/** Kinds where Procurement typically owns the next action (vs Finance exec scorecard). */
const PROCUREMENT_ACTION_KINDS = new Set<ObligationKind>([
  'notice_deadline',
  'renewal_window',
  'expiration',
  'sla_review',
  'compliance_audit',
  'payment',
  'pdpl_remediation',
]);

/**
 * Legal uses raw personaPriority >= 1. Procurement vs Executive need different slices:
 * the dataset marks most rows as visible to both, which made the two lenses identical.
 */
function obligationInLens(ev: ObligationEvent, personaId: PersonaId): boolean {
  if (ev.personaPriority[personaId] < 1) return false;
  if (personaId === 'legal') return true;

  const { cfo, legal, procurement } = ev.personaPriority;
  const maxScore = Math.max(cfo, legal, procurement);

  if (personaId === 'procurement') {
    if (procurement >= 3) return true;
    if (
      procurement >= 2
      && procurement >= maxScore - 1
      && PROCUREMENT_ACTION_KINDS.has(ev.kind)
    ) {
      return true;
    }
    return false;
  }

  // Executive (stored as cfo)
  if (typeof ev.amount === 'number' && ev.amount >= 400_000) return true;
  if (ev.severity === 'critical') return true;
  if (cfo >= 3) return true;
  if (cfo >= 2 && cfo >= maxScore - 1) return true;
  return false;
}

/**
 * Arabic source-clause translations for a few obligations. KSA contracts are
 * commonly bilingual (Arabic primary, English secondary). Surfacing the AR
 * source proves out the bilingual extraction story without forking the data
 * model: only obligations with attested AR text appear here, the rest fall
 * back to English in the popover.
 */
const ARABIC_CLAUSES: Record<string, { clauseRefAr: string; quoteAr: string }> = {
  'e-001': {
    clauseRefAr: 'البند 11.2 - إخطار عدم التجديد',
    quoteAr: 'يجوز لأي من الطرفين رفض التجديد بإشعار خطي يُسلَّم قبل ثلاثين (30) يوماً على الأقل من تاريخ انتهاء العقد.',
  },
  'e-007': {
    clauseRefAr: 'البند 14.1 - إشعار الحوادث الأمنية',
    quoteAr: 'في حال وقوع حادث أمني يؤثر على بيانات العميل، يلتزم المزوّد بإخطار العميل خلال ثلاثين (30) يوماً تقويمياً...',
  },
  'e-008': {
    clauseRefAr: 'البند 14.1 - إشعار الحوادث الأمنية',
    quoteAr: 'في حال وقوع حادث أمني يؤثر على بيانات العميل، يلتزم المزوّد بإخطار العميل خلال ثلاثين (30) يوماً تقويمياً...',
  },
  'e-013': {
    clauseRefAr: 'البند 12.2 - بيانات التشخيص',
    quoteAr: 'قد يقوم المُرخِّص بجمع بيانات التشخيص والاستخدام بهدف تحسين الخدمة والمنتج، ويحتفظ بها وفقاً لسياسات الشركة الداخلية.',
  },
};

/** Pick the best citation for an obligation card */
function eventCitation(e: ObligationEvent) {
  const vi = vendorIntelligence.find(v => v.contractId === e.contractId);
  const pdc = pdplClauses.find(p => {
    if (!e.sourceClause) return false;
    const refPrefix = p.clauseRef.split(' - ')[0]?.trim() ?? p.clauseRef;
    return p.contractId === e.contractId && e.sourceClause.includes(refPrefix);
  });

  const clauseRef = pdc?.clauseRef;
  let quote = pdc?.clauseText ?? e.sourceClause;
  let confidence = e.confidence;
  let derivation: string | undefined;
  let benchmarkSource: string | undefined;

  if (e.kind === 'renewal_window' || e.kind === 'notice_deadline') {
    if (vi && e.contractId === vi.contractId) {
      derivation = `${vi.leverageScore}/100 leverage score computed from expiry alignment (${e.date}), BATNA benchmarks, spend concentration (${fmt(vi.currentRate)} current vs. ${fmt(vi.marketMedian)} median).`;
      benchmarkSource = vi.benchmarkSource;
      confidence = Math.round((confidence + Math.min(99, vi.leverageScore + 14)) / 2);
    }
  }
  if (!quote && vi && (e.kind === 'renewal_window' || e.kind === 'payment')) {
    quote = `[Derived from Vendor Intelligence briefing for ${vi.vendor}]`;
    derivation = derivation ?? vi.leverageReason;
    benchmarkSource = vi.benchmarkSource;
  }

  const ar = ARABIC_CLAUSES[e.id];

  return {
    clauseRef: clauseRef ?? (e.sourceClause?.split(' - ')[0]?.trim()),
    clauseRefAr: ar?.clauseRefAr,
    quote: quote ?? e.detail,
    quoteAr: ar?.quoteAr,
    confidence, derivation, benchmarkSource,
  };
}

export default function Timeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const { persona, setPersona, demoFlow, demoStep } = usePersona();

  /** Deep-link from semantic search: /timeline#ob-e-xxx */
  useEffect(() => {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (!raw.startsWith('ob-')) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(raw);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('hash-lit');
      window.setTimeout(() => el?.classList.remove('hash-lit'), 2000);
    }, 220);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  const months = monthRange('2026-05', 14);

  // Filter + sort obligations for current persona lens
  const scoped = [...obligationEvents]
    .filter(ev => obligationInLens(ev, persona.id))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group into month buckets
  const buckets = months.map(m => ({
    ym: m,
    events: scoped.filter(e => ymOf(e.date) === m),
  }));

  const la = lensAccent(persona.id);
  const LaIcon = la.icon;

  const totalStake = scoped
    .filter(e => e.amount && e.personaPriority[persona.id] >= 2)
    .reduce((s, e) => s + (e.amount ?? 0), 0);

  const criticalSoon = scoped.filter(e => {
    const d = countdownLabel(e.date, TODAY_ISO);
    return e.severity === 'critical' && !d.endsWith('ago');
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="anim-up">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: la.bg, border: `1px solid ${la.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LaIcon size={15} color={la.color} strokeWidth={1.85} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#18181b' }}>Obligation Timeline</h1>
          </div>
          <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, paddingLeft: 42 }}>
            A living portfolio view ordered by action date - filtered for <strong style={{ color: '#18181b' }}>{persona.focus.toLowerCase()}</strong>.
            Today: <strong style={{ color: '#18181b' }}>{TODAY_LABEL}</strong>.
          </p>

          {/* Legal / Procurement / Executive lens lives here (not in the global top bar) */}
          <div style={{
            marginTop: 14,
            paddingLeft: 42,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px 14px',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.09em',
            }}>
              Portfolio lens
            </span>
            <div style={{
              display: 'flex', gap: 4,
              padding: 3,
              borderRadius: 999,
              background: '#f4f4f5',
            }}>
              {(['legal', 'procurement', 'cfo'] as const).map(pid => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setPersona(pid)}
                  title={pid === 'legal' ? 'Legal' : pid === 'procurement' ? 'Procurement' : 'Executive'}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: persona.id === pid ? '1px solid #cbd5ff' : '1px solid transparent',
                    fontSize: 12,
                    fontWeight: 600,
                    color: persona.id === pid ? '#4338ca' : '#71717a',
                    background: persona.id === pid ? '#fff' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {pid === 'legal' ? 'Legal' : pid === 'procurement' ? 'Procurement' : 'Executive'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const flowDefault: PersonaId =
                  demoFlow === 'renegotiation' ? 'procurement'
                  : demoFlow === 'pdpl-sweep' ? 'legal'
                  : 'cfo';
                setPersona(flowDefault);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={
                demoFlow === 'renegotiation' ? 'Reset to Procurement (default for the renegotiation flow)'
                : demoFlow === 'pdpl-sweep' ? 'Reset to Legal (default for the PDPL sweep flow)'
                : 'Reset to Executive (default lens)'
              }
              style={{
                padding: '5px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 500,
                color: '#71717a',
                border: '1px dashed #e4e4e7',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Default lens
            </button>
          </div>

          {demoFlow !== null && demoStep >= 0 && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10,
              background: demoFlow === 'renegotiation' ? '#eef2ff' : demoFlow === 'pdpl-sweep' ? '#f5f3ff' : '#f0fdf4',
              border: '1px solid #e4e4e7',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                Demo mode - step {demoStep + 1} of {demoFlow === 'weekly-brief' ? 4 : 5}
              </p>
              <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.55 }}>
                Watch the highlighted milestones on this timeline -
                they're sequenced across procurement, legal, and executive viewpoints.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Btn variant="outline" size="sm" onClick={() => navigate('/vault')}>Document vault</Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate(persona.id === 'legal' ? '/legal' : persona.id === 'procurement' ? '/procurement' : '/executive')}>
            {persona.id === 'legal' ? 'Clause sweep' : persona.id === 'procurement' ? 'Renegotiation pipeline' : 'Weekly brief'} <ArrowRight size={13} strokeWidth={1.85} />
          </Btn>
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
        {[
          {
            label: 'Active obligations · this lens',
            value: `${scoped.length} events`,
            sub: `${fmt(totalStake)} flagged value at stake`,
            Icon: Calendar,
          },
          {
            label: 'Critical · upcoming',
            value: `${criticalSoon}`,
            sub: `${pdplClauses.filter(p => ['Open', 'Escalated', 'Needs Review'].includes(p.status)).length} PDPL items open`,
            Icon: AlertTriangle,
          },
          {
            label: 'Documents',
            value: `${contracts.filter(c =>
              persona.id === 'legal' ? c.pdplClauses > 0 :
                persona.id === 'procurement' ? vendorIntelligence.some(v => v.contractId === c.id) :
                  true,
            ).length} contracts`,
            sub: `${contracts.filter(c => c.extractionStatus === 'incomplete').length} incomplete extraction`,
            Icon: Layers,
          },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</span>
              <s.Icon size={13} color="#71717a" strokeWidth={1.75} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#18181b', lineHeight: 1.2 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Timeline canvas ───────────────────────────────────────── */}
      <Card style={{ padding: '16px 0 0', overflow: 'hidden' }}>
        {/* Month ruler */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${months.length}, minmax(104px,1fr))`,
          borderBottom: '1px solid #f4f4f5', padding: '0 16px',
        }}>
          {months.map(m => {
            const isNow = m === ymOf(TODAY_ISO);
            return (
              <div key={m} style={{ padding: '8px 4px', textAlign: 'center', borderLeft: '1px solid #fafafa', position: 'relative' }}>
                {isNow && (
                  <div style={{
                    position: 'absolute', left: '50%', top: -38, bottom: -5000,
                    width: 1, background: 'linear-gradient(#6366f1, transparent)', zIndex: 1,
                    pointerEvents: 'none',
                  }} />
                )}
                <p style={{ fontSize: 10, fontWeight: 700, color: isNow ? '#6366f1' : '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {monthPretty(m)}
                </p>
                {isNow && (
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#6366f1', marginTop: 2 }}>TODAY</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Event columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${months.length}, minmax(104px,1fr))`,
          minHeight: 360,
          padding: '8px 16px 14px',
          gap: 0,
          overflowX: 'auto',
          background: '#fafafa',
          borderBottom: '1px solid #f4f4f5',
        }}>
          {buckets.map(b => (
            <div key={b.ym} style={{ padding: '4px', borderRight: '1px solid #f0f0f0', borderLeft: '1px solid transparent', background: '#fff', minHeight: 340, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {b.events.sort((x, y) => x.date.localeCompare(y.date)).map(e => {
                  const ctr = contracts.find(c => c.id === e.contractId)!;
                  const sevBg = e.severity === 'critical' ? '#fef2f2' : e.severity === 'high' ? '#fffbeb' : e.severity === 'medium' ? '#eef2ff' : '#f9fafb';
                  const sevBr = e.severity === 'critical' ? '#fecaca' : e.severity === 'high' ? '#fde68a' : e.severity === 'medium' ? '#c7d2fe' : '#f4f4f5';

                  const pri = e.personaPriority[persona.id];
                  const dim = pri === 1 ? 0.75 : 1;

                  const cit = eventCitation(e);
                  const demoHi = demoFlow !== null && demoStep >= 0 && isDemoHighlighted(demoFlow, demoStep, e);

                  const openContract = () => navigate(`/contract/${e.contractId}`);

                  return (
                    <div key={e.id} id={`ob-${e.id}`} className="obligation-anchor" style={{ minWidth: 0 }}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Open contract: ${ctr.counterparty}, ${e.title}`}
                      onClick={openContract}
                      onKeyDown={kv => {
                        if (kv.key === 'Enter' || kv.key === ' ') {
                          kv.preventDefault();
                          openContract();
                        }
                      }}
                      style={{
                        textAlign: 'left', cursor: 'pointer',
                        padding: '8px 8px',
                        borderRadius: 9,
                        background: demoHi ? '#eef2ff' : sevBg,
                        border: `1px solid ${demoHi ? '#6366f1' : sevBr}`,
                        boxShadow: demoHi ? '0 4px 12px rgba(99,102,241,0.12)' : 'none',
                        transform: demoHi ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease',
                        opacity: dim,
                      }}
                      onMouseEnter={ev => (ev.currentTarget.style.transform = demoHi ? 'scale(1.02)' : 'scale(1.01)')}
                      onMouseLeave={ev => (ev.currentTarget.style.transform = demoHi ? 'scale(1.02)' : 'scale(1)')}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1fr) auto',
                        alignItems: 'start',
                        gap: 6,
                        marginBottom: 4,
                        minWidth: 0,
                      }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                          background: demoHi ? '#6366f1' : '#fff', color: demoHi ? '#fff' : '#71717a',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.35,
                        }}>
                          {KIND_LABEL[e.kind]}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#6366f1',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          lineHeight: 1.35,
                        }}>
                          {countdownLabel(e.date, TODAY_ISO, { compact: true })}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#71717a', marginBottom: 2 }}>{e.date}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#18181b', marginBottom: 3, lineHeight: 1.35 }}>
                        {ctr.counterparty.split(' ')[0]}
                      </p>
                      <p style={{ fontSize: 10, color: '#52525b', lineHeight: 1.45, marginBottom: 6 }}>
                        {e.title}
                      </p>
                      {/* Cited monetary / AI confidence footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                        {e.amount ? (
                          <Citation
                            trigger="click"
                            contractId={e.contractId}
                            clauseRef={cit.clauseRef}
                            clauseRefAr={cit.clauseRefAr}
                            quote={cit.quote}
                            quoteAr={cit.quoteAr}
                            confidence={cit.confidence}
                            derivation={cit.derivation}
                            benchmarkSource={cit.benchmarkSource}
                            style={{ borderBottomStyle: 'dotted', fontSize: 10, fontWeight: 700 }}
                          >
                            <span style={{ color: '#dc2626' }}>{fmt(e.amount)}</span>
                          </Citation>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#a1a1aa' }}>
                            <DiamondIcon size={8} color="#6366f1" />
                            AI {cit.confidence}%
                          </span>
                        )}
                        {demoHi && <Zap size={11} color="#6366f1" />}
                      </div>
                    </div>
                    </div>
                  );
                })}
                {b.events.length === 0 && (
                  <div style={{
                    flex: 1, minHeight: 60, marginTop: 8, borderRadius: 8,
                    border: '1px dashed #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, color: '#d4d4d8' }}>-</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer legend */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: '12px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DiamondIcon size={11} color="#6366f1" />
            <span style={{ fontSize: 11, color: '#71717a' }}>Diamond underline = click the value on timeline cards for clause quote · elsewhere hover still works.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              ['#fef2f2', '#fecaca', 'Critical'],
              ['#fffbeb', '#fde68a', 'High'],
              ['#eef2ff', '#c7d2fe', 'Medium'],
              ['#f9fafb', '#f4f4f5', 'Low'],
            ].map(([bg, br, l]) => (
              <span key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#71717a' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: bg as string, border: `1px solid ${br}` }} />
                {l as string}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
