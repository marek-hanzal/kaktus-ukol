# Kaktus connector

Portable Node.js 24+ CLI with Serakki's flat domains, Effect 4 and standalone Zod contracts.

```text
npm ci
npm run check
node dist/kaktus.mjs import-intermediate examples/intermediate.ndjson --output-format intermediate --output .out/exchange.ndjson
node dist/kaktus.mjs import-intermediate .out/exchange.ndjson --output .out/reimport.ndjson
node dist/kaktus.mjs schema intermediate-output --output .out/output.schema.json
```

Development uses `npm run dev -- <command>`. The single ESM bundle includes dependencies; distribution needs only Node and input files.

Input, admitted domain records and public output have separate contracts. Intermediate NDJSON contains `type`, `source` and `data`. Named enums define types (`company`, `supplier`, `received_invoice`) and origins (`kaktus`, `intermediate`). Unknown business fields, missing/null values and wrong types reach domain validation without coercion or defaults.

Domain amounts and exchange rates use Effect BigDecimal. Admission requires decimal strings with at most four fractional digits; numbers, exponents and excess precision are rejected without rounding. Source adapters must preserve monetary tokens before decoding. Export uses normalized plain strings, preserving values rather than original spelling. Decimal text is bounded to 1 MiB. Division and business rounding remain unimplemented.

The `record-export` domain owns strict output schemas and explicit, exhaustive projection, including nested objects. Computed domain values and output are validated before encoding. Intermediate output is accepted by our importer. JSON Schema exports describe JSON admission/output contracts, including decimal strings, rather than in-memory objects.

The runner retains adapter E/R and processes sequentially with backpressure. Input uses 16 KiB chunks. Independent record limits default to 64 KiB, configurable up to 1 MiB with `--max-record-bytes` and `--max-output-record-bytes`. Output limits exclude LF. Larger exports require a matching import limit. LF, CRLF and an unterminated final line work; blank lines are ignored.

Rejections log position, provenance and field issues. Syntax, encoding, size or I/O failures abort. Any rejection withholds the entire output. Human logs append to `.out/processing.log`, overridden by `KAKTUS_LOG_FILE`, with progress every 1,000 records. Success returns a JSON receipt.

Publication stages beside the destination, synchronizes, closes and renames. Universal power-loss durability, writer arbitration and orphan recovery remain unimplemented.

Cross-record references, uniqueness, authorization, accounting rules and DBF/XML integration remain pending. Supplied DBF samples use CP852 despite the manual. Simulator code was neither inspected nor executed.

AI implemented the foundation; typechecking caught API/type mistakes and an earlier smoke run used a stale bundle. Manual checks cover exact decimals, three-type exchange and atomic rejection. No automated tests were written. Human review and Windows/Linux execution remain pending.
