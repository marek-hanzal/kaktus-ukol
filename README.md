# taxy-cli

Node.js 24+ CLI using Effect 4/Zod. Mise pins tooling; package.json owns scripts.

```text
mise install
npm ci
npm run check
npm install --global ./dist
taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/read.ndjson
taxy-cli example convert taxy --actor developer --output .out/example.ndjson
taxy-cli kaktus export examples/intermediate.ndjson --company 0001 --actor developer --output .out/batch.xml
node kaktus/kaktus.cjs import .out/batch.xml
```

Development: `npm run dev -- <command>`. Standalone: `node dist/taxy-cli.mjs <command>`.

Reading exports both companies, suppliers and received invoices to reusable intermediate NDJSON. Writing currently generates XML from intermediate records; the last command manually invokes Kaktus. Automated TAXY submission, per-document response handling and idempotent retries remain pending.

`example convert` streams offices, clients and invoice requests into the same intermediate language. Optional `kaktus` metadata survives replay. The supplied null invoice number blocks strict publication. See [example conversion](docs/example-json.md).

Bounded streams pass strict domain validation; rejection blocks output by default. Batch commands accept `--best-effort`: omit rejected records, report counts and require log review. Framing, I/O and lock failures still abort. Local publication remains atomic. Human logs/audits append to `.out/processing.log` and `.out/audit.log`; `--actor` is caller-declared. Kaktus may partially accept a batch.

Decisions: immutable admitted records, exact BigDecimal strings with at most four fractional digits, rejection without rounding, numeric supplier registration IDs padded to eight digits. Busy companies abort reading; lock checks do not guarantee a snapshot.

Observed: DBF uses CP852; XML requires Windows-1250 and two-place amounts. Reimport creates duplicates; exit 0 can include rejected documents. Inspect `.odpoved.xml`. Details: [locks](docs/kaktus-locks.md), [XML findings](docs/kaktus-xml.md).

Before production: authenticated routing, consistent source/target coordination, durable retry reconciliation, regression tests and Windows/Linux verification.

AI implemented code/documentation and ran manual checks: 92 source records, locks, XML/readback, JSON replay and atomic rejection. Simulator lock internals were inspected. Initial packaging exposed dependency conflicts; distribution now uses a separate bundle manifest. No automated tests were written.

AI instructions: [AGENTS.md](AGENTS.md). Evidence: preserved development conversations [1](https://chatgpt.com/s/cx_6aca353f88288191bae59ab0ccbc71b1), [2](https://chatgpt.com/s/cx_6aca3796edfc8191b379116231f8c1a9), [example data](https://chatgpt.com/s/cx_6aca3834d0088191bdee3014b8bc5723).
