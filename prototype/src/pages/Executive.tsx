import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, ChevronRight, Shield, FileText, Calendar } from 'lucide-react';
import { executiveBrief, contracts, vendorIntelligence, personas } from '../data/contracts';
import { Card, SectionLabel, RiskBadge, DiamondIcon, Btn, fmt, AIBadge } from '../components/ui';
function KpiCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <Card style={{ padding: '18px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#18181b', marginBottom: 6, lineHeight: 1.2 }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {positive
          ? <TrendingUp size={12} color="#16a34a" />
          : <TrendingDown size={12} color="#dc2626" />
        }
        <span style={{ fontSize: 11, fontWeight: 500, color: positive ? '#16a34a' : '#dc2626' }}>{delta}</span>
      </div>
    </Card>
  );
}

function HighlightCard({ item }: { item: typeof executiveBrief.highlights[0] }) {
  const cfg = {
    risk: { Icon: AlertTriangle, bg: '#fef2f2', border: '#fecaca', iconColor: '#dc2626', label: 'Risk', labelBg: '#fef2f2', labelColor: '#b91c1c' },
    opportunity: { Icon: TrendingUp, bg: '#f0fdf4', border: '#bbf7d0', iconColor: '#16a34a', label: 'Opportunity', labelBg: '#f0fdf4', labelColor: '#15803d' },
    action: { Icon: Zap, bg: '#eef2ff', border: '#c7d2fe', iconColor: '#4338ca', label: 'Action Required', labelBg: '#eef2ff', labelColor: '#4338ca' },
  }[item.type];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <cfg.Icon size={14} color={cfg.iconColor} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em', background: cfg.labelBg, color: cfg.labelColor }}>
            {cfg.label}
          </span>
          {item.value && (
            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.iconColor }}>{item.value}</span>
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 3 }}>{item.title}</p>
        <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.6 }}>{item.detail}</p>
      </div>
    </div>
  );
}

export default function Executive() {
  const navigate = useNavigate();
  const audience = personas.find(p => p.id === 'cfo')!;
  const brief = executiveBrief;
  const topVendors = [...vendorIntelligence].sort((a, b) => b.potentialSaving - a.potentialSaving).slice(0, 3);
  const expiringContracts = contracts.filter(c => c.status === 'Expiring Soon');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="anim-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DiamondIcon size={16} color="#6366f1" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#18181b' }}>Executive Brief</h1>
            <AIBadge label="AI-generated" />
          </div>
          <p style={{ fontSize: 13, color: '#71717a', marginLeft: 42 }}>
            Week of {brief.weekOf} · Personalized for{' '}
            <strong style={{ color: '#18181b' }}>{audience.name}</strong> ({audience.role})
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" demoOnly><Calendar size={13} strokeWidth={1.75} />Previous weeks</Btn>
          <Btn variant="primary" size="sm" demoOnly><FileText size={13} strokeWidth={1.75} />Export PDF</Btn>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {brief.kpis.map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.positive} />)}
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'flex-start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Highlights */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionLabel>This Week's Highlights</SectionLabel>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: '#f0f0ff', color: '#6366f1' }}>
                {brief.highlights.length} items
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {brief.highlights.map((h, i) => <HighlightCard key={i} item={h} />)}
            </div>
          </Card>

          {/* Savings pipeline */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <SectionLabel>Savings Pipeline</SectionLabel>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#16a34a', lineHeight: 1 }}>{fmt(brief.potentialSavings)}</p>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => navigate('/vault')}>View all <ChevronRight size={12} /></Btn>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topVendors.map((v, i) => (
                <div
                  key={v.contractId}
                  onClick={() => navigate(`/contract/${v.contractId}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < topVendors.length - 1 ? '1px solid #f4f4f5' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {v.vendor.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{v.vendor}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: '#71717a' }}>Leverage {v.leverageScore}/100</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em', background: v.urgency === 'High' ? '#fef2f2' : v.urgency === 'Medium' ? '#fffbeb' : '#f0fdf4', color: v.urgency === 'High' ? '#dc2626' : v.urgency === 'Medium' ? '#d97706' : '#15803d' }}>
                          {v.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{fmt(v.potentialSaving)}</p>
                      <p style={{ fontSize: 11, color: '#a1a1aa' }}>potential saving</p>
                    </div>
                    <ChevronRight size={14} color="#d4d4d8" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Expiring */}
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <AlertTriangle size={14} color="#d97706" strokeWidth={2} />
                <SectionLabel>Expiring Soon</SectionLabel>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#fffbeb', color: '#b45309' }}>{expiringContracts.length}</span>
            </div>
            <div>
              {expiringContracts.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/contract/${c.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 0', borderBottom: i < expiringContracts.length - 1 ? '1px solid #f4f4f5' : 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s' }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.counterparty}</p>
                    <p style={{ fontSize: 11, color: '#71717a', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#b45309', marginTop: 2 }}>{c.expirationDate}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#18181b', marginBottom: 3 }}>{fmt(c.value)}</p>
                    <RiskBadge risk={c.risk} />
                  </div>
                </button>
              ))}
            </div>
            <Btn variant="outline" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => navigate('/vault')}>
              View all expiring <ChevronRight size={12} />
            </Btn>
          </Card>

          {/* PDPL */}
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <Shield size={14} color="#6366f1" strokeWidth={2} />
              <SectionLabel>PDPL Status</SectionLabel>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', lineHeight: 1 }}>{brief.criticalPdpl}</p>
                <p style={{ fontSize: 11, color: '#b91c1c', marginTop: 3 }}>Critical violations</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>{brief.pdplViolations}</p>
                <p style={{ fontSize: 11, color: '#71717a' }}>Total flagged</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: '#f0f0ff', border: '1px solid #c7d2fe', marginBottom: 12 }}>
              <DiamondIcon size={12} color="#6366f1" />
              <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>STC breach notification clause escalated to Legal Director</p>
            </div>
            <Btn variant="outline" size="sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/legal')}>
              <Shield size={12} strokeWidth={1.75} />Open PDPL Sweep <ChevronRight size={12} />
            </Btn>
          </Card>

          {/* Action items */}
          <Card style={{ padding: 18 }}>
            <SectionLabel>Recommended Actions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Initiate Microsoft renegotiation', due: 'By Sep 2026', p: 'High' },
                { label: 'Issue STC co-location RFP', due: 'Aug 2026', p: 'High' },
                { label: 'Remediate STC PDPL Clause 14.1', due: 'Immediate', p: 'Critical' },
                { label: 'Review Hays HR data transfers', due: 'This week', p: 'Critical' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f4f4f5' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.p === 'Critical' ? '#dc2626' : '#d97706', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#18181b' }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>{a.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
