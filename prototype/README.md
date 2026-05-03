# Signit Intelligence - Assignment Prototype

Post-signature **portfolio-level contract intelligence** built for the Senior AI Product Manager take-home exercise. Everything runs locally - no secrets, no live LLM dependency (interaction patterns are simulated with deterministic data and provenance popovers).

> **Companion document:** `../case-study.html` is the paired product memo. The prototype is the implementation of the solution overview in Section 02 of that document.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173 -> lands on Obligation Timeline
npm run build      # verifies TypeScript + production bundle
npm run lint       # ESLint baseline
```

> Node 20+ recommended (Vite 8 + TS 6).

---

## What to demo (3 evaluator flows)

1. **Vendor renegotiation brief** - **Scenario > Reneg brief** (top bar).  
   Procurement lens auto-selects on **Obligation Timeline**. Follow the violet ribbon prompts: imminent notice deadlines -> Procurement pipeline -> SAR figures with citations.
2. **PDPL remediation sweep** - **Scenario > PDPL sweep**.  
   Legal persona auto-selects. Guided steps hop between PDPL Sweep, Clause Compare, and Mandatory Review Queue.
3. **Executive weekly digest** - **Scenario > Executive brief**.  
   Executive framing (audience: Nora, CFO) on the Brief page (`/executive`); ribbon walkthrough drills into KPIs.

**Portfolio lens (Legal · Procurement · Executive)** sits **in the Timeline page body**, not in the global header. The lens filters obligations on the same data model: e.g. STC PDPL remediation surfaces strongly on Legal and Executive but is muted for Procurement; Office Supplies notice deadlines surface on Procurement, not Executive.

**Default lens** is flow-aware: Procurement during renegotiation, Legal during PDPL sweep, Executive otherwise. The button under the lens row resets to the active flow's default.

---

## Core novel surfaces vs. spreadsheet hell

| Surface | Idea |
|---------|------|
| `Obligation Timeline` (`/timeline`) | Portfolio-as-time-axis. AI stacks upcoming legal/financial beats by month and **filters per persona lens** on the same dataset. **Money chips: click** for citation (scroll-safe); citations elsewhere are **hover**. |
| `Clause Compare` (`/compare`) | Matrix over liability / notice / payment / breach / retention with deviation glyphs, playbook column, and a flagged-deltas filter. |
| `Human Review Queue` (`/review`) | Quarantined low-confidence extractions, incomplete OCR docs, and mandatory negated-clause confirmations. **Extractor quality tile** mirrors the Phase 1 commitments in the case study (F1 targets, hallucination ceiling, correction velocity). |
| `Citation` popover | Every AI value surfaces clause ref, quote, confidence, derivation, and benchmark source. **`EN` / `AR` toggle** appears for clauses with attested Arabic source text (e.g. STC 14.1, Microsoft 12.2, Office Supplies 11.2). |

Secondary routes: `/vault` (with **Low completeness only** filter), `/procurement`, `/legal`, `/contract/:id`, `/executive`.

---

## Data and fidelity

Synthetic **Al-Rajhi Capital** flavored portfolio with 9 contracts, 22 obligation events, 8 PDPL clause flags, and 5 cross-contract clause deviations. Vendors include Microsoft, SAP, STC, Hays, Help AG, Al-Tamimi, Seera, Al-Jazirah, and Bayan. KSA regulatory anchors are real: PDPL Art. 26, NCA CSCC-3, SDAIA cross-border guidance, Saudi Bar Rule 42, ZATCA, SAMA, CMA.

**Demo "today"** is anchored to **`May 3, 2026`** (`TODAY_ISO` / `TODAY_LABEL`) so obligation rails, executive week-of, and UI chrome stay aligned.

Confidence scores span **38 to 99 percent** deliberately to show extractor routing, completeness scoring, and review-queue gating. Artifacts live in **`src/data/contracts.ts`**.

---

## What is simulated vs. live

| Surface | Live in this prototype | Simulated |
|---|---|---|
| Persona lens filtering | Yes - real selectors over data | - |
| Citation popovers | Yes - clause ref, quote, confidence, derivation | Underlying values come from authored data, not a live extractor |
| Confidence bars and routing | Yes - low-confidence routes to `/review` | Confidence numbers are authored deliberately |
| AR / EN clause toggle | Yes for 4 clauses (STC 14.1 x2, Microsoft 12.2, Office Supplies 11.2) | Other clauses fall back to English |
| Demo scenario walkthroughs | Yes - 3 flows, ribbon, auto-routing | - |
| Semantic search panel | Yes - matches against contract / obligation / clause haystacks | Uses substring matching, not vector search |
| Vault Low-completeness filter | Yes | - |
| Extractor quality tile | Static targets pulled from the case study (F1, hallucination, correction velocity) | Numbers are targets / illustrative, not measured |

### Demo-only buttons (intentionally non-functional)

These buttons surface a `Demo only - not implemented` tooltip and do not navigate. They exist to communicate the intended surface area without faking the action:

- `Contract` page: Download, Open, Edit, Add reminder, Run Analysis (when no intel yet)
- `Legal` page: Re-run Sweep, Open Vendor Dialogue (post-confirmation handoff)
- `Executive` page: Previous weeks, Export PDF
- `Procurement` page: Run new analysis, Export report
- `Vault` page: Export, Vault ingest, Sort
- Bell / pencil icons on Contract overview key dates

---

## Tooling leveraged

- Cursor + Claude-assisted React/TS authoring and refactors  
- Vite 8 / React 19 / React Router for the application shell  
- `lucide-react` icons, custom `Btn` component with `demoOnly` affordance  
- Custom CSS keyframes for enterprise-grade pacing (`anim-up`, `anim-fade`, `anim-scale`)

Happy reviewing - if anything feels too SaaS-generic, poke the **Citation** affordances first (especially the AR/EN toggle on STC 14.1); persuasion hides in provenance, not charts.
