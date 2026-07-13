# EGOG legacy demo evidence — 2026-07-13

This document freezes the first EGOG Demo environment as legacy evidence. The
environment is not an active Production target. Its database, contract,
transactions, IPFS objects, and hashes must not be deleted, overwritten, or
mixed with the replacement Demo environment.

## Environment identity

| Item | Legacy value |
| --- | --- |
| Supabase project | `EGOG Demo` (legacy project ref `jifvhxyobwowkxqwwttr`) |
| GIWA Demo contract | `0xE97Cf932E2b8C87bEBAb27b8EcA8EFEc71F29E46` |
| Production deployment | `dpl_HDD1hD698cMh6tqrJiLp95Wnnb18` |
| Source commit | `174fbf37be646b95701b864440d45cee4d7a3aa0` |
| Recorded state | 3 projects, 3 Vietnam snapshots, 1 confirmed participation |

## Immutable Snapshot and Badge evidence

| Item | Legacy value |
| --- | --- |
| Snapshot version | `3` |
| Snapshot hash | `0x5d5de8920f82fb7753e1e9cb383bd319befa846c74f26583a841183e5eaecf27` |
| Snapshot URI | `ipfs://bafkreied3i5pfzn7eeiietcnif3k5r7dmpxshjiz63gtbwzticmvpqoo3i` |
| Snapshot measured at | `2026-07-20T00:00:00Z` |
| Snapshot published at | `2026-07-20T09:00:00Z` |
| Badge metadata URI | `ipfs://bafkreids6xvie3yy2xs6adywxdu3wlf3gkyo5bceub3jislediphaxhepy` |
| Badge image URI | `ipfs://bafkreiap6bsh7lyxqu2glomh6fnqehkrv4e2hbpfufjy4ossi5yynvij3e` |

## On-chain participation

| Event field | Legacy value |
| --- | --- |
| Transaction hash | `0x9afee5a8e5331b441fabe4cc904ee369aab6a1f6f1d16d10104ee69c917bd0cc` |
| Block number | `30558345` |
| Log index | `23` |
| Participant | `0xFD80B37ee01c578D8aFE408B93818b5B48c2ECAe` |
| Project ID | `0x1e7fc9065358e5dc6efa1097f171dcee735339d3ac39c01184dd238549741fe1` |
| Token ID | `1` |
| Member number | `1` |
| Snapshot version | `3` |
| Snapshot hash | `0x5d5de8920f82fb7753e1e9cb383bd319befa846c74f26583a841183e5eaecf27` |
| Snapshot URI | `ipfs://bafkreied3i5pfzn7eeiietcnif3k5r7dmpxshjiz63gtbwzticmvpqoo3i` |
| Joined at | `2026-07-13T00:44:21Z` (`1783903461`) |

## Reason for replacement

The v3 Snapshot was published on `2026-07-20`, while Badge #1 referenced it on
`2026-07-13`. This chronology cannot be corrected by mutating the existing
Snapshot because that would invalidate its content hash and the immutable
on-chain evidence. The replacement Demo therefore uses a new Supabase project,
a new contract, and newly published v1–v3 objects. The legacy environment stays
intact as evidence of the superseded run.

## Isolation rules

- Never point Production at the legacy Supabase project or contract again.
- Never reuse a legacy Snapshot CID, metadata CID, sync cursor, or participation row.
- Never update legacy Snapshot JSON under an existing CID or hash.
- Any future audit must label these records `legacy demo evidence`.
- The replacement Demo must have its own Admin, Relayer, contract address,
  database URLs, Snapshot CIDs, cron cursor, and Production deployment record.
