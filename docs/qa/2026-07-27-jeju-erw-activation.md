# Jeju ERW Field Evidence Activation

Verified at: `2026-07-27` KST
Environment: EGOG Demo / Production
Network: GIWA Sepolia (`91342`)

## Result

| Check | Result |
| --- | --- |
| Demo database | `EGOG Demo` (`zxruwjprnubdgiqmsnzi`, `ap-northeast-1`) |
| Project state | `active` |
| Snapshot | `Field Evidence Snapshot v1` |
| Carbon data | `pending` |
| Field images | 4 |
| Sensor evidence images | 4 |
| IPFS image SHA-256 verification | PASS (8/8) |
| S3 backup SHA-256 verification | PASS (8/8) |
| GIWA project active | PASS |
| Initial Jeju member count | `0` |
| Relayer has Admin role | `false` |
| `verify:demo` | PASS |
| Production dependency audit | PASS (`0` known vulnerabilities) |

The evidence is actual Newtonne-provided field and ZENTRA Cloud material. It is
not evidence of a quantified carbon-removal result, issued carbon credits, a
registry decision, or methodology approval.

## Snapshot evidence

| Field | Value |
| --- | --- |
| Project | `jeju-erw-001` |
| Version | `1` |
| Kind | `field_evidence` |
| Snapshot hash | `0x18295ddcc848f1346aecd5aa3aedc2842e114a0b714b6d65c8d4ac4f549a3824` |
| Snapshot URI | `ipfs://bafkreifk4rlfzx3zbpi362q44cdgl7jutip4guiptfowpvarqb2kap3pmi` |
| S3 backup key | `public-snapshots/jeju-erw-001/v1/0x18295ddcc848f1346aecd5aa3aedc2842e114a0b714b6d65c8d4ac4f549a3824.json` |
| Measured at | `2026-07-27T01:20:02.000Z` |
| Published at | `2026-07-27T01:30:00.000Z` |

The eight evidence objects and their SHA-256 values are stored in the immutable
Snapshot JSON. `verify:demo` downloaded the Snapshot and every IPFS object,
recomputed each hash, and compared it with the database. A separate S3
verification downloaded all eight backup objects and compared their hashes with
the same manifest.

## Contract activation

| Field | Value |
| --- | --- |
| Contract | `0xf06aDA399160D208D3629EBeEAAF628266BE23A6` |
| Jeju project ID | `0x7d2984410c0b6281d6104f6970023a0e31b688beebeae0a43d24839d2c136ffe` |
| Admin | `0x9e4CE65D4a03a9b4f0b6CA4B2AC6d5ab98dF1Bb8` |
| Relayer | `0x5256FD2BB9d34d9a02103cb2AEC2458356aCED1a` |
| Activation transaction | `0x5737102c231e92bf2e7fd311a591db1dfe92f01d429b9b78fc2cc202e30a5a0d` |
| Activation block | `31779546` |
| Receipt | `success` |
| `projectActive(projectId)` | `true` |
| `projectMemberCount(projectId)` | `0` |

The first post-transaction `latest` read briefly returned the preceding GIWA
RPC state after the successful receipt. The activation command was not
resubmitted. The script now verifies writes against the receipt block, and an
idempotent rerun returned `activeBefore: true`, `activeAfter: true`, and no new
transaction.

## Verification commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:contracts
pnpm --filter @egog/contracts coverage
pnpm audit --prod
pnpm verify:demo -- --env-file=<secure-demo-env>
```

## Dependency security verification

The Production dependency audit initially found patched releases for Next.js,
Sharp, Axios, PostCSS, and Fast URI. The remediation used exact non-major
versions only:

| Package | Applied version | Dependency path |
| --- | --- | --- |
| `next` | `16.2.11` | Direct Production dependency of `@egog/web` |
| `sharp` | `0.35.0` | `@egog/web > next > sharp` |
| `axios` | `1.18.0` | Privy/Wagmi/Coinbase SDK transitive path |
| `postcss` | `8.5.18` | Next.js and build-tool transitive paths |
| `fast-uri` | `3.1.4` | Remotion/webpack/ajv transitive path |

No `--force` operation or unrelated major upgrade was used. After the lockfile
update, lint, typecheck, 96 Vitest tests, the Production build, 14 Hardhat
tests, contract coverage, `pnpm audit --prod`, and `verify:demo` all passed.

Vercel's fileless `env run` command does not export Sensitive values such as
the Production database URL to the local process. The final predeployment
verification therefore combined the existing Demo database credential held
outside Git with the non-secret Production configuration. The temporary
Vercel environment file was mode `600`, was not tracked, and was deleted after
the check. The stale repository-level `.env.demo.local` file was also removed.

Secrets were loaded from the existing local environment and macOS Keychain.
No private key, database password, Pinata token, AWS secret, or sync secret was
written to this document.
