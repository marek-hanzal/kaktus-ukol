# taxy-cli

Portable Node.js 24+ CLI using Effect 4 and standalone Zod contracts.

```text
mise install
npm ci
npm run check
npm install --global ./dist
taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/kaktus.intermediate.jsonl
node dist/taxy-cli.mjs import-intermediate examples/intermediate.ndjson --actor developer --output .out/exchange.ndjson
node dist/taxy-cli.mjs compare-record current.ndjson incoming.ndjson --actor developer --output .out/difference.log
```

Mise only pins Node 24.19.0/npm 12.0.2. Scripts live in package.json: `npm run dev -- <command>` or `npm run start -- <command>`. The bundle needs only Node and input files.

The standalone DBF reader knows framing, not accounting. Only dBase III C/N/D/L are supported. Kaktus maps FIRMY.DBF and each company folder's ADRESAR.DBF/FAKPRI.DBF, preserving physical-row provenance and skipping deleted slots. Samples use CP852 despite the manual; --encoding overrides header encoding. Agreed policy restores leading zeroes in numeric supplier ICO to eight digits. Conversion checks FIRMA.LCK; this is not a snapshot. See [lock flow](docs/kaktus-locks.md).

Intermediate NDJSON carries `type`, `source` and loose `data`. Domain admission requires complete, correctly typed values. Output uses explicit projections and is validated before encoding; our importer accepts our export.

Amounts and exchange rates use Effect BigDecimal internally. Admission requires plain decimal strings with at most four fractional digits; numbers, exponents and excess precision are rejected without rounding. Export normalizes spelling without changing values. Decimal text is bounded to 1 MiB. Division and business rounding remain unimplemented.

Processing is sequential with backpressure. Independent input/output record limits default to 64 KiB and allow up to 1 MiB through `--max-record-bytes` and `--max-output-record-bytes`. Independent business rejections produce field diagnostics; syntax, encoding, size or I/O failures abort. Any rejection withholds the complete output.

Records are immutable. `compare-record` accepts exactly one record in each file, requires matching type/company/ID and reports direct `data` property changes. It normalizes decimals and compares direct properties without resolving references or updating records.

Typed logs/audits use human-text printers. Processing logs append to `.out/processing.log`; audits append to `.out/audit.log`. Override these with `KAKTUS_LOG_FILE` and `KAKTUS_AUDIT_FILE`. Data operations require caller-declared `--actor`, which is not authentication. Audit intent is synchronized before reading records; failed completion audit after publication is reported as unconfirmed separately. CLI receipts and difference reports are text.

Publication stages beside the destination, synchronizes, closes and renames atomically. Power-loss durability, writer arbitration, cross-record uniqueness/references and target writes remain pending.

AI implemented these changes and inspected simulator lock internals. Manual verification covers 92 DBF records, lock/unlock, exchange and atomic rejection. No automated tests were written. Windows/Linux execution remains pending.
