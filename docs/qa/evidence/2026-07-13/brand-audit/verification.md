# EGOG Brand Audit Evidence

- **Verified:** 2026-07-13 KST
- **Canonical product name:** `EGOG`
- **Result:** PASS for all active source and submission artifacts.

## Active-source scan

The following case-insensitive search returned zero matches:

```text
rg -n -i 'e[o]go' . \
  --glob '!node_modules/**' \
  --glob '!.next/**' \
  --glob '!coverage/**' \
  --glob '!packages/contracts/coverage/**' \
  --glob '!pnpm-lock.yaml' \
  --glob '!docs/qa/legacy-demo-2026-07-13.md' \
  --glob '!docs/qa/dependency-audit-2026-07-13.md'
```

The audit covers application routes and copy, the text wordmark, Privacy,
Terms, QA/runbook/design documents, project seed data, shared Snapshot data,
contract types, current contract deployment references, and the Remotion
submission-video source.

## Immutable and high-impact assets

| Asset | Active state | Mutation policy |
| --- | --- | --- |
| Current Demo contract | `EGOG Participation Badge` at `0xf06aDA399160D208D3629EBeEAAF628266BE23A6` | Active; address and deployed bytecode are immutable. |
| Current Badge image | EGOG-branded shared SVG backed up to S3 and pinned to IPFS | Do not overwrite a CID; publish a new object for future changes. |
| Current token metadata | Badge #1 and #2 use EGOG name/description | Per-token URI is immutable after mint. |
| Current Snapshot JSON | Corrected v1–v3 objects, including v3 CID `bafkreida2iinclg7drtcqkpu7e67w5leo747d5jsiguukbacg3b5mmygba` | Never overwrite JSON or reuse a hash/CID for changed content. |
| Superseded Demo contract and Badge #1 | Preserved as `legacy demo evidence` | Never delete, mutate, or reconnect Production. |

The immutable identifiers, chronology defect, and isolation requirements for
the superseded environment are recorded in
[legacy-demo-2026-07-13.md](../../../legacy-demo-2026-07-13.md).

## Exclusions

Dependency/build output is excluded because it is generated or third-party
content. The legacy evidence document is excluded from the zero-match gate so
that historical identifiers can be preserved if an immutable artifact ever
requires the exact legacy four-letter spelling; active source, UI, metadata, and documentation contain no such match.
