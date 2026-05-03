import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { aiPrompts, personas, contracts, vendorIntelligence } from '../data/contracts';
import type { PersonaId } from '../data/contracts';
import { Btn, Divider, DiamondIcon, AIBadge } from './ui';
import { Citation } from './Citation';

type Scope = 'portfolio' | 'contract';

interface SmartAssistantProps {
  scope: Scope;
  personaId?: PersonaId | 'viewer';
  contractId?: string;
  headline?: string;
}

export function SmartAssistant({ scope, personaId = 'viewer', contractId, headline }: SmartAssistantProps) {
  const navigate = useNavigate();

  /** Filter prompts: portfolio-scope shows persona-matched prompts; contract-scope collapses everything to this contract where possible */
  let prompts = aiPrompts;
  const activePersona = personas.find(p => p.id === personaId);

  if (scope === 'portfolio') {
    prompts = prompts.filter(p => p.persona === 'all' || p.persona === personaId || personaId === 'viewer');
  }

  const [picked, setPicked] = useState(prompts[0]?.id ?? '');

  const selected = prompts.find(p => p.id === picked)!;

  /** Try to specialise answer for contract scope */
  const answer = scope === 'contract' && contractId
    ? (() => {
        const vi = vendorIntelligence.find(v => v.contractId === contractId);
        const ctr = contracts.find(c => c.id === contractId);
        if (!ctr) return selected.answer;
        if (selected.question.includes('leverage')) {
          const line = vi
            ? `${vi.leverageReason} Recommended: ${vi.recommendedAction}`
            : 'Run a vendor benchmark analysis before renegotiating - insufficient market context on file.';
          return `For ${ctr.counterparty}: ${line}`;
        }
        if (selected.question.includes('PDPL')) {
          const n = ctr.pdplClauses ?? 0;
          return `${ctr.title} carries ${n} PDPL-flagged clause${n === 1 ? '' : 's'}. ${selected.answer.split('. ')[0] ?? ''}`;
        }
        return selected.answer.replace(/portfolio/i, ctr.title);
      })()
    : selected.answer;

  return (
    <div>
      {(headline || activePersona) && scope === 'portfolio' && (
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f4f4f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <DiamondIcon size={14} color="#6366f1" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{headline ?? 'Portfolio assistant'}</span>
            <AIBadge />
          </div>
          {activePersona && personaId !== 'viewer' && (
            <p style={{ fontSize: 11, color: '#71717a', lineHeight: 1.5 }}>
              <strong style={{ color: '#374151' }}>{activePersona.name}</strong>{' '}· prompting as {activePersona.role}.
            </p>
          )}
        </div>
      )}

      <div style={{ padding: scope === 'contract' ? 0 : '10px 16px' }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Smart prompt
        </label>
        <div style={{ marginTop: 6, position: 'relative' }}>
          <select
            className="sa-select"
            value={picked || prompts[0]?.id || ''}
            onChange={e => setPicked(e.target.value)}
            style={{
              width: '100%', padding: '9px 32px 9px 10px',
              borderRadius: 8, border: '1px solid #e4e4e7', background: '#fff',
              fontSize: 13, fontWeight: 500, color: '#18181b',
            }}
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>{p.question}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ pointerEvents: 'none', position: 'absolute', right: 10, top: 12, color: '#a1a1aa' }} />
        </div>
      </div>

      <Divider />

      {/* Answer */}
      <div style={{ padding: scope === 'contract' ? '10px 0' : '12px 16px 16px' }}>
        <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.65 }}>
          {answer}
        </p>

        {/* Inline citations */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {selected.citations.map((cit, idx) => {
            const c = contracts.find(ct => ct.id === cit.contractId);
            if (scope === 'contract' && contractId && cit.contractId !== contractId && idx > 1) return null;
            return (
              <div key={`${cit.contractId}-${idx}`} style={{ padding: '10px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f4f4f5' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Source {idx + 1} · {c?.counterparty}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                  <Citation
                    contractId={cit.contractId}
                    clauseRef={cit.clauseRef}
                    quote={cit.quote ?? ''}
                    confidence={cit.confidence}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4338ca' }}>
                      Hover for clause excerpt ({cit.confidence}%)
                    </span>
                  </Citation>
                </div>
              </div>
            );
          })}
        </div>

        {/* Follow-up */}
        {selected.followUpRoute && scope === 'portfolio' && (
          <div style={{ marginTop: 16 }}>
            <Btn variant="outline-primary" size="sm" style={{ width: '100%', justifyContent: 'center', gap: 6 }} onClick={() => navigate(selected.followUpRoute!)}>
              Drill into surface <ArrowRight size={12} strokeWidth={1.85} />
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
