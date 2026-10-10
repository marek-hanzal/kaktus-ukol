# Kaktus connector

Portable Node.js 24+ CLI using Serakki's flat domains, Effect 4 and standalone Zod contracts.

```text
npm ci
npm run check
node dist/kaktus.mjs import-intermediate examples/intermediate.ndjson --actor developer --output .out/exchange.ndjson
node dist/kaktus.mjs compare-record current.ndjson incoming.ndjson --actor developer --output .out/difference.log
node dist/kaktus.mjs schema intermediate-output --output .out/output.schema.json
```

Development uses `npm run dev -- <command>`. The single ESM bundle includes dependencies; distribution needs only Node and input files.

Input, admitted domain records and public output have separate contracts. Intermediate NDJSON carries `type`, `source` and loose `data`. Named enums define supported types and origins. Domain admission requires complete, correctly typed business values. Output uses explicit projections and is validated before encoding; our importer accepts our intermediate export.

Amounts and exchange rates use Effect BigDecimal internally. Admission requires plain decimal strings with at most four fractional digits; numbers, exponents and excess precision are rejected without rounding. Export normalizes spelling without changing values. Decimal text is bounded to 1 MiB. Division and business rounding remain unimplemented.

Processing is sequential with backpressure. Independent input/output record limits default to 64 KiB and allow up to 1 MiB through `--max-record-bytes` and `--max-output-record-bytes`. Independent business rejections produce field diagnostics; syntax, encoding, size or I/O failures abort. Any rejection withholds the complete output.

Records are immutable. `compare-record` accepts exactly one record in each file, requires matching type/company/ID and reports direct `data` property changes. It normalizes decimals, ignores provenance and leaves nested VAT as one property, without resolving references or updating records.

Typed canonical log and audit entries pass through human-text printers. Processing logs append to `.out/processing.log`; audits append to `.out/audit.log`. Override these with `KAKTUS_LOG_FILE` and `KAKTUS_AUDIT_FILE`. Data operations require caller-declared `--actor`, which is not authentication. Audit intent is synchronized before reading records; failed completion audit after publication is reported as unconfirmed separately. CLI receipts and difference reports are text.

Publication stages beside the destination, synchronizes, closes and renames atomically. Power-loss durability, writer arbitration, cross-record uniqueness/references and target writes remain pending.

AI implemented these changes. Manual CLI verification covers exchange, decimal equivalence, property differences and atomic rejection. No automated tests were written. Windows/Linux execution remains pending.
