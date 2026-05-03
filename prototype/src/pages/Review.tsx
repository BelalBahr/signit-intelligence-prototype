import { useNavigate } from 'react-router-dom';
import { ClipboardList, ShieldAlert, FileWarning, ArrowRight, Activity } from 'lucide-react';
import { contracts, pdplClauses } from '../data/contracts';
import { Card, Btn, ConfidenceBar, SectionLabel, DiamondIcon } from '../components/ui';

export default function Review() {
  const navigate = useNavigate();

  const clauses = pdplClauses.filter(c =>
    c.status === 'Needs Review' ||
    c.needsReview ||
    (c.isNegated && c.status !== 'False Positive'),
  );

  const docs = contracts.filter(c =>
    c.extractionStatus === 'incomplete' ||
    (c.completenessScore !== undefined && c.completenessScore < 85),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="anim-up">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={16} color="#b45309" strokeWidth={1.75} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#18181b' }}>Human Review Queue</h1>
          </div>
          <p style={{ fontSize: 13, color: '#71717a', marginLeft: 42 }}>
            Low-confidence extractions, incomplete documents, and negated-clause constructions never pass silently - they pause here until a solicitor confirms them.
          </p>
        </div>
      </div>

      {/* Extractor quality (case study targets) */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={15} color="#4338ca" />
          <SectionLabel>Extractor quality - last 30 days</SectionLabel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            {
              label: 'Hallucination rate',
              value: '0.3%',
              target: 'Target: <0.5%',
              tone: 'good' as const,
              tooltip:
                'LLM-as-judge eval at scale, human spot-checks on stratified sample. Specialized legal models baseline ~0.2%; general-purpose models 0.7-1.3%.',
            },
            {
              label: 'F1 - standard fields',
              value: '93.1%',
              target: 'Target: 93% (dates, parties, amounts)',
              tone: 'good' as const,
              tooltip:
                'Industry benchmark for specialized legal NER on dates, parties, and payment amounts is 90-95% precision. Phase 1 launch floor.',
            },
            {
              label: 'F1 - complex clauses',
              value: '81.4%',
              target: 'Floor: 80% before downstream use',
              tone: 'watch' as const,
              tooltip:
                'Liability caps, indemnity, breach notification. Below the floor blocks the extraction from synthesis layer until human review.',
            },
            {
              label: 'Correction velocity',
              value: '-12% / wk',
              target: 'False-positive rate trending down',
              tone: 'good' as const,
              tooltip:
                'False-positive rate by clause category, week-over-week. Decreasing velocity = the feedback loop is improving the model.',
            },
          ].map(metric => {
            const accent = metric.tone === 'good' ? '#16a34a' : '#d97706';
            const bg = metric.tone === 'good' ? '#f0fdf4' : '#fffbeb';
            const border = metric.tone === 'good' ? '#bbf7d0' : '#fde68a';
            return (
              <div
                key={metric.label}
                title={metric.tooltip}
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: bg,
                  border: `1px solid ${border}`,
                  cursor: 'help',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <DiamondIcon size={9} color={accent} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {metric.label}
                  </span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#18181b', lineHeight: 1.1 }}>{metric.value}</p>
                <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{metric.target}</p>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 12, lineHeight: 1.6 }}>
          Targets reflect the AI architecture commitments in the Signit Intelligence product memo (extraction layer F1, hallucination ceiling, correction-velocity feedback loop). Hover any tile for the underlying methodology.
        </p>
      </Card>

      {/* Incomplete documents */}
      {docs.length > 0 && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileWarning size={15} color="#d97706" />
            <SectionLabel>Incomplete Extractions ({docs.length})</SectionLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {docs.map(doc => (
              <div
                key={doc.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10, background: '#fffbeb',
                  border: '1px solid #fde68a', cursor: 'pointer',
                }}
                onClick={() => navigate(`/contract/${doc.id}`)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#78350f' }}>{doc.title}</p>
                  <p style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
                    Completeness {' '}
                    <strong>{doc.completenessScore}%</strong>
                    {doc.missingFields && doc.missingFields.length > 0 && (
                      <> · Missing: {doc.missingFields.join(', ')}</>
                    )}
                  </p>
                </div>
                <Btn variant="outline" size="sm" style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); navigate(`/contract/${doc.id}`); }}>
                  Open <ArrowRight size={11} />
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Clause-level review */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ShieldAlert size={15} color="#4338ca" />
          <SectionLabel>Mandatory Clause Review ({clauses.length})</SectionLabel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clauses.map(c => (
            <div
              key={c.id}
              style={{
                padding: '16px 18px', borderRadius: 10,
                border: `1px solid ${c.aiConfidence < 50 ? '#fecaca' : '#ddd6fe'}`,
                background: c.aiConfidence < 50 ? '#fef2f2' : '#f5f3ff',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/legal')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#18181b', marginBottom: 4 }}>
                    {c.clauseRef} · <span style={{ fontWeight: 500, color: '#71717a' }}>{c.contractTitle}</span>
                  </p>
                  <p style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99,
                    background: c.isNegated ? '#fef9c3' : '#fde68a', color: '#713f12', display: 'inline-block',
                    marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {c.reviewReason ?? (c.isNegated ? 'Negated clause routing' : 'Low confidence')}
                  </p>
                  <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.55 }}>{c.violation}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <ConfidenceBar value={c.aiConfidence} />
                  <Btn variant="primary" size="sm" style={{ justifyContent: 'center' }}>
                    Review in Sweep <ArrowRight size={11} />
                  </Btn>
                </div>
              </div>
            </div>
          ))}
          {clauses.length === 0 && (
            <p style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', padding: 24 }}>No items in the mandatory review queue.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
