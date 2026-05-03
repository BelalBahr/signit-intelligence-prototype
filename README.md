# Signit Intelligence - Senior AI PM Take-Home

Post-signature **portfolio-level contract intelligence** for Signit. This repo bundles the two deliverables of the assignment:

| Deliverable | File / folder | What it is |
|---|---|---|
| Product document | [`case-study.html`](./case-study.html) | Problem framing, persona analysis, AI architecture, retrieval design, phasing |
| Working prototype | [`prototype/`](./prototype) | React + TS + Vite app implementing Section 02 of the case study |
| Assignment brief | [`Senior AI Product Manager - Signit.pdf`](./Senior%20AI%20Product%20Manager%20-%20Signit.pdf) | The original take-home brief (for context) |

> Demo "today" is anchored to **May 3, 2026** so the obligation rails, executive week-of, and ribbon walkthroughs stay aligned.

---

## Run the prototype locally

```bash
cd prototype
npm install
npm run dev        # http://localhost:5173 -> lands on Obligation Timeline
```

Node 20+ recommended. Full instructions, scenario walkthroughs, simulated-vs-live matrix, and demo-only button list live in [`prototype/README.md`](./prototype/README.md).

**Product documentation** (vision, IA, surfaces, trust model, data concepts): [`docs/PRODUCT_DOCUMENTATION.md`](./docs/PRODUCT_DOCUMENTATION.md).

---

## Read the case study

Open [`case-study.html`](./case-study.html) directly in a browser - it is a single self-contained file. The companion implementation references in Section 02 map 1:1 to routes in the prototype:

- Section 02 *Obligation Timeline* -> `/timeline` (with **Legal / Procurement / Executive** lens in the page body)
- Section 02 *Clause Compare* -> `/compare`
- Section 02 *Human Review Queue* -> `/review` (extractor quality tile mirrors the Phase 1 commitments)
- Section 04 *Reasoning layer* -> Citation popovers everywhere; AR/EN toggle on attested clauses (e.g. STC 14.1)

---

## Repository layout

```
Signit/
  case-study.html                       # Product memo (open in browser)
  docs/
    PRODUCT_DOCUMENTATION.md            # Product spec for reviewers (IA, flows, trust model)
  Senior AI Product Manager - Signit.pdf
  prototype/
    src/                                # React + TS source
    public/
    package.json
    README.md                           # Detailed prototype guide
```
