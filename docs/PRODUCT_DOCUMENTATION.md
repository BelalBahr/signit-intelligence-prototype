# Product documentation: Signit Post-Signature Contract Intelligence

This document describes the **product** surfaced in the assignment prototype and its companion memo (`case-study.html`). It is written for reviewers, stakeholders, and future implementation teams. For engineer-specific setup and build commands, see [README](../README.md) and [prototype/README.md](../prototype/README.md).

---

## 1. Vision

Signit Intelligence extends Signit beyond e-signing into **post-signature portfolio understanding**: one place to see obligations in time, compare clauses across vendors, and route uncertain AI output to humans before it drives decisions.

**Design principle:** every number or claim that could move money or legal posture should be **traceable** (clause reference, quote, confidence, derivation) and **role-appropriate** (Legal, Procurement, Executive see the same contracts through different priorities).

---

## 2. Problem statement

Enterprise teams manage dozens to thousands of active agreements. After signature, value leaks through:

- **Missed notice and renewal windows** that lock in unfavorable auto-renewals or prevent competitive bids.
- **Fragmented views** where Legal, Procurement, and Finance each maintain spreadsheets and calendar reminders that disagree.
- **Slow PDPL and regulatory response** when a single counterparty template change implies portfolio-wide exposure.
- **Opaque AI** when extraction is shown as final without provenance, driving distrust and rework.

The product answers: *What is coming due, for which contract, with what financial or compliance risk, and why do we believe it?*

---

## 3. Target users and portfolio lens

The prototype encodes three internal personas. They share one contract graph; **priority and filtering** change by role.

| Lens | Persona (synthetic) | Primary focus |
|------|---------------------|---------------|
| **Legal** | General Counsel lens (Sara Al-Qahtani) | PDPL and regulatory clauses, remediation, audit defensibility |
| **Procurement** | Procurement Director (Ibrahim Al-Shammari) | Renewals, notice deadlines, vendor leverage, renegotiation |
| **Executive** | CFO (Nora Al-Otaibi) | Concentration, material exposure, portfolio-level risk and opportunity |

**Portfolio lens** (Legal / Procurement / Executive) lives on the **Obligation Timeline** page. It is not a global header control: evaluators land on the timeline as home and choose how to **remix the same obligation rail** for their job.

**Default lens** behavior in the prototype is scenario-aware: starting the **Renegotiation** demo biases default to Procurement; **PDPL sweep** to Legal; **Executive brief** and idle state to Executive. The in-page **Default lens** control returns to that flow’s default.

---

## 4. Information architecture

| Route | Name | Role |
|-------|------|------|
| `/` | Redirect | To `/timeline` |
| `/timeline` | Obligation Timeline | Home; time-based portfolio obligations; portfolio lens |
| `/vault` | Contract Vault | Searchable repository; extraction completeness filter |
| `/contract/:id` | Contract detail | Single-agreement view; intelligence and actions |
| `/procurement` | Procurement | Vendor intelligence and renegotiation pipeline |
| `/legal` | Legal Counsel | PDPL compliance sweep and triage |
| `/executive` | Executive Brief | Weekly-style KPIs and highlights |
| `/compare` | Clause Compare | Cross-contract matrix (liability, notice, payment, and related dimensions) |
| `/review` | Human Review Queue | Low-confidence and incomplete extractions; quality commitments tile |

**Global chrome:** left icon rail and sidebar labels, top bar (breadcrumbs, scenario selector, semantic search, end scenario when a demo is active).

---

## 5. Core surfaces (product behavior)

### 5.1 Obligation Timeline (`/timeline`)

**Purpose:** Make the portfolio legible as a **calendar of commitments** (expirations, notices, renewals, payments, compliance beats), not as a folder of PDFs.

**Key interactions:**

- Events are grouped and ordered by date; severity and amounts are visible at a glance.
- **Monetary chips** on the timeline use **click** to open citation popovers (scroll-safe); other citation affordances may use **hover**.
- **Portfolio lens** filters and re-ranks which obligations surface most prominently for Legal, Procurement, or Executive, using shared underlying events and explicit per-event priority metadata.

### 5.2 Contract Vault (`/vault`)

**Purpose:** Inventory all agreements with status, value, risk, and **extraction health**.

**Key interactions:**

- **Low completeness only** toggles the list to contracts with partial or incomplete AI extraction (prototype implements this filter; sort and bulk export remain demo-only where marked).

### 5.3 Contract detail (`/contract/:id`)

**Purpose:** Deep view for one agreement: parties, key dates, linked obligations, and vendor or compliance context.

**Key interactions:**

- Cited figures and intelligence tie to clauses where the product model defines them.
- Some header and utility actions are intentionally **demo-only** (tooltip: not implemented in the prototype) to avoid implying fake workflows.

