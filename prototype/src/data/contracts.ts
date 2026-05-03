export type RiskLevel = 'High' | 'Medium' | 'Low';
export type ContractStatus = 'Active' | 'Pending Review' | 'Expiring Soon' | 'Expired' | 'Draft';

export interface Contract {
  id: string;
  title: string;
  type: string;
  counterparty: string;
  signedDate: string;
  expirationDate: string;
  effectiveDate: string;
  value: number;
  currency: 'SAR' | 'USD';
  status: ContractStatus;
  risk: RiskLevel;
  tags: string[];
  pdplClauses: number;
  owner: string;
  department: string;
  renewalReminder?: string;
  parties: { role: string; name: string }[];
  scope: string;
  jurisdiction: string;
  // Extraction quality (added)
  extractionStatus?: 'complete' | 'partial' | 'incomplete';
  completenessScore?: number; // 0-100
  missingFields?: string[];
}

export interface VendorIntelligence {
  contractId: string;
  vendor: string;
  currentRate: number;
  marketMedian: number;
  marketLow: number;
  leverageScore: number;
  leverageReason: string;
  recommendedAction: string;
  potentialSaving: number;
  benchmarkSource: string;
  urgency: 'High' | 'Medium' | 'Low';
}

export interface PDPLClause {
  id: string;
  contractId: string;
  contractTitle: string;
  clauseRef: string;
  clauseText: string;
  violation: string;
  articleRef: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'Confirmed' | 'Escalated' | 'False Positive' | 'Needs Review';
  aiConfidence: number;
  recommendation: string;
  assignedTo?: string;
  // New fields for failure-mode handling
  isNegated?: boolean;       // negated obligation construction flag
  needsReview?: boolean;     // routed to manual review queue
  reviewReason?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actionType: 'human' | 'ai';
  action: string;
  detail: string;
}

export interface ExecutiveBrief {
  weekOf: string;
  totalContracts: number;
  totalValue: number;
  expiringThisQuarter: number;
  expiringValue: number;
  pdplViolations: number;
  criticalPdpl: number;
  potentialSavings: number;
  renewalOpportunities: number;
  highlights: {
    type: 'risk' | 'opportunity' | 'action';
    title: string;
    detail: string;
    value?: string;
    /** In-app route (prototype) opened when the row is activated */
    deeplink?: string;
  }[];
  recommendedActions?: { label: string; due: string; priority: 'Critical' | 'High'; to: string }[];
  kpis: { label: string; value: string; delta: string; positive: boolean }[];
}

// ─── Personas (the persona switcher data) ─────────────────────────────────────
export type PersonaId = 'cfo' | 'legal' | 'procurement';

export interface Persona {
  id: PersonaId;
  name: string;
  initials: string;
  role: string;
  department: string;
  focus: string; // short label of what this lens prioritises
  lensColor: string;
}

export const personas: Persona[] = [
  {
    id: 'cfo',
    name: 'Nora Al-Otaibi',
    initials: 'NO',
    role: 'Chief Financial Officer',
    department: 'Finance',
    focus: 'Financial exposure, concentration risk, posture',
    lensColor: '#16a34a',
  },
  {
    id: 'legal',
    name: 'Sara Al-Qahtani',
    initials: 'SQ',
    role: 'General Counsel',
    department: 'Legal',
    focus: 'PDPL, clause patterns, regulatory remediation',
    lensColor: '#7c3aed',
  },
  {
    id: 'procurement',
    name: 'Ibrahim Al-Shammari',
    initials: 'IS',
    role: 'Procurement Director',
    department: 'Procurement',
    focus: 'Renewals, leverage, vendor renegotiation',
    lensColor: '#6366f1',
  },
];

// ─── Obligation Events (for the Timeline) ─────────────────────────────────────
export type ObligationKind =
  | 'expiration'
  | 'auto_renewal'
  | 'notice_deadline'
  | 'renewal_window'
  | 'payment'
  | 'sla_review'
  | 'compliance_audit'
  | 'pdpl_remediation';

export interface ObligationEvent {
  id: string;
  contractId: string;
  date: string;          // ISO yyyy-mm-dd
  kind: ObligationKind;
  title: string;
  detail: string;
  amount?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  // 0 = ignore, 1 = informational, 2 = relevant, 3 = primary concern
  personaPriority: { cfo: 0 | 1 | 2 | 3; legal: 0 | 1 | 2 | 3; procurement: 0 | 1 | 2 | 3 };
  sourceClause?: string;
  confidence: number;    // AI extraction confidence 0-100
  ai: boolean;
}

// "Today" anchor used across the prototype (aligned with case study timeline, May 2026)
export const TODAY_ISO = '2026-05-03';
export const TODAY_LABEL = 'May 3, 2026';

