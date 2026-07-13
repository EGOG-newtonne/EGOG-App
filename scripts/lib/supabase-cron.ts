export const ONCHAIN_SYNC_CRON_NAME = "egog-onchain-sync-recovery";
export const ONCHAIN_SYNC_SCHEDULE = "*/10 * * * *";
export const ONCHAIN_SYNC_URL_VAULT_NAME = "egog_onchain_sync_url";
export const ONCHAIN_SYNC_SECRET_VAULT_NAME = "egog_onchain_sync_secret";

export function buildOnchainSyncCronCommand() {
  return `
select net.http_get(
  url := (
    select decrypted_secret
    from vault.decrypted_secrets
    where name = '${ONCHAIN_SYNC_URL_VAULT_NAME}'
  ),
  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = '${ONCHAIN_SYNC_SECRET_VAULT_NAME}'
    ),
    'User-Agent', 'EGOG-Supabase-Cron/1.0'
  ),
  timeout_milliseconds := 30000
) as request_id;
`.trim();
}