### 5.4 Procurement pipeline (`/procurement`)

**Purpose:** Consolidate vendor benchmarking, leverage signals, and recommended actions so Procurement can prioritize renegotiations and renewals.

### 5.5 Legal PDPL sweep (`/legal`)

**Purpose:** Corpus-wide view of PDPL-aligned clause issues with severity, status, and remediation guidance.

**Key interactions:**

- Supports triage mental model: confirm, escalate, treat as false positive, needs review.

### 5.6 Executive Brief (`/executive`)

**Purpose:** Weekly digest abstraction: totals, expiry pressure, violations, savings themes, and narrative highlights oriented to Nora (CFO) and staff who brief leadership.

### 5.7 Clause Compare (`/compare`)

**Purpose:** Matrix comparison across contracts so outliers (notice periods, caps, carve-outs) surface without opening every PDF.

### 5.8 Human Review Queue (`/review`)

**Purpose:** Operationalize **AI fallibility**: quarantine bad extractions, incomplete documents, and sensitive patterns (including negated clauses) until a human validates.

The **Extractor quality** tile summarizes Phase 1 style targets described in the case study (for example F1 targets, hallucination ceiling, correction velocity). In the prototype these are **static illustrative targets**, not live measured metrics.

### 5.9 Semantic search (panel)

**Purpose:** Unified search across contracts, obligations, and clause text in the demo dataset.

**Prototype fidelity:** The panel is real UI with **substring matching** over prepared search haystacks, not vector retrieval.

---

## 6. Guided demo scenarios

The top bar can start three scripted flows. Each advances a violet **instruction ribbon** with steps and suggested routes.

| Scenario | Default persona | Narrative arc (high level) |
|----------|-----------------|----------------------------|
| **Renegotiation brief** | Procurement | Timeline notice lanes and cited money chips to Procurement pipeline and a contract drill-down with benchmarking |
| **PDPL sweep** | Legal | Sweep to Clause Compare to Review Queue, emphasizing triage and low-confidence containment |
| **Executive brief** | Executive / CFO | Brief KPIs and highlights; ribbon references timeline lens remix for leadership |

Users can exit a scenario with **End scenario** at any time.

---

## 7. AI trust model (product requirements)

These behaviors are **first-class UX requirements**, not icing.

1. **Provenance:** For AI-derived fields, show clause reference, quote, confidence, and how the value was derived (including benchmark source where applicable).
2. **Bilingual evidence where relevant:** Selected clauses expose an **EN / AR** toggle in the citation popover when Arabic source text is modeled.
3. **Confidence as a routing signal:** Low confidence and incomplete extraction must be visible in Vault and routable to Review.
4. **Human-in-the-loop:** Mandatory review for classes of error (incomplete ingest, negated clause construction, and similar) before downstream automation is assumed.

The case study’s **Reasoning layer** section describes the intended production architecture (structured-query-first retrieval with vector support for clause grounding). The prototype **simulates** outputs and citations from authored data to demonstrate the interaction model.

---

## 8. Data model (conceptual)

Authoritative demo data lives in `prototype/src/data/contracts.ts`. Conceptual entities:

- **Contract:** identity, counterparty, dates, value, risk, tags, PDPL counts, extraction completeness and missing fields.
- **ObligationEvent:** date, kind (expiration, notice, renewal, payment, audit, PDPL remediation, and so on), severity, optional amount, per-persona priority weights, confidence, optional source clause string.
- **VendorIntelligence:** benchmarks, leverage, recommended action, savings estimate, urgency.
- **PDPLClause:** violation, article reference, severity, status, confidence, negation and review flags.
- **ExecutiveBrief:** week anchor, aggregates, KPIs, highlights.

**Date anchor:** Demo “today” is fixed at **2026-05-03** (`TODAY_ISO` / `TODAY_LABEL`) so timelines and copy stay consistent with the case study.

---

## 9. Prototype boundaries

The following are explicitly **out of scope** for the local prototype (some controls exist with **demo-only** tooltips):

- Real document ingestion, OCR, and LLM extraction pipelines
- Authentication, authorization, and multi-tenant isolation
- Edits to contracts, exports, notifications, and integrations (email, Slack, CLM sync)
- Production vector search and eval dashboards

A maintained list of **demo-only buttons** appears in [prototype/README.md](../prototype/README.md).

---

## 10. Related documents

| Document | Contents |
|----------|----------|
| [case-study.html](../case-study.html) | Full product memo: market, personas, solution, AI architecture, phasing, summary |
| [README.md](../README.md) | Repo orientation and quick start |
| [prototype/README.md](../prototype/README.md) | Developer setup, demo script, simulated vs live matrix |

---

*Last updated to align with the Signit assignment repository layout and prototype behavior as of the May 3, 2026 demo anchor.*