export const obligationEvents: ObligationEvent[] = [
  // c-003 Office Supplies - imminent
  {
    id: 'e-001', contractId: 'c-003', date: '2026-05-09', kind: 'notice_deadline',
    title: 'Notice deadline - Office Supplies',
    detail: 'Final 30-day non-renewal notice window closes. Auto-renewal triggers if no notice served.',
    severity: 'high', personaPriority: { cfo: 1, legal: 1, procurement: 3 }, confidence: 96, ai: true,
    sourceClause: 'Clause 11.2 - "Either party may decline renewal by written notice not less than thirty (30) days prior to the expiration date."',
  },
  {
    id: 'e-002', contractId: 'c-003', date: '2026-06-09', kind: 'expiration',
    title: 'Expiration - Al-Jazirah Supplies',
    detail: 'Contract expires. Auto-renewal for 12 months at current rate (22% above market) unless notice served.',
    amount: 380_000, severity: 'high', personaPriority: { cfo: 2, legal: 1, procurement: 3 }, confidence: 99, ai: true,
  },

  // c-008 Seera Travel
  {
    id: 'e-003', contractId: 'c-008', date: '2026-05-31', kind: 'renewal_window',
    title: 'Renewal window opens - Seera Travel',
    detail: '90-day renewal window opens. RFP recommended to Almosafer Business and Corporate Travel Arabia.',
    severity: 'medium', personaPriority: { cfo: 1, legal: 0, procurement: 3 }, confidence: 95, ai: true,
  },
  {
    id: 'e-004', contractId: 'c-008', date: '2026-07-01', kind: 'notice_deadline',
    title: 'Notice deadline - Seera Travel',
    detail: '60-day notice window closes. SAR 110K saving opportunity if renegotiated competitively.',
    severity: 'medium', personaPriority: { cfo: 2, legal: 1, procurement: 3 }, confidence: 92, ai: true,
    sourceClause: 'Clause 9.1 - "This Agreement shall renew automatically for successive twelve (12) month terms unless terminated by sixty (60) days prior written notice."',
  },
  {
    id: 'e-005', contractId: 'c-008', date: '2026-08-31', kind: 'expiration',
    title: 'Expiration - Seera Group',
    detail: 'Travel management contract expires. 1,200 employees affected.',
    amount: 650_000, severity: 'medium', personaPriority: { cfo: 2, legal: 0, procurement: 3 }, confidence: 99, ai: true,
  },

  // c-005 STC Co-location - high risk
  {
    id: 'e-006', contractId: 'c-005', date: '2026-08-20', kind: 'renewal_window',
    title: 'Renewal window opens - STC Co-location',
    detail: '90 days before expiry. Mobily Business and Zain offer compliant alternatives at SAR 2.2–2.6M.',
    severity: 'high', personaPriority: { cfo: 2, legal: 2, procurement: 3 }, confidence: 94, ai: true,
  },
  {
    id: 'e-007', contractId: 'c-005', date: '2026-09-15', kind: 'pdpl_remediation',
    title: 'PDPL remediation deadline - STC Clause 14.1',
    detail: 'Replace 30-day breach notification with 72-hour PDPL Art. 26 / NCA CSCC-3 compliant clause before renewal.',
    severity: 'critical', personaPriority: { cfo: 2, legal: 3, procurement: 1 }, confidence: 99, ai: true,
    sourceClause: 'Clause 14.1 - "In the event of a security incident affecting Customer data, Provider shall notify Customer within thirty (30) calendar days..."',
  },
  {
    id: 'e-008', contractId: 'c-005', date: '2026-09-19', kind: 'notice_deadline',
    title: 'Notice deadline - STC Co-location',
    detail: '60-day non-renewal notice window closes. SAR 450K saving available via competitive RFP.',
    severity: 'high', personaPriority: { cfo: 2, legal: 2, procurement: 3 }, confidence: 95, ai: true,
  },
  {
    id: 'e-009', contractId: 'c-005', date: '2026-11-19', kind: 'expiration',
    title: 'Expiration - STC Solutions',
    detail: '4 PDPL violations unresolved. Data residency at risk if renewal proceeds without remediation.',
    amount: 3_100_000, severity: 'critical', personaPriority: { cfo: 3, legal: 3, procurement: 3 }, confidence: 99, ai: true,
  },

  // c-001 Microsoft Azure - high-value renewal
  {
    id: 'e-010', contractId: 'c-001', date: '2026-06-30', kind: 'payment',
    title: 'Q2 enterprise invoice - Microsoft',
    detail: 'Quarterly enterprise agreement payment due. SAR 600K.',
    amount: 600_000, severity: 'low', personaPriority: { cfo: 2, legal: 0, procurement: 1 }, confidence: 97, ai: true,
  },
  {
    id: 'e-011', contractId: 'c-001', date: '2026-10-15', kind: 'renewal_window',
    title: 'Renewal window opens - Microsoft Azure',
    detail: 'Leverage score 82/100. SAR 480K saving opportunity. stc Cloud pilot is a credible BATNA.',
    severity: 'high', personaPriority: { cfo: 3, legal: 1, procurement: 3 }, confidence: 96, ai: true,
  },
  {
    id: 'e-012', contractId: 'c-001', date: '2026-11-15', kind: 'notice_deadline',
    title: 'Notice deadline - Microsoft Azure',
    detail: '60-day non-renewal notice required to unlock renegotiation leverage.',
    severity: 'high', personaPriority: { cfo: 2, legal: 1, procurement: 3 }, confidence: 95, ai: true,
  },
  {
    id: 'e-013', contractId: 'c-001', date: '2026-12-15', kind: 'pdpl_remediation',
    title: 'Microsoft Entra Privacy Addendum due',
    detail: 'Negotiate addendum to address Clause 12.2 diagnostic data breadth before renewal close.',
    severity: 'medium', personaPriority: { cfo: 1, legal: 3, procurement: 2 }, confidence: 84, ai: true,
  },
  {
    id: 'e-014', contractId: 'c-001', date: '2026-01-14', kind: 'expiration',
    title: 'Expiration - Microsoft Azure EA',
    detail: '2,400 users. SAR 2.4M annual. Auto-renewal triggers without notice.',
    amount: 2_400_000, severity: 'critical', personaPriority: { cfo: 3, legal: 1, procurement: 3 }, confidence: 99, ai: true,
  },

  // c-006 Hays HR
  {
    id: 'e-015', contractId: 'c-006', date: '2026-09-30', kind: 'pdpl_remediation',
    title: 'Hays subprocessor register due',
    detail: 'Cross-border transfers to US/UK without SDAIA safeguards. Subprocessor register must be in place before Q4.',
    severity: 'critical', personaPriority: { cfo: 1, legal: 3, procurement: 2 }, confidence: 93, ai: true,
  },
  {
    id: 'e-016', contractId: 'c-006', date: '2026-11-01', kind: 'notice_deadline',
    title: 'Notice deadline - Hays HR RPO',
    detail: '60-day non-renewal notice closes. Michael Page and Bayt.com offer comparable RPO at lower rates.',
    severity: 'medium', personaPriority: { cfo: 2, legal: 2, procurement: 3 }, confidence: 90, ai: true,
  },
  {
    id: 'e-017', contractId: 'c-006', date: '2026-12-31', kind: 'expiration',
    title: 'Expiration - Hays Talent Solutions',
    detail: '240 Saudization hires in flight. PDPL exposure on candidate data if continued without remediation.',
    amount: 920_000, severity: 'high', personaPriority: { cfo: 2, legal: 3, procurement: 3 }, confidence: 99, ai: true,
  },

  // c-002 SAP - long-running
  {
    id: 'e-018', contractId: 'c-002', date: '2026-09-01', kind: 'payment',
    title: 'SAP annual maintenance - SAR 1.2M',
    detail: 'Annual support fee. ZATCA e-invoicing module not yet included.',
    amount: 1_200_000, severity: 'low', personaPriority: { cfo: 3, legal: 0, procurement: 2 }, confidence: 98, ai: true,
  },
  {
    id: 'e-019', contractId: 'c-002', date: '2026-03-01', kind: 'sla_review',
    title: 'SAP annual SLA review',
    detail: 'KPI review against 99.5% availability target. Vision 2030 compliance module roadmap discussion.',
    severity: 'low', personaPriority: { cfo: 1, legal: 0, procurement: 2 }, confidence: 89, ai: true,
  },

  // c-007 Help AG
  {
    id: 'e-020', contractId: 'c-007', date: '2026-10-12', kind: 'sla_review',
    title: 'Help AG annual security audit',
    detail: 'NCA-aligned penetration test and SOC review. Confirm 72-hour PDPL incident notification SLA.',
    severity: 'medium', personaPriority: { cfo: 1, legal: 3, procurement: 2 }, confidence: 91, ai: true,
  },

  // c-004 Al-Tamimi
  {
    id: 'e-021', contractId: 'c-004', date: '2026-08-01', kind: 'payment',
    title: 'Al-Tamimi quarterly retainer',
    detail: 'M&A advisory retainer. CMA / SAMA filing capacity.',
    amount: 300_000, severity: 'low', personaPriority: { cfo: 2, legal: 1, procurement: 1 }, confidence: 95, ai: true,
  },

  // c-009 - low-confidence ingestion case
  {
    id: 'e-022', contractId: 'c-009', date: '2026-07-15', kind: 'compliance_audit',
    title: 'Manual review required - Bayan SaaS Subscription',
    detail: 'Document completeness 64%. Termination clause not detected. Routed to legal review queue.',
    severity: 'medium', personaPriority: { cfo: 1, legal: 3, procurement: 2 }, confidence: 38, ai: true,
  },
];

