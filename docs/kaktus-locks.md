# Kaktus company locks

The supplied simulator's lock-related implementation was inspected. `zamknout` simulates an accountant opening a company; it does not acquire an exclusive connector lease.

```text
node kaktus/kaktus.cjs zamknout 0001
taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/kaktus.intermediate.jsonl
node kaktus/kaktus.cjs odemknout 0001
taxy-cli kaktus convert kaktus/DATA --actor developer --output .out/kaktus.intermediate.jsonl
```

`zamknout` writes a nonempty UTF-8 `DATA/0001/FIRMA.LCK` containing the simulated user and workstation. `odemknout` removes the marker. The simulator's XML import refuses a nonempty marker with exit code **3**, before writing records, an import log or a response. Its lock/unlock commands do not implement ownership checks or coordinate with an import already running.

The converter conservatively treats **any existing marker**, including an empty file, as busy. A missing marker is allowed; other filesystem failures propagate. It checks before company tables, between the supplier and invoice tables, after the invoice table, and rescans all active company routes when the complete stream ends, before publication. The final rescan is streamed; it does not retain a growing set of company identities. Deleted company slots remain ignored.

A detected marker raises `CompanyLockedError`, identifying the company and marker path. Processing and audit logs record the failure, staged data is discarded, and any previous destination remains intact. Close the company in Kaktus and retry. The converter never removes foreign locks, skips locked companies, or waits indefinitely.

These are cooperative busy checks, **not a consistent snapshot**. They can miss a lock created and removed between checks, or a write starting after the final check. `FIRMY.DBF` has no documented lock protocol. Reliable source consistency needs coordination with the real accounting program; creating our own marker cannot provide that guarantee.

Manual verification used an isolated copy of the supplied simulator and DATA: locked XML import returned 3 without changing DBFs; locked conversions for either company preserved the old destination and foreign lock; unlocking allowed 92 records; a lock introduced after company 0001 finished was caught by the final rescan. After unlocking, native XML import accepted one invoice and added its supplier; conversion then produced 94 records. An empty lock marker also blocked conversion. No automated tests were added, and supplied files were preserved.
