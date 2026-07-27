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

## Production deployment

| Field | Value |
| --- | --- |
| Git commit | `92cf5225497a9aaa872609210cb0626d01db90cd` |
| Vercel deployment | `dpl_FDYHrfLn2jGM2iq7EB6t12Ez9og6` |
| Production alias | `https://egog-app-web.vercel.app` |
| Deployment state | `READY` |
| Discovery response | HTTP `200` |
| Jeju detail response | HTTP `200` |
| Projects API response | HTTP `200` |
| Jeju API response | HTTP `200` |

The deploy source was a detached worktree at the recorded commit. The unrelated
local GIWA Explorer verification changes were not included in the deployment.

## Production participation E2E

The Production flow was completed using an existing Privy embedded wallet. The
required permanent-record consent was selected and the optional email consent
was deliberately left off.

| Field | Contract event / DB / UI result |
| --- | --- |
| Participant | `0x6596921577AAdF46e7Ec1403B7d56394FC529905` |
| Project ID | `0x7d2984410c0b6281d6104f6970023a0e31b688beebeae0a43d24839d2c136ffe` |
| Token ID | `9` |
| Member number | `1` |
| Snapshot hash | `0x18295ddcc848f1346aecd5aa3aedc2842e114a0b714b6d65c8d4ac4f549a3824` |
| Snapshot version | `1` |
| Snapshot URI | `ipfs://bafkreifk4rlfzx3zbpi362q44cdgl7jutip4guiptfowpvarqb2kap3pmi` |
| Metadata URI | `ipfs://bafkreib54std2diooc4yhnevd3gxfneyjnwfio7nooxrpbw57w3nu4f6wy` |
| Joined at | `2026-07-27T04:18:54.000Z` |
| Transaction | `0xc850886584f71e25538a70d135325959e81b44a374b48decb46588b97e6833f6` |
| Block | `31780818` |
| Log index | `26` |
| Receipt status | `ok` |
| Required consent stored | `true` |
| Email opt-in stored | `false` |
| Email opt-in timestamp stored | `false` |
| Participation request state | `CONFIRMED` |

The decoded `ParticipationRecorded` event, database row, completion view, and My
Participation view matched for every on-chain field. The database contained
exactly one participation row and one indexed event row for the transaction.
The project cache and the contract member counter were both `1`.

After immediate reconciliation, the protected Production sync endpoint was
called twice and returned HTTP `200` with zero duplicate events. The manual
`pnpm sync:onchain` command also returned zero new events. The sync cursor
advanced to block `31781083`, while the participation and indexed-event row
counts remained `1`.

## Responsive and accessibility evidence

| Evidence | Result |
| --- | --- |
| Desktop Jeju detail | PASS |
| Mobile Jeju detail at `390×844` | PASS; document width `390`, no horizontal overflow |
| Field image dialog | PASS; Escape closes and focus returns to the source thumbnail |
| Gallery semantics | PASS; eight uniquely named image buttons and accessible dialog |
| Mobile completion | PASS |
| Mobile My Participation | PASS; no horizontal overflow |
| Account menu | PASS; open/close does not change authentication state |

Captured evidence:

- `evidence/jeju-erw/production-desktop.png`
- `evidence/jeju-erw/production-mobile-390x844.png`
- `evidence/jeju-erw/participation-complete-mobile.png`
- `evidence/jeju-erw/my-participation-desktop.png`
- `evidence/jeju-erw/my-participation-mobile.png`

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