// ─── Cross-contract clause deviations (for the Compare view) ──────────────────
export type DeviationStatus = 'standard' | 'over' | 'under' | 'missing' | 'flagged';

export interface ClauseCell {
  value: string;
  numeric?: number;       // for sortable numeric comparison
  unit?: string;          // 'days' | 'SAR' | '%' | 'years'
  status: DeviationStatus;
  note?: string;
}

export interface ClauseDeviationRow {
  contractId: string;
  vendor: string;
  contractTitle: string;
  liabilityCap: ClauseCell;
  noticePeriod: ClauseCell;
  paymentTerms: ClauseCell;
  breachNotification: ClauseCell;
  retentionPeriod: ClauseCell;
}

export const policyStandard = {
  liabilityCap:        '12 months of fees',
  noticePeriod:        '60 days',
  paymentTerms:        'Net 30',
  breachNotification:  '72 hours (PDPL Art. 26)',
  retentionPeriod:     '2 years post-termination',
};

export const clauseDeviations: ClauseDeviationRow[] = [
  {
    contractId: 'c-001', vendor: 'Microsoft', contractTitle: 'Azure Enterprise Agreement',
    liabilityCap:       { value: '12 months', numeric: 12, unit: 'months', status: 'standard' },
    noticePeriod:       { value: '60 days',   numeric: 60, unit: 'days', status: 'standard' },
    paymentTerms:       { value: 'Net 45',    numeric: 45, unit: 'days', status: 'over', note: '+15 days vs. Net 30' },
    breachNotification: { value: '72 hours',  numeric: 72, unit: 'hours', status: 'standard' },
    retentionPeriod:    { value: 'Indefinite (telemetry)', status: 'flagged', note: 'Diagnostic data, no defined cap' },
  },
  {
    contractId: 'c-002', vendor: 'SAP',       contractTitle: 'S/4HANA License Agreement',
    liabilityCap:       { value: '6 months',  numeric: 6, unit: 'months', status: 'under', note: '−6 months vs. policy' },
    noticePeriod:       { value: '90 days',   numeric: 90, unit: 'days', status: 'over', note: '+30 days vs. policy' },
    paymentTerms:       { value: 'Net 30',    numeric: 30, unit: 'days', status: 'standard' },
    breachNotification: { value: '72 hours',  numeric: 72, unit: 'hours', status: 'standard' },
    retentionPeriod:    { value: '7 years',   numeric: 7, unit: 'years', status: 'over', note: '+5 yrs vs. policy' },
  },
  {
    contractId: 'c-005', vendor: 'STC',       contractTitle: 'Co-location Services',
    liabilityCap:       { value: 'Unlimited', status: 'flagged', note: 'No cap - material exposure' },
    noticePeriod:       { value: '60 days',   numeric: 60, unit: 'days', status: 'standard' },
    paymentTerms:       { value: 'Net 30',    numeric: 30, unit: 'days', status: 'standard' },
    breachNotification: { value: '30 days',   numeric: 720, unit: 'hours', status: 'flagged', note: 'PDPL Art. 26 violation - 72h required' },
    retentionPeriod:    { value: '5 years',   numeric: 5, unit: 'years', status: 'over' },
  },
  {
    contractId: 'c-006', vendor: 'Hays',      contractTitle: 'HR RPO',
    liabilityCap:       { value: '6 months',  numeric: 6, unit: 'months', status: 'under', note: '−6 months vs. policy' },
    noticePeriod:       { value: '60 days',   numeric: 60, unit: 'days', status: 'standard' },
    paymentTerms:       { value: 'Net 30',    numeric: 30, unit: 'days', status: 'standard' },
    breachNotification: { value: '7 days',    numeric: 168, unit: 'hours', status: 'flagged', note: 'PDPL Art. 26 violation - 72h required' },
    retentionPeriod:    { value: '7 years',   numeric: 7, unit: 'years', status: 'flagged', note: 'PDPL Art. 18 - purpose limitation' },
  },
  {
    contractId: 'c-007', vendor: 'Help AG',   contractTitle: 'Cybersecurity Managed Services',
    liabilityCap:       { value: '24 months', numeric: 24, unit: 'months', status: 'over', note: 'Above policy - favourable' },
    noticePeriod:       { value: '90 days',   numeric: 90, unit: 'days', status: 'over' },
    paymentTerms:       { value: 'Net 30',    numeric: 30, unit: 'days', status: 'standard' },
    breachNotification: { value: '24 hours',  numeric: 24, unit: 'hours', status: 'standard', note: 'Better than PDPL minimum' },
    retentionPeriod:    { value: '3 years',   numeric: 3, unit: 'years', status: 'over' },
  },
  {
    contractId: 'c-008', vendor: 'Seera',     contractTitle: 'Travel Management',
    liabilityCap:       { value: '12 months', numeric: 12, unit: 'months', status: 'standard' },
    noticePeriod:       { value: '60 days',   numeric: 60, unit: 'days', status: 'standard' },
    paymentTerms:       { value: 'Net 60',    numeric: 60, unit: 'days', status: 'over', note: '+30 days vs. policy' },
    breachNotification: { value: '-',         status: 'missing', note: 'Clause not present' },
    retentionPeriod:    { value: '2 years',   numeric: 2, unit: 'years', status: 'standard' },
  },
  {
    contractId: 'c-009', vendor: 'Bayan',     contractTitle: 'Bayan SaaS Subscription',
    liabilityCap:       { value: '~ 6 months (low conf.)', status: 'flagged', note: 'Confidence 38% - manual review' },
    noticePeriod:       { value: '-',         status: 'missing', note: 'Termination clause not detected' },
    paymentTerms:       { value: 'Net 30',    numeric: 30, unit: 'days', status: 'standard' },
    breachNotification: { value: '-',         status: 'missing', note: 'Clause not detected' },
    retentionPeriod:    { value: '-',         status: 'missing' },
  },
];

