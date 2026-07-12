# EOGO External Prerequisites

## Rules

- Dev and Demo values are stored separately in local `.env.local` files and Vercel environment settings.
- Secret values must never be written in this document, Git, issue comments, screenshots, or logs.
- Record only the resource name, owner, status, and verification date below.
- `NEXT_PUBLIC_*` values are public by design. Every other variable is server-only.
- Copy `.env.example` to `.env.local`, then obtain each value from its issuing owner.

## Environment contract

| Variable | Exposure | Issuer / owner | Dev resource | Demo resource | Verification |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | Public | Infra | `development` | `demo` | App banner/environment label |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Public | Privy / Product owner | Record app name | Record app name | Google login opens |
| `PRIVY_APP_SECRET` | Secret | Privy / Infra | Record secret name | Record secret name | Server token verification |
| `DATABASE_URL` | Secret | Supabase / Infra | Record project name | Record project name | Transaction pooler connection |
| `DATABASE_DIRECT_URL` | Secret | Supabase / Infra | Record project name | Record project name | Migration connection |
| `PINATA_JWT` | Secret | Pinata / Infra | Record key name | Record key name | Test pin succeeds |
| `NEXT_PUBLIC_PINATA_GATEWAY_URL` | Public | Pinata / Infra | Record gateway host | Record gateway host | Pinned JSON loads |
| `AWS_S3_BUCKET` | Server-only config | AWS / Infra | Record bucket name | Record bucket name | Private object write/read |
| `AWS_REGION` | Server-only config | AWS / Infra | Record region | Record region | Matches bucket region |
| `AWS_ACCESS_KEY_ID` | Secret | AWS / Infra | Record credential name | Record credential name | Least-privilege S3 access |
| `AWS_SECRET_ACCESS_KEY` | Secret | AWS / Infra | Record credential name | Record credential name | Least-privilege S3 access |
| `GIWA_RPC_URL` | Secret server config | GIWA RPC provider / Infra | Record endpoint name | Record endpoint name | Server RPC request succeeds |
| `GIWA_CHAIN_ID` | Server-only config | GIWA / Infra | `91342` | `91342` | Chain ID matches RPC |
| `PARTICIPATION_CONTRACT_ADDRESS` | Server-only config | Contract owner / Contract engineer | Record deployment | Record deployment | Contract bytecode exists |
| `GIWA_RELAYER_PRIVATE_KEY` | Secret | Wallet owner / Infra | Record wallet address only | Record wallet address only | Relayer is funded |
| `CRON_SECRET` | Secret | Infra | Record secret name | Record secret name | Unauthorized cron call rejected |
| `NEXT_PUBLIC_GIWA_RPC_URL` | Public | GIWA RPC provider / Infra | Record endpoint name | Record endpoint name | Browser RPC request succeeds |
| `NEXT_PUBLIC_GIWA_EXPLORER_URL` | Public | GIWA / Infra | Record explorer URL | Record explorer URL | Transaction link opens |
| `NEXT_PUBLIC_GIWA_CHAIN_ID` | Public | GIWA / Infra | `91342` | `91342` | Matches server chain ID |
| `NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS` | Public | Contract owner / Contract engineer | Record deployment | Record deployment | Matches server contract address |

## Supabase connection policy

- `DATABASE_URL` is the Supavisor transaction pooler URL on port `6543`. It is used by the Vercel runtime and must not use prepared statements.
- `DATABASE_DIRECT_URL` is the direct Postgres URL on port `5432`. It is used only for migrations and one-off administrative commands.
- Create separate Supabase projects for Dev and Demo. Do not point both environments at the same database.
- If the execution environment cannot reach the direct IPv6 endpoint, resolve the network requirement before running migrations. Do not substitute the runtime pooler for migration work.

## External resource checklist

| Resource | Owner | Dev evidence | Demo evidence | Verified at |
| --- | --- | --- | --- | --- |
| Privy app, Google login, allowed domains | Product owner + Infra | [ ] | [ ] | |
| Supabase project and both connection URLs | Infra | [ ] | [ ] | |
| Pinata public IPFS key and gateway | Infra | [ ] | [ ] | |
| S3 private raw/backup storage and least-privilege credentials | Infra | [ ] | [ ] | |
| GIWA Admin wallet, Relayer wallet, and test ETH | Contract owner + Infra | [ ] | [ ] | |
| GIWA participation contract deployment | Contract engineer | [ ] | [ ] | |
| Vercel project and separated environment settings | Infra | [ ] | [ ] | |
| Google Stitch project and MCP access | Product designer | [ ] | [ ] | |

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
