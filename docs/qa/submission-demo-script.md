# EGOG Submission Demo Script

Target runtime: 2–3 minutes. Record against the stable Production URL only after every pre-demo gate in `docs/runbooks/demo-operations.md` passes.

## Before recording

- Use Desktop Chrome at 1440×900 or larger and close unrelated tabs and notifications.
- Start logged out, with the Demo Relayer funded and Demo synchronization healthy.
- Confirm the stable URL serves the current commit and all five core surfaces.
- Keep the GIWA transaction, public IPFS Snapshot, and My Page links ready for verification.
- Never expose Vercel, Supabase, Pinata, AWS, Privy, or wallet secrets in the recording.

## Shot list and narration

### 0:00–0:20 — Project discovery

Show the `EGOG` wordmark, product statement, and the three project cards.

Narration:

> EGOG is a verified climate participation experience. Visitors can inspect climate project data before creating an account. Vietnam Brick is the active demonstration project, while Solar Mobility and Jeju ERW show the planned expansion.

Point out `Demonstration Data` and `Coming Soon`. Do not describe demonstration figures as Newtonne-verified or issued carbon credits.

### 0:20–0:55 — dMRV project detail

Open Vietnam Brick. Show the monitored reduction KPI, validation stage, forecast range and date, Snapshot v3, trend chart, verification timeline, data details, and on-chain status.

Narration:

> The project separates monitored information, forecast values, and verification status. Three immutable demonstration Snapshots show the version history. Each public Snapshot is canonicalized, published to IPFS, and later referenced by the user’s participation record.

Show the current value and future-opportunity distinction in the sticky participation panel.

### 0:55–1:25 — Login, wallet, and consent

Select `Support & Join Early Access`, then sign in with Google. Show the shortened embedded-wallet address, required on-chain consent, optional email opt-in, and Snapshot review.

Narration:

> Google login provisions an embedded EVM wallet through Privy. The user reviews the exact Snapshot they saw. Email updates are optional and remain off-chain; the permanent blockchain record requires explicit consent.

Do not show Google credentials or private keys.

### 1:25–1:55 — Signature and GIWA confirmation

Sign the EIP-712 participation message. Keep the signing and `Confirming on GIWA` states visible until one block confirms.

Narration:

> The user signs a gas-free, ten-minute EIP-712 authorization. EGOG verifies it, publishes immutable badge metadata, and the designated Relayer submits one GIWA Sepolia transaction. The contract prevents replay, duplicate participation, unauthorized relayers, and badge transfer.

### 1:55–2:20 — Completion proof

Show member number, token ID, Snapshot version, transaction hash, data type, and the three verification actions. Open the GIWA transaction and public Snapshot briefly.

Narration:

> One confirmed transaction records the wallet, project, Snapshot hash and URI, version, member number, and token. The public Snapshot can be independently compared with its on-chain hash.

### 2:20–2:45 — My Page

Open My Page. Show the complete wallet address, non-transferable badge, joined Snapshot, latest Snapshot, current stage, transaction, and Snapshot links.

Narration:

> My Page distinguishes the immutable Snapshot at participation from the project’s latest state. The ERC-721 badge implements ERC-5192 and is permanently locked, so it represents participation only—not an investment, financial return, or carbon credit ownership.

### 2:45–3:00 — Close

Return to the project or completion view with the verified status visible.

Narration:

> This MVP proves an end-to-end connection from transparent dMRV Snapshot data, to explicit user authorization, to a verifiable GIWA participation record and badge.

## Recording acceptance checklist

- The recording is continuous enough to prove the real flow; cuts do not hide login, signature, or confirmation failures.
- `Demonstration Data` remains visible whenever figures could be mistaken for actual Newtonne data.
- The transaction opens on GIWA Sepolia and shows success.
- The Snapshot URI opens publicly and matches the participation version.
- My Page shows the same member number and token ID as completion.
- No secrets, private keys, raw access tokens, personal inbox content, or unrelated tabs are visible.
- A backup copy and three still captures are retained with the submission package.
