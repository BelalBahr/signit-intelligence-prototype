import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight, AlertTriangle, GitCompareArrows } from 'lucide-react';
import {
  clauseDeviations,
  policyStandard,
  contracts,
  type ClauseDeviationRow,
  type DeviationStatus,
  type ClauseCell,
} from '../data/contracts';
import { Card, SectionLabel, Btn, DiamondIcon, AIBadge } from '../components/ui';

const COL_KEYS = ['liabilityCap', 'noticePeriod', 'paymentTerms', 'breachNotification', 'retentionPeriod'] as const;
type ClauseKey = (typeof COL_KEYS)[number];

const COL_LABELS: Record<ClauseKey, { label: string; policyLine: string }> = {
  liabilityCap:        { label: 'Liability cap', policyLine: policyStandard.liabilityCap },
  noticePeriod:        { label: 'Termination notice', policyLine: policyStandard.noticePeriod },
  paymentTerms:        { label: 'Payment terms', policyLine: policyStandard.paymentTerms },
  breachNotification:  { label: 'Breach notification', policyLine: policyStandard.breachNotification },
  retentionPeriod:     { label: 'Data retention', policyLine: policyStandard.retentionPeriod },
};

function deviationDot(status: DeviationStatus) {
  const palette: Record<DeviationStatus, { bg: string; border: string }> = {
    standard: { bg: '#bbf7d0', border: '#22c55e' },
    over: { bg: '#fef9c3', border: '#facc15' },
    under: { bg: '#dbeafe', border: '#3b82f6' },
    missing: { bg: '#f4f4f5', border: '#e4e4e7' },
    flagged: { bg: '#fecaca', border: '#f87171' },
  };
  const p = palette[status];
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.bg, border: `1px solid ${p.border}` }} />;
}

