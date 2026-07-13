# EGOG demo video verification

Status: **PASS — final Production capture, render, and QC complete.**

Verified: `2026-07-13 KST`

## Final artifact

| Check | Required result | Actual result |
| --- | --- | --- |
| Duration | Revised storyboard target: approximately 1:55 | `115.050667` seconds |
| Resolution | 1920×1080 | `1920×1080` |
| Codec | H.264, 4:2:0 | H.264 High, `yuvj420p` full-range 4:2:0 |
| Frame rate | 30 fps | `30/1` |
| Aspect ratio | 16:9 | `16:9` |
| File size | Record final byte count | `40,296,664` bytes |
| SHA-256 | Record immutable artifact hash | `62ff8ae1a47a92b2eb685c4567065642d33fe155785b49c751a81008893ff18a` |
| Audio | No unlicensed music or audible program | AAC stereo container stream at digital silence; mean and max volume `-91.0 dB` |
| Automated QC | No duration, resolution, or stream failures | `qc_video.py`: zero warnings, zero failures |

- Final render: [egog-demo-1080p.mp4](./egog-demo-1080p.mp4)
- Contact Sheet: [contact-sheet.png](./contact-sheet.png), 5×3 at 2400×810
- Remotion source: [remotion/src/video.tsx](./remotion/src/video.tsx)
- Capture manifest: [capture-manifest.json](./capture-manifest.json)

## Production evidence featured in the video

All authenticated product scenes belong to one coherent Production
participation. No member number, token ID, transaction, or URL was reconstructed
for the video.

| Field | Verified value |
| --- | --- |
| Production origin | `https://egog-app-web.vercel.app` |
| Capture deployment | `dpl_AHFHo5ScjkNMka78GU4fKJ5WaLkV` |
| Capture workspace base commit | `174fbf37be646b95701b864440d45cee4d7a3aa0` |
| Final Production redeploy | `dpl_52fBwyJ9xzoe1ifwxbcjEDLriXe5`, application commit `a89843f` |
| Contract | `0xf06aDA399160D208D3629EBeEAAF628266BE23A6` |
| Participant wallet | `0x1AB0ab3A3A43956C501929F808dd5e220dd04721` |
| Member number | `7` |
| Token ID | `7` |
| Transaction | `0x305d60419871d9b7ab2e133a5bd5541cc90485b7b2fa6db202ead4434152457c` |
| Block | `30588788` |
| Event log index | `4` |
| Snapshot version | `3` |
| Snapshot hash | `0xb984ab96e9f8a4e869f717b0a72b350ba0f933c41f4f2bb7ba6ca242c379bb66` |
| Snapshot URI | `ipfs://bafkreida2iinclg7drtcqkpu7e67w5leo747d5jsiguukbacg3b5mmygba` |
| Metadata URI | `ipfs://bafkreichbn7c66wliymqiujvzrabbxdjfbztoqgr7dzg2bks2tflu4tbzm` |
| Joined at | `2026-07-13T09:11:44.000Z` |
| Optional email updates | Enabled by the user before signing |

The decoded `ParticipationRecorded` event is stored at
[`../qa/evidence/2026-07-13/final-video-v3/participation-event-7.json`](../qa/evidence/2026-07-13/final-video-v3/participation-event-7.json).
The event values, completion page, My Participation page, Explorer transaction,
and Project Detail member count all resolve to Badge #7.

## Capture and privacy review

- Product evidence was captured from the live Production origin at
  `2304×1089`, device pixel ratio 2.
- After final source control and artifact checks, the same application was
  redeployed to Production as `dpl_52fBwyJ9xzoe1ifwxbcjEDLriXe5`. The stable
  alias returned 200 for Discovery, Project Detail, Privacy, Terms, and Projects
  API; the unauthenticated Cron endpoint returned 401.
- The user completed Google OAuth interactively. Authenticated evidence was then
  captured with controlled Chrome; no Google credential, account chooser,
  email address, OAuth token, storage state, or Secret appears in the footage or
  repository.
- Public Project Discovery, Project Detail, GIWA Explorer, and IPFS surfaces
  were captured from their real URLs. No fake browser address bar is rendered.
- The final scene copy does not claim that the demonstration data itself was
  verified. It states that the versioned Snapshot URI and participation record
  can be inspected on GIWA.
- `Demonstration Data` remains visible in the product UI.
- Contact Sheet review found no cropped headline, malformed frame, cursor
  obstruction, OAuth surface, notification, or personal information.

## Scene coverage

1. EGOG positioning
2. Production Project Discovery with three projects and seven participants
3. Vietnam Brick Demonstration Data, KPI cards, stage, and Snapshot v3
4. Google-authenticated Privy embedded wallet readiness
5. Required on-chain consent and optional email consent
6. Actual EIP-712 signature request for member number 7
7. Badge #7 completion with token ID 7 and Snapshot v3
8. GIWA Explorer transaction success and event proof
9. Public IPFS Snapshot JSON and CID
10. My Participation with the same member, token, and Snapshot
11. Product flow: dMRV data → versioned Snapshot → user signature → GIWA record + Badge

## Tooling and license review

- Official Remotion Agent Skill: implementation baseline.
- `demo-video-creation-skill` upstream commit
  `7c246b3f122e11ad00bf0123d9b2ef79267244dc`: storyboard, capture, and QC
  procedure only; MIT license reviewed on `2026-07-13`.
- Remotion usage eligibility was recorded before rendering in
  [open-source-decision.md](./open-source-decision.md).
- No music, narration, sound effects, stock footage, or redistributed font file
  is included. The visual source material is the EGOG Production product and its
  public GIWA/IPFS evidence.

## Commands used

```bash
pnpm --dir docs/demo-video/remotion typecheck
pnpm --dir docs/demo-video/remotion assets
pnpm --dir docs/demo-video/remotion render
python3 ~/.codex/skills/demo-video-creation-skill/scripts/qc_video.py \
  docs/demo-video/egog-demo-1080p.mp4 \
  --min-width 1920 --min-height 1080 --min-duration 110 --max-duration 180
ffprobe -v error -show_entries format=duration,size,bit_rate:stream \
  -of json docs/demo-video/egog-demo-1080p.mp4
ffmpeg -i docs/demo-video/egog-demo-1080p.mp4 \
  -af volumedetect -f null -
```
