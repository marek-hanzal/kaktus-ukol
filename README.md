# taxy-cli

Node.js 24+ CLI using Effect 4/Zod. Mise pins tooling; package.json owns scripts.

```text
mise install
npm ci
npm run check
npm install --global ./dist
taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/read.ndjson
taxy-cli kaktus export examples/intermediate.ndjson --company 0001 --actor developer --output .out/batch.xml
node kaktus/kaktus.cjs import .out/batch.xml
```

Development: `npm run dev -- <command>`. Standalone: `node dist/taxy-cli.mjs <command>`.

Reading exports both companies, suppliers and received invoices to reusable intermediate NDJSON. Writing currently generates XML from intermediate records; the last command manually invokes Kaktus. Automated TAXY submission, per-document response handling and idempotent retries remain pending.

Bounded streams pass strict domain validation; any rejection withholds the complete local output. Local publication is atomic; Kaktus may partially accept a batch. Human processing/audit logs append to `.out/processing.log` and `.out/audit.log`; `--actor` is caller-declared.

Decisions: immutable admitted records, exact BigDecimal strings with at most four fractional digits, rejection without rounding, numeric supplier registration IDs padded to eight digits. Busy companies abort reading; lock checks do not guarantee a snapshot.

Observed: DBF uses CP852; XML requires Windows-1250 and two-place amounts. Reimport creates duplicates; exit 0 can include rejected documents. Inspect `.odpoved.xml`. Details: [locks](docs/kaktus-locks.md), [XML findings](docs/kaktus-xml.md).

Before production: authenticated routing, consistent source/target coordination, durable retry reconciliation, regression tests and Windows/Linux verification.

AI implemented code/documentation and ran manual checks: 92 source records, locks, XML/readback and atomic rejection. Simulator lock internals were inspected. Initial packaging exposed dependency conflicts; distribution now uses a separate bundle manifest. No automated tests were written.

AI instructions: [AGENTS.md](AGENTS.md). Evidence: [preserved development conversation](https://chatgpt.com/s/cx_6aca353f88288191bae59ab0ccbc71b1).