// ─── Pre-baked AI Q&A (replaces the inert "Ask AI" input) ─────────────────────
export interface AIPrompt {
  id: string;
  question: string;
  persona: PersonaId | 'all';
  answer: string;
  citations: { contractId: string; clauseRef?: string; quote?: string; confidence: number }[];
  followUpRoute?: string;
}

export const aiPrompts: AIPrompt[] = [
  {
    id: 'q-001',
    persona: 'cfo',
    question: 'What is our 12-month financial exposure across all active contracts?',
    answer: 'Total active commitment is SAR 18.7M. Of that, SAR 6.5M is up for renewal in the next 7 months across 4 contracts. SAR 2.03M of identified savings is contingent on renegotiation actions starting before end of Q3 2026. Concentration risk: 36% of value sits with two IT vendors (Microsoft Azure, STC).',
    citations: [
      { contractId: 'c-001', clauseRef: 'Schedule A - Annual fee', quote: 'Total annual subscription fee: SAR 2,400,000.', confidence: 99 },
      { contractId: 'c-005', clauseRef: 'Schedule 1 - Service charges', quote: 'Annual co-location service charge: SAR 3,100,000.', confidence: 98 },
    ],
    followUpRoute: '/executive',
  },
  {
    id: 'q-002',
    persona: 'legal',
    question: 'Which contracts have breach-notification SLAs longer than 72 hours?',
    answer: '2 contracts violate PDPL Art. 26 (72-hour requirement): STC Co-location (30 days, confidence 99%) and Hays HR RPO (7 days, confidence 93%). Seera Travel has no breach-notification clause detected at all. Help AG outperforms the policy at 24 hours.',
    citations: [
      { contractId: 'c-005', clauseRef: 'Clause 14.1', quote: 'Provider shall notify Customer within thirty (30) calendar days of becoming aware of the incident.', confidence: 99 },
      { contractId: 'c-006', clauseRef: 'Clause 12.3', quote: 'Hays shall notify the Client within seven (7) days of any data security incident.', confidence: 93 },
    ],
    followUpRoute: '/compare',
  },
  {
    id: 'q-003',
    persona: 'procurement',
    question: 'Where do I have the most negotiation leverage in the next 90 days?',
    answer: 'Highest-leverage opportunity is Al-Jazirah Supplies (88/100): commodity category with 12+ alternatives, current rate 22% above market, notice deadline May 9, 2026. Microsoft Azure (82/100) is the largest absolute saving at SAR 480K; the renewal window opens Oct 15, 2026 (90 days before expiry). STC Co-location (74/100) combines pricing leverage with PDPL non-compliance pressure.',
    citations: [
      { contractId: 'c-003', clauseRef: 'Clause 11.2', quote: 'Either party may decline renewal by written notice not less than thirty (30) days prior to the expiration date.', confidence: 96 },
    ],
    followUpRoute: '/procurement',
  },
  {
    id: 'q-004',
    persona: 'all',
    question: 'Show me everything driven by PDPL across the portfolio.',
    answer: '7 PDPL clauses flagged across 4 contracts. 4 are critical (STC breach notification, STC cross-border transfer, Hays candidate retention, Hays subprocessors). One Al-Tamimi flag was confirmed as a false positive - Saudi Bar Association Rule 42 provides statutory basis. One Bayan clause is low-confidence (38%) and routed to manual review.',
    citations: [
      { contractId: 'c-005', clauseRef: 'Clause 14.1', quote: 'Provider shall notify Customer within thirty (30) calendar days...', confidence: 99 },
      { contractId: 'c-006', clauseRef: 'Clause 5.1', quote: 'Hays may retain candidate profile data... for a period of seven (7) years...', confidence: 91 },
    ],
    followUpRoute: '/legal',
  },
  {
    id: 'q-005',
    persona: 'all',
    question: 'Which contracts auto-renew if I do nothing this month?',
    answer: 'Office Supplies (Al-Jazirah) auto-renews June 9, 2026 unless notice is served by May 9. Seera Travel has a 60-day window opening end of May 2026. No other contracts auto-renew within 30 days, but two notice deadlines fall in September–November 2026 (STC, Microsoft).',
    citations: [
      { contractId: 'c-003', clauseRef: 'Clause 11.2', quote: 'Either party may decline renewal by written notice not less than thirty (30) days...', confidence: 96 },
      { contractId: 'c-008', clauseRef: 'Clause 9.1', quote: 'This Agreement shall renew automatically for successive twelve (12) month terms unless terminated by sixty (60) days prior written notice.', confidence: 92 },
    ],
    followUpRoute: '/timeline',
  },
];

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contracts: Contract[] = [
  {
    id: 'c-001',
    title: 'Microsoft Azure Enterprise Agreement',
    type: 'SaaS / Cloud Services',
    counterparty: 'Microsoft Corporation',
    signedDate: 'Jan 15, 2024',
    expirationDate: 'Jan 14, 2027',
    effectiveDate: 'Jan 15, 2024',
    value: 2_400_000,
    currency: 'SAR',
    status: 'Expiring Soon',
    risk: 'High',
    tags: ['Cloud', 'IT Infrastructure', 'ZATCA'],
    pdplClauses: 1,
    owner: 'Faisal Al-Harbi',
    department: 'IT',
    renewalReminder: 'Oct 15, 2026',
    parties: [
      { role: 'Licensee', name: 'Al-Rajhi Capital' },
      { role: 'Licensor', name: 'Microsoft Corporation' },
    ],
    scope: 'Enterprise cloud infrastructure, Microsoft 365, Azure services for 2,400 users',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'complete',
    completenessScore: 98,
  },
  {
    id: 'c-002',
    title: 'SAP S/4HANA License Agreement',
    type: 'Enterprise Software',
    counterparty: 'SAP SE',
    signedDate: 'Mar 01, 2023',
    expirationDate: 'Feb 28, 2027',
    effectiveDate: 'Mar 01, 2023',
    value: 5_800_000,
    currency: 'SAR',
    status: 'Active',
    risk: 'Medium',
    tags: ['ERP', 'Finance', 'Vision 2030'],
    pdplClauses: 0,
    owner: 'Nora Al-Otaibi',
    department: 'Finance',
    parties: [
      { role: 'Customer', name: 'Al-Rajhi Capital' },
      { role: 'Vendor', name: 'SAP SE' },
    ],
    scope: 'S/4HANA Finance, Procurement, and HR modules; 850 named users',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'complete',
    completenessScore: 96,
  },
  {
    id: 'c-003',
    title: 'Office Supplies Framework Agreement',
    type: 'Procurement Framework',
    counterparty: 'Al-Jazirah Supplies Co.',
    signedDate: 'Jun 10, 2023',
    expirationDate: 'Jun 09, 2026',
    effectiveDate: 'Jun 10, 2023',
    value: 380_000,
    currency: 'SAR',
    status: 'Expiring Soon',
    risk: 'Low',
    tags: ['Procurement', 'Facilities'],
    pdplClauses: 0,
    owner: 'Ibrahim Al-Shammari',
    department: 'Procurement',
    parties: [
      { role: 'Buyer', name: 'Al-Rajhi Capital' },
      { role: 'Supplier', name: 'Al-Jazirah Supplies Co.' },
    ],
    scope: 'Office consumables, printing supplies, stationery for Riyadh HQ',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'complete',
    completenessScore: 100,
  },
  {
    id: 'c-004',
    title: 'Legal Counsel Retainer - Corporate M&A',
    type: 'Professional Services',
    counterparty: 'Al-Tamimi & Company',
    signedDate: 'Aug 01, 2024',
    expirationDate: 'Jul 31, 2026',
    effectiveDate: 'Aug 01, 2024',
    value: 1_200_000,
    currency: 'SAR',
    status: 'Active',
    risk: 'Low',
    tags: ['Legal', 'M&A', 'Board'],
    pdplClauses: 1,
    owner: 'Sara Al-Qahtani',
    department: 'Legal',
    parties: [
      { role: 'Client', name: 'Al-Rajhi Capital' },
      { role: 'Firm', name: 'Al-Tamimi & Company' },
    ],
    scope: 'M&A advisory, due diligence, regulatory filings under CMA and SAMA frameworks',
    jurisdiction: 'Kingdom of Saudi Arabia / DIFC',
    extractionStatus: 'complete',
    completenessScore: 94,
  },
  {
    id: 'c-005',
    title: 'Data Center Co-location Services',
    type: 'Infrastructure Services',
    counterparty: 'STC Solutions',
    signedDate: 'Nov 20, 2022',
    expirationDate: 'Nov 19, 2026',
    effectiveDate: 'Nov 20, 2022',
    value: 3_100_000,
    currency: 'SAR',
    status: 'Expiring Soon',
    risk: 'High',
    tags: ['IT Infrastructure', 'PDPL', 'Data Residency'],
    pdplClauses: 2,
    owner: 'Faisal Al-Harbi',
    department: 'IT',
    renewalReminder: 'Aug 20, 2026',
    parties: [
      { role: 'Customer', name: 'Al-Rajhi Capital' },
      { role: 'Provider', name: 'STC Solutions' },
    ],
    scope: 'Primary and DR co-location, 80 server racks, 24/7 NOC support, data sovereignty in KSA',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'complete',
    completenessScore: 92,
  },
  {
    id: 'c-006',
    title: 'HR Recruitment Process Outsourcing',
    type: 'HR Services',
    counterparty: 'Hays Talent Solutions',
    signedDate: 'Jan 05, 2024',
    expirationDate: 'Dec 31, 2026',
    effectiveDate: 'Jan 05, 2024',
    value: 920_000,
    currency: 'SAR',
    status: 'Active',
    risk: 'Medium',
    tags: ['HR', 'Saudization', 'PDPL'],
    pdplClauses: 3,
    owner: 'Mona Al-Dosari',
    department: 'HR',
    parties: [
      { role: 'Client', name: 'Al-Rajhi Capital' },
      { role: 'Provider', name: 'Hays Talent Solutions KSA' },
    ],
    scope: 'End-to-end recruitment for Saudization targets: 240 hires in 2024-2027',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'complete',
    completenessScore: 91,
  },
  {
    id: 'c-007',
    title: 'Cybersecurity Managed Services',
    type: 'Managed Services',
    counterparty: 'Help AG (Etisalat)',
    signedDate: 'Apr 12, 2024',
    expirationDate: 'Apr 11, 2027',
    effectiveDate: 'Apr 12, 2024',
    value: 4_250_000,
    currency: 'SAR',
    status: 'Active',
    risk: 'Medium',
    tags: ['Security', 'IT Infrastructure', 'CITC'],
    pdplClauses: 0,
    owner: 'Faisal Al-Harbi',
    department: 'IT',
    parties: [
      { role: 'Customer', name: 'Al-Rajhi Capital' },
      { role: 'Provider', name: 'Help AG (Etisalat Digital)' },
    ],
    scope: '24/7 SOC, SIEM, threat intelligence, incident response retainer',
    jurisdiction: 'Kingdom of Saudi Arabia / UAE',
    extractionStatus: 'complete',
    completenessScore: 95,
  },
  {
    id: 'c-008',
    title: 'Corporate Travel Management',
    type: 'Travel Services',
    counterparty: 'Seera Group',
    signedDate: 'Sep 01, 2023',
    expirationDate: 'Aug 31, 2026',
    effectiveDate: 'Sep 01, 2023',
    value: 650_000,
    currency: 'SAR',
    status: 'Expiring Soon',
    risk: 'Low',
    tags: ['Travel', 'Finance', 'Procurement'],
    pdplClauses: 0,
    owner: 'Ibrahim Al-Shammari',
    department: 'Procurement',
    parties: [
      { role: 'Client', name: 'Al-Rajhi Capital' },
      { role: 'Provider', name: 'Seera Group (Al-Tayyar)' },
    ],
    scope: 'Domestic and international corporate travel, hotel booking, visa support for 1,200 employees',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'partial',
    completenessScore: 78,
    missingFields: ['Breach notification clause'],
  },
  {
    id: 'c-009',
    title: 'Bayan SaaS Subscription Agreement',
    type: 'SaaS / Cloud Services',
    counterparty: 'Bayan Technologies',
    signedDate: 'Feb 10, 2026',
    expirationDate: 'Feb 09, 2027',
    effectiveDate: 'Feb 10, 2026',
    value: 540_000,
    currency: 'SAR',
    status: 'Pending Review',
    risk: 'Medium',
    tags: ['SaaS', 'Needs Review'],
    pdplClauses: 1,
    owner: 'Sara Al-Qahtani',
    department: 'Legal',
    parties: [
      { role: 'Customer', name: 'Al-Rajhi Capital' },
      { role: 'Vendor', name: 'Bayan Technologies' },
    ],
    scope: 'Operational analytics SaaS - scanned PDF, partial extraction, manual review required',
    jurisdiction: 'Kingdom of Saudi Arabia',
    extractionStatus: 'incomplete',
    completenessScore: 64,
    missingFields: ['Termination clause', 'Breach notification', 'Data retention period', 'Liability cap'],
  },
];

