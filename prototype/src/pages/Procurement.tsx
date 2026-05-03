import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ChevronRight, Zap, ArrowUpDown } from 'lucide-react';
import { vendorIntelligence, contracts, pdplClauses, personas } from '../data/contracts';
import { Card, SectionLabel, DiamondIcon, Btn, fmt, AIBadge } from '../components/ui';
import { Citation } from '../components/Citation';

function leverageColor(score: number) {
  return score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#a1a1aa';
}
function leverageLabel(score: number) {
  return score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak';
}

type Row = typeof vendorIntelligence[0] & { contract: typeof contracts[0] };

function buildRows(): Row[] {
  return vendorIntelligence
    .map(vi => ({
      ...vi,
      contract: contracts.find(c => c.id === vi.contractId)!,
    }))
    .filter(r => r.contract)
    .sort((a, b) => b.potentialSaving - a.potentialSaving);
}

function OverMarket({ current, median }: { current: number; median: number }) {
  const pct = ((current - median) / median) * 100;
  const isOver = pct > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {isOver
        ? <TrendingUp size={12} color="#dc2626" />
        : <TrendingDown size={12} color="#16a34a" />
      }
      <span style={{ fontSize: 13, fontWeight: 600, color: isOver ? '#dc2626' : '#16a34a' }}>
        {isOver ? '+' : ''}{pct.toFixed(0)}%
      </span>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: 'High' | 'Medium' | 'Low' }) {
  const cfg = {
    High:   { bg: '#fef2f2', color: '#dc2626' },
    Medium: { bg: '#fffbeb', color: '#d97706' },
    Low:    { bg: '#f0fdf4', color: '#15803d' },
  }[urgency];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: '0.04em', background: cfg.bg, color: cfg.color }}>
      {urgency}
    </span>
  );
}

