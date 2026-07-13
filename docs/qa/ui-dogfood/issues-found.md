# EGOG UI Dogfood Issues

## UI-001 — Account Trigger logs the user out

| Field | Value |
| --- | --- |
| Severity | Blocker |
| Screen | Global header |
| Environment | Production, authenticated session |
| Reproduction | Sign in, then activate the wallet/account control in the header. |
| Expected | An Account Menu opens and the Privy session remains authenticated. |
| Actual | The control invokes `logout()` immediately. |
| Root cause | `apps/web/src/components/app-header.tsx` binds the authenticated Trigger directly to `logout()` and has no menu state or explicit Sign out item. |
| Required fix | Radix DropdownMenu Trigger plus explicit menu items; only Sign out may invoke `logout()`. Delete Account must require a confirmation dialog. |
| Regression coverage | Menu open/close, outside click, Escape, keyboard navigation, focus return, explicit Sign out, Delete Account confirmation, and 390x844 collision handling. |
| Before evidence | Current Production behavior and source inspection on 2026-07-13. |
| After evidence | Local implementation complete. `app-header.test.tsx` covers session preservation, explicit sign-out, destinations, delete confirmation and failure, trigger toggle, outside click, Escape, Arrow/Enter, Tab/Shift+Tab focus movement, and focus restoration. My Page uses the same AlertDialog and has its own regression test. Production redeployment remains pending. |
| Commit | Pending. |