function Cell({ metric, column }: { metric: ClauseCell; column: ClauseKey }) {
  const risky = column === 'breachNotification' && metric.status === 'flagged';
  let confidence =
    risky ? 98 :
      column === 'liabilityCap' ? 93 :
        column === 'retentionPeriod' ? 88 :
          column === 'noticePeriod' ? 95 : 94;
  if (metric.status === 'missing') confidence = Math.min(confidence, 55);

  return (
    <div style={{
      borderRadius: 9,
      border: `1px solid ${risky ? '#fecaca' : '#f4f4f5'}`,
      background: risky ? '#fff7ed' : '#fff',
      padding: '10px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {deviationDot(metric.status)}
        <p style={{
          fontSize: 13, fontWeight: 600,
          color: risky ? '#9a3412' : '#111827',
        }}>
          {metric.value}
        </p>
      </div>
      <p style={{ fontSize: 11, color: '#71717a', lineHeight: 1.45 }}>
        <strong style={{ fontWeight: 700, color: '#52525b' }}>Baseline:</strong>{' '}
        {COL_LABELS[column].policyLine}
      </p>
      {metric.note && (
        <p style={{
          marginTop: 6, fontSize: 11,
          color: risky ? '#9a3412' : '#4b5563',
        }}>
          {metric.note}
        </p>
      )}
      <div style={{
        marginTop: 8, display: 'flex', gap: 6, alignItems: 'center',
        fontSize: 10, fontWeight: 600, color: '#6366f1',
      }}>
        <DiamondIcon size={9} color="#6366f1" />
        AI extractor · {confidence}%
      </div>
    </div>
  );
}

function flagScore(row: ClauseDeviationRow) {
  let score = 0;
  COL_KEYS.forEach(col => {
    const cell = row[col];
    if (cell.status === 'flagged' || cell.status === 'missing') score += 2;
    else if (cell.status !== 'standard') score += 1;
  });
  return score;
}

export default function Compare() {
  const navigate = useNavigate();
  const [focusFlaggedOnly, setFocusFlaggedOnly] = useState(false);

  const rows = [...clauseDeviations]
    .filter(row => {
      if (!focusFlaggedOnly) return true;
      return COL_KEYS.some(col => {
        const cell = row[col];
        return cell.status === 'flagged' || cell.status === 'missing';
      });
    })
    .sort((a, b) => flagScore(b) - flagScore(a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="anim-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: '#eef2ff',
              border: `1px solid ${'#e5e7eb'}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Scale size={18} strokeWidth={1.75} color="#4338ca" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Clause Compare Matrix</h1>
              <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 720 }}>
                Live matrix over {rows.length} material agreements -
                outliers surface without opening PDF stacks. Hover row headers to pivot into Obligation Timeline.
              </p>
            </div>
            <GitCompareArrows size={34} strokeWidth={1.5} style={{ opacity: 0.2 }} />
          </div>
          <div style={{
            marginTop: 14, display: 'inline-flex',
            alignItems: 'center', gap: 8,
            padding: '6px 10px',
            borderRadius: 999,
            background: '#f5f3ff',
            border: `1px solid ${'#ddd6fe'}`,
            fontSize: 11, fontWeight: 600,
            color: '#5b21b6',
          }}>
            <DiamondIcon size={11} />
            Structural comparison · negated clauses still routed separately
          </div>
          <span style={{
            marginLeft: 10,
            fontSize: 11,
            fontWeight: 600,
          }}>
            <AIBadge label="clause graph" />{' '}+ SME policy corpus
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant={focusFlaggedOnly ? 'secondary' : 'outline'} size="sm" onClick={() => setFocusFlaggedOnly(v => !v)}>
            {focusFlaggedOnly ? 'Show full matrix' : 'Flagged deltas only'}
          </Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate('/legal')}>PDPL Sweep<ArrowRight size={13} /></Btn>
        </div>
      </div>

      {/* Policy corpus */}
      <Card style={{
        padding: 18,
        background: '#fafbff',
      }}>
        <SectionLabel>Organisation playbook</SectionLabel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
          gap: 10,
          marginTop: 10,
        }}>
          {(Object.keys(policyStandard) as Array<keyof typeof policyStandard>).map(key => (
            <div key={key as string} style={{
              borderRadius: 10,
              border: `1px solid ${'#e5e7eb'}`,
              background: '#fff',
              padding: '10px 12px',
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700,
                color: '#9ca3af',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>{COL_LABELS[key].label}</p>
              <p style={{
                fontSize: 12, fontWeight: 600,
                color: '#111827',
              }}>{policyStandard[key]}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Matrix */}
      <div style={{
        borderRadius: 16,
        border: `1px solid ${'#e5e7eb'}`,
        background: '#ffffff',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${'#f3f4f6'}`,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <AlertTriangle size={15} color="#f97316" />
          <p style={{
            fontSize: 13, fontWeight: 600,
            color: '#1f2937',
          }}>
            Visual heatmap hides nothing - missing cells imply extractor uncertainty, never “clean.”
          </p>
        </div>
        <div style={{
          overflowX: 'auto',
        }}>
          <table style={{
            minWidth: 1100, width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9ca3af',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: '#f9fafb',
                  borderBottom: `1px solid ${'#f3f4f6'}`,
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  minWidth: 220,
                }}>
                  Vendor
                </th>
                {COL_KEYS.map(col => (
                  <th key={col}
                    style={{
                      textAlign: 'left',
                      padding: '14px',
                      borderBottom: `1px solid ${'#f3f4f6'}`,
                      fontSize: 11, fontWeight: 700,
                      color: '#9ca3af',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                    {COL_LABELS[col].label}
                  </th>
                ))}
                <th style={{
                  textAlign: 'center',
                  padding: '14px',
                  borderBottom: `1px solid ${'#f3f4f6'}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9ca3af',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  minWidth: 120,
                }}>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const c = contracts.find(ct => ct.id === row.contractId);
                const score = flagScore(row);
                const heat = score >= 8 ? '#fee2e2' : score >= 5 ? '#ffedd5' : '#ecfdf5';
                return (
                  <tr key={row.contractId}>
                    {/* Sticky */}
                    <td style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${'#f9fafb'}`,
                      verticalAlign: 'top',
                      position: 'sticky',
                      left: 0,
                      zIndex: 5,
                      background: '#ffffff',
                      minWidth: 220,
                    }}>
                      <button
                        style={{
                          textAlign: 'left',
                          border: 'none',
                          background: '#f9fafb',
                          cursor: 'pointer',
                          padding: '10px 12px',
                          borderRadius: 12,
                          width: '100%',
                        }}
                        onClick={() => navigate(`/contract/${row.contractId}`)}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{
                            width: 40, height: 40,
                            borderRadius: '50%',
                            background: '#eef2ff',
                            color: '#4338ca',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                          }}>{row.vendor.slice(0, 2)}
                          </span>
                          <span>
                            <p style={{ fontWeight: 600, color: '#111827' }}>{row.vendor}</p>
                            <p style={{
                              marginTop: 2,
                              fontSize: 12,
                              color: '#6b7280',
                            }}>
                              {row.contractTitle}
                            </p>
                            {(c?.completenessScore ?? 100) < 90 && (
                              <p style={{ marginTop: 4, fontSize: 11, color: '#b45309', fontWeight: 600 }}>
                                Extractor completeness {c?.completenessScore}%
                              </p>
                            )}
                          </span>
                        </div>
                      </button>
                    </td>
                    {COL_KEYS.map(col => (
                      <td key={col} style={{
                        padding: 12,
                        borderBottom: `1px solid ${'#f9fafb'}`,
                        verticalAlign: 'top',
                      }}>
                        <Cell metric={row[col]} column={col} />
                      </td>
                    ))}
                    <td style={{
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      padding: '0 12px',
                      borderBottom: `1px solid ${'#f9fafb'}`,
                    }}>
                      <div style={{
                        borderRadius: 999,
                        padding: '6px 14px',
                        background: heat,
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#0f172a',
                        margin: '0 auto',
                      }}>
                        Δ {score.toString().padStart(2, '0')}
                      </div>
                      <Btn variant="outline" style={{ marginTop: 12, width: '100%' }}
                        size="sm"
                        onClick={() => navigate(`/contract/${row.contractId}`)}>
                        Open dossier<ChevronMini />
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChevronMini() {
  return <ArrowRight size={13} />;
}
