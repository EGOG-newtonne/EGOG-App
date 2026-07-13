# EGOG demo video v2 storyboard

Target: 1 minute 55 seconds, 1920x1080, 30 fps, H.264 MP4.
Evidence rule: every product surface must come from the current Production
deployment and one coherent final featured participation.

| Time | Scene | Visual and motion | On-screen copy | Required evidence |
| --- | --- | --- | --- | --- |
| 00:00-00:07 | Hook | EGOG title for no more than 2.5 seconds, then a quick spatial push into Project Discovery | `From climate data to on-chain proof` | Real EGOG wordmark and Production Discovery |
| 00:07-00:17 | Project Discovery | Show all three project cards, then move directly to Vietnam Brick; no dwell on Coming Soon cards | `Explore climate projects before participating` | Production Discovery after the final featured mint |
| 00:17-00:35 | Project Detail and dMRV | One focal region at a time: Demonstration label, monitored reduction, Snapshot v3/date, Validation stage, history chart | `Review the versioned dMRV Snapshot` | Production Detail with the final current member count |
| 00:35-00:49 | Google sign-in and wallet | Short login action; crop or blur account-selection PII; call out the authenticated embedded-wallet-ready state | `Google sign-in. Embedded wallet ready.` | Final test account, no email or OAuth PII visible |
| 00:49-01:06 | Review, consent, and signature | Show required consent, optional email consent, Snapshot v3/date, then focus the real Privy modal; background dim 25-40 percent | `Review the exact Snapshot, then sign` | Real challenge and signature for the final featured mint |
| 01:06-01:21 | Confirmation and badge | Show one-block confirmation, then punch in to actual Member Number, Token ID, Snapshot Version, and View Transaction | `Participation recorded. Badge issued.` | Actual result from the same final transaction |
| 01:21-01:37 | Independent verification | Crop browser chrome; highlight actual Explorer Success, block, contract/method, and real event/log field, then briefly show public Snapshot JSON | `Independently verifiable on GIWA` | Final transaction and public Snapshot URI |
| 01:37-01:49 | My Participation | Show the same badge, member number, token ID, transaction, joined Snapshot, and latest Snapshot | `The Snapshot you signed stays attached` | Same account and transaction as completion |
| 01:49-01:54 | Product flow | Product-centred four-step flow, not infrastructure | `dMRV Data -> Versioned Snapshot -> User Signature -> GIWA Record + Badge` | No Supabase, Cron, endpoint, cursor, or recovery internals |
| 01:54-01:55 | Closing | EGOG wordmark on ink background | `Transparent climate participation, anchored on GIWA.` | Brand-only close |

## Motion specification

- Use only Remotion frame-based animation; no CSS animation or CSS transition.
- Use ease-in-out punch-ins between 1.12x and 1.25x.
- Keep one focal highlight per spoken/caption idea.
- Use a short click ring only where it clarifies a real action.
- Remove the reconstructed browser address bar from product frames.
- Keep key copy within 80px horizontal and 100px vertical safe margins.
- Keep captions to two lines or fewer.
- Do not place a callout over product text, hashes, buttons, or the Privy modal.

## Accuracy gates before capture

1. Read the current on-chain `projectMemberCount` immediately before capture.
2. Record the expected next member number, but do not assume the token ID.
3. Complete one actual participation with a fresh eligible test account.
4. Decode `ParticipationRecorded` and capture the actual member number, token
   ID, Snapshot, transaction hash, block, metadata URI, and wallet.
5. Confirm the same values in the completion page and My Participation.
6. Capture Project Detail again after the transaction so its count matches the
   completed flow.
7. Reject and redo the capture if any value or account surface is inconsistent.