// ─── Vendor Intelligence ──────────────────────────────────────────────────────
export const vendorIntelligence: VendorIntelligence[] = [
  {
    contractId: 'c-001',
    vendor: 'Microsoft Corporation',
    currentRate: 2_400_000,
    marketMedian: 1_980_000,
    marketLow: 1_720_000,
    leverageScore: 82,
    leverageReason: 'Contract in 90-day renewal window. Three competing offers available from AWS and Google Cloud. stc Cloud pilot provides credible BATNA.',
    recommendedAction: 'Initiate renegotiation for 20–25% reduction. Leverage stc Cloud pilot as credible BATNA. Request MENA-specific pricing tier and include ZATCA e-invoicing compliance at no additional cost.',
    potentialSaving: 480_000,
    benchmarkSource: 'Gartner TechMarket Insights Q1 2026 · 42 comparable KSA enterprise deals',
    urgency: 'High',
  },
  {
    contractId: 'c-002',
    vendor: 'SAP SE',
    currentRate: 5_800_000,
    marketMedian: 5_200_000,
    marketLow: 4_600_000,
    leverageScore: 61,
    leverageReason: 'Long-term relationship with upcoming Vision 2030 compliance module requirement. Oracle ERPM is a viable alternative with active KSA presence.',
    recommendedAction: 'Request volume discount for 2027 renewal. Negotiate inclusion of ZATCA e-invoicing module at no added cost. Use Oracle comparison in negotiation.',
    potentialSaving: 600_000,
    benchmarkSource: 'SAP MENA Partner Benchmark 2024 · 18 comparable banking clients',
    urgency: 'Medium',
  },
  {
    contractId: 'c-005',
    vendor: 'STC Solutions',
    currentRate: 3_100_000,
    marketMedian: 2_650_000,
    marketLow: 2_200_000,
    leverageScore: 74,
    leverageReason: 'PDPL compliance gaps in current contract add negotiation pressure. Mobily and Zain offer KSA-compliant co-location alternatives.',
    recommendedAction: 'Run competitive RFP with Mobily Business and Zain Business 60 days before expiry. Use PDPL clause gaps as leverage for SLA improvements and price reduction.',
    potentialSaving: 450_000,
    benchmarkSource: 'IDC KSA Cloud Infrastructure Report 2025',
    urgency: 'High',
  },
  {
    contractId: 'c-006',
    vendor: 'Hays Talent Solutions',
    currentRate: 920_000,
    marketMedian: 780_000,
    marketLow: 640_000,
    leverageScore: 55,
    leverageReason: 'HRSD Saudization targets create dependency but Michael Page and Bayt.com offer comparable RPO services at lower rates.',
    recommendedAction: 'Renegotiate success fee from 18% to 14%. Add performance KPIs tied to Saudization tier achievement. Consider splitting between two providers.',
    potentialSaving: 148_000,
    benchmarkSource: 'HRSD RPO Market Survey Q4 2024',
    urgency: 'Medium',
  },
  {
    contractId: 'c-003',
    vendor: 'Al-Jazirah Supplies Co.',
    currentRate: 380_000,
    marketMedian: 310_000,
    marketLow: 260_000,
    leverageScore: 88,
    leverageReason: 'Commodity supplies with 12+ local alternatives. Open SFDA procurement portal available. Lowest switching cost in portfolio.',
    recommendedAction: 'Open competitive tender. Current rates 22% above market median. Non-renewal recommended unless 20%+ price reduction offered within 30 days.',
    potentialSaving: 88_000,
    benchmarkSource: 'SFDA Procurement Benchmarks 2025 · NUPCO framework pricing',
    urgency: 'High',
  },
  {
    contractId: 'c-007',
    vendor: 'Help AG (Etisalat)',
    currentRate: 4_250_000,
    marketMedian: 4_100_000,
    marketLow: 3_500_000,
    leverageScore: 42,
    leverageReason: 'NCA-certified SOC requirements significantly limit alternatives. Critical infrastructure dependency reduces negotiating position.',
    recommendedAction: 'Maintain current commercial terms. Negotiate inclusion of PDPL incident notification SLA (72h) and annual penetration testing at no added cost.',
    potentialSaving: 150_000,
    benchmarkSource: 'NCA CSCC Framework 2025 · Gartner MSSP Magic Quadrant',
    urgency: 'Low',
  },
  {
    contractId: 'c-008',
    vendor: 'Seera Group',
    currentRate: 650_000,
    marketMedian: 540_000,
    marketLow: 430_000,
    leverageScore: 71,
    leverageReason: 'Multiple active TMC providers in KSA market. Corporate travel rebounded post-COVID creating competitive pricing pressure.',
    recommendedAction: 'Issue RFP to Almosafer Business and Corporate Travel Arabia. Request volume rebates tied to booking thresholds.',
    potentialSaving: 110_000,
    benchmarkSource: 'GBTA KSA Corporate Travel Benchmark 2025',
    urgency: 'Medium',
  },
];

