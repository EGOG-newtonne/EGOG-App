# EGOG Dependency Audit — 2026-07-13

## Result

Option A was approved and applied as two narrowly scoped pnpm overrides:

```json
{
  "@actions/http-client@2.2.3>undici": "6.27.0",
  "@nomicfoundation/ignition-core@3.1.8>lodash-es": "4.18.1"
}
```

The post-remediation `pnpm audit --audit-level=high` result is 1 low, 1
moderate, 0 high, and 0 critical. `pnpm audit --prod --audit-level=high`
reports no known vulnerabilities. Both overridden packages remain confined to
the `@egog/contracts` Hardhat development graph and are absent from the
`@egog/web` Production dependency tree.

The lockfile now resolves `@actions/http-client@2.2.3` to `undici@6.27.0`
and `@nomicfoundation/ignition-core@3.1.8` to `lodash-es@4.18.1`; the previous
`undici@5.29.0` and `lodash-es@4.17.21` resolutions were removed. No package
major upgrade or `pnpm --force` command was used.

## High findings

| Severity | Package / installed version | Advisory | Impact | Dependency path | Production web runtime | Patched release |
| --- | --- | --- | --- | --- | --- | --- |
| High, CVSS 7.5 | `undici@5.29.0` | `GHSA-vrm6-8vpv-qv8q` / `CVE-2026-1526` | A malicious WebSocket server can trigger unbounded decompression and exhaust process memory. | `@egog/contracts` → `hardhat-toolbox-viem` → `hardhat-node-test-runner` → `hardhat-node-test-reporter` → `@actions/core` → `@actions/http-client` → `undici` | No. Hardhat and the reporter are contract-development dependencies. | `undici >=6.24.0`; the stricter shared target for all three Undici findings is `6.27.0`. |
| High, CVSS 7.5 | `undici@5.29.0` | `GHSA-v9p9-hfj2-hcw8` / `CVE-2026-2229` | Invalid WebSocket compression negotiation can cause an uncaught exception and terminate the Node process. | Same reporter path as above. | No. | `undici >=6.24.0`; shared target `6.27.0`. |
| High, CVSS 7.5 | `undici@5.29.0` | `GHSA-vxpw-j846-p89q` / `CVE-2026-12151` | An attacker-controlled WebSocket endpoint can exhaust memory through an unbounded number of continuation frames. | Same reporter path as above. | No. | `undici >=6.27.0`. |
| High, CVSS 8.1 | `lodash-es@4.17.21` | `GHSA-r5fr-rjxr-66jc` / `CVE-2026-4800` | Untrusted `_.template` import key names can reach a `Function()` constructor and execute injected code. | `@egog/contracts` → `hardhat-toolbox-viem` → `@nomicfoundation/ignition-core` → `lodash-es` | No. Ignition is included by the development toolbox and is not imported by the Next.js app. | `lodash-es >=4.18.0`; current release is `4.18.1`. |

Primary references:

- <https://github.com/advisories/GHSA-vrm6-8vpv-qv8q>
- <https://github.com/advisories/GHSA-v9p9-hfj2-hcw8>
- <https://github.com/advisories/GHSA-vxpw-j846-p89q>
- <https://github.com/advisories/GHSA-r5fr-rjxr-66jc>

## Scope and exploitability

- `@nomicfoundation/hardhat-toolbox-viem@5.0.7`, `hardhat@3.9.1`,
  `@nomicfoundation/hardhat-node-test-reporter@3.1.0`, and
  `@nomicfoundation/ignition-core@3.1.8` are their current published versions.
  A normal top-level upgrade therefore does not remove these findings today.
- `pnpm --filter @egog/web list --prod --depth 20` contains neither the
  vulnerable `undici` runtime package nor `lodash-es`. Entries named
  `undici-types` are TypeScript declarations and are not the vulnerable runtime.
- The vulnerable path can affect local or CI contract tests and deployment
  tooling if the affected code paths are exercised. It does not expose the
  deployed Vercel application or Solidity contract bytecode to these packages.
- Current EGOG contract code does not import Ignition and does not pass external
  data to `_.template`. The Node test reporter transitively installs Undici but
  EGOG does not directly create a WebSocket through that path. This lowers
  immediate exploitability but does not make a failing High audit acceptable for
  final Scope closure.

## Remediation options

### A — Targeted, tested transitive resolutions (recommended)

