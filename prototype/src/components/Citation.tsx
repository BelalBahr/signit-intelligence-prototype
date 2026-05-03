import {
  useState, useRef, useEffect,
  useCallback,
  type ReactNode, type CSSProperties, type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, FileText } from 'lucide-react';
import { contracts } from '../data/contracts';
import { DiamondIcon, ConfidenceBar } from './ui';

interface CitationProps {
  contractId: string;
  clauseRef?: string;
  quote?: string;
  /** Arabic version of the clause quote (rendered RTL when AR tab is active). */
  quoteAr?: string;
  /** Arabic version of the clause reference (e.g. "البند 14.1 - إشعار الحوادث الأمنية"). */
  clauseRefAr?: string;
  confidence: number;       // 0-100
  derivation?: string;      // optional one-liner explaining how the AI derived the value
  benchmarkSource?: string; // optional non-clause source (e.g. Gartner)
  children: ReactNode;      // the value being cited
  style?: CSSProperties;
  /** Use `click` inside scrollable parents (e.g. horizontal timeline): hover fights scroll + mouseleave. */
  trigger?: 'hover' | 'click';
}

const POPOVER_W = 340;
const CLOSE_MS = 280;

const POSITION_OPTS: AddEventListenerOptions = { passive: true, capture: true };

function CitationPopoverContent({
  conf, contract, clauseRef, clauseRefAr, quote, quoteAr, derivation, benchmarkSource,
  onNavigate,
}: {
  conf: number;
  contract: (typeof contracts)[number] | undefined;
  clauseRef?: string;
  clauseRefAr?: string;
  quote?: string;
  quoteAr?: string;
  derivation?: string;
  benchmarkSource?: string;
  onNavigate: () => void;
}) {
  const hasArabic = Boolean(quoteAr || clauseRefAr);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const showAr = hasArabic && lang === 'ar';
  const displayQuote = showAr ? (quoteAr ?? quote) : quote;
  const displayClauseRef = showAr ? (clauseRefAr ?? clauseRef) : clauseRef;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <DiamondIcon size={11} color="#6366f1" />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            AI source
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasArabic && (
            <div
              role="tablist"
              aria-label="Clause language"
              style={{
                display: 'inline-flex',
                padding: 2,
                borderRadius: 999,
                background: '#f4f4f5',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {(['en', 'ar'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  role="tab"
                  aria-selected={lang === l}
                  onClick={(e) => { e.stopPropagation(); setLang(l); }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    background: lang === l ? '#fff' : 'transparent',
                    color: lang === l ? '#4338ca' : '#71717a',
                    boxShadow: lang === l ? '0 0 0 1px #c7d2fe' : 'none',
                    letterSpacing: '0.06em',
                  }}
                >
                  {l === 'en' ? 'EN' : 'AR'}
                </button>
              ))}
            </div>
          )}
          <ConfidenceBar value={conf} />
        </div>
      </div>

      {/* Contract */}
      {contract && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #eef2f6', marginBottom: 10 }}>
          <FileText size={12} color="#71717a" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#18181b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contract.title}
          </span>
        </div>
      )}

      {/* Clause */}
      {displayClauseRef && (
        <p
          dir={showAr ? 'rtl' : 'ltr'}
          lang={showAr ? 'ar' : 'en'}
          style={{
            fontSize: 10, fontWeight: 700, color: '#a1a1aa',
            textTransform: showAr ? 'none' : 'uppercase',
            letterSpacing: showAr ? 'normal' : '0.08em',
            marginBottom: 4,
          }}
        >
          {displayClauseRef}
        </p>
      )}

      {/* Quote */}
      {displayQuote && (
        <div
          dir={showAr ? 'rtl' : 'ltr'}
          lang={showAr ? 'ar' : 'en'}
          style={{
            borderLeft: showAr ? 'none' : '3px solid #6366f1',
            borderRight: showAr ? '3px solid #6366f1' : 'none',
            padding: '8px 12px',
            background: '#fafbff',
            marginBottom: 10,
            borderRadius: showAr ? '6px 0 0 6px' : '0 6px 6px 0',
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: '#374151',
              lineHeight: 1.7,
              fontStyle: showAr ? 'normal' : 'italic',
              fontFamily: showAr ? '"Segoe UI", Tahoma, Arial, sans-serif' : 'inherit',
            }}
          >
            {showAr ? displayQuote : `"${displayQuote}"`}
          </p>
        </div>
      )}

      {/* Derivation */}
      {derivation && (
        <p style={{ fontSize: 11, color: '#52525b', lineHeight: 1.55, marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>How this was derived: </span>
          {derivation}
        </p>
      )}

      {/* Benchmark source */}
      {benchmarkSource && (
        <p style={{ fontSize: 11, color: '#71717a', lineHeight: 1.55, marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#52525b' }}>Benchmark: </span>
          {benchmarkSource}
        </p>
      )}

      {/* CTA */}
      {contract && (
        <button
          type="button"
          onClick={onNavigate}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: '#6366f1',
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          }}
        >
          View in document <ExternalLink size={11} />
        </button>
      )}
    </>
  );
}

