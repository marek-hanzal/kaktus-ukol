# Potential improvements

- Add an optional `taxy-cli` reporting command that combines normalization diagnostics, connector outcomes and Kaktus responses into one human-readable per-document report. Correlate source provenance/request IDs with batch ordinals and show rejected, unattempted and unknown outcomes explicitly, so users do not need to interpret vendor XML. Keep normalization and target execution independently runnable with their own receipts and logs; aggregation must not couple them into one end-to-end import flow. Reviewing the processing logs remains required.
