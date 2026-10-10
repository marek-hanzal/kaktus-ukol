# Kaktus connector

Initial foundation, following Serakki's flat domain ownership, Effect 4 and strict Zod contracts. Requires Node.js 24 or newer.

```text
npm ci
npm run dev -- --help
npm run dev -- schema taxy-import-invoice --output .out/import.schema.json
npm run dev -- schema taxy-invoice --output .out/invoice.schema.json
npm run check
node dist/kaktus.mjs --help
```

The build produces one portable ESM file, `dist/kaktus.mjs`, including its application dependencies. Distribution requires Node, the bundle and the relevant external data/program; no TypeScript loader or installed npm packages. Build and development use portable npm/Node commands.

Every object schema is a standalone named module with `FooSchema.Type`. TAXY invoice import contracts preserve missing/null business fields while requiring a correlation ID; complete domain contracts require all fields. Protocol keys retain their original spelling; domain fields are English. Structurally complete does not mean authorized: client identity, exact totals, exchange-rate rules and accounting periods still need business admission. Unknown object keys are rejected deliberately. Per-invoice VAT arrays are capped at 32 rows; this resource limit is a project decision.

The core validates records individually and publishes byte streams with backpressure, a 64 KiB default maximum chunk and sequential writes. Producers must bound records before assembling them. Human events are appended and synchronized to `.out/processing.log`; `KAKTUS_LOG_FILE` overrides the path. Each event has a timestamp and a 64 KiB limit. Data output cannot overwrite the log. Diagnostic failure never changes an already committed publication into a failed write.

Publication stages beside the destination, synchronizes and closes the file, then renames it. Earlier stream failure leaves an existing output intact; no remove-before-rename fallback. Atomic replacement relies on the destination filesystem. File synchronization does not guarantee survival of rename after sudden power loss on every filesystem. There is no multi-file transaction, concurrent-writer arbitration or orphan recovery yet. External Kaktus writes will be best effort.

DBF readers, JSON input streaming, XML import, response reconciliation and read/write commands are not implemented. No simulator code was inspected or executed. DBF headers show numeric address-book registration numbers, requiring restoration of leading zeroes. No automated tests were written, as requested. Checks cover TypeScript, Serakki Biome/Grit rules, Dependency Cruiser, jscpd and bundling, plus manual CLI runs. Windows/Linux execution and crash behavior remain unverified.

AI prepared the foundation from supplied files and current Serakki sources. Typechecking caught an obsolete Config API call; a premature smoke run used a stale bundle. Both were corrected. Human review remains pending.
