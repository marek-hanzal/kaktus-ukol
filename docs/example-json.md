# Example JSON conversion

```text
taxy-cli example convert taxy --actor developer --output .out/example.ndjson
taxy-cli import-intermediate .out/example.ndjson --actor developer --output .out/replayed.ndjson
taxy-cli schema kaktus-meta --output .out/kaktus-meta.schema.json
```

`example` names the source adapter. The import/export language remains `intermediate` NDJSON.
The directory must contain `klienti.json` (one office and a client array) and
`doklady-k-zapisu.json` (an invoice array). Clients-document properties may appear in either order.
The adapter streams `office`, `client` and `invoice_request` records without resolving references
or inventing target-side invoice and supplier identifiers. Protocol fields map explicitly
into English domain fields. Unexpected properties are rejected rather than silently discarded.

The shared intermediate envelope supports optional, strict `kaktus: KaktusMetaSchema` metadata:

```json
{
  "type": "client",
  "source": {
    "origin": "example",
    "location": "/input/taxy/klienti.json#/klienti",
    "record": 1
  },
  "kaktus": { "companyId": "0001" },
  "data": {
    "id": 4172,
    "name": "Truhlářství Dvořák s.r.o.",
    "registrationNumber": "90412761"
  }
}
```

Known metadata fields are `companyId`, `folder`, `supplierId` and `invoiceId`.
Only known values are supplied. Client conversion preserves `kaktusFirma` as `kaktus.companyId`;
client admission requires this mapping. Intermediate replay preserves metadata and source provenance.
Metadata does not authorize target writes, and `folder` is never a trusted filesystem path.

Monetary JSON number tokens are captured as exact text before decoding, then admitted as BigDecimal.
Publishing normalizes decimal spelling without rounding; exponents and precision beyond four places
are rejected. JSON syntax, duplicate properties, invalid UTF-8 and oversized records abort conversion.
Independent business rejections are scanned and logged; strict mode withholds the complete output
on any rejection and preserves an existing destination. `--best-effort` omits rejected records
after synchronizing their field diagnostics and a review warning. It atomically publishes the
admitted subset and returns `rejectedRecords` and `reviewRequired`, with explicit CLI and audit
warnings. The caller must review the processing log before using the batch. Framing, encoding,
I/O and diagnostic-write failures still abort; a rejected batch with no accepted records is not published.
Input and output limits are independent, default to 64 KiB
and are configurable up to 1 MiB with the corresponding CLI flags.

The supplied invoices include `doc_340661d8d9` with `cisloDokladu: null` at position 19.
Consequently, strict conversion produces 39 accepted records and one rejection, a failed audit
completion and no publication. With `--best-effort`, those 39 records are published, the rejection
is counted and mandatory review is reported. The supplied files are left unchanged. Authorization, invoice totals,
target identity checks and accounting-period admission are separate from this structural conversion.
