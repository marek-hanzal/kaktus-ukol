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

Source adapters export reusable intermediate NDJSON. Kaktus writing consumes that format through the common reader, resolves approved requests against clients/live companies, prepares XML batches of at most 20 invoices, invokes the simulator and reports every input request. Details: [writing](docs/kaktus-write.md), [example conversion](docs/example-json.md).

Bounded streams pass strict domain validation. Local rejection prevents submission by default; `--best-effort` permits omissions with counts and mandatory review. Framing, I/O and locks stop processing. Local publication is atomic; Kaktus may partially commit. Human logs/audits append to `.out/processing.log` and `.out/audit.log`; `--actor` is caller-declared.

Decisions: immutable records, exact BigDecimal strings (four fractional digits internally), no rounding/upsert, numeric supplier registration IDs padded to eight digits. Busy companies abort reading; checks do not guarantee a snapshot.

Observed: DBF uses CP852; XML requires Windows-1250/two-place amounts. Reimport duplicates invoices; exit 0 can include rejection, and oversized batches silently lose documents. Complete response ordinals/counts are checked. See [locks](docs/kaktus-locks.md), [XML](docs/kaktus-xml.md).

Keep `.out/kaktus-write-state`: synchronized intents/responses prevent blind retries. Identical confirmed requests are skipped; changes and existing business identities are refused. Missing/malformed responses stop submission with unknown outcomes. Recovery/stale locks require manual reconciliation.

Before production: authenticated routing, target coordination, real executable integration, recovery tooling, regression tests and Windows/Linux verification.

AI implemented code/documentation and ran manual checks: 92 source records, locks, XML/readback, JSON replay and intermediate submission. Simulator code was inspected, including its 20-document limit. CLI verification caught a missing boolean default. No automated tests were written.

AI instructions: [AGENTS.md](AGENTS.md). Evidence: preserved development conversations [1](https://chatgpt.com/s/cx_6aca353f88288191bae59ab0ccbc71b1), [2](https://chatgpt.com/s/cx_6aca3796edfc8191b379116231f8c1a9), [example data](https://chatgpt.com/s/cx_6aca3834d0088191bdee3014b8bc5723).
