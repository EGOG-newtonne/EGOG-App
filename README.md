# EGOG MVP

EGOG connects a public, versioned dMRV Snapshot with a user's signed climate-project participation record on GIWA Testnet. The current dataset is explicitly fictional `Demonstration Data`; it is not Newtonne-approved, third-party verified, or an issued carbon credit.

## Product flow

1. Browse three public projects; Vietnam Brick is active and two projects are Coming Soon.
2. Review monitored reduction, forecast, source details, version history, and on-chain reference status.
3. Sign in with Google through Privy and use the automatically provisioned embedded EVM wallet.
4. Accept the permanent on-chain-record notice and optionally opt in to email updates.
5. Sign an EIP-712 participation message without gas.
6. EGOG publishes immutable badge metadata, relays the GIWA transaction, waits for one confirmation, and mints a non-transferable ERC-721/ERC-5192 badge.
7. Compare the Snapshot at join with the latest Snapshot on My Page.

## Workspace

```text
apps/web                 Next.js UI, API, Drizzle runtime
packages/contracts       Hardhat, ParticipationBadge, contract tests
packages/contract-types  Shared ABI
packages/shared          Snapshot schema/hash and EIP-712 types
data/projects            Demonstration project seeds and JSON Schema
scripts                  Seed and on-chain reconciliation commands
docs                     Design source, runbooks, execution plan, QA evidence
```

## Local development

Requirements: Node.js 24.13.x and pnpm 10.33.x.

```bash
cp .env.example apps/web/.env.local
pnpm install
pnpm db:migrate
pnpm seed:projects --env=dev
pnpm dev
```

Secrets belong only in `apps/web/.env.local` or encrypted deployment settings. Never commit them. The public and server environment contracts fail at startup when values are missing or malformed.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm build
pnpm sync:onchain
```

See [Demo operations](docs/runbooks/demo-operations.md), [external prerequisites](docs/runbooks/external-prerequisites.md), and [QA evidence](docs/qa/2026-07-13-mvp-verification.md).

## Legal boundary

The badge is non-transferable and conveys no investment right, financial return, carbon-credit ownership, purchase right, or guaranteed future benefit. The included Privacy Policy and Terms are MVP notices and require legal review before a production launch.
