# taxy-cli

Node.js 24+ CLI using Effect 4/Zod. Mise pins tooling; package.json owns scripts.

```text
mise install
npm ci
npm run check
npm install --global ./dist
taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/read.ndjson
taxy-cli example convert taxy --actor developer --best-effort --output .out/example.ndjson
taxy-cli kaktus import .out/example.ndjson --actor developer --best-effort --output .out/write.txt
```

The standalone bundle `dist/taxy-cli.mjs` includes dependencies and needs only Node.

Source adapters publish intermediate NDJSON; Kaktus imports it in XML batches of at most 20 invoices. Normalization and target execution have separate receipts/logs; review both. Details: [writing](docs/kaktus-write.md), [conversion](docs/example-json.md). Optional improvements: [TODO](TODO.md).

Bounded streams use strict domain validation. Rejection prevents submission by default; `--best-effort` permits omissions with mandatory review. Framing, I/O and locks stop processing. Local publication is atomic; Kaktus may partially commit. Human logs/audits: `.out/processing.log`, `.out/audit.log`; `--actor` is caller-declared.

Decisions: immutable records, exact BigDecimal strings (four fractional digits at exchange boundaries), no rounding/upsert, numeric supplier registration IDs padded to eight digits.

Observed: CP852 DBF, Windows-1250 XML, two-place amounts. Native reimport duplicates invoices; exit 0 can include rejection, and oversized batches silently truncate. Response ordinals/counts are checked; DBF readback confirms writes. See [locks](docs/kaktus-locks.md), [XML](docs/kaktus-xml.md).

Authorization (server command X/company Y): The sender must be authenticated and authorized for the office, document and target company. The request must pass validation, with client/buyer/live company identities agreeing. Processing returns an explicit outcome: written, already present, conflict, rejection or unresolved failure; `--actor` alone is not authorization.

Interruption: Some invoices may already be written when power fails. Rerun the original immutable input: fresh target reads skip matching identities, refuse conflicts/ambiguity and submit only absent invoices. Readback confirms writes; history files do not control replay. This assumes target exclusion and a fresh consistent view; corrupt DBFs require external recovery.

Before production: authenticated routing, target coordination, real executable integration, target backup/recovery, regression tests and Windows/Linux verification.

AI implemented code/documentation and ran manual checks: 92 source records, locks, XML/readback, JSON replay and intermediate submission. AI inspected `kaktus/kaktus.cjs` source to verify the batch limit, import behavior and response semantics. CLI verification caught a missing boolean default. No automated tests were written.

AI instructions: [AGENTS.md](AGENTS.md). Evidence: preserved development conversations [1](https://chatgpt.com/s/cx_6aca353f88288191bae59ab0ccbc71b1), [2](https://chatgpt.com/s/cx_6aca3796edfc8191b379116231f8c1a9), [example data](https://chatgpt.com/s/cx_6aca3834d0088191bdee3014b8bc5723).
