# Kaktus XML export

`taxy-cli kaktus export` reads our native intermediate NDJSON. It exports `received_invoice` records for exactly one `--company`, optionally restricted by `--invoice-id`. Suppliers are resolved by company and supplier ID from the same input; the selected company must occur exactly once. Input order does not matter. Other admitted record types do not become XML documents.

```text
node dist/taxy-cli.mjs kaktus export examples/intermediate.ndjson --company 0001 --actor developer --output .out/batch.xml
```

The input is admitted and normalized to a temporary snapshot before XML construction. Supplier lookups and duplicate identity checks use operation-local files rather than an in-memory dataset. Each XML invoice is separately projected and validated. Independent rejections produce field diagnostics and the scan continues; strict mode withholds the complete XML on any rejection. `--best-effort` can omit rejected input records and XML invoices, including missing suppliers and output-size rejections. The receipt and audit count both stages, mark required review and point to the processing log. Diagnostics and the final review notice must be synchronized before publishing the admitted subset. No admitted XML invoices means no publication. Syntax, framing, I/O and ambiguous identity failures abort. Publication stages beside the destination, synchronizes, closes and renames atomically. Actor, operation ID and result are audited; export itself does not invoke Kaktus.

`--max-record-bytes` bounds input UTF-8 records; `--max-output-record-bytes` independently bounds each encoded XML invoice including its provenance comment. Both default to 64 KiB and allow at most 1 MiB. Invoice and supplier source provenance, source identities and original document number survive in ASCII JSON comments. Hyphens, XML delimiters and non-ASCII characters in comments use JSON escapes. Comments do not introduce vendor business fields.

## Target contract and observed behavior

The manual is `kaktus/prirucka/Kaktus-Ucto-3.2-import.txt`. XML behavior was checked through isolated execution and DBF readback, without reading the simulator source in this XML task. Other tasks' simulator inspection is disclosed in the root README.

- Root: `KaktusDavka`, attributes `verze="3.2"` and the exact four-digit `firma`. Each document is `FakturaPrijata`, including a nested `Dodavatel`. There is no standalone company/supplier XML import in the documented protocol.
- The declaration **and actual bytes** use Windows-1250. UTF-8 can return OK while corrupting Czech text. The supplied DBF data uses CP852; target business text must survive both encodings. Unsupported characters, XML control characters and surrounding whitespace are rejected rather than replaced or trimmed. XML entities and embedded CR/LF/tab round-trip correctly.
- Amounts allow two fractional digits; exchange rates allow four. Amounts must fit N(12,2), rates N(10,4). Exact BigDecimal sums must match `Celkem`. There is no rounding. These restrictions belong exclusively to the Kaktus export contracts; generic accounting/intermediate values retain four fractional digits and Unicode text.
- Silent target truncation was observed. Export limits supplier number/variable symbol to 20/10 characters; supplier name/tax number/street/city/postcode/country/account to 40/14/40/30/6/2/30; invoice text/note to 50/60.
- Export requires a known taxable date instead of accepting the target's issue-date fallback. A null due date is omitted and remains null. Paid invoices are rejected because this XML protocol cannot preserve payment dates. Foreign currency requires a positive rate; CZK allows one or absent, and Kaktus stores one.
- Suppliers are matched by registration number, or name when absent. Kaktus assigns fresh invoice IDs and document numbers. Re-importing the same XML **creates duplicates**. XML generation does not provide target authorization, idempotency or rollback.
- Exit code 0 means the batch was processed, including when every invoice was rejected. Read the sibling `.odpoved.xml`: `KaktusOdpoved` contains counts and ordinal `Doklad` results (`OK` with document number, or `CHYBA` with code/message). Business rejection can leave other invoices committed. Fiscal-period and live target checks remain Kaktus's responsibility.
- Sending a batch must use Kaktus's own application locking protocol for the whole company, including invoice and supplier DBF tables. Black-box verification confirmed that `zamknout 0001` creates the occupied-company state and makes import return exit code 3 without changing either DBF. Creating that state ourselves before import would block our importer too; it is not an ownership handoff. Never invoke `odemknout` to bypass another user's lock. The owner explicitly selected target-side locking, so no connector sidecar or native OS locking was introduced. The verified guarantee is refusal while the company is occupied; an exclusive importer-owned lock during execution has not been demonstrated by the documented commands. Offline XML generation does not open or lock target DBF files.

## Reproduce on a disposable copy

Use a fresh copy directory; the import changes only that copy:

```text
node --input-type=module -e "import {cpSync} from 'node:fs'; cpSync('kaktus', '.out/kaktus-verification', {recursive:true,errorOnExist:true,force:false})"
node dist/taxy-cli.mjs kaktus export examples/intermediate.ndjson --company 0001 --actor developer --output .out/kaktus-verification/batch.xml
node .out/kaktus-verification/kaktus.cjs import .out/kaktus-verification/batch.xml
node dist/taxy-cli.mjs kaktus convert .out/kaktus-verification/DATA --actor developer --output .out/kaktus-verification/readback.ndjson
```

Verification on 2026-10-10 imported the example and real DBF invoice 36 as `FP260047` in separate copies. A two-invoice EUR batch returned `zapsano="2" odmitnuto="0"`; Czech text, literal entities, negative amounts and rate `25.1234` matched DBF readback. Company 0002 selection returned `FP260015`, without exporting company 0001. Fifteen rejection scenarios preserved the previous output, including two independent XML rejections in one scan. Generic intermediate import still preserved `1000.001` exactly. No automated test files were added. Original supplied data was not modified by this task.
