import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Shield, RefreshCw, Clock, ChevronDown } from 'lucide-react';
import { pdplClauses, auditTrail, type PDPLClause } from '../data/contracts';
import { Card, SectionLabel, SeverityBadge, PDPLStatusBadge, ConfidenceBar, Btn, StatCard, Divider, DiamondIcon, AIBadge } from '../components/ui';

type FilterStatus = 'All' | 'Open' | 'Confirmed' | 'Escalated' | 'False Positive' | 'Needs Review';

function ClauseCard({ clause, onStatus }: { clause: PDPLClause; onStatus: (id: string, s: PDPLClause['status']) => void }) {
  const [expanded, setExpanded] = useState(false);

  const severityBar = { Critical: '#dc2626', Major: '#d97706', Minor: '#16a34a' }[clause.severity];

  return (
    <Card style={{ overflow: 'hidden' }} className="anim-scale">
      {/* Severity stripe */}
      <div style={{ height: 3, background: severityBar }} />

      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <SeverityBadge severity={clause.severity} />
              <PDPLStatusBadge status={clause.status} />
              {clause.needsReview && (
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 999,
                  background: '#fff7ed',
                  color: '#c2410c',
                  border: '1px solid #fdba74',
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  Human queue
                </span>
              )}
              {clause.isNegated && (
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 999,
                  background: '#fef9c3',
                  color: '#854d0e',
                  border: '1px solid #fde047',
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  Negated clause
                </span>
              )}
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>{clause.articleRef}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#18181b', marginBottom: 2 }}>{clause.clauseRef}</p>
            <p style={{ fontSize: 12, color: '#71717a' }}>{clause.contractTitle}</p>
          </div>
          <ConfidenceBar value={clause.aiConfidence} />
        </div>

        {/* Violation */}
        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fafafa', border: '1px solid #f4f4f5', marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Violation</p>
          <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.65 }}>{clause.violation}</p>
        </div>

        {/* Clause text toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, padding: 0, fontWeight: 500 }}
        >
          {expanded ? 'Hide' : 'View'} original clause
          <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {expanded && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 12 }} className="anim-scale">
            <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Original Text</p>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.65, fontStyle: 'italic' }}>"{clause.clauseText}"</p>
          </div>
        )}

        {/* AI recommendation */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 8, background: '#f0f0ff', border: '1px solid #c7d2fe', marginBottom: 16 }}>
          <DiamondIcon size={14} color="#6366f1" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Recommendation</p>
              <AIBadge />
            </div>
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.65 }}>{clause.recommendation}</p>
          </div>
        </div>

        <Divider style={{ marginBottom: 14 }} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(clause.status === 'Open' || clause.status === 'Needs Review') && (
              <>
                <Btn variant="primary" size="sm" onClick={() => onStatus(clause.id, 'Confirmed')}>
                  <CheckCircle2 size={12} />Confirm
                </Btn>
                <Btn variant="outline" size="sm" onClick={() => onStatus(clause.id, 'Escalated')}>
                  <AlertTriangle size={12} />Escalate
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => onStatus(clause.id, 'False Positive')} style={{ color: '#71717a' }}>
                  Mark false positive
                </Btn>
              </>
            )}
            {clause.status === 'Confirmed' && (
              <Btn variant="primary" size="sm" demoOnly>
                <ChevronRight size={12} />Open Vendor Dialogue
              </Btn>
            )}
            {clause.status === 'Escalated' && (
              <span style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', fontWeight: 500, border: '1px solid #ede9fe' }}>
                Escalated to Legal Director
              </span>
            )}
            {clause.status === 'False Positive' && (
              <span style={{ fontSize: 12, color: '#71717a' }}>Marked false positive by {clause.assignedTo}</span>
            )}
          </div>
          {clause.assignedTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                {clause.assignedTo.split(' ').map(n => n[0]).join('')}
              </div>
              <span style={{ fontSize: 12, color: '#71717a' }}>{clause.assignedTo}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Legal() {
  const [clauses, setClauses] = useState(pdplClauses);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [showAudit, setShowAudit] = useState(false);

  const handleStatus = (id: string, status: PDPLClause['status']) => {
    setClauses(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const filtered = filter === 'All' ? clauses : clauses.filter(c => c.status === filter);
  const filterOpts: FilterStatus[] = ['All', 'Open', 'Needs Review', 'Confirmed', 'Escalated', 'False Positive'];

  const stats = {
    critical: clauses.filter(c => c.severity === 'Critical').length,
    major: clauses.filter(c => c.severity === 'Major').length,
    open: clauses.filter(c => c.status === 'Open' || c.status === 'Needs Review').length,
    resolved: clauses.filter(c => ['False Positive', 'Confirmed'].includes(c.status)).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="anim-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#4338ca" strokeWidth={1.75} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#18181b' }}>PDPL Compliance Sweep</h1>
          </div>
          <p style={{ fontSize: 13, color: '#71717a', marginLeft: 42 }}>
            Automated scan across 8 contracts · Last run: Apr 28, 2026 09:14 ·&nbsp;
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 7px', borderRadius: 99, background: '#f0f0ff', color: '#6366f1', fontWeight: 500 }}>
              <DiamondIcon size={9} color="#6366f1" />AI‑powered
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={() => setShowAudit(!showAudit)}>
            <Clock size={13} strokeWidth={1.75} />Audit Trail
          </Btn>
          <Btn variant="primary" size="sm" demoOnly>
            <RefreshCw size={13} strokeWidth={2} />Re-run Sweep
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <StatCard label="Critical Violations" value={String(stats.critical)} sub="Immediate action" accent="#dc2626" icon={<AlertTriangle size={15} />} />
        <StatCard label="Major Issues" value={String(stats.major)} sub="Require review" accent="#d97706" icon={<AlertTriangle size={15} />} />
        <StatCard label="Open Items" value={String(stats.open)} sub="Awaiting triage" accent="#6366f1" icon={<Shield size={15} />} />
        <StatCard label="Resolved" value={String(stats.resolved)} sub="Confirmed or FP" accent="#16a34a" icon={<CheckCircle2 size={15} />} />
      </div>

      {/* Audit trail */}
      {showAudit && (
        <Card style={{ padding: 20 }} className="anim-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <SectionLabel>AI Audit Trail</SectionLabel>
            <button onClick={() => setShowAudit(false)} style={{ fontSize: 12, color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
          {auditTrail.map((entry, i) => (
            <div key={entry.id} style={{ display: 'flex', gap: 12, paddingBottom: i < auditTrail.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 3, background: entry.actionType === 'ai' ? '#7c3aed' : '#6366f1' }} />
                {i < auditTrail.length - 1 && <div style={{ width: 1, flex: 1, background: '#f4f4f5', minHeight: 14, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '1px 6px', borderRadius: 99, background: entry.actionType === 'ai' ? '#f5f3ff' : '#eef2ff', color: entry.actionType === 'ai' ? '#7c3aed' : '#4338ca' }}>
                    {entry.actionType === 'ai' ? 'AI action' : 'Human action'}
                  </span>
                  <span style={{ fontSize: 11, color: '#a1a1aa' }}>{entry.timestamp}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#52525b' }}>{entry.actor}</span>
                </div>
                <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600 }}>{entry.action}</span> - {entry.detail}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e4e4e7' }}>
        {filterOpts.map(f => {
          const count = f === 'All' ? clauses.length : clauses.filter(c => c.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent', color: active ? '#6366f1' : '#71717a', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {f}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: active ? '#f0f0ff' : '#f4f4f5', color: active ? '#6366f1' : '#71717a' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(c => (
          <ClauseCard key={c.id} clause={c} onStatus={handleStatus} />
        ))}
        {filtered.length === 0 && (
          <Card style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <CheckCircle2 size={32} color="#16a34a" />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#18181b', marginTop: 14 }}>No items in this category</p>
          </Card>
        )}
      </div>
    </div>
  );
}
