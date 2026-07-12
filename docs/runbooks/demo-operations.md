# EGOG Demo Operations

## Environment boundaries

| Environment | Database | Contract | Relayer | Storage |
| --- | --- | --- | --- | --- |
| Development | EGOG Dev Supabase | Dev ParticipationBadge | Dev Relayer | Dev Pinata key and S3 bucket |
| Demo / Production | EGOG Demo Supabase | Demo ParticipationBadge | Demo Relayer | Demo Pinata key and S3 bucket |

Never mix a database, contract, relayer, or storage credential across rows. `NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS` and `PARTICIPATION_CONTRACT_ADDRESS` must always match.

## Database and seed

Run migrations with a port-5432 Supabase direct or Supavisor session connection. Runtime requests use the port-6543 transaction pooler.

```bash
pnpm db:migrate
pnpm seed:projects --env=dev
pnpm seed:projects --env=demo --env-file=/absolute/path/to/demo.env
```

Seed is idempotent. An existing project/version with a different canonical hash is rejected; published Snapshot rows are never overwritten. Actual Newtonne data must be introduced as a new version, not as an edit to demonstration history.

## Reconciliation and retries

```bash
pnpm sync:onchain
pnpm sync:onchain -- --env-file=/absolute/path/to/demo.env
```

The operation:

1. reads `ParticipationRecorded` from `lastSyncedBlock + 1`;
2. de-duplicates by transaction hash and log index;
3. recovers requests by transaction hash or project/wallet/member identity;
4. reconciles the cached member count from the contract;
5. checks submitted receipts;
6. retries failed metadata publication or relayer submission up to three times using the same reserved member number, metadata URI, nonce, and user signature.

Never manually mint around a failed request. Inspect `participation_requests.status`, `last_error_code`, and `retry_count`, then run reconciliation.

## Operational checks

Run these read-only queries in the matching Supabase environment before a demo and after an incident:

```sql
select status, count(*)
from participation_requests
group by status
order by status;

select project_id, count(*) as confirmed_participations,
       max(member_number) as latest_member_number
from participations
group by project_id;

select key, last_synced_block, updated_at
from sync_state
order by key;

select action, reason, count(*)
from rate_limit_events
where blocked = true and created_at >= now() - interval '24 hours'
group by action, reason
order by count(*) desc;
```

Compare `projects.cached_member_count` with the contract member counter by running `pnpm verify:demo`; the chain value is authoritative. Check the Relayer balance on GIWA Explorer before every demo. A low balance, non-advancing `last_synced_block`, rising `FAILED_RETRYABLE` count, or storage publication error blocks new demo participation until resolved.

The production Cron endpoint requires `Authorization: Bearer $CRON_SECRET`. The intended schedule is every 10 minutes and requires a Vercel plan that accepts `*/10 * * * *`; do not silently reduce the frequency.

## Demo reset policy

The Demo contract and its member numbers are immutable. Do not truncate Demo database participation tables after badges exist; reconciliation will restore chain records. For a genuinely clean demo, deploy a new Demo contract, activate Vietnam Brick, update both public/server contract variables, migrate a new Demo database, and seed it.

## Pre-demo checklist

- Stable URL returns HTTP 200 and shows the current commit.
- Vietnam Brick visibly says `Demonstration Data`.
- Solar Mobility and Jeju ERW are `Coming Soon` and cannot create a challenge.
- Privy Google login provisions a Privy embedded Ethereum wallet.
- Relayer and Admin addresses remain separate; Relayer has GIWA test ETH.
- One end-to-end participation confirms after one block.
- Completion links open the GIWA transaction and public IPFS Snapshot.
- My Page shows the same member/token values and joined/latest versions.
- `/api/cron/sync-onchain` rejects missing or invalid `CRON_SECRET`.
- Privacy and Terms links work on desktop and mobile.

## Incident handling

| Symptom | Evidence to inspect | Safe action |
| --- | --- | --- |
| Metadata publication failed | request status/error, Pinata auth, S3 access | Restore provider access and run reconciliation; do not reserve a new member |
| Transaction submitted but UI is processing | request tx hash and GIWA receipt | Run reconciliation; do not ask the user to sign again |
| Relayer transaction reverted | receipt reason, nonce, deadline, member counter | Let automatic retry run only while the original signature remains valid |
| DB count differs from chain | contract member counter, last sync block | Run reconciliation; chain is authoritative |
| Relayer key suspected exposed | Admin wallet and contract role state | Pause contract, revoke/replace Relayer role, rotate deployment secret |

Never put private keys, JWTs, database passwords, OAuth tokens, or raw personal identifiers in logs or support messages.
