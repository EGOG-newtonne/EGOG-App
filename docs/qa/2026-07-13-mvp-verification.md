# EGOG MVP Verification — 2026-07-13 KST

This record separates verified evidence from checks that still require the current Production deployment.

## Automated evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| ESLint | PASS | `pnpm lint`, zero warnings |
| TypeScript | PASS | `pnpm typecheck`, 4/4 workspace packages |
| Vitest | PASS | 16 files, 46 tests |
| Hardhat | PASS | 11 contract scenarios |
| Production build | PASS | Next.js 16.2.10 compiled and generated all app/API routes |
| Dependency audit | PASS | `pnpm audit --prod`, no known vulnerabilities |
| Dev on-chain reconciliation | PASS | block `30525586`, 0 missing events, 0 pending transactions, 0 retries |
| Demo integrity verifier | PASS | 3 projects, 3 public/IPFS Snapshots, current v3, active Demo contract, chain/cache/row member count `0` |

Contract coverage includes valid mint, EIP-712 tamper/replay/expiry rejection, wrong signer, Relayer/Admin authorization, project member ordering, pause, duplicate join, and every ERC-721 transfer/approval path. Server tests cover environment boundaries, canonical Snapshot/hash fixtures, metadata shape, storage publication, database constraints, recovery-state decisions, project advisory-lock identifiers, and keyed rate-limit identifiers.

## Visual evidence

| Surface | Viewport | Result |
| --- | --- | --- |
| Project Discovery | Desktop Chrome-compatible browser | PASS |
| Vietnam Brick detail | Desktop | PASS |
| Vietnam Brick detail | 390×844 mobile | PASS |
| Participation review | Desktop | PASS |
| My Page logged-out state | Desktop | PASS |

Local captures were produced at `/tmp/egog-home.png`, `/tmp/egog-detail.png`, `/tmp/egog-mobile-detail.png`, and `/tmp/egog-participate.png`. They are local QA evidence and are intentionally not committed.

## Production gates not yet proven

- Current commit deployed successfully to the stable Vercel URL.
- Cron schedule accepted by the selected Vercel plan. The current Hobby plan rejected `*/10 * * * *`; no schedule fallback has been applied.
- Real Google login and embedded wallet provisioning on the stable origin.
- Real Demo `joinBySig` transaction, one-block confirmation, Badge/tokenURI, IPFS Snapshot, and My Page reconciliation.
- Pre-issued 5–10 team-account Demo badges.
- Final desktop/mobile smoke against the deployed build.
- 2–3 minute submission recording.

These items must remain marked incomplete until direct runtime evidence exists.