// ─── PDPL Clauses (with negated + needs-review additions) ─────────────────────
export const pdplClauses: PDPLClause[] = [
  {
    id: 'p-001',
    contractId: 'c-005',
    contractTitle: 'Data Center Co-location Services',
    clauseRef: 'Clause 8.3 - Data Processing',
    clauseText: 'Provider may process, analyze, and use Customer data for service improvement purposes, including sharing aggregated data with third-party analytics providers located outside the Kingdom of Saudi Arabia.',
    violation: 'Cross-border data transfer without explicit consent mechanism; lacks SDAIA adequacy determination or standard contractual clauses.',
    articleRef: 'PDPL Art. 29, Art. 30',
    severity: 'Critical',
    status: 'Open',
    aiConfidence: 96,
    recommendation: 'Replace with: "Provider shall not transfer Personal Data outside the Kingdom of Saudi Arabia without prior written consent and SDAIA authorization. All subprocessors must maintain data residency in KSA." Add DPA as Schedule 3.',
    assignedTo: 'Sara Al-Qahtani',
  },
  {
    id: 'p-002',
    contractId: 'c-006',
    contractTitle: 'HR Recruitment Process Outsourcing',
    clauseRef: 'Clause 5.1 - Candidate Data',
    clauseText: 'Hays may retain candidate profile data, assessment results, and employment history for a period of seven (7) years following the conclusion of services for benchmarking and analytics purposes.',
    violation: 'Retention period exceeds purpose limitation. No legal basis stated for 7-year retention. No candidate notification or consent mechanism provided.',
    articleRef: 'PDPL Art. 18, Art. 4',
    severity: 'Critical',
    status: 'Open',
    aiConfidence: 91,
    recommendation: 'Reduce to 2-year retention aligned with MOL requirements. Add: "Retention for analytics requires separate explicit consent per SDAIA Form PD-03." Include automated deletion workflow.',
    assignedTo: 'Sara Al-Qahtani',
  },
  {
    id: 'p-003',
    contractId: 'c-001',
    contractTitle: 'Microsoft Azure Enterprise Agreement',
    clauseRef: 'Clause 12.2 - Diagnostic Data',
    clauseText: 'Customer agrees that Microsoft may collect and use technical data and related information, including diagnostic data, to facilitate software updates, product support, and improve Microsoft products and services.',
    violation: 'Broad diagnostic data collection without granular consent. Purpose unclear. Potential personal data included in diagnostic telemetry.',
    articleRef: 'PDPL Art. 5, Art. 6',
    severity: 'Major',
    status: 'Open',
    aiConfidence: 84,
    recommendation: 'Negotiate Microsoft Entra Privacy Addendum. Enable Enhanced Privacy Controls in M365 Admin Center. Document data flow map for SDAIA audit readiness.',
    assignedTo: 'Faisal Al-Harbi',
  },
  {
    id: 'p-004',
    contractId: 'c-006',
    contractTitle: 'HR Recruitment Process Outsourcing',
    clauseRef: 'Clause 9.4 - Background Checks',
    clauseText: 'Provider shall conduct background verification including criminal record checks, credit history, and social media screening as standard practice for all shortlisted candidates.',
    violation: 'Social media screening may involve special category data (religion, political views). No explicit consent framework. HRSD screening regulations not referenced.',
    articleRef: 'PDPL Art. 24, HRSD Employment Regulations',
    severity: 'Major',
    status: 'Confirmed',
    aiConfidence: 88,
    recommendation: 'Limit to HRSD-approved background check categories. Require explicit consent form (bilingual AR/EN) before any screening. Exclude social media screening or obtain specific consent.',
    assignedTo: 'Mona Al-Dosari',
  },
  {
    id: 'p-005',
    contractId: 'c-004',
    contractTitle: 'Legal Counsel Retainer - Corporate M&A',
    clauseRef: 'Clause 3.7 - Matter Files',
    clauseText: 'Al-Tamimi & Company shall retain all matter files, correspondence, and related documents for ten (10) years in accordance with legal professional obligations and applicable bar regulations.',
    violation: 'Retention period may include personal data beyond what is required. No distinction between privileged legal files and personal data records.',
    articleRef: 'PDPL Art. 18, Saudi Bar Association Rules',
    severity: 'Minor',
    status: 'False Positive',
    aiConfidence: 61,
    recommendation: 'Legal professional retention requirements (Saudi Bar Association Rule 42) provide statutory basis. Acceptable as-is. Consider adding data segregation clause.',
    assignedTo: 'Sara Al-Qahtani',
  },
  {
    id: 'p-006',
    contractId: 'c-005',
    contractTitle: 'Data Center Co-location Services',
    clauseRef: 'Clause 14.1 - Security Incident Notification',
    clauseText: 'In the event of a security incident affecting Customer data, Provider shall notify Customer within thirty (30) calendar days of becoming aware of the incident.',
    violation: 'PDPL and NCA require notification within 72 hours for personal data breaches. 30-day timeline is materially non-compliant.',
    articleRef: 'PDPL Art. 26, NCA CSCC-3',
    severity: 'Critical',
    status: 'Escalated',
    aiConfidence: 99,
    recommendation: 'Replace with: "Provider shall notify Customer within 72 hours of becoming aware of a Personal Data Breach per PDPL Art. 26 and NCA CSCC-3. Notification shall include: nature of breach, categories affected, estimated data subjects, and mitigation measures."',
    assignedTo: 'Sara Al-Qahtani',
  },
  {
    id: 'p-007',
    contractId: 'c-006',
    contractTitle: 'HR Recruitment Process Outsourcing',
    clauseRef: 'Clause 11.2 - Subprocessors',
    clauseText: 'Hays may engage subprocessors for assessment and psychometric testing services, including providers located in the United Arab Emirates, United Kingdom, and United States.',
    violation: 'Cross-border transfer to non-adequate countries (US, UK post-Brexit) without SDAIA safeguards. No subprocessor register provided.',
    articleRef: 'PDPL Art. 29, SDAIA Cross-Border Decision',
    severity: 'Critical',
    status: 'Open',
    aiConfidence: 93,
    recommendation: 'Require subprocessor register as Schedule 2. Mandate KSA-based processing or SDAIA-approved standard clauses for each transfer. Obtain right to audit subprocessors annually.',
    assignedTo: 'Sara Al-Qahtani',
  },
  // New: negated clause flagged for mandatory human review (per AI architecture doc)
  {
    id: 'p-008',
    contractId: 'c-001',
    contractTitle: 'Microsoft Azure Enterprise Agreement',
    clauseRef: 'Clause 17.4 - Limitation of Liability',
    clauseText: 'Notwithstanding anything to the contrary, Microsoft shall not be liable for any indirect, incidental, or consequential damages arising under or in connection with this Agreement, except in cases of gross negligence or wilful misconduct.',
    violation: 'Negated obligation construction. Auto-classifier may misread "shall not be liable" as a Customer obligation. Routed to mandatory human review.',
    articleRef: 'Internal AI Policy - Negated Clause Rule',
    severity: 'Minor',
    status: 'Needs Review',
    aiConfidence: 72,
    recommendation: 'Confirm interpretation against Schedule 4 - Indemnification. Verify exception scope ("gross negligence or wilful misconduct") is consistent with KSA contract law.',
    assignedTo: 'Sara Al-Qahtani',
    isNegated: true,
    needsReview: true,
    reviewReason: 'Negated obligation - known systematic failure mode. Mandatory human verification.',
  },
  // New: low-confidence extraction routed to review queue
  {
    id: 'p-009',
    contractId: 'c-009',
    contractTitle: 'Bayan SaaS Subscription Agreement',
    clauseRef: 'Clause ? - Data Processing (low confidence)',
    clauseText: '[Scanned text - partial extraction] "...the Provider may process subscriber data including [...illegible...] and retain such data for the period [...illegible...] following termination."',
    violation: 'Document was scanned at low DPI; key terms (retention period, scope of processing) could not be reliably extracted. Cannot determine PDPL compliance status without manual review.',
    articleRef: 'Document completeness 64%',
    severity: 'Minor',
    status: 'Needs Review',
    aiConfidence: 38,
    recommendation: 'Request a digital-native copy from vendor. If unavailable, conduct manual clause-by-clause review and re-ingest. Do not pass downstream until completeness ≥ 85%.',
    assignedTo: 'Sara Al-Qahtani',
    needsReview: true,
    reviewReason: 'Low extraction confidence (38%) on key fields. Document completeness 64%.',
  },
];