function VendorRow({ row, onClick }: { row: Row; onClick: () => void }) {
  const initials = row.vendor.substring(0, 2).toUpperCase();
  const cite = pdplClauses.find(c => c.contractId === row.contractId);
  const citeConfidence = cite?.aiConfidence ?? 88;
  return (
    <tr
      style={{ cursor: 'pointer', transition: 'background 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
      onClick={onClick}
    >
      {/* Vendor */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 2 }}>{row.vendor}</p>
            <p style={{ fontSize: 11, color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{row.contract.title}</p>
          </div>
        </div>
      </td>

      {/* Current rate */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{fmt(row.currentRate)}</span>
      </td>

      {/* Market median */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, color: '#52525b' }}>{fmt(row.marketMedian)}</span>
      </td>

      {/* Over market */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <OverMarket current={row.currentRate} median={row.marketMedian} />
      </td>

      {/* Leverage */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5', minWidth: 130 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: leverageColor(row.leverageScore) }}>
              {leverageLabel(row.leverageScore)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#52525b' }}>{row.leverageScore}/100</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: '#f4f4f5', overflow: 'hidden' }}>
            <div style={{ width: `${row.leverageScore}%`, height: '100%', borderRadius: 99, background: leverageColor(row.leverageScore), transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </td>

      {/* Potential saving */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <Citation
          contractId={row.contractId}
          clauseRef={cite?.clauseRef ?? `${row.vendor} · Commercial appendix`}
          quote={cite?.clauseText ?? `"${row.recommendedAction.slice(0, 160)}..."`}
          confidence={Math.round((row.leverageScore + citeConfidence) / 2)}
          derivation={row.leverageReason}
          benchmarkSource={row.benchmarkSource}
          style={{ fontSize: 14 }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{fmt(row.potentialSaving)}</span>
        </Citation>
      </td>

      {/* Urgency */}
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <UrgencyBadge urgency={row.urgency} />
      </td>

      {/* Action */}
      <td style={{ padding: '14px 12px 14px 0', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Btn variant="outline" size="sm" onClick={e => { e.stopPropagation(); onClick(); }}>
            Review <ChevronRight size={11} />
          </Btn>
        </div>
      </td>
    </tr>
  );
}

export default function Procurement() {
  const navigate = useNavigate();
  const lead = personas.find(p => p.id === 'procurement')!;
  const rows = buildRows();
  const totalSaving = rows.reduce((s, r) => s + r.potentialSaving, 0);
  const highLeverage = rows.filter(r => r.leverageScore >= 70);
  const highPriority = rows.filter(r => r.urgency === 'High');
  const avgOverMarket = rows.reduce((s, r) => s + ((r.currentRate - r.marketMedian) / r.marketMedian) * 100, 0) / rows.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="anim-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DiamondIcon size={16} color="#6366f1" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#18181b' }}>Procurement Intelligence</h1>
            <AIBadge label="AI-powered" />
          </div>
          <p style={{ fontSize: 13, color: '#71717a', marginLeft: 42 }}>
            Vendor benchmarking across {rows.length} contracts · Benchmarks updated Apr 28, 2026 ·{' '}
            Owned by{' '}
            <strong style={{ color: '#18181b' }}>{lead.name}</strong> · {lead.role} · Renewals & leverage focus.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" demoOnly><Zap size={13} strokeWidth={1.75} />Run new analysis</Btn>
          <Btn variant="primary" size="sm" demoOnly><TrendingUp size={13} strokeWidth={1.75} />Export report</Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Savings Pipeline', value: fmt(totalSaving), sub: 'across all vendors', color: '#16a34a', Icon: TrendingUp },
          { label: 'Highest Leverage', value: `${Math.max(...rows.map(r => r.leverageScore))}/100`, sub: 'Al-Jazirah Supplies', color: '#6366f1', Icon: Zap },
          { label: 'High Priority', value: `${highPriority.length} vendors`, sub: 'require immediate action', color: '#dc2626', Icon: TrendingDown },
          { label: 'Avg. Above Market', value: `+${avgOverMarket.toFixed(0)}%`, sub: `across ${rows.length} benchmarked`, color: '#d97706', Icon: ArrowUpDown },
        ].map(k => (
          <Card key={k.label} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</p>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.Icon size={13} color={k.color} strokeWidth={2} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#18181b', lineHeight: 1.2, marginBottom: 4 }}>{k.value}</p>
            <p style={{ fontSize: 11, color: '#a1a1aa' }}>{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f4f4f5', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>Vendor Renegotiation Pipeline</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: '#f0f0ff', color: '#6366f1' }}>{rows.length}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 8 }}>
            <DiamondIcon size={11} color="#6366f1" />
            <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 500 }}>Sorted by potential saving</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#71717a', padding: '5px 10px', borderRadius: 7, border: '1px solid #e4e4e7', background: '#fff', cursor: 'pointer' }}>
              <ArrowUpDown size={11} strokeWidth={2} />Sort
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Vendor', 'Current Rate', 'Market Median', 'vs. Market', 'Leverage', 'Potential Saving', 'Urgency', ''].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <VendorRow
                  key={row.contractId}
                  row={row}
                  onClick={() => navigate(`/contract/${row.contractId}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* High leverage highlight */}
      {highLeverage.length > 0 && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <DiamondIcon size={14} color="#6366f1" />
            <SectionLabel>Signit AI - Highest-Impact Opportunities</SectionLabel>
            <AIBadge />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {highLeverage.map(row => (
              <div
                key={row.contractId}
                onClick={() => navigate(`/contract/${row.contractId}`)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0f0ff')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {row.vendor.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{row.vendor}</span>
                    <UrgencyBadge urgency={row.urgency} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{fmt(row.potentialSaving)} potential saving</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.6 }}>{row.recommendedAction}</p>
                  <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{row.benchmarkSource}</p>
                </div>
                <ChevronRight size={14} color="#d4d4d8" style={{ flexShrink: 0, marginTop: 4 }} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
