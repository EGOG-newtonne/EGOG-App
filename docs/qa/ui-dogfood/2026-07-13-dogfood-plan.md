# EGOG Production UI Dogfood Plan

## Scope

Production URL: `https://egog-app-web.vercel.app`

This plan validates the complete public and authenticated EGOG experience after the Account Menu blocker is fixed and deployed. Production data mutations must use designated demo accounts only. Credentials, OAuth details, access tokens, and reusable browser state must not be committed.

## Required environments

| Environment | Viewport | Required flow |
| --- | --- | --- |
| Desktop Chrome | 1366x768 and 1920x1080 | Full E2E |
| Desktop Edge | 1366x768 | Full E2E |
| iPhone Safari | 390x844 | Login through My Participation |
| Android Chrome | 390x844 | Login through My Participation |

The result document must identify whether each mobile run used a physical device, simulator, emulator, or cloud device.

## Product states

- Logged out
- Logged in with embedded wallet ready
- Participation draft and consent review
- Signature rejected
- Transaction processing
- Participation confirmed
- Duplicate participation
- Empty My Participation
- Account deletion confirmation
- Deleted session
- Recoverable API, RPC, storage, and rate-limit failures

## Automated and manual scenarios

| ID | Scenario | Mutation |
| --- | --- | --- |
| E2E-01 | Public project discovery | No |
| E2E-02 | Project detail desktop | No |
| E2E-03 | Project detail mobile | No |
| E2E-04 | Account menu opens without logout | No |
| E2E-05 | Explicit Sign out | Session only |
| E2E-06 | Google login and wallet provisioning | Yes |
| E2E-07 | Participation with email opt-in off | Yes |
| E2E-08 | Participation with email opt-in on | Yes |
| E2E-09 | Signature rejection | No on-chain mutation |
| E2E-10 | Successful participation | Yes, one Badge |
| E2E-11 | Participation refresh recovery | Existing request only |
| E2E-12 | Duplicate participation blocked | No second Badge |
| E2E-13 | Completion links | No |
| E2E-14 | My Participation | No |
| E2E-15 | Account deletion | Destructive, disposable account only |
| E2E-16 | Privacy and Terms | No |
| E2E-17 | Coming Soon project blocked | No |
| E2E-18 | Mobile account menu | No |
| E2E-19 | Rate-limit error UI | Controlled test data |
| E2E-20 | RPC and storage failure UI | Controlled non-production mutation path |

## Account Menu blocker gate

Dogfood cannot proceed past authenticated navigation until all of these pass:

- Trigger opens the menu and preserves the Privy session.
- Trigger toggle, outside click, and Escape close only the menu.
- Arrow keys and Enter operate menu items.
- Focus returns to the Trigger after close.
- My Participation, Privacy, and Terms navigate correctly.
- Delete Account opens a confirmation dialog and does not delete immediately.
- Only the explicit Sign out item invokes `logout()`.
- Portal content remains inside the 390x844 viewport.

## Screen review checklist

For every screen and state, verify:

- Loading, empty, success, rejected, retryable failure, and final failure messaging.
- No horizontal scroll, clipped dialogs, obscured sticky controls, or unsafe-area overlap.
- Long addresses, hashes, and URIs wrap without breaking layout.
- Keyboard focus is visible and follows a logical order.
- Controls have clear accessible names and do not expose duplicate screen-reader text.
- Stitch desktop and mobile information hierarchy, tokens, copy, and component roles remain aligned.
- `EGOG`, `dMRV`, `GIWA Testnet`, and `Participation Badge` terminology is consistent.
- `Demonstration Data` remains visible wherever mock Snapshot values appear.

## Execution order

1. Fix and locally verify Account Menu blocker with interaction tests.
2. Run lint, typecheck, Vitest, contract tests, build, audit, and `verify:demo`.
3. Deploy Production and record deployment URL plus commit.
4. Run non-mutating public and Account Menu scenarios.
5. Run designated-account participation scenarios and capture on-chain evidence.
6. Run disposable-account deletion only after action-time approval.
7. Run mobile and secondary-browser scenarios.
8. Run controlled failure and rate-limit scenarios.
9. Reconcile Demo Contract, Supabase cache, and UI counts.
10. Update results, issue register, regression matrix, AC-01 through AC-15 evidence, and demo-video capture plan.
