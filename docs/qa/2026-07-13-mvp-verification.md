# EGOG MVP Verification — 2026-07-13 KST

This record separates verified evidence from checks that still require the current Production deployment.

## Automated evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| ESLint | PASS | `pnpm lint`, zero warnings |
| TypeScript | PASS | `pnpm typecheck`, 4/4 workspace packages |
| Vitest | PASS | 16 files, 48 tests |
| Hardhat | PASS | 11 contract scenarios |
| Production build | PASS | Next.js 16.2.10 compiled and generated all app/API routes |
| Dependency audit | PASS | `pnpm audit --prod`, no known vulnerabilities |
| Dev on-chain reconciliation | PASS | block `30525586`, 0 missing events, 0 pending transactions, 0 retries |
| Demo integrity verifier | PASS | 3 projects, 3 public/IPFS Snapshots, current v3, active Demo contract, chain/cache/row member count `0` |
| Dev nonce migration | PASS | `participation_requests.nonce` is `numeric(78,0)`; migration id `3`, hash `2f4ea1a2ff48580f39f2e8026dfdf8dfa6d3c2f24e626b8bf1bf029c32977232`; a uint256-sized nonce round-tripped without loss |
| Demo nonce migration | PASS | `participation_requests.nonce` is `numeric(78,0)` with the same recorded migration id and hash |

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

## Real Dev end-to-end evidence

The complete user path was executed with a real Privy Google login and embedded wallet against the Dev environment.

| Evidence | Verified value |
| --- | --- |
| Embedded wallet | `0xFD80B37ee01c578D8aFE408B93818b5B48c2ECAe` |
| Dev contract | `0x4f0D8b9A1624177cF21373Ab184d053443489FD5` |
| GIWA transaction | `0x3b33f742e0f31a24ee0b94f10c872b335a5c8b919b0d22bf2926380cce2de2d3` |
| Confirmation block | `30527634` |
| Participation identity | Vietnam Brick Member `#1`, Token `#1` |
| Snapshot URI | `ipfs://bafkreied3i5pfzn7eeiietcnif3k5r7dmpxshjiz63gtbwzticmvpqoo3i` |
| Badge metadata URI | `ipfs://bafkreidz2shvhhkftmjsisrmh3lae5mka5aimwbvz3bkelxy7z6ygyziku` |
| Badge image URI | `ipfs://bafkreiap6bsh7lyxqu2glomh6fnqehkrv4e2hbpfufjy4ossi5yynvij3e` |

The receipt succeeded with four logs. Direct contract reads confirmed project member count `1`, participation `true`, token ownership by the embedded wallet, the expected token URI, and ERC-5192 `locked(1) = true`. Each IPFS resource returned HTTP 200. My Page showed the wallet, Early Participant `#1`, Snapshot `v3`, stage `VALIDATION`, and Token ID `1`; the project detail showed `Referenced on GIWA Testnet`, one participation record, and the joined state.

## Production gates not yet proven

- Current commit deployed successfully to the stable Vercel URL.
- Cron schedule accepted by the selected Vercel plan. The current Hobby plan rejected `*/10 * * * *`; no schedule fallback has been applied.
- Real Google login and embedded wallet provisioning on the stable origin.
- Real Demo `joinBySig` transaction, one-block confirmation, Badge/tokenURI, IPFS Snapshot, and My Page reconciliation.
- Pre-issued 5–10 team-account Demo badges.
- Final desktop/mobile smoke against the deployed build.
- 2–3 minute submission recording.

These items must remain marked incomplete until direct runtime evidence exists.
