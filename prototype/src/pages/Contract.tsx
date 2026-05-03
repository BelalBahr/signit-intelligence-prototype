import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Bell, Edit2, Download, ExternalLink,
  AlertTriangle, CheckCircle2, Clock, FileText, BarChart2, Activity,
} from 'lucide-react';
import { contracts, vendorIntelligence, pdplClauses } from '../data/contracts';
import {
  Card, SectionLabel, KVRow, RiskBadge, StatusBadge, ContractTag,
  DiamondIcon, Btn, Divider, LeverageBar, fmt, fmtFull, AIBadge,
} from '../components/ui';
import { SmartAssistant } from '../components/SmartAssistant';
import { Citation } from '../components/Citation';

type Section = 'overview' | 'intelligence' | 'activity';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contract = contracts.find(c => c.id === id);
  const intel = vendorIntelligence.find(v => v.contractId === id);
  const citeClause = id ? pdplClauses.find(p => p.contractId === id) : undefined;
  const [section, setSection] = useState<Section>('overview');

  if (!contract) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#a1a1aa', fontSize: 15 }}>Contract not found</p>
      </div>
    );
  }

  const sectionTabs: { key: Section; label: string; icon: typeof FileText }[] = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'intelligence', label: 'Vendor Intelligence', icon: BarChart2 },
    { key: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }} className="anim-up">
      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button
            onClick={() => navigate('/vault')}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e4e4e7', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
          >
            <ChevronLeft size={16} color="#71717a" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 600, color: '#18181b', lineHeight: 1.3, marginBottom: 8 }}>
                  {contract.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={contract.status} />
                  <RiskBadge risk={contract.risk} />
                  <span style={{ fontSize: 12, color: '#a1a1aa' }}>{contract.type}</span>
                  {contract.pdplClauses > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '2px 8px', borderRadius: 99, background: '#fef2f2', color: '#dc2626', fontWeight: 500 }}>
                      <AlertTriangle size={11} />
                      {contract.pdplClauses} PDPL issues
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="ghost" size="sm" demoOnly><Download size={13} strokeWidth={1.75} />Download</Btn>
                <Btn variant="ghost" size="sm" demoOnly><ExternalLink size={13} strokeWidth={1.75} />Open</Btn>
                <Btn variant="primary" size="sm" demoOnly><Edit2 size={13} strokeWidth={2} />Edit</Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e4e4e7', gap: 0 }}>
          {sectionTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSection(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                fontSize: 13, fontWeight: 500, background: 'none', border: 'none',
                borderBottom: section === tab.key ? '2px solid #6366f1' : '2px solid transparent',
                color: section === tab.key ? '#6366f1' : '#71717a', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <tab.icon size={13} strokeWidth={1.75} />
              {tab.label}
              {tab.key === 'intelligence' && intel && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: '#f0fdf4', color: '#15803d', marginLeft: 2 }}>
                  {fmt(intel.potentialSaving)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────────── */}
        {section === 'overview' && (
          <div className="anim-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Document overview */}
            <Card style={{ padding: 20 }}>
              <SectionLabel>Document Overview</SectionLabel>
              <KVRow label="Contract Type" value={contract.type} />
              <KVRow label="Counterparty" value={contract.counterparty} />
              <KVRow label="Value">
                <span style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>{fmtFull(contract.value)}</span>
              </KVRow>
              <KVRow label="Owner" value={contract.owner} />
              <KVRow label="Department" value={contract.department} />
              <KVRow label="Jurisdiction" value={contract.jurisdiction} />
              <KVRow label="Risk" last>
                <RiskBadge risk={contract.risk} />
              </KVRow>
              <div style={{ paddingTop: 16 }}>
                <SectionLabel>Tags</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {contract.tags.map(t => <ContractTag key={t} label={t} />)}
                </div>
              </div>
            </Card>

            {/* Key dates */}
            <Card style={{ padding: 20 }}>
              <SectionLabel>Key Dates</SectionLabel>
              <KVRow label="Effective Date" value={contract.effectiveDate} />
              <KVRow label="Signed Date" value={contract.signedDate} />
              <KVRow label="Expiration Date">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: contract.status === 'Expiring Soon' ? '#b45309' : '#18181b' }}>
                    {contract.expirationDate}
                  </span>
                  <Bell size={13} color="#d4d4d8" aria-disabled="true" style={{ cursor: 'not-allowed', opacity: 0.5 }} />
                  <Edit2 size={12} color="#d4d4d8" aria-disabled="true" style={{ cursor: 'not-allowed', opacity: 0.5 }} />
                </div>
              </KVRow>
              {contract.renewalReminder && (
                <KVRow label="Renewal Reminder">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} color="#d97706" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#d97706' }}>{contract.renewalReminder}</span>
                  </div>
                </KVRow>
              )}

              <Divider style={{ margin: '14px 0' }} />

              <SectionLabel>Parties &amp; Scope</SectionLabel>
              {contract.parties.map((p, i) => (
                <KVRow key={p.role} label={p.role} value={p.name} last={i === contract.parties.length - 1 && false} />
              ))}
              <div style={{ paddingTop: 12 }}>
                <p style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Scope</p>
                <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6 }}>{contract.scope}</p>
              </div>

              <button
                title="Demo only - not implemented in this prototype"
                aria-disabled="true"
                style={{
                  marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  width: '100%', padding: '8px 0', borderRadius: 8, border: '1px dashed #e4e4e7',
                  background: '#fafafa', fontSize: 12, color: '#a1a1aa', cursor: 'not-allowed', fontWeight: 500,
                }}
              >
                <Bell size={13} strokeWidth={1.75} />Add reminder
              </button>
            </Card>

            {/* Completeness */}
            {(contract.completenessScore ?? 100) < 92 && (
              <Card style={{ padding: 20, gridColumn: '1 / -1', border: '1px dashed #fed7aa', background: '#fffbeb' }}>
                <SectionLabel>AI Completeness Signal</SectionLabel>
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, marginBottom: 10 }}>
                  This document scored <strong>{contract.completenessScore}%</strong> on expected fields.
                  {contract.missingFields && contract.missingFields.length > 0 && (
                    <> Missing anchors:{' '}
                      <em>{contract.missingFields.join(', ')}</em>.
                    </>
                  )}
                  Low completeness blocks downstream automation until legal confirms.
                </p>
                <Btn variant="outline" size="sm" onClick={() => navigate('/review')}>
                  Queue for human review<ChevronRight size={12} />
                </Btn>
              </Card>
            )}

            {/* PDPL alert */}
            {contract.pdplClauses > 0 && (
              <Card style={{ padding: 20, gridColumn: '1 / -1', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={15} color="#dc2626" />
                    <SectionLabel>PDPL Compliance · {contract.pdplClauses} clauses flagged</SectionLabel>
                  </div>
                  <Btn variant="outline" size="sm" onClick={() => navigate('/legal')}>
                    View in PDPL Sweep <ChevronRight size={12} />
                  </Btn>
                </div>
                <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
                    Signit AI identified {contract.pdplClauses} clause{contract.pdplClauses !== 1 ? 's' : ''} with potential PDPL compliance issues. Legal review required before next renewal negotiation.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── Vendor Intelligence ───────────────────────────────────────── */}
        {section === 'intelligence' && (
          <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {intel ? (
              <>
                {/* Summary */}
                <Card style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <DiamondIcon size={14} color="#6366f1" />
                        <SectionLabel>AI Analysis</SectionLabel>
                        <AIBadge />
                      </div>
                      <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.7 }}>{intel.leverageReason}</p>
                    </div>
                    <div style={{ width: 220, flexShrink: 0 }}>
                      <LeverageBar score={intel.leverageScore} />
                    </div>
                  </div>
                </Card>

                {/* Market benchmarks */}
                <Card style={{ padding: 20 }}>
                  <SectionLabel>Market Benchmarks</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                    {([
                      {
                        label: 'Current Rate', value: fmt(intel.currentRate), highlight: true,
                        derivation: `Verified against ingestion of executed fee schedules + OCR cross-check.`,
                      },
                      {
                        label: 'Market Median', value: fmt(intel.marketMedian), highlight: false,
                        derivation: `Median from ${intel.benchmarkSource}.`,
                      },
                      {
                        label: 'Market Low', value: fmt(intel.marketLow), highlight: false,
                        derivation: `Low decile referencing comparable SAR enterprise renewals.`,
                      },
                    ] as const).map(m => (
                      <div key={m.label} style={{ padding: 16, borderRadius: 10, background: m.highlight ? '#fef2f2' : '#fafafa', border: `1px solid ${m.highlight ? '#fecaca' : '#e4e4e7'}` }}>
                        <p style={{
                          fontSize: 11, fontWeight: 600,
                          color: m.highlight ? '#b91c1c' : '#71717a',
                          marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>{m.label}</p>
                        <Citation
                          contractId={contract.id}
                          clauseRef={citeClause?.clauseRef ?? `${intel.vendor} · Commercial schedule`}
                          quote={citeClause?.clauseText ?? 'Commercial fee schedule reconciled via automated extraction + SME spot checks.'}
                          confidence={citeClause?.aiConfidence ?? 94}
                          derivation={m.derivation}
                          benchmarkSource={intel.benchmarkSource}
                          style={{
                            paddingBottom: 2,
                            fontSize: 20,
                            fontWeight: 700,
                          }}
                        >
                          <span style={{ color: m.highlight ? '#dc2626' : '#18181b' }}>
                            {m.value}
                          </span>
                        </Citation>
                      </div>
                    ))}
                  </div>

                  {/* Saving highlight */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={16} color="#15803d" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#14532d' }}>Potential annual saving</p>
                        <p style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>{intel.benchmarkSource}</p>
                      </div>
                    </div>
                    <Citation
                      contractId={contract.id}
                      clauseRef="Vendor intelligence synthesizer · savings engine"
                      quote={`Derived gap between invoiced SAR ${intel.currentRate.toLocaleString()} and deterministic market median SAR ${intel.marketMedian.toLocaleString()} with leverage modifier ${intel.leverageScore}.`}
                      confidence={93}
                      derivation={intel.leverageReason}
                      benchmarkSource={intel.benchmarkSource}
                      style={{ fontSize: 24 }}
                    >
                      <span style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{fmt(intel.potentialSaving)}</span>
                    </Citation>
                  </div>
                </Card>

                {/* Recommended action */}
                <Card style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DiamondIcon size={16} color="#6366f1" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <SectionLabel>Recommended Action</SectionLabel>
                      <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.7, marginBottom: 16 }}>{intel.recommendedAction}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em',
                          background: intel.urgency === 'High' ? '#fef2f2' : intel.urgency === 'Medium' ? '#fffbeb' : '#f0fdf4',
                          color: intel.urgency === 'High' ? '#dc2626' : intel.urgency === 'Medium' ? '#d97706' : '#15803d',
                        }}>
                          {intel.urgency} Priority
                        </span>
                        <Btn variant="primary" size="sm" onClick={() => navigate('/procurement')}>
                          Initiate Renegotiation <ChevronRight size={12} />
                        </Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <DiamondIcon size={22} color="#6366f1" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#18181b', marginBottom: 6 }}>No intelligence available</p>
                <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>Run a vendor analysis to get market benchmarks and renegotiation recommendations.</p>
                <Btn variant="primary" size="md" demoOnly>Run Analysis</Btn>
              </Card>
            )}
          </div>
        )}

        {/* ── Activity ──────────────────────────────────────────────────── */}
        {section === 'activity' && (
          <Card style={{ padding: 20 }} className="anim-fade">
            <SectionLabel>Activity Timeline</SectionLabel>
            {[
              ...(intel ? [{
                date: 'Apr 30, 2026', actor: 'Signit AI', type: 'ai',
                action: `Identified renegotiation opportunity - ${fmt(intel.potentialSaving)} saving potential via market benchmark (leverage ${intel.leverageScore}/100)`,
              }] : []),
              ...(contract.pdplClauses > 0 ? [{
                date: 'Apr 28, 2026', actor: 'Signit AI', type: 'ai',
                action: `PDPL clause sweep completed - ${contract.pdplClauses} ${contract.pdplClauses === 1 ? 'issue' : 'issues'} flagged for legal review`,
              }] : []),
              {
                date: 'Mar 15, 2026', actor: contract.owner, type: 'human',
                action: 'Contract reviewed and approved for upcoming renewal consideration',
              },
              {
                date: contract.signedDate, actor: 'System', type: 'human',
                action: 'Contract activated - effective date confirmed by both parties',
              },
            ].map((e, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.type === 'ai' ? '#7c3aed' : '#6366f1', marginTop: 2 }} />
                  {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: '#f4f4f5', minHeight: 20, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 0 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 99, background: e.type === 'ai' ? '#f5f3ff' : '#eef2ff', color: e.type === 'ai' ? '#7c3aed' : '#4338ca' }}>
                      {e.type === 'ai' ? 'AI action' : 'Human action'}
                    </span>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>{e.date}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: '#18181b' }}>{e.actor}</span> · {e.action}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* ── Grounded Assistant (no phantom chat boxes) ─────────────────────── */}
      <Card style={{
        width: 302, flexShrink: 0,
        alignSelf: 'flex-start', position: 'sticky', top: 0,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <SmartAssistant
          scope="contract"
          contractId={contract.id}
          personaId="viewer"
          headline={`${contract.counterparty.slice(0, 18)}`}
        />

        {/* Deterministic playbook chips - routed actions, no chat dead-ends */}
        <div style={{ borderTop: '1px solid #f4f4f5', padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.08em', marginBottom: 10 }}>Recommended actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {intel && (
              <button
                key="reno"
                onClick={() => navigate('/procurement')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #eef2ff',
                  background: '#fafbff',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <DiamondIcon size={11} color="#4338ca" />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Prep renegotiation brief</p>
                </div>
                <p style={{ fontSize: 11, color: '#71717a' }}>
                  {fmt(intel.potentialSaving)} upside vs. SAR benchmarks
                </p>
              </button>
            )}

            {contract.pdplClauses > 0 && (
              <button key="pdpl"
                onClick={() => navigate('/legal')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #fde2e2',
                  background: '#fff7f7',
                  textAlign: 'left',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <DiamondIcon size={11} color="#dc2626" />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Open PDPL findings</p>
                </div>
                <p style={{ fontSize: 11, color: '#71717a' }}>
                  {contract.pdplClauses} flagged clause{contract.pdplClauses === 1 ? '' : 's'}
                </p>
              </button>
            )}

            <button key="delta"
              onClick={() => navigate('/compare')}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e0f2fe',
                background: '#f8fafc',
                textAlign: 'left',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <DiamondIcon size={11} color="#0ea5e9" />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Portfolio clause deltas</p>
              </div>
              <p style={{ fontSize: 11, color: '#71717a' }}>Cross-vendor deltas · indemnity, breach SLA, retention</p>
            </button>

            {(contract.completenessScore ?? 100) < 90 && (
              <button key="ingestion"
                onClick={() => navigate('/review')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #fed7aa',
                  background: '#fffbeb',
                  textAlign: 'left',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <DiamondIcon size={11} color="#ea580c" />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Send to ingestion queue</p>
                </div>
                <p style={{ fontSize: 11, color: '#92400e' }}>{contract.completenessScore}% completeness</p>
              </button>
            )}
          </div>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f4f4f5', background: '#fafafa' }}>
          <p style={{ fontSize: 11, color: '#a1a1aa' }}>
            No free‑text hallucination lane · every surfaced answer binds to ingestion metadata with confidence routing.
          </p>
        </div>
      </Card>
    </div>
  );
}