// ─── Audit Trail (with new feedback-loop entries) ─────────────────────────────
export const auditTrail: AuditEntry[] = [
  {
    id: 'a-001',
    timestamp: 'Apr 28, 2026 · 09:14',
    actor: 'Signit AI',
    actionType: 'ai',
    action: 'PDPL sweep initiated',
    detail: 'Automated compliance scan across 9 active contracts. 17 clauses flagged for initial review.',
  },
  {
    id: 'a-002',
    timestamp: 'Apr 28, 2026 · 09:15',
    actor: 'Signit AI',
    actionType: 'ai',
    action: 'Critical violation detected',
    detail: 'STC Solutions - Clause 14.1: 30-day breach notification violates PDPL Art. 26 (72h requirement). Confidence: 99%.',
  },
  {
    id: 'a-003',
    timestamp: 'Apr 28, 2026 · 09:16',
    actor: 'Signit AI',
    actionType: 'ai',
    action: 'Negated clause flagged for review',
    detail: 'Microsoft EA - Clause 17.4 contains "shall not be liable" construction. Routed to mandatory human review per AI policy.',
  },
  {
    id: 'a-004',
    timestamp: 'Apr 28, 2026 · 09:17',
    actor: 'Signit AI',
    actionType: 'ai',
    action: 'Low-confidence extraction quarantined',
    detail: 'Bayan SaaS Subscription - 5 fields below 0.50 confidence threshold. Document completeness 64%. Held from downstream outputs.',
  },
  {
    id: 'a-005',
    timestamp: 'Apr 28, 2026 · 11:32',
    actor: 'Sara Al-Qahtani',
    actionType: 'human',
    action: 'Violation escalated',
    detail: 'Escalated STC breach notification clause to Legal Director for immediate vendor engagement.',
  },
  {
    id: 'a-006',
    timestamp: 'Apr 28, 2026 · 14:07',
    actor: 'Signit AI',
    actionType: 'ai',
    action: 'Remediation drafted',
    detail: 'Generated replacement clause language for STC Clause 14.1 aligned with PDPL Art. 26 and NCA CSCC-3.',
  },
  {
    id: 'a-007',
    timestamp: 'Apr 29, 2026 · 10:21',
    actor: 'Sara Al-Qahtani',
    actionType: 'human',
    action: 'False positive marked',
    detail: 'Al-Tamimi Clause 3.7 marked as false positive - Saudi Bar Association Rule 42 provides statutory retention basis. Feedback added to model evaluation set.',
  },
  {
    id: 'a-008',
    timestamp: 'May 02, 2026 · 08:45',
    actor: 'Signit AI',
    actionType: 'ai',
    action: 'Renegotiation opportunity flagged',
    detail: 'Microsoft Azure contract approaches 90-day renewal window ahead of January 2027 expiry. Leverage score 82/100. SAR 480K saving identified.',
  },
];

