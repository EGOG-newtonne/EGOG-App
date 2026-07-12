# EGOG External Prerequisites

## Rules

- Dev and Demo values are stored separately in local `.env.local` files and Vercel environment settings.
- Secret values must never be written in this document, Git, issue comments, screenshots, or logs.
- Record only the resource name, owner, status, and verification date below.
- `NEXT_PUBLIC_*` values are public by design. Every other variable is server-only.
- Copy `.env.example` to `.env.local`, then obtain each value from its issuing owner.

## Environment contract

| Variable | Exposure | Issuer / owner | Dev resource | Demo resource | Verification |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | Public | Infra | `dev` | `demo` | Vercel target-specific value |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Public | Privy / Product owner | `EGOG` (`cmrhtodio00xj0dla4952yo13`) | Same app | Google login enabled |
| `PRIVY_APP_SECRET` | Secret | Privy / Infra | Vercel encrypted value | Vercel encrypted value | Value stored without documentation exposure |
| `DATABASE_URL` | Secret | Supabase / Infra | `EGOG Dev` | `EGOG Demo` | Transaction pooler URL stored |
| `DATABASE_DIRECT_URL` | Secret | Supabase / Infra | `EGOG Dev` | `EGOG Demo` | Direct migration URL stored |
| `PINATA_JWT` | Secret | Pinata / Infra | `EGOG Dev` key | `EGOG Demo` key | Both tokens return HTTP 200 |
| `NEXT_PUBLIC_PINATA_GATEWAY_URL` | Public | Pinata / Infra | `gateway.pinata.cloud/ipfs` | Same gateway | Public gateway selected |
| `AWS_S3_BUCKET` | Server-only config | AWS / Infra | `egog-mvp-dev-200151116034` | `egog-mvp-demo-200151116034` | Private object write/read/delete passed |
| `AWS_REGION` | Server-only config | AWS / Infra | `ap-northeast-2` | `ap-northeast-2` | Matches both buckets |
| `AWS_ACCESS_KEY_ID` | Secret | AWS / Infra | `egog-mvp-s3` access key | Same least-privilege key | Account-wide bucket listing denied |
| `AWS_SECRET_ACCESS_KEY` | Secret | AWS / Infra | `egog-mvp-s3` access key | Same least-privilege key | Never written to Git or this document |
| `GIWA_RPC_URL` | Secret server config | GIWA RPC provider / Infra | `sepolia-rpc.giwa.io` | `sepolia-rpc.giwa.io` | Chain ID request succeeds |
| `GIWA_CHAIN_ID` | Server-only config | GIWA / Infra | `91342` | `91342` | Chain ID matches RPC |
| `PARTICIPATION_CONTRACT_ADDRESS` | Server-only config | Contract owner / Contract engineer | `0x4f0D8b9A1624177cF21373Ab184d053443489FD5` | `0xE97Cf932E2b8C87bEBAb27b8EcA8EFEc71F29E46` | Bytecode, roles, and active project verified |
| `GIWA_RELAYER_PRIVATE_KEY` | Secret | Wallet owner / Infra | `0xc0f8380B4629B3142728F9755C784dA6b9B70881` | `0x5256FD2BB9d34d9a02103cb2AEC2458356aCED1a` | Each wallet funded with 0.05 test ETH |
| `CRON_SECRET` | Secret | Infra | `EGOG Dev` generated secret | `EGOG A04 Demo CRON_SECRET` | Stored locally and in Vercel; endpoint test awaits route implementation |
| `NEXT_PUBLIC_GIWA_RPC_URL` | Public | GIWA RPC provider / Infra | `https://sepolia-rpc.giwa.io` | Same endpoint | Browser/server RPC available |
| `NEXT_PUBLIC_GIWA_EXPLORER_URL` | Public | GIWA / Infra | `https://sepolia-explorer.giwa.io` | Same explorer | Explorer opens |
| `NEXT_PUBLIC_GIWA_CHAIN_ID` | Public | GIWA / Infra | `91342` | `91342` | Matches server chain ID |
| `NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS` | Public | Contract owner / Contract engineer | Dev contract above | Demo contract above | Matches server contract address in every Vercel target |

## Supabase connection policy

