# Intermediate submission to Kaktus

```text
taxy-cli example convert taxy --actor developer --best-effort --output .out/example.ndjson
taxy-cli kaktus import .out/example.ndjson --actor developer --best-effort --output .out/write.txt
```

This writes through the supplied simulator. `--simulator` selects its `.cjs` script; live `DATA` is resolved beside that script. Node invokes it with argument arrays, without a shell or platform branches. A real `KAKTUS.EXE` adapter is not implemented. Our DBF access is read-only; the target program owns every mutation.

The writer consumes the shared intermediate NDJSON through `readIntermediateStream`: one office, client mappings and invoice requests, in any order. Source-specific JSON reading and preservation of monetary tokens belong to `example convert`. Other producers use the same intermediate contract. Readback invoices remain a separate record type; requests never acquire invented numeric DBF identities. `kaktus export` is the separate offline readback-invoice XML exporter.

The conversion and submission have separate receipts and audits. On the supplied demo, best-effort conversion publishes 39 records: 36 requests plus routing records, with one source request rejected. That omission remains in the conversion receipt/log; it is absent from the writer input. Both stages require explicit `--best-effort` to proceed past independent rejections. Strict conversion publishes nothing for this demo.

## Admission and replay identity

All local admission and XML preparation finish before the first target invocation. Requests must be approved received invoices with complete domain values. Client mapping, request buyer and live company must agree on registration number; request metadata cannot override the route. Simulator folder routing must agree with its company ID. VAT is grouped with exact BigDecimal sums, zero-rate tax must be zero, and the total must equal the sum. Encoding, field widths and monetary/rate precision are checked without trimming, replacement or rounding. The importer accepts eight integer amount digits with two fractional digits, and four integer/fractional exchange-rate digits.

Each invocation reads a new complete target inventory into a disk index. The business identity is **company + supplier registration number (otherwise exact name) + supplier invoice number**. It must remain stable across retries; changed identities are different entities. Fiscal-year invoice-number reuse is conservatively treated as a conflict, not inferred to be a new invoice.

- Missing identity: prepare an import.
- Exactly one existing invoice, with matching normalized imported properties: `ALREADY_PRESENT`, skip submission and retain its actual document number.
- Same identity, different properties: `REJECTED` with `target_conflict` and direct `target`/`incoming` property differences; never update.
- Multiple existing invoices with that identity: abort admission rather than choose one, including in best-effort mode.

Comparison includes supplier invoice number, variable symbol, issue/taxable/due dates, all VAT bases and taxes, total, currency, exchange rate, text and note. Decimal spelling is normalized without rounding; absent CZK XML rate means stored rate one. Company and supplier identity are established by the index key. Target-assigned IDs/document numbers, provenance and payment state are excluded. Related supplier address/name/tax details are not compared when registration number identifies the supplier: Kaktus reuses the existing directory entry without updating those details. This is confirmation of invoice fields and their supplier relationship, not of partner-data synchronization. Changes made later in Kaktus are outside this workflow.

Repeated request IDs, ambiguous routes or target identities abort. Duplicate business identities inside one input are refused. Without `--best-effort`, local rejection withholds every new target call and marks otherwise admitted requests `NOT_ATTEMPTED`; matching target invoices can still be reported `ALREADY_PRESENT`. Best-effort submits the admitted subset with mandatory review. Framing, decoding, I/O and busy-company failures never become silently skipped input.

## Execution and confirmation

Request snapshots, mappings, target indices, duplicate keys and plans stay on disk. Only a batch of at most **20 same-company invoices** and a response bounded to 256 KiB are resident. All XML files are prepared before the first call and retained side by side as `batch-<sequence>-<company>.xml`, with separate responses/stdout/stderr. Alternating companies may produce smaller batches. The ceiling comes from inspected simulator code: larger batches are silently truncated.

Responses use strict [saxes](https://github.com/lddubeau/saxes) parsing with DTDs refused, the expected company, one ordered result per ordinal and matching aggregate counts. Exit 0 and even a valid `OK` acknowledgement do not confirm a write. After every submitted batch, a fresh DBF inventory verifies every request against actual persisted properties. This currently rescans the dataset per batch: memory stays bounded and the readback index is reused, but large datasets need a more efficient coordinated readback strategy.

Matching target data yields `WRITTEN`, including after a missing/malformed response or nonzero process exit. The response failure remains visible in the human outcome. A valid business rejection plus an absent target invoice yields `REJECTED`. An absent invoice without a trustworthy rejection, differing/ambiguous target data, or failed target readback yields `UNKNOWN` and stops later batches in both modes. Confirmed business rejections stop later batches in strict mode; best-effort may continue. Nothing is automatically resubmitted inside that invocation.

Canonical outcomes are printed as human text with source/request/company, status, code, detail and confirmed target document number. Per-document files and processing/audit logs append and synchronize progressively. The final report is published atomically with counts and the run location. Failed local reporting cannot undo external writes; inspect retained artifacts and replay against fresh target data. `schema write-outcome` and `schema write-summary` expose public contracts.

CLI exit 0 requires at least one `WRITTEN` or `ALREADY_PRESENT`, no unknown/unattempted documents, and no rejection in strict mode. Best-effort exit 0 may contain rejections and requires log review. Audit completion describes report publication; document statuses describe target outcomes.

## Interruption and restart

Target exclusion and a fresh, consistent view are explicit prerequisites supplied outside this exercise. Existing cooperative busy checks remain; they are not an exclusive lease or snapshot. No new locking/concurrency mechanism is implemented and no foreign marker is removed. An eventually consistent replica is insufficient unless its freshness/completeness is established before deciding an invoice is absent.

After a crash, rerun the original immutable intermediate input. Rebuild the target index, skip complete matching invoices, refuse conflicts/ambiguity and submit only missing invoices. A lost local acknowledgement or report does not require manual reconciliation when the target can be read reliably. A partly processed batch can converge over repeated invocations without duplicates under the stable identity, target consistency and exclusion assumptions.

`--state` (default `.out/kaktus-write-state`) now stores run evidence only. No request/business intent ledger or local writer lock controls replay. A different or empty history directory has the same replay decisions. Old artifacts may be retained for audit but are never trusted as proof that data exists in Kaktus.

This does not repair corrupt target DBFs or guarantee that Kaktus durably commits every record before a power failure. The simulator rewrites DBFs without an explicit sync/transaction; storage loss can corrupt them. Unreadable/inconsistent data stops admission or confirmation and requires target backup/recovery before retrying. A crash can also leave a supplier without an invoice; Kaktus can reuse that supplier on the next import. Local file sync/rename does not promise directory durability on every filesystem. No universal exactly-once or target rollback guarantee is claimed.

## Isolated manual verification

Disposable copies preserve supplied files. Demo conversion admitted 39 records with one source rejection; submission wrote 27 invoices, found two matching invoices already present and rejected seven requests. Replay with a completely new history directory wrote zero invoices and found 29 matching entries.

Fault probes covered malformed responses after actual writes, a 3-of-20 partial write followed by restart, a hard process kill after three writes, a valid false `OK` response without a target write, changed invoice text and duplicate actual target identities. The 25-request partial run prepared XML batches of 20 and 5 before execution; restart wrote 22 and skipped three, then replay skipped all 25. These are process-failure/replay checks, not a physical power-cut or filesystem durability test. No persistent automated tests were added.
