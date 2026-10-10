# Intermediate submission to Kaktus

```text
taxy-cli example convert taxy --actor developer --best-effort --output .out/example.ndjson
taxy-cli kaktus import .out/example.ndjson --actor developer --best-effort --output .out/write.txt
```

This **writes through the supplied simulator**. `--simulator` selects its `.cjs` script; live `DATA` is resolved beside that script. Node invokes the script with argument arrays, without a shell or platform branches. A real `KAKTUS.EXE` adapter is not implemented. DBFs are opened only for reading; the target program owns every mutation.

The writer accepts only the shared intermediate NDJSON through `readIntermediateStream`, containing one office, client mappings and invoice requests; order does not matter. Source-specific JSON reading and exact monetary token handling belong to the separate `example convert` adapter. Other producers use the same intermediate contract without a source-format flag or writer branch. Readback invoices remain a separate record type. The writer never manufactures numeric DBF invoice/supplier identities for a request. `taxy-cli kaktus export` remains the separate offline readback-invoice exporter.

Both commands have their own admission receipt and audit. On the supplied demo, `example convert --best-effort` publishes 39 records and reports one rejected request; the writer receives 36 requests plus routing records. Adapter omissions must be reviewed in that first receipt/log and do not reappear as writer input outcomes. Writer admission can independently reject requests, so its own `--best-effort` is explicit too. Strict conversion publishes nothing for this demo.

## Admission and outcomes

Local admission completes before the first target invocation. Requests must be approved received invoices with complete domain values. Client mapping, request buyer and live target company must agree on registration number; conflicting request metadata is refused. Simulator folder routing must agree with its company ID. VAT rows are grouped using exact BigDecimal sums, zero-rate tax must be zero, and the final sum must equal the total. Kaktus encoding, field widths, monetary precision and rate restrictions are checked without trimming, replacement or rounding. The actual importer accepts at most eight integer amount digits and four integer exchange-rate digits, stricter than DBF storage widths.

Existing company/supplier/invoice-number identities and duplicates within the input are refused; there is no upsert. A repeated request ID or ambiguous client/target identity aborts admission. Only independently rejected requests may be skipped in `--best-effort`; malformed framing, I/O errors and lock failures stop the operation. Mandatory routing records cannot be skipped into an invented route.

Without `--best-effort`, local rejection prevents every target call and the report marks admitted requests `NOT_ATTEMPTED`. With the flag, the admitted subset proceeds and every rejection requires log review. Kaktus can partially commit a submitted batch in either mode. A complete response containing a target rejection stops later batches in strict mode; best-effort continues after confirmed individual rejections. An unconfirmed response stops subsequent submission in both modes.

Request snapshots, clients, target identities, duplicate keys and plans live on disk. Only the current batch of at most **20 same-company invoices** and a response bounded to 256 KiB are resident. The complete XML set is prepared before the first target invocation. XML files are retained side by side as `batch-<sequence>-<company>.xml`, with their own response files. Alternating companies may produce smaller batches. The 20-document ceiling comes from inspected simulator code: larger batches are silently truncated.

The response is parsed with [saxes](https://github.com/lddubeau/saxes), with DTDs refused and strict protocol schemas. Confirmation requires the expected company, exactly one result for every ordinal in order, and matching aggregate counts. Exit 0 alone is insufficient. Each result correlates to the original request ID/provenance and carries `WRITTEN`, `ALREADY_WRITTEN`, `REJECTED`, `NOT_ATTEMPTED` or `UNKNOWN`, a code/detail and the target-assigned document number when confirmed.

Canonical outcomes are printed as human text. Synchronized per-document files and the primary processing log remain retrievable throughout execution. The final human report is published atomically, including review counts and the retained run location. Report-publication failure cannot undo external writes; inspect retained intents/responses/outcomes. `schema write-outcome` and `schema write-summary` export the contracts.

CLI exit 0 requires at least one confirmed or previously confirmed write, no unknown/unattempted documents, and no rejection in strict mode. Best-effort exit 0 may include rejection and reports `REVIEW REQUIRED`. Audit completion confirms report publication; document statuses describe target outcomes.

## Repeated runs and interruptions

Keep `--state` (default `.out/kaktus-write-state`) across runs. An exclusive directory prevents concurrent writers sharing that state. It is local connector coordination, not a target lock. Kaktus's occupied-company marker is checked during inventory and before submission; the simulator also performs its own busy check. No foreign marker is removed and no exclusive target snapshot is promised.

Each target has a separate state namespace. Before spawning Kaktus, XML and request/business-key intents are atomically written and file-synchronized. After a complete response, admitted results are synchronized, then confirmations and human outcomes are persisted. Identical confirmed requests become `ALREADY_WRITTEN`; changed business values under the same ID are refused. Existing target business identities are refused even without local confirmation. Supplier matching follows Kaktus: registration number, otherwise exact name. This conservative policy can reject legitimate invoice-number reuse; no replacement or inferred equivalence is attempted.

A crash or missing/malformed response may leave some invoices written and some absent. Intents block automatic replay, including another request ID with the same business identity. Review the retained plan/XML/response/outcomes and target DBFs, reconcile the particular attempts, then release a stale writer directory manually. No automatic recovery command or universal exactly-once guarantee is claimed. File sync/rename does not promise directory durability on every filesystem; different state roots do not coordinate writers. Later changes directly in the target are outside this workflow.

## Isolated manual verification

Disposable copies preserved the supplied files. Through the public CLI, demo conversion published 39 intermediate records and reported one rejection. Kaktus submission then yielded 27 confirmed writes and nine rejections: eight local rejections and one target fiscal-period rejection, with 36 request outcomes. All 27 invoice fields and exact amounts matched DBF readback. Repetition yielded zero new writes and 27 prior confirmations. A 25-invoice intermediate input generated batches of 20 and 5, all prepared before invocation. Partial target rejection and loss of the response after an actual write were also probed. No automated test files were added.