Add narrowly scoped pnpm overrides for the vulnerable transitive packages:

- Resolve the reporter path from `undici@5.29.0` to `undici@6.27.0`.
- Resolve Ignition's `lodash-es@4.17.21` to `lodash-es@4.18.1`.

This is the smallest change that can clear all four High findings while keeping
the existing Hardhat 3 test and deployment architecture. The Undici change
crosses a major-version boundary outside `@actions/http-client@2.2.3`'s declared
`^5.25.4` range, and Ignition currently pins lodash-es exactly. Therefore these
resolutions must not be treated as safe based on installation alone.

Required validation before acceptance:

1. Fresh `pnpm install --frozen-lockfile=false` without `--force`.
2. Confirm the exact resolved paths with `pnpm list` and `pnpm audit`.
3. Run all 11 Hardhat scenarios and contract coverage.
4. Run contract build and a deployment-script dry run against an isolated local
   Hardhat network; do not redeploy Production merely to test dependency
   compatibility.
5. Run repository lint, typecheck, all Vitest projects, Next.js Production
   build, and `verify:demo`.
6. Reject the overrides and return to the unchanged lockfile if any behavior or
   type compatibility fails; do not add a fallback code path.

### B — Wait for upstream Hardhat releases

Keep the dependency graph unchanged until the Hardhat reporter and Ignition
packages publish patched dependency ranges. This avoids out-of-range resolutions
but leaves the High audit failing, so the final MVP Scope cannot be marked
complete in the meantime.

### C — Recompose the Hardhat plugin stack

Replace the aggregate toolbox with individually selected plugins and change the
test-runner architecture to eliminate the reporter and unused Ignition path.
This is structurally clean but materially broader: the current tests depend on
Hardhat's Node test runner, Viem assertions, network helpers, and Viem plugin.
It would require a test-runner migration or equivalent plugin redesign and is
not recommended during final Scope closure unless option A proves incompatible.

## Applied dependency paths

`pnpm --filter @egog/contracts why undici` resolves one version,
`undici@6.27.0`. The paths are entirely beneath Hardhat development tooling:

- the Node test reporter path through `@actions/http-client@2.2.3`;
- Hardhat utility, error, Ignition, verification, and Viem plugin paths.

`pnpm --filter @egog/contracts why lodash-es` resolves one version,
`lodash-es@4.18.1`, exclusively through
`@nomicfoundation/ignition-core@3.1.8` and the Hardhat toolbox.

Both `pnpm --filter @egog/web why undici --prod` and
`pnpm --filter @egog/web why lodash-es --prod` return no dependency path.
The preserved command output is in
[why-and-resolution.md](./evidence/2026-07-13/dependency-audit/why-and-resolution.md).

## Compatibility validation

| Gate | Result | Evidence |
| --- | --- | --- |
| Hardhat contract scenarios | PASS | 11 existing contract scenarios pass. |
| Deployment-target regression tests | PASS | 3 tests pass; total Hardhat test count is 14. |
| Contract coverage | PASS | 93.94% lines and 91.11% statements. |
| Local deployment dry-run | PASS | Isolated chain ID 91342 deployment, project activation, role and state verification completed. |
| ESLint | PASS | Repository lint exits 0. |
| TypeScript | PASS | Fresh Turbo run exits 0. |
| Vitest | PASS | 26 files and 89 tests pass, including Account Menu, shared Delete Account Dialog, and all USER/WALLET/IP/GLOBAL rate-limit regressions. |
| Production build | PASS | Fresh uncached Turbo build exits 0. |
| Dependency audit | PASS | 0 high, 0 critical; Production audit has no known vulnerabilities. |
| `verify:demo` | PASS | New Demo DB/contract verify successfully with member counter 2. |

The first install attempt inherited the user's global npm setting
`force=true`. No `--force` argument was issued, but this inherited setting was
not accepted as evidence. After explicit approval, the single `force=true`
entry was removed from `~/.npmrc` while preserving the remaining npm settings.
`pnpm config get force` now returns `undefined` and `npm config get force`
returns `false`. The dependency tree, audit, type checks, tests, coverage,
deployment dry-run, and direct Production build were then reproduced without a
force override or warning.

## Final disposition

Option A is accepted. The overrides are an explicit reviewed security
resolution, not a temporary fallback. Future Hardhat upgrades should retest
whether upstream ranges have been corrected before removing either override.