/**
 * Wraps any value with a hover popover that reveals its provenance.
 *
 * Uses a fixed-position portal so popovers are not clipped by overflow parents.
 */
export function Citation({
  contractId, clauseRef, clauseRefAr, quote, quoteAr, confidence, derivation, benchmarkSource, children, style,
  trigger = 'hover',
}: CitationProps) {
  const hoverMode = trigger === 'hover';

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const popoverElRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const navigate = useNavigate();
  const contract = contracts.find(c => c.id === contractId);

  const conf = Math.max(0, Math.min(100, confidence));
  const confColor = conf >= 90 ? '#16a34a' : conf >= 70 ? '#d97706' : '#dc2626';

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    if (!hoverMode) return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setCoords(null);
    }, CLOSE_MS);
  }, [cancelClose, hoverMode]);

  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
    setCoords(null);
  }, [cancelClose]);

  const openNow = useCallback(() => {
    if (!hoverMode) return;
    cancelClose();
    setOpen(true);
  }, [cancelClose, hoverMode]);

  const toggleClick = useCallback((e: Pick<SyntheticEvent, 'preventDefault' | 'stopPropagation'>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(o => !o);
  }, []);

  useEffect(() => () => cancelClose(), [cancelClose]);

  /** Click mode: dismiss on outside tap or Escape */
  useEffect(() => {
    if (!open || hoverMode) return;

    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (ref.current?.contains(t)) return;
      if (popoverElRef.current?.contains(t)) return;
      close();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, hoverMode, close]);

  useEffect(() => {
    if (!open || !ref.current) {
      setCoords(null);
      return;
    }

    const el = ref.current;
    const margin = 8;
    /** Approximate max height - enough to flip placement; actual content may scroll if needed */
    const approxPopH = 320;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      const placeBelow = spaceBelow >= 200 || spaceBelow >= spaceAbove;

      let top = placeBelow ? rect.bottom + margin : rect.top - approxPopH - margin;
      top = Math.max(margin, Math.min(top, window.innerHeight - margin - 120));

      let left = rect.left;
      left = Math.min(Math.max(margin, left), window.innerWidth - POPOVER_W - margin);

      setCoords({ top, left });
    };

    update();
    /** Capture scroll: keeps popover anchored when page scroll containers move. */
    window.addEventListener('scroll', update, POSITION_OPTS);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, POSITION_OPTS);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const popover = open && coords && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={popoverElRef}
          role={hoverMode ? 'tooltip' : 'dialog'}
          aria-label="Source citation"
          onMouseEnter={hoverMode ? cancelClose : undefined}
          onMouseLeave={hoverMode ? scheduleClose : undefined}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 10000,
            width: POPOVER_W,
            maxHeight: 'min(420px, calc(100vh - 24px))',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 12,
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.03), 0 16px 48px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.06)',
            padding: 16,
            cursor: 'default',
            animation: 'fadeIn 0.12s ease-out',
          }}
        >
          <CitationPopoverContent
            conf={conf}
            contract={contract}
            clauseRef={clauseRef}
            clauseRefAr={clauseRefAr}
            quote={quote}
            quoteAr={quoteAr}
            derivation={derivation}
            benchmarkSource={benchmarkSource}
            onNavigate={() => navigate(`/contract/${contractId}`)}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <span
      ref={ref}
      tabIndex={hoverMode ? undefined : -1}
      role={hoverMode ? undefined : 'button'}
      aria-expanded={hoverMode ? undefined : open}
      aria-haspopup={hoverMode ? undefined : 'dialog'}
      onMouseEnter={hoverMode ? openNow : undefined}
      onMouseLeave={hoverMode ? scheduleClose : undefined}
      onClick={hoverMode ? undefined : toggleClick}
      onKeyDown={hoverMode ? undefined : (e) => {
        if (e.key === 'Enter' || e.key === ' ') toggleClick(e);
      }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        cursor: hoverMode ? 'help' : 'pointer',
        borderBottom: `1px dashed ${confColor}`,
        paddingBottom: 1,
        ...style,
      }}
    >
      {children}
      <DiamondIcon size={9} color={confColor} />

      {popover}
    </span>
  );
}
