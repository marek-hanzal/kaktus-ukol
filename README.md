# Kaktus connector

Portable Node.js 24+ CLI, using Serakki's flat domain ownership, Effect 4 and standalone Zod schemas.

```text
npm ci
npm run dev -- import-intermediate examples/intermediate.ndjson --output .out/accounting.ndjson
npm run dev -- schema intermediate-record --output .out/intermediate.schema.json
npm run dev -- schema accounting-record --output .out/accounting.schema.json
npm run check
node dist/kaktus.mjs import-intermediate examples/intermediate.ndjson --output .out/accounting.ndjson
```

The build produces one ESM bundle including application dependencies; distribution needs Node and input files, without npm packages or a TypeScript loader.

Intermediate NDJSON is a native input. Each line contains `type`, `source` and `data`; the example covers all variants. Named enums define record types (`company`, `supplier`, `received_invoice`) and origins (`kaktus`, `intermediate`). Replaying a file preserves its original provenance. Unknown business fields, missing values, nulls and wrong types reach domain validation without coercion or defaults. Complete accounting records use English fields and exact decimal strings. Variant routing uses exhaustive ts-pattern matching; Serakki's Biome rule prohibits switch.

The shared import runner consumes an Effect Stream, retaining adapter errors and requirements. The NDJSON adapter reads sequentially with backpressure, 16 KiB chunks and a 64 KiB line limit, configurable with `--max-record-bytes` up to 1 MiB. LF, CRLF and an unterminated final line work; blank lines are ignored. Future adapters must also bound records and chunks.

Envelope/domain rejections are scanned and logged individually with input position, stage, logical provenance and field issues. Invalid JSON, UTF-8, oversized lines or I/O failures abort. Any rejection withholds the entire data output. Human logs append to `.out/processing.log`; override with `KAKTUS_LOG_FILE`. Diagnostic failure preserves an original rejection. Progress is logged every 1,000 records. Successful commands return a JSON receipt.

Publication stages beside the destination, synchronizes, closes and renames. Filesystem atomic replacement is required; universal power-loss durability, concurrent-writer arbitration and orphan recovery remain unimplemented.

Validation currently enforces complete structural contracts, not cross-record references, uniqueness, authorization or accounting rules. DBF/XML integration is not implemented. Bounded inspection found CP852 text in supplied DBF samples despite the manual's Windows-1250 claim. Simulator code was neither inspected nor executed.

AI implemented the foundation. Typechecking caught API/type mistakes; an earlier premature smoke run used a stale bundle. Manual CLI runs verified standalone execution, rejection atomicity, byte limits and UTF-8 boundaries. No automated tests were written, as requested. Human review and Windows/Linux execution remain pending.
