import {
  useState, useEffect, useMemo, useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, GitCompareArrows, X } from 'lucide-react';
import {
  contracts, obligationEvents, clauseDeviations, type ObligationKind,
} from '../data/contracts';

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

function haystack(...parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join('\u0001').toLowerCase();
}

export function SemanticSearchPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');

  /** Mount-only focus (panel is only mounted while open - parent toggles visibility) */
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const raw = q.trim().toLowerCase();
    const tokens = raw.split(/\s+/).filter(Boolean);
    const matchAll = (blob: string) => tokens.every(t => blob.includes(t));

    if (raw.length < 1) {
      return {
        contracts: contracts.slice(0, 8),
        obligations: [...obligationEvents].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8),
        matrix: clauseDeviations.slice(0, 6),
      };
    }

    const cHits = contracts
      .filter(c =>
        matchAll(haystack(
          c.title,
          c.counterparty,
          c.type,
          c.scope,
          c.tags.join(' '),
          c.owner,
          c.id,
        )))
      .slice(0, 8);

    const oHits = obligationEvents
      .filter(e => {
        const ctr = contracts.find(ct => ct.id === e.contractId);
        const kind = KIND_LABEL[e.kind];
        return matchAll(haystack(
          e.title,
          e.detail,
          kind,
          ctr?.counterparty,
          ctr?.title,
          e.contractId,
        ));
      })
      .slice(0, 10);

    const mHits = clauseDeviations
      .filter(r =>
        matchAll(haystack(
          r.vendor,
          r.contractTitle,
          r.contractId,
          r.liabilityCap.value,
          r.noticePeriod.value,
          r.breachNotification.value,
          r.paymentTerms.value,
          r.retentionPeriod.value,
        )))
      .slice(0, 8);

    return {
      contracts: cHits,
      obligations: oHits,
      matrix: mHits,
    };
  }, [q]);

  if (typeof document === 'undefined') return null;

  const goContract = (id: string) => {
    navigate(`/contract/${id}`);
    onClose();
  };
  const goObligation = (id: string) => {
    navigate(`/timeline#ob-${id}`);
    onClose();
  };
  const goCompare = () => {
    navigate('/compare');
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Semantic search"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingInline: 16,
        background: 'rgba(15,23,42,0.45)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          maxHeight: 'min(560px, 78vh)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 14,
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.09)',
          boxShadow: '0 24px 64px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.05) inset',
          overflow: 'hidden',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
          borderBottom: '1px solid #f4f4f5',
          background: '#fafafa',
        }}>
          <Search size={17} color="#71717a" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search agreements, counterparties, obligation kinds, clauses…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 14, fontWeight: 500, background: 'transparent', color: '#18181b',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              padding: 6,
              borderRadius: 8,
              border: 'none',
              background: '#edeef2',
              cursor: 'pointer',
              display: 'flex',
              color: '#52525b',
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div style={{
          overflowY: 'auto',
          padding: '12px 0 10px',
        }}>
          {(results.contracts.length > 0) && (
            <div style={{ padding: '4px 0 10px' }}>
              <div style={{
                padding: '0 16px 6px',
                fontSize: 10, fontWeight: 700, color: '#a1a1aa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Agreements
              </div>
              {results.contracts.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goContract(c.id)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="search-hit-row"
                >
                  <FileText size={15} style={{ flexShrink: 0, marginTop: 2, color: '#6366f1' }} strokeWidth={1.75} />
                  <span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b', display: 'block' }}>{c.title}</span>
                    <span style={{ fontSize: 11, color: '#71717a' }}>{c.counterparty} · {c.type}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {(results.obligations.length > 0) && (
            <div style={{ padding: '4px 0 10px', borderTop: '1px solid #f4f4f5' }}>
              <div style={{
                padding: '12px 16px 6px',
                fontSize: 10, fontWeight: 700, color: '#a1a1aa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Obligations
              </div>
              {results.obligations.map(ev => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => goObligation(ev.id)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="search-hit-row"
                >
                  <Calendar size={15} style={{ flexShrink: 0, marginTop: 2, color: '#6366f1' }} strokeWidth={1.75} />
                  <span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b', display: 'block' }}>{ev.title}</span>
                    <span style={{ fontSize: 11, color: '#71717a' }}>
                      {KIND_LABEL[ev.kind]} · {ev.date}{' · '}
                      {contracts.find(ct => ct.id === ev.contractId)?.counterparty}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {(results.matrix.length > 0) && (
            <div style={{ padding: '4px 0 10px', borderTop: '1px solid #f4f4f5' }}>
              <div style={{
                padding: '12px 16px 6px',
                fontSize: 10, fontWeight: 700, color: '#a1a1aa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Clause matrix matches
              </div>
              {results.matrix.map(row => (
                <button
                  key={row.contractId}
                  type="button"
                  onClick={goCompare}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="search-hit-row"
                >
                  <GitCompareArrows size={15} style={{ flexShrink: 0, marginTop: 2, color: '#6366f1' }} strokeWidth={1.75} />
                  <span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b', display: 'block' }}>{row.vendor}</span>
                    <span style={{ fontSize: 11, color: '#71717a' }}>{row.contractTitle}</span>
                  </span>
                </button>
              ))}
              <p style={{ fontSize: 10, color: '#a1a1aa', padding: '0 16px 4px', marginTop: 4 }}>
                Opens Clause Compare matrix (same portfolio row).
              </p>
            </div>
          )}

          {q.trim().length >= 2
            && results.contracts.length === 0
            && results.obligations.length === 0
            && results.matrix.length === 0 && (
            <div style={{ padding: '28px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#52525b' }}>No matches</p>
              <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 6 }}>Try counterparty initials, renewal, PDPL, or a vendor name.</p>
            </div>
          )}
        </div>

        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #f4f4f5',
          fontSize: 10,
          color: '#a1a1aa',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          background: '#fcfcfc',
        }}>
          <button type="button" onClick={() => { navigate('/compare'); onClose(); }} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#6366f1', fontWeight: 600, padding: 0 }}>
            Clause Compare
          </button>
          <button type="button" onClick={() => { navigate('/vault'); onClose(); }} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#6366f1', fontWeight: 600, padding: 0 }}>
            Vault
          </button>
          <button type="button" onClick={() => { navigate('/timeline'); onClose(); }} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#6366f1', fontWeight: 600, padding: 0 }}>
            Timeline home
          </button>
          <span style={{ marginLeft: 'auto' }}><kbd style={{ padding: '1px 5px', borderRadius: 4, background: '#edeef2' }}>Esc</kbd> close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
