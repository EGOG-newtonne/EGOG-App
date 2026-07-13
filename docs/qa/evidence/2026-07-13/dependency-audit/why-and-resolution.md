# Dependency Override Resolution Evidence

Verified on 2026-07-13 KST with `NPM_CONFIG_FORCE=false`.

## Applied overrides

```text
@actions/http-client@2.2.3>undici = 6.27.0
@nomicfoundation/ignition-core@3.1.8>lodash-es = 4.18.1
```

## Contract development tree

`pnpm --filter @egog/contracts why undici` reports exactly one resolved
version, `undici@6.27.0`. It is reachable only through the Hardhat development
toolchain. The direct overridden edge is:

```text
@egog/contracts (devDependencies)
└─ @nomicfoundation/hardhat-toolbox-viem@5.0.7
   └─ @nomicfoundation/hardhat-node-test-runner@3.0.17
      └─ @nomicfoundation/hardhat-node-test-reporter@3.1.0
         └─ @actions/core@1.11.1
            └─ @actions/http-client@2.2.3
               └─ undici@6.27.0
```

The package is also deduplicated into Hardhat utility/plugin branches. Every
reported branch terminates at `@egog/contracts` as a development dependency;
there is no application runtime branch.

`pnpm --filter @egog/contracts why lodash-es` reports exactly one resolved
version:

```text
@egog/contracts (devDependencies)
└─ @nomicfoundation/hardhat-toolbox-viem@5.0.7
   └─ @nomicfoundation/ignition-core@3.1.8
      └─ lodash-es@4.18.1
```

## Production exclusion

The following commands return no dependency path:

```text
pnpm --filter @egog/web why undici --prod
pnpm --filter @egog/web why lodash-es --prod
```

## Audit results

```text
pnpm audit --audit-level=high
2 vulnerabilities found
Severity: 1 low | 1 moderate

pnpm audit --prod --audit-level=high
No known vulnerabilities found
```

High: 0. Critical: 0.

## Lockfile result

- `@actions/http-client@2.2.3` resolves `undici@6.27.0`.
- `@nomicfoundation/ignition-core@3.1.8` resolves `lodash-es@4.18.1`.
- `undici@5.29.0` is absent.
- `lodash-es@4.17.21` is absent.

## Validation commands

```text
pnpm test:contracts
pnpm --filter @egog/contracts coverage
pnpm --filter @egog/contracts deploy:dry-run
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --audit-level=high
pnpm audit --prod --audit-level=high
pnpm verify:demo -- --env-file=/tmp/egog-new-production.env
```

All package installation, resolution, and final validation commands used
`NPM_CONFIG_FORCE=false`. No `--force` argument or automatic major upgrade was
used.
