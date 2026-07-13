# EGOG demo video revision audit

> Historical pre-revision audit. The 150-second Badge #1 artifact described
> below was superseded by the coherent Badge #7 cut. See
> [verification.md](./verification.md) for the final artifact and QC evidence.

Audit date: 2026-07-13 KST
Audited artifact: `egog-demo-1080p.mp4`
Production origin: `https://egog-app-web.vercel.app`
Production deployment: `dpl_AHFHo5ScjkNMka78GU4fKJ5WaLkV`
Deployment URL: `https://egog-app-qwetaohcx-jewelcoredots-projects.vercel.app`
Capture workspace base commit: `174fbf37be646b95701b864440d45cee4d7a3aa0`

## Technical baseline

| Check | Observed value |
| --- | --- |
| Duration | 150.058667 seconds |
| Resolution | 1920x1080 |
| Frame rate | 30 fps |
| Video codec | H.264 |
| Audio | AAC container stream containing digital silence |
| Demo contract | `0xf06aDA399160D208D3629EBeEAAF628266BE23A6` |
| Current Vietnam Brick member count | 5 on-chain, 5 on the Production page |
| Current Snapshot | Version 3 |
| Snapshot hash | `0xb984ab96e9f8a4e869f717b0a72b350ba0f933c41f4f2bb7ba6ca242c379bb66` |
| Snapshot URI | `ipfs://bafkreida2iinclg7drtcqkpu7e67w5leo747d5jsiguukbacg3b5mmygba` |
| Data status | Demonstration data |
| Current project stage | Validation, explicitly marked as demonstration |

The on-chain `projectMemberCount` was read directly from GIWA Sepolia. Five
`ParticipationRecorded` events exist, with token IDs and member numbers 1
through 5. The next member number is therefore expected to be 6 because the
contract enforces `projectMemberCount + 1`. The next token ID must not be
assumed or placed in the video before the new transaction is confirmed.

## Gemini timecode comparison

The Gemini time ranges correspond to the current Remotion sequence boundaries.
The current timeline is:

| Time | Current scene | Audit result |
| --- | --- | --- |
| 00:00-00:10 | Static opening | Correctly identified as too long. Reduce to 2-3 seconds. |
| 00:10-00:22 | Project Discovery | Valid Production capture. Compress movement and dwell. |
| 00:22-00:36 | Project Detail | Shows 5 participants and Demonstration Snapshot v3. |
| 00:36-00:47 | Snapshot integrity | Accurate values, but `canonical` is unnecessary developer language. |
| 00:47-00:58 | Join action | Valid Production capture. |
| 00:58-01:10 | Embedded wallet | Valid capture; use a restrained callout rather than implying no wallet exists. |
| 01:10-01:22 | Consent | Required and optional consent are visibly separate. |
| 01:22-01:34 | EIP-712 | Real Privy signing prompt for Badge 1. Background is already dimmed. |
| 01:34-01:46 | Completion | Real Badge 1 result. Inconsistent with the earlier 5-participant capture. |
| 01:46-01:58 | Badge proof | Same real Badge 1 result. Needs a tighter proof-area zoom. |
| 01:58-02:10 | GIWA Explorer | Real successful Badge 1 transaction. Highlight actual fields only. |
| 02:10-02:22 | My Participation | Real Badge 1 account state. Must be recaptured with the final featured mint. |
| 02:22-02:30 | Cron architecture | Remove. Internal recovery infrastructure is not part of the product story. |

## Claim-by-claim findings

### `Particioant` typo

**Finding: false positive.** The Production UI source, original 1152x1089
completion capture, and Remotion frame all say `You are Early Participant #1`.
No typo exists in the product or video source. The apparent error is consistent
with OCR or compressed-frame misreading. No product-code change is required.

### Participant-count consistency

**Finding: confirmed issue.** The Project Detail capture was made after five
real mints, while the later signature, completion, Explorer, and My
Participation scenes use the earlier Badge 1 flow. Combining them creates a
false single-session narrative.

**Required correction:** perform one new real Production participation after
the pre-capture count check. Use the actual resulting member number, token ID,
transaction, wallet, metadata URI, Snapshot hash, and Snapshot URI consistently
across Project Detail, signature, completion, Explorer, and My Participation.
No overlay or hardcoded replacement is allowed.

### Domain treatment

**Finding:** `egog-app-web.vercel.app` is the real stable Production origin. It
is not a fake domain. The current Remotion browser chrome reconstructs that real
origin as text. For the revised video, remove or crop browser chrome instead of
displaying a fabricated custom domain.

### Claims and wording

The following current or proposed phrases require revision:

| Phrase | Decision | Replacement |
| --- | --- | --- |
| `Verified Climate Participation` | Keep as product positioning, while Demonstration Data remains visible | No change |
| `canonical snapshot` | Remove from moving-video copy | `versioned Snapshot` |
| `Sign participation. No gas required.` | Too absolute | `Sign for this Snapshot. Gas is sponsored for the user.` |
| `No wallets needed` | Prohibited | `No wallet extension or seed phrase required.` |
| `tamper-proof dMRV data` | Prohibited | `tamper-evident Snapshot reference` |
| `real-time dMRV` | Prohibited for the current file/seed workflow | `versioned dMRV Snapshot` |
| `immutable IPFS JSON` | Avoid overstatement about availability | `public IPFS Snapshot JSON` |

## Explorer evidence

The featured Badge 1 transaction is real:

| Field | Value |
| --- | --- |
| Transaction | `0x45389de1ca5a9284d0a642e59913ed6ac345415486a05b4b291084a03721b468` |
| Block | `30564404` |
| Status | Success |
| Member number | 1 |
| Token ID | 1 |
| Snapshot version | 3 |

The current Explorer capture exposes a real `Success` status and minted token.
The revised capture should use the final featured transaction, show the real
status, block, method/contract, and event/log information that the Explorer
actually exposes, and must not synthesize a `Mint Event Log` label.

## Revision decision

Proceed with a new 1:40-2:00 cut based on one coherent real Production flow.
Remove the Cron recovery scene, compress static holds, eliminate reconstructed
address-bar chrome, retain explicit Demonstration Data labeling, and use only
the actual values returned by the final featured mint.
