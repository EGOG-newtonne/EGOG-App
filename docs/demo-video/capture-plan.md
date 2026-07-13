# Production capture plan

## Source environment

- Origin: `https://egog-app-web.vercel.app`
- Chain: GIWA Sepolia (`91342`)
- Demo Contract: `0xf06aDA399160D208D3629EBeEAAF628266BE23A6`
- Snapshot: Vietnam Brick v3
- Capture viewport: 1920×1080 at device scale factor 1 or higher
- Capture engine: Playwright Chromium using a local, git-ignored authenticated
  storage state. Google credentials are never scripted or stored.

## Deterministic capture sequence

1. Signed-out Project Discovery.
2. Vietnam Brick Project Detail at page top.
3. Project Detail trend, Timeline, and on-chain reference sections.
4. Participation page after interactive Google login.
5. Wallet-ready and consent OFF state.
6. Consent ON state for the final mint.
7. Real EIP-712 confirmation prompt.
8. Transaction processing state.
9. Confirmed state with member number and token ID.
10. GIWA Explorer transaction page.
11. Public IPFS Snapshot JSON.
12. My Page participation record.

## Privacy and safety

- Pause automation for Google account selection; the operator signs in manually.
- Do not record the account chooser, email address, OAuth consent details,
  cookies, access tokens, or browser DevTools.
- Store Playwright `storageState` only below the ignored `.auth/` directory and
  delete it after final capture.
- Mask or crop any unexpected personal information before the asset is admitted
  to the manifest.
- Only the public wallet, transaction hash, token ID, member number, CIDs, and
  project data may remain visible.

## Asset admission gate

Each admitted capture must be listed in `capture-manifest.json` with its URL,
UTC capture time, viewport, source deployment, and privacy review result. The
Remotion asset preparation script fails when a required capture is missing.
