import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ArrowUpDown, Plus, Download, AlertTriangle, ChevronRight,
  Shield, Layers, ClipboardList, FileWarning,
} from 'lucide-react';
import { contracts } from '../data/contracts';
import type { Contract } from '../data/contracts';
import { Card, ContractTag, StatusBadge, RiskBadge, Btn, fmt, DiamondIcon } from '../components/ui';
import { SmartAssistant } from '../components/SmartAssistant';

function ContractRow({ contract, muted, onClick }: {
  contract: Contract;
  muted: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      style={{
        background: hover ? '#fafbfb' : '#fff',
        cursor: 'pointer',
        opacity: muted ? 0.36 : 1,
        transition: 'background 0.1s, opacity 0.15s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#f4f4f5',
            border: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileText size={14} color="#71717a" strokeWidth={1.75} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 13, fontWeight: 600,
              color: '#18181b', marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', maxWidth: 240,
            }}>
              {contract.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {contract.tags.map(t => <ContractTag key={t} label={t} />)}
              {contract.pdplClauses > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '1px 6px',
                  borderRadius: 4, fontSize: 11,
                  fontWeight: 500, background: '#fef2f2',
                  color: '#dc2626', border: '1px solid #fecaca',
                }}>
                  <AlertTriangle size={9} />{contract.pdplClauses} PDPL
                </span>
              )}
              {(contract.completenessScore ?? 100) < 85 && (
                <span style={{
                  display: 'inline-flex', gap: 3, padding: '1px 6px',
                  borderRadius: 4, fontSize: 11,
                  fontWeight: 500,
                  background: '#fff7ed',
                  color: '#c2410c', border: '1px solid #fed7aa',
                }}>
                  {contract.completenessScore}% completeness
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, color: '#52525b' }}>{contract.type}</span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, color: '#52525b' }}>{contract.counterparty}</span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{fmt(contract.value)}</span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{
            fontSize: 12,
            color: contract.status === 'Expiring Soon' ? '#b45309' : '#71717a',
            fontWeight: contract.status === 'Expiring Soon' ? 600 : 400,
          }}>
            {contract.expirationDate}
          </span>
          <StatusBadge status={contract.status} />
        </div>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5', whiteSpace: 'nowrap' }}>
        <RiskBadge risk={contract.risk} />
      </td>
      <td style={{ padding: '12px', borderBottom: '1px solid #f4f4f5', width: 32 }} />
    </tr>
  );
}