export const executiveBrief = {
  weekOf: 'April 27 – May 3, 2026',
  totalContracts: 9,
  totalValue: 19_240_000,
  expiringThisQuarter: 4,
  expiringValue: 6_530_000,
  pdplViolations: 9,
  criticalPdpl: 4,
  potentialSavings: 2_026_000,
  renewalOpportunities: 4,
  highlights: [
    {
      type: 'risk' as const,
      title: 'STC PDPL Breach Notification Non-Compliant',
      detail: 'STC Co-location Clause 14.1 requires 30-day notification vs. PDPL 72-hour mandate. Escalated to Legal Director. Vendor engagement required before renewal.',
      value: 'SAR 3.1M at risk',
      deeplink: '/legal',
    },
    {
      type: 'risk' as const,
      title: 'Hays HR Data Transfer Violations',
      detail: 'Candidate data routed to US and UK without SDAIA safeguards. 3 PDPL clauses flagged (2 critical) in active recruitment contract serving 240 Saudization hires.',
      value: '2 critical violations',
      deeplink: '/contract/c-006',
    },
    {
      type: 'opportunity' as const,
      title: 'Microsoft Azure - SAR 480K Saving Opportunity',
      detail: 'Contract renews Jan 2027. Current rate 22% above market median. stc Cloud pilot provides credible BATNA. Recommended: initiate renegotiation by Sep 2026.',
      value: 'SAR 480K / year',
      deeplink: '/contract/c-001',
    },
    {
      type: 'opportunity' as const,
      title: 'STC Co-location Competitive RFP',
      detail: 'Mobily Business and Zain KSA offer KSA-compliant alternatives at SAR 2.2–2.6M. Running RFP 60 days before expiry recommended.',
      value: 'SAR 450K saving',
      deeplink: '/contract/c-005',
    },
    {
      type: 'action' as const,
      title: 'Four Contracts Expiring Before Year-End',
      detail: 'Office Supplies (Jun), Travel Management (Aug), STC Co-location (Nov), HR RPO (Dec). Renewal decisions and RFPs required across all four.',
      value: 'SAR 6.5M in renewals',
      deeplink: '/timeline',
    },
  ],
  recommendedActions: [
    { label: 'Initiate Microsoft renegotiation', due: 'By Sep 2026', priority: 'High', to: '/contract/c-001' },
    { label: 'Issue STC co-location RFP', due: 'Aug 2026', priority: 'High', to: '/procurement' },
    { label: 'Remediate STC PDPL Clause 14.1', due: 'Immediate', priority: 'Critical', to: '/legal' },
    { label: 'Review Hays HR data transfers', due: 'This week', priority: 'Critical', to: '/contract/c-006' },
  ],
  kpis: [
    { label: 'Portfolio Value', value: 'SAR 19.2M', delta: '+8.3% YoY', positive: true },
    { label: 'PDPL Compliance', value: '61 / 100', delta: '−12 pts this scan', positive: false },
    { label: 'Savings Identified', value: 'SAR 2.03M', delta: 'New this week', positive: true },
    { label: 'Expiring <90 Days', value: '4 contracts', delta: 'SAR 6.5M at stake', positive: false },
    { label: 'Avg. Risk Level', value: 'Medium–High', delta: '3 High risk contracts', positive: false },
    { label: 'AI Actions', value: '12 this week', delta: '3 critical flags', positive: true },
  ],
};
