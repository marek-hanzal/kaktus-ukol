# taxy-cli

Node.js 24+, Effect/Zod. Run from the project root:

```text
mise install
npm ci
npm run check
npm install --no-save --package-lock=false ./dist
```

`check` builds `dist/taxy-cli.mjs`; installation does not. The bundle needs only Node.

Read both Kaktus companies (92 records):

```text
npx taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/read.ndjson
```

Convert TAXY, then import into Kaktus (modifies `kaktus/DATA`):

```text
npx taxy-cli example convert taxy --actor developer --best-effort --output .out/example.ndjson
npx taxy-cli kaktus import .out/example.ndjson --actor developer --best-effort --output .out/write.txt
```

Fresh demo: conversion rejects one record; import writes 27, skips two existing, rejects seven. Review `.out/write.txt`, `.out/processing.log` and `.out/audit.log`. Without `--best-effort`, validation rejects the batch.

Revalidate/re-export intermediate data:

```text
npx taxy-cli import-intermediate .out/read.ndjson --actor developer --output .out/replayed.ndjson
```

Generate XML without submitting:

```text
npx taxy-cli kaktus export examples/intermediate.ndjson --company 0001 --invoice-id 1 --actor developer --output .out/batch.xml
```

Compare two single-record files (one changed property), or export a JSON Schema:

```text
npx taxy-cli compare-record examples/company-current.ndjson examples/company-incoming.ndjson --actor developer --output .out/difference.txt
npx taxy-cli schema intermediate-output --output .out/intermediate.schema.json
```

Decisions: bounded streaming, atomic local output, immutable records, no upsert/rounding, BigDecimal exchange strings with at most four fractional digits.

Observed: CP852 DBF, Windows-1250 XML, two-place amounts. Native reimport duplicates invoices; exit 0 can include rejection; batches above 20 truncate. We limit submissions and confirm through DBF readback.

Authorization: authenticate the sender, authorize office/document/company, validate data and matching client/buyer/target identities. `--actor` only labels audits.

Interruption: partial writes remain. Rerun the same import: fresh target reads skip matches, refuse conflicts and submit missing invoices. Requires external exclusion and consistent target reads; corrupt DBFs need external recovery.

Before production: authenticated routing, coordination, real executable adapter, backups, tests and Windows/Linux verification.

Details: [writing](docs/kaktus-write.md), [JSON](docs/example-json.md), [XML](docs/kaktus-xml.md), [locks](docs/kaktus-locks.md), [TODO](TODO.md).

AI wrote code/docs and inspected `kaktus/kaktus.cjs`; manual CLI runs exposed a missing boolean default. No automated tests yet.

AI instructions: [AGENTS.md](AGENTS.md). Evidence: preserved development conversations [1](https://chatgpt.com/s/cx_6aca353f88288191bae59ab0ccbc71b1), [2](https://chatgpt.com/s/cx_6aca3796edfc8191b379116231f8c1a9), [example data](https://chatgpt.com/s/cx_6aca3834d0088191bdee3014b8bc5723), [architecture](https://chatgpt.com/s/cx_6aca5232a53c8191832b41cd847deda9).