export default function Vault() {
  const navigate = useNavigate();
  const [lowCompletenessOnly, setLowCompletenessOnly] = useState(false);

  const ranked = useMemo(
    () => [...contracts].sort((a, b) => b.value - a.value),
    [],
  );

  const lowCompletenessCount = contracts.filter(
    c => c.extractionStatus === 'incomplete' || (c.completenessScore ?? 100) < 92,
  ).length;

  const visibleRanked = useMemo(() => {
    if (!lowCompletenessOnly) return ranked;
    return ranked.filter(
      c => c.extractionStatus === 'incomplete' || (c.completenessScore ?? 100) < 92,
    );
  }, [ranked, lowCompletenessOnly]);

  const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const expiring = contracts.filter(c => c.status === 'Expiring Soon');

  return (
    <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }} className="anim-up">
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#18181b', marginBottom: 6 }}>
              Contract Vault
            </h1>
            <p style={{ fontSize: 13, color: '#71717a' }}>
              {contracts.length} contracts ·{' '}
              <span style={{ fontWeight: 600, color: '#52525b' }}>{fmt(totalValue)}</span>
              {' '}total - ordered by obligation value (use the Obligation Timeline lens to reprioritize by role).
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" demoOnly><Download size={13} strokeWidth={1.75} />Export</Btn>
            <Btn variant="primary" size="sm" demoOnly><Plus size={13} strokeWidth={2} />Vault ingest</Btn>
          </div>
        </div>

        {expiring.length > 0 && (
          <div style={{
            borderRadius: 10,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '12px 16px',
          }} className="anim-scale">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle color="#d97706" size={17} strokeWidth={1.85} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#78350f' }}>
                    Expiry cluster · {expiring.length} contracts before year‑end
                  </p>
                  <p style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
                    {fmt(expiring.reduce((acc, contract) => acc + contract.value, 0))} of renewals on the Obligation Timeline
                  </p>
                </div>
              </div>
              <Btn variant="outline" size="sm" style={{ gap: 4 }} onClick={() => navigate('/timeline')}>
                View timeline<ChevronRight size={12} />
              </Btn>
            </div>
          </div>
        )}

        <Card style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f4f4f5',
            display: 'flex', alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Portfolio register</span>
            <span style={{
              padding: '1px 6px',
              borderRadius: 999,
              background: '#f0f0ff',
              color: '#6366f1',
              fontWeight: 600,
              fontSize: 11,
            }}>
              {visibleRanked.length}{lowCompletenessOnly ? ` of ${contracts.length}` : ''}
            </span>
            <button
              type="button"
              onClick={() => setLowCompletenessOnly(v => !v)}
              title={
                lowCompletenessOnly
                  ? 'Showing only contracts with incomplete extraction or completeness < 92%'
                  : 'Filter to contracts with incomplete extraction or completeness < 92%'
              }
              style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center',
                gap: 5, padding: '5px 10px',
                borderRadius: 7,
                border: lowCompletenessOnly ? '1px solid #fde68a' : '1px solid #e4e4e7',
                fontSize: 12,
                color: lowCompletenessOnly ? '#b45309' : '#71717a',
                background: lowCompletenessOnly ? '#fffbeb' : '#fff',
                fontWeight: lowCompletenessOnly ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <FileWarning size={11} strokeWidth={2} />
              Low completeness only · {lowCompletenessCount}
            </button>
            <button
              type="button"
              title="Sort by obligation value (default)"
              aria-disabled="true"
              style={{
                display: 'flex', alignItems: 'center',
                gap: 5, padding: '5px 10px',
                borderRadius: 7,
                border: '1px solid #e4e4e7',
                fontSize: 12, color: '#a1a1aa', background: '#fafafa',
                cursor: 'not-allowed',
              }}
            >
              <ArrowUpDown size={11} strokeWidth={2} />Sort
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  {['Contract', 'Type', 'Vendor', 'Value', 'Expiration', 'Risk', ''].map(label => (
                    <th key={label} style={{
                      padding: '9px 16px',
                      textAlign: 'left',
                      borderBottom: '1px solid #f4f4f5',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#a1a1aa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRanked.map(contract => (
                  <ContractRow
                    key={contract.id}
                    contract={contract}
                    muted={false}
                    onClick={() => navigate(`/contract/${contract.id}`)}
                  />
                ))}
                {visibleRanked.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#a1a1aa', fontSize: 13 }}>
                      No contracts match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Smart assistant */}
      <div style={{
        width: 302,
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <Card style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <SmartAssistant scope="portfolio" personaId="viewer" headline="Portfolio assistant" />
          <div style={{ borderTop: '1px solid #f4f4f5', padding: '0 14px 14px' }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              color: '#a1a1aa',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '12px 0 8px',
            }}>Next best actions</p>
            {[
              { label: 'Surface PDPL outliers', Icon: Shield, route: '/legal' },
              { label: 'Open clause compare overlay', Icon: Layers, route: '/compare' },
              { label: 'Triage ingestion queue', Icon: ClipboardList, route: '/review' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 6,
                  borderRadius: 8,
                  border: '1px solid #f4f4f5',
                  background: '#fff',
                  display: 'flex',
                  gap: 10,
                  cursor: 'pointer',
                  alignItems: 'center',
                }}
              >
                <item.Icon size={15} strokeWidth={1.8} color="#6366f1" />
                <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>{item.label}</span>
                <ChevronRight size={13} color="#d4d4d8" />
              </button>
            ))}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f4f4f5', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 8 }}>
            <DiamondIcon size={11} color="#6366f1" />
            <span style={{ fontSize: 11, color: '#a1a1aa' }}>
              Smart prompts cite contract passages - hover any answer source for provenance & confidence routing.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