- `DATABASE_URL` is the Supavisor transaction pooler URL on port `6543`. It is used by the Vercel runtime and must not use prepared statements.
- `DATABASE_DIRECT_URL` is the direct Postgres URL on port `5432`. It is used only for migrations and one-off administrative commands.
- Create separate Supabase projects for Dev and Demo. Do not point both environments at the same database.
- If the execution environment cannot reach the direct IPv6 endpoint, resolve the network requirement before running migrations. Do not substitute the runtime pooler for migration work.

## External resource checklist

| Resource | Owner | Dev evidence | Demo evidence | Verified at |
| --- | --- | --- | --- | --- |
| Privy app, Google login, allowed domains | Product owner + Infra | [x] `EGOG`, Google + embedded wallet, localhost | [x] Stable production origin `https://egog-app-web.vercel.app` added | 2026-07-12 KST |
| Supabase project and both connection URLs | Infra | [x] `EGOG Dev` | [x] `EGOG Demo` | 2026-07-12 KST |
| Pinata public IPFS key and gateway | Infra | [x] `EGOG Dev`, auth HTTP 200 | [x] `EGOG Demo`, auth HTTP 200 | 2026-07-12 KST |
| S3 private raw/backup storage and least-privilege credentials | Infra | [x] Dev bucket smoke passed | [x] Demo bucket smoke passed | 2026-07-12 KST |
| GIWA Admin wallet, Relayer wallet, and test ETH | Contract owner + Infra | [x] Admin/Relayer split, each funded | [x] Admin/Relayer split, each funded | 2026-07-12 KST |
| GIWA participation contract deployment | Contract engineer | [x] Dev contract + Vietnam Brick active | [x] Demo contract + Vietnam Brick active | 2026-07-12 KST |
| Vercel project and separated environment settings | Infra | [x] `egog-app-web`, Development/Preview use Dev resources | [x] Production uses Demo resources; all 20 variables configured | 2026-07-12 KST |
| Google Stitch project and MCP access | Product designer | [x] `EGOG Climate Participation Portal`; `get_project` and `list_screens` passed | [x] API key stored in Codex config without repository exposure | 2026-07-12 KST |

## Vercel deployment evidence

| Item | Evidence |
| --- | --- |
| Project | `jewelcoredots-projects/egog-app-web` |
| Production deployment | `dpl_3xbAYyqmrEwwAa9WFySy54SeCsN7` |
| Stable public URL | `https://egog-app-web.vercel.app` |
| Immutable deployment URL | `https://egog-app-avi4il8j8-jewelcoredots-projects.vercel.app` |
| Build result | `READY`; Vercel Node.js `24.13.1`; Next.js production build passed |
| Public smoke test | HTTP `200`, HTML title `EGOG`, visible `EGOG` wordmark |

The immutable deployment URL is protected by Vercel authentication and returns an SSO redirect. The stable public alias is the user-facing origin and the Privy allowed-domain entry.

## GIWA deployment evidence

| Environment | Deployment transaction | Project activation transaction | Block |
| --- | --- | --- | --- |
| Development | `0x3e1a19827ba949daf43629f7fdcb6ca71639fe69a464582c1f0aaf706c9642bb` | `0x9d58661e12633575cdf8c4579e617302cc7685a19a9bbf63bbb71424685c94e6` | `30522043` / `30522101` |
| Demo | `0x0566ca1562728070306b6038c4e1cf36a7797df9a76b58c41eefd248ab404e88` | `0x23aa5b3bb63bdb74bfd086610bfb1237134142b3e49b8705385d665efcac5778` | `30522146` / `30522196` |

Both deployments are on GIWA Sepolia (`chainId=91342`). The deploy script verifies contract bytecode, `DEFAULT_ADMIN_ROLE`, `RELAYER_ROLE`, and the active `vietnam-brick` project after one-block confirmation.

## Product blocking confirmations

- [ ] **Exact submission deadline:** Product owner records the date, exact time, and timezone before schedule lock. Current planning date `2026-07-31` is not an exact confirmed deadline.
- [ ] **Newtonne feedback request owner:** Product owner assigns one named sender and records the request date, response deadline, and recipient.
- [ ] **Newtonne data outcome:** Record whether actual project data will arrive before submission. If not, retain the approved `Demonstration Data` labeling in every surface.

## Verification record

For each completed item, record:

1. resource name, never its credential value;
2. accountable owner;
3. verification date and environment;
4. smoke-test result;
5. incident/contact path if the provider is unavailable.
