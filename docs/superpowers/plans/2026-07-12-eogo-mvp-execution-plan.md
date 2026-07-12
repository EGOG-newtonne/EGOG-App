# EOGO MVP Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-07-31까지 Google 로그인 사용자가 Vietnam Brick dMRV Demonstration Snapshot을 확인하고 EIP-712 서명 후 GIWA Testnet에서 양도 불가능한 Participation Badge를 발급받는 공개 MVP를 완성한다.

**Architecture:** pnpm monorepo 안에 Next.js 앱, Hardhat 컨트랙트, 공용 Snapshot/EIP-712 패키지, ABI 패키지를 둔다. Vercel의 Next.js 서버가 Privy 인증, Supabase PostgreSQL, Pinata/S3, GIWA Relayer를 연결하며, 온체인 이벤트를 최종 기준으로 DB를 동기화한다.

**Tech Stack:** pnpm workspace, Next.js, TypeScript, Privy, Drizzle ORM, Supabase PostgreSQL, viem, Solidity, Hardhat, OpenZeppelin Contracts 5.x, ERC-721, ERC-5192, Pinata IPFS, AWS S3, Vercel, Google Stitch MCP

---

## 0. 현재 상태와 실행 원칙

- 기준 문서: `/Users/jewel/Downloads/EOGO_MVP_Final_Scope_v1.0_2026-07-12.md`
- 작업 디렉터리: `/Users/jewel/Desktop/Developement/egog`
- 현재 상태: 애플리케이션 코드와 Git 저장소가 없는 빈 작업 디렉터리. `.omx/` 런타임 파일만 존재한다.
- 목표일: 2026-07-31. 정확한 제출 시각은 외부 확인 Task로 관리한다.
- Scope Freeze: 새 기능은 본 계획에 추가하지 않는다.
- 임시 수정, mock API 대체, S3-only 발행, 수동 Stitch export 같은 fallback은 구현하지 않는다.
- 목업은 제품 범위에서 승인된 `Demonstration Data`만 사용한다. 기술 통합을 가짜 응답으로 대체하지 않는다.
- 각 Task는 독립적으로 검증 가능해야 하며, 실패한 Gate를 통과한 것으로 처리하지 않는다.

## 1. 작업 단위 경계

### 생성할 최상위 구조

```text
/Users/jewel/Desktop/Developement/egog/
  apps/
    web/                         # Next.js UI, route handlers, Privy/DB/IPFS/GIWA 연결
  packages/
    contracts/                   # Solidity, Hardhat tests, deploy scripts
    contract-types/              # ABI, chain별 contract addresses, generated types
    shared/                      # Snapshot schema/canonicalization/hash, EIP-712 types
  data/
    projects/                    # Vietnam v1-v3, Solar/Jeju Coming Soon seed JSON
  scripts/
    seed-projects.ts             # 불변 Snapshot seed
    sync-onchain.ts              # 수동 이벤트 reconciliation
    verify-demo.ts               # 제출 전 DB/chain/IPFS 검증
  docs/
    architecture/                # 상태 전이, 데이터 경계, 운영 설계
    runbooks/                    # deploy, seed, sync, incident, submission
    stitch/                      # Stitch project ID, screen mapping, token mapping
  pnpm-workspace.yaml
  package.json
  turbo.json
  .env.example
  .gitignore
```

### 파일 책임

- `packages/shared`: 앱과 컨트랙트 테스트가 공유하는 유일한 Snapshot/EIP-712 정의.
- `packages/contracts`: 온체인 규칙만 담당. 개인정보, HTTP, DB 로직 금지.
- `apps/web/src/server`: 인증된 서버 유스케이스와 외부 서비스 adapter.
- `apps/web/src/app/api`: HTTP 입력 검증과 유스케이스 호출만 담당.
- `apps/web/src/features`: Stitch 기반 화면과 상태별 UI.
- `scripts`: 운영자가 명시적으로 실행하는 seed/sync/verify 명령.

## 2. 상태·의존성 표기

- `READY`: 현재 바로 시작 가능.
- `EXTERNAL`: 계정, 키, 승인, 실제 서비스 응답이 필요.
- `BLOCKED BY`: 선행 Task 완료 후 시작.
- 우선순위 `P0`: 핵심 경로 차단 가능. `P1`: MVP 필수. `P2`: 제출·운영 완성.

## 3. Phase A — 오늘 시작 가능한 기반 작업 (2026-07-12)

### Task A01: 저장소와 pnpm monorepo 초기화

**Priority/Status:** P0 / COMPLETED  
**Owner:** Full-stack  
**Depends on:** 없음

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `apps/web/package.json`
- Create: `packages/shared/package.json`
- Create: `packages/contracts/package.json`
- Create: `packages/contract-types/package.json`

- [x] Git 저장소를 초기화하고 기본 branch를 `main`으로 설정한다.
- [x] Node와 pnpm 버전을 root `package.json`의 `engines`와 `packageManager`에 고정한다.
- [x] `apps/*`, `packages/*` workspace를 선언한다.
- [x] `dev`, `build`, `lint`, `typecheck`, `test`, `test:contracts` root script를 정의한다.
- [x] `.omx/`, `.env*`, private key, build output을 `.gitignore`에 포함한다.
- [x] 빈 workspace install/build/typecheck가 성공하는지 확인한다.

**Verify:**

```bash
pnpm install
pnpm -r typecheck
pnpm -r build
git status --short
```

**Done:** workspace 4개가 인식되고 secret이나 `.omx/` 없이 첫 bootstrap commit 생성.

### Task A02: 품질 게이트와 CI 기본선

**Priority/Status:** P0 / BLOCKED BY A01  
**Owner:** Full-stack

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `eslint.config.mjs`
- Create: `tsconfig.base.json`
- Create: `vitest.workspace.ts`

- [ ] TypeScript strict mode, ESLint, Vitest를 workspace 공통 설정으로 고정한다.
- [ ] CI에 install, lint, typecheck, unit test, contract test, build 순서를 설정한다.
- [ ] secret이 없어도 pure unit/contract tests가 실행되도록 test boundary를 분리한다.
- [ ] 실패하는 lint fixture를 만들어 CI가 실제 차단되는지 확인 후 fixture를 제거한다.

**Verify:**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm build
```

**Done:** 모든 명령 exit code 0. 이후 모든 Task가 같은 게이트 사용.

### Task A03: 환경변수 계약과 외부 준비물 체크리스트

**Priority/Status:** P0 / READY  
**Owner:** Infra + Product owner

**Files:**
- Create: `apps/web/src/env/server.ts`
- Create: `apps/web/src/env/client.ts`
- Create: `docs/runbooks/external-prerequisites.md`
- Modify: `.env.example`

- [ ] Dev/Demo 환경변수를 분리하고 각 변수의 발급 주체를 문서화한다.
- [ ] 최소 변수 계약을 정의한다: Privy app ID/secret, Supabase pooled/direct URL, Pinata JWT/gateway, S3 bucket/region/credentials, GIWA RPC/explorer/chain ID, Dev/Demo contract address, relayer key, cron secret.
- [ ] 서버 secret이 client bundle에 노출되지 않도록 server/client schema를 분리한다.
- [ ] 제출 정확한 마감 시각과 Newtonne 피드백 요청 담당자를 체크리스트에 포함한다.

**Done:** 빠진 변수에서 앱이 명확한 변수명과 함께 시작을 거부하고, 값 자체는 로그에 출력되지 않음.

### Task A04: 외부 계정과 Dev/Demo 리소스 생성

**Priority/Status:** P0 / EXTERNAL  
**Owner:** Product owner + Infra  
**Depends on:** A03

- [ ] Privy app을 만들고 Google login, localhost, Vercel Preview/Production allowed domain을 설정한다.
- [ ] Supabase Dev와 Demo 프로젝트를 각각 생성하고 pooled/direct connection string을 보관한다.
- [ ] Pinata public IPFS credential과 전용 gateway를 생성한다.
- [ ] S3 private/raw/backup 저장 정책과 bucket을 생성한다.
- [ ] GIWA Dev/Demo Admin Wallet과 Relayer Wallet을 분리 생성하고 Test ETH를 확보한다.
- [ ] Vercel project와 Preview/Production 환경을 생성한다.
- [ ] Google Stitch project를 만들고 Stitch MCP 접근을 연결한다.

**Done:** `docs/runbooks/external-prerequisites.md`의 모든 항목에 owner, resource name, 확인일이 기록되고 실제 서비스 smoke check 통과. 키 값은 문서에 기록하지 않음.

## 4. Phase B — P0 기술 게이트 (2026-07-13~14)

### Task B01: 공용 GIWA chain과 EIP-712 타입 정의

**Priority/Status:** P0 / BLOCKED BY A01  
**Owner:** Contract + Full-stack

**Files:**
- Create: `packages/shared/src/chain/giwa.ts`
- Create: `packages/shared/src/eip712/participation.ts`
- Create: `packages/shared/src/eip712/participation.test.ts`
- Create: `packages/shared/src/index.ts`

- [ ] GIWA Testnet chain ID, native currency, RPC/explorer 환경 경계를 정의한다.
- [ ] `EOGO Participation` domain과 Participation message 타입을 단일 export로 만든다.
- [ ] participant, projectId, snapshotHash, snapshotVersion, snapshotURI, memberNumber, tokenURI, nonce, deadline 필드 순서를 고정한다.
- [ ] 동일 입력 digest 일치, 한 필드 변경 시 digest 변경, Dev/Demo contract domain 분리 테스트를 작성한다.

**Verify:**

```bash
pnpm --filter @eogo/shared test -- participation.test.ts
```

**Done:** frontend, server, Hardhat test가 같은 typed-data builder를 import 가능.

### Task B02: Privy Google 로그인과 Embedded Wallet 서명 PoC

**Priority/Status:** P0 / BLOCKED BY A04, B01  
**Owner:** Full-stack

**Files:**
- Create: `apps/web/src/app/providers.tsx`
- Create: `apps/web/src/app/poc/privy/page.tsx`
- Create: `apps/web/src/features/auth/privy-provider.tsx`
- Create: `apps/web/src/features/auth/sign-participation-poc.tsx`
- Test: `apps/web/src/features/auth/sign-participation-poc.test.tsx`

- [ ] Google login만 노출하고 로그인 시 Embedded EVM wallet이 생성되는지 확인한다.
- [ ] 축약 wallet address를 표시한다.
- [ ] B01 typed data를 Embedded Wallet로 서명한다.
- [ ] 서버에서 recovered signer가 Embedded Wallet 주소와 같은지 검증한다.
- [ ] 로그인 취소, 서명 거절, 잘못된 signer 상태를 성공과 구분한다.

**Done:** 실제 Privy Dev app에서 로그인 → wallet provisioning → typed-data signature → signer verification 녹화와 검증 로그 확보. secret/전체 signature는 로그에 남기지 않음.

### Task B03: ParticipationBadge 컨트랙트 골격과 서명 검증

**Priority/Status:** P0 / BLOCKED BY A01, B01  
**Owner:** Contract

**Files:**
- Create: `packages/contracts/contracts/ParticipationBadge.sol`
- Create: `packages/contracts/contracts/interfaces/IERC5192.sol`
- Create: `packages/contracts/test/ParticipationBadge.spec.ts`
- Create: `packages/contracts/hardhat.config.ts`

- [ ] ERC-721, EIP-712, AccessControl, Pausable 기반 컨트랙트를 작성한다.
- [ ] Admin/Relayer role, multi-project active flag, project counter를 구현한다.
- [ ] `joinBySig`에서 deadline, signer, nonce, expected member number, project uniqueness를 검증한다.
- [ ] ParticipationRecorded event에 scope의 모든 필드를 포함한다.
- [ ] transfer, safeTransfer, approve, operator approval, burn 경로를 차단하고 ERC-5192 `locked=true`를 구현한다.
- [ ] 정상, replay, expiry, identity, tamper, access, uniqueness, soulbound, counter 테스트를 각각 작성한다.

**Verify:**

```bash
pnpm --filter @eogo/contracts test
pnpm --filter @eogo/contracts coverage
```

**Done:** Scope 7.6의 모든 시나리오 자동 테스트 통과.

### Task B04: GIWA Dev 배포와 Relayer receipt PoC

**Priority/Status:** P0 / BLOCKED BY A04, B03  
**Owner:** Contract + Infra

**Files:**
- Create: `packages/contracts/scripts/deploy.ts`
- Create: `packages/contracts/scripts/configure-projects.ts`
- Create: `packages/contract-types/src/addresses.ts`
- Create: `packages/contract-types/src/participation-badge.ts`
- Create: `docs/runbooks/deploy-contract.md`

- [ ] Dev Admin으로 컨트랙트를 GIWA Testnet에 배포한다.
- [ ] Dev Relayer role을 부여하고 Vietnam project를 활성화한다.
- [ ] 실제 Privy 서명을 Dev Relayer가 `joinBySig`로 제출한다.
- [ ] 1 block receipt와 ParticipationRecorded event를 viem으로 파싱한다.
- [ ] ABI와 Dev 주소를 `contract-types`에 게시한다.

**Done:** GIWA Explorer에서 실제 Dev transaction, event, NFT owner, `locked=true` 확인. B02+B04가 P0 Gate 통과 증거.

### Task B05: Pinata + S3 원자산 저장 PoC

**Priority/Status:** P0 / BLOCKED BY A04  
**Owner:** Backend/Infra

**Files:**
- Create: `apps/web/src/server/storage/pinata.ts`
- Create: `apps/web/src/server/storage/s3.ts`
- Create: `apps/web/src/server/storage/storage.test.ts`
- Create: `apps/web/src/app/poc/storage/route.ts`

- [ ] Public JSON과 Badge image를 Pinata public IPFS에 업로드한다.
- [ ] 같은 원자산을 S3 backup key 규칙으로 저장한다.
- [ ] 반환 CID, `ipfs://` URI, gateway URL을 구분한다.
- [ ] gateway에서 JSON content-type과 image가 실제 조회되는지 확인한다.
- [ ] 업로드 실패는 성공 상태나 가짜 URI로 변환하지 않는다.

**Done:** 실제 CID와 S3 object가 존재하고 byte hash가 일치.

### Task B06: Stitch MCP 대표 화면 연결 Gate

**Priority/Status:** P0 / BLOCKED BY A04  
**Owner:** Design + Frontend

**Files:**
- Create: `docs/stitch/project.md`
- Create: `docs/stitch/screen-map.md`
- Create: `docs/stitch/design-tokens.md`

- [ ] Stitch에 EOGO wordmark와 Modern Climate Technology 방향을 설정한다.
- [ ] Vietnam Brick Project Detail Desktop 대표 화면을 생성한다.
- [ ] Stitch MCP로 project/screen 정보를 실제 조회한다.
- [ ] color, typography, spacing, radius, shadow, breakpoint token을 문서화한다.
- [ ] 왼쪽 data content + 오른쪽 sticky participation panel 구조를 승인한다.

**Done:** Stitch MCP에서 대표 screen을 재조회할 수 있고 screen ID/token mapping이 저장소에 기록됨.

## 5. Phase C — 데이터·DB 기반 (2026-07-15~16)

### Task C01: Snapshot schema, canonicalization, hash

**Priority/Status:** P0 / BLOCKED BY A02  
**Owner:** Full-stack/Data

**Files:**
- Create: `packages/shared/src/snapshot/schema.ts`
- Create: `packages/shared/src/snapshot/canonicalize.ts`
- Create: `packages/shared/src/snapshot/hash.ts`
- Create: `packages/shared/src/snapshot/snapshot.test.ts`

- [ ] Scope 5.3 public fields를 Zod schema로 정의한다.
- [ ] Decimal string, UTC ISO timestamp, null, key order를 강제한다.
- [ ] UI-only field가 canonical payload에 들어가지 않도록 분리한다.
- [ ] UTF-8 canonical JSON의 keccak256을 생성한다.
- [ ] key order 무관 동일 hash, 의미 필드 변경 시 다른 hash, float/잘못된 unit 거부 테스트를 작성한다.

**Done:** canonical JSON golden fixture와 expected hash가 고정됨.

### Task C02: Demonstration project seed 3종 작성

**Priority/Status:** P1 / BLOCKED BY C01  
**Owner:** Data + Product

**Files:**
- Create: `data/projects/vietnam-brick.json`
- Create: `data/projects/solar-mobility.json`
- Create: `data/projects/jeju-erw.json`
- Create: `data/projects/schema.json`
- Test: `packages/shared/src/snapshot/seed-fixtures.test.ts`

- [ ] Vietnam v1/v2/v3에 120000/240000/336000 tCO2e와 MONITORING/MONITORING/VALIDATION을 입력한다.
- [ ] 모든 metric에 source, measuredAt, sourceVersion, verification note를 연결한다.
- [ ] Registry/Methodology를 `Demonstration Data`와 분리될 수 없는 구조로 표시한다.
- [ ] Solar/Jeju는 Coming Soon이며 참여 가능한 Snapshot을 만들지 않는다.
- [ ] 세 버전 hash가 고유하고 v3가 current인지 테스트한다.

**Done:** 실제 데이터로 오해 가능한 unlabeled 값 0건. Newtonne 피드백은 새 Snapshot 입력으로만 반영.

### Task C03: Drizzle schema와 migrations

**Priority/Status:** P0 / BLOCKED BY A04, C01  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/server/db/schema.ts`
- Create: `apps/web/src/server/db/client.ts`
- Create: `apps/web/drizzle.config.ts`
- Create: `apps/web/drizzle/0000_initial.sql`
- Create: `apps/web/src/server/db/schema.test.ts`

- [ ] users, projects, project_snapshots, participation_requests, participations, onchain_events, sync_state, rate_limit_events 테이블을 정의한다.
- [ ] project/version, wallet/project, txHash/logIndex, idempotency key unique constraint를 DB에서 강제한다.
- [ ] Snapshot update/delete를 앱 권한에서 금지하고 새 version insert만 허용한다.
- [ ] 상태 enum과 24시간 expiry 필드를 정의한다.
- [ ] Dev migration up과 clean DB 재적용을 검증한다.

**Done:** Supabase Dev에서 migration 재현 가능, 제약 위반 테스트 통과.

### Task C04: Seed와 Snapshot IPFS publish 명령

**Priority/Status:** P1 / BLOCKED BY B05, C02, C03  
**Owner:** Backend/Data

**Files:**
- Create: `scripts/seed-projects.ts`
- Create: `scripts/lib/publish-snapshot.ts`
- Create: `scripts/seed-projects.test.ts`
- Modify: `package.json`

- [ ] JSON을 schema 검증하고 canonical hash를 계산한다.
- [ ] public Snapshot JSON을 Pinata와 S3에 저장한다.
- [ ] immutable Snapshot row를 insert하고 currentSnapshotId를 v3로 갱신한다.
- [ ] 동일 입력 재실행 시 중복 row/CID 참조를 만들지 않는 idempotency를 구현한다.
- [ ] `pnpm seed:projects --env dev` 명령을 제공한다.

**Done:** Dev DB에 3 projects, Vietnam 3 immutable snapshots, public CID/hash 존재.

## 6. Phase D — Vertical Slice (2026-07-16~18)

### Task D01: Public project query API

**Priority/Status:** P0 / BLOCKED BY C03, C04  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/app/api/projects/route.ts`
- Create: `apps/web/src/app/api/projects/[slug]/route.ts`
- Create: `apps/web/src/server/projects/project-service.ts`
- Test: `apps/web/src/server/projects/project-service.test.ts`

- [ ] 목록은 3개 프로젝트, data type, Coming Soon, cached member count를 반환한다.
- [ ] 상세는 Vietnam current snapshot, history, chart 가능 여부, source details, on-chain reference 상태를 반환한다.
- [ ] 비공개 raw data와 개인정보가 response에 포함되지 않음을 테스트한다.

**Done:** 미인증 요청 200, Vietnam만 참여 가능.

### Task D02: Privy 서버 인증과 user provisioning

**Priority/Status:** P0 / BLOCKED BY B02, C03  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/server/auth/verify-privy.ts`
- Create: `apps/web/src/server/auth/require-user.ts`
- Create: `apps/web/src/server/users/upsert-user.ts`
- Test: `apps/web/src/server/auth/verify-privy.test.ts`

- [ ] Privy access token을 서버 SDK로 검증한다.
- [ ] Privy user, email, embedded wallet을 users row와 연결한다.
- [ ] 요청 wallet이 로그인 사용자의 embedded wallet인지 검증한다.
- [ ] 외부 wallet과 client-supplied identity를 신뢰하지 않는다.

**Done:** valid/expired/forged token과 wallet mismatch 테스트 통과.

### Task D03: Participation challenge와 consent API

**Priority/Status:** P0 / BLOCKED BY D01, D02  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/app/api/participations/challenge/route.ts`
- Create: `apps/web/src/app/api/participations/[id]/consent/route.ts`
- Create: `apps/web/src/server/participations/create-challenge.ts`
- Create: `apps/web/src/server/participations/save-consent.ts`
- Test: `apps/web/src/server/participations/create-challenge.test.ts`

- [ ] CTA 시점의 Snapshot ID/version/hash/URI를 request에 고정한다.
- [ ] 10분 deadline과 1회용 nonce, 24시간 request expiry를 생성한다.
- [ ] 같은 user/project의 유효한 미완료 request를 재사용한다.
- [ ] 필수 온체인 동의와 선택 email opt-in을 독립 저장한다.
- [ ] 완료 참여와 Coming Soon project challenge를 거부한다.

**Done:** duplicate click, expired draft, optional consent off 테스트 통과.

### Task D04: Metadata 생성과 프로젝트별 발행 lock

**Priority/Status:** P0 / BLOCKED BY B05, C03, D03  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/server/participations/metadata.ts`
- Create: `apps/web/src/server/participations/project-lock.ts`
- Create: `apps/web/src/server/participations/reserve-member.ts`
- Test: `apps/web/src/server/participations/reserve-member.test.ts`

- [ ] PostgreSQL advisory lock key를 project ID에서 결정적으로 생성한다.
- [ ] 온체인 member counter + 1을 expectedMemberNumber로 사용한다.
- [ ] 공통 Badge image와 참여자별 metadata JSON을 생성한다.
- [ ] metadata를 Pinata/S3에 먼저 저장하고 request에 URI를 고정한다.
- [ ] 동시 요청 두 건이 같은 번호를 확보하지 못하도록 integration test를 작성한다.

**Done:** 동일 project 직렬화, 다른 project 병렬 가능, retry는 같은 tokenURI/member 사용.

### Task D05: Signature submit → Relayer → 1 block → DB 반영

**Priority/Status:** P0 / BLOCKED BY B04, D02, D03, D04  
**Owner:** Backend + Contract

**Files:**
- Create: `apps/web/src/app/api/participations/[id]/submit/route.ts`
- Create: `apps/web/src/server/participations/submit-participation.ts`
- Create: `apps/web/src/server/chain/relayer.ts`
- Create: `apps/web/src/server/chain/parse-participation-event.ts`
- Test: `apps/web/src/server/participations/submit-participation.test.ts`

- [ ] signature signer와 request wallet을 서버에서 복구·비교한다.
- [ ] fixed Snapshot/EIP-712 값과 client payload가 일치하는지 검증한다.
- [ ] 상태를 SIGNED → METADATA_UPLOADED → TX_SUBMITTED → CONFIRMED로 전이한다.
- [ ] 지정 Dev Relayer로 `joinBySig`를 제출하고 1 block을 기다린다.
- [ ] receipt event의 token/member/hash/URI를 DB의 최종 값으로 저장한다.
- [ ] chain 성공 후 DB write 실패 시 CONFIRMED를 위조하지 않고 reconciliation 대상 상태를 남긴다.

**Done:** 실제 Dev 환경에서 Google login부터 Confirmed까지 최초 Vertical Slice 성공.

### Task D06: 최소 Participation UI와 My Page Vertical Slice

**Priority/Status:** P0 / BLOCKED BY D01, D03, D05  
**Owner:** Frontend

**Files:**
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/projects/[slug]/page.tsx`
- Create: `apps/web/src/app/participate/[projectSlug]/page.tsx`
- Create: `apps/web/src/app/me/page.tsx`
- Create: `apps/web/src/features/participation/participation-stepper.tsx`
- Test: `apps/web/src/features/participation/participation-stepper.test.tsx`

- [ ] public Discovery/Detail에서 CTA까지 연결한다.
- [ ] Sign in, Wallet ready, Review/Consent, Sign, Confirming, Complete 상태를 구현한다.
- [ ] 새로고침 후 request API로 상태를 복원한다.
- [ ] Completion에 member, token, tx, Snapshot 링크를 표시한다.
- [ ] My Page에 wallet과 참여 1건을 표시한다.

**Done:** 디자인 polish 전에도 end-to-end 핵심 경로가 실제 서비스로 동작.

## 7. Phase E — 신뢰성·운영 기능 (2026-07-19~21)

### Task E01: 상태 조회, resume, expiry, retry

**Priority/Status:** P1 / BLOCKED BY D05  
**Owner:** Backend + Frontend

**Files:**
- Create: `apps/web/src/app/api/participations/[id]/route.ts`
- Create: `apps/web/src/server/participations/get-request-state.ts`
- Create: `apps/web/src/server/participations/retry-participation.ts`
- Test: `apps/web/src/server/participations/retry-participation.test.ts`

- [ ] DRAFT/CONSENTED 24시간 expiry, signature 10분 expiry를 분리한다.
- [ ] METADATA_UPLOADED retry가 동일 CID/member를 사용한다.
- [ ] 이미 온체인 발행된 요청은 event로 DB를 복구하고 신규 mint하지 않는다.
- [ ] PROCESSING과 FAILED_RETRYABLE을 성공으로 표시하지 않는다.

**Done:** scope 상태 전이 전체 테스트 통과.

### Task E02: On-chain event sync와 count reconciliation

**Priority/Status:** P1 / BLOCKED BY D05  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/server/sync/sync-onchain.ts`
- Create: `apps/web/src/app/api/cron/sync-onchain/route.ts`
- Create: `scripts/sync-onchain.ts`
- Test: `apps/web/src/server/sync/sync-onchain.test.ts`
- Create: `vercel.json`

- [ ] lastSyncedBlock+1부터 event를 읽고 txHash+logIndex로 upsert한다.
- [ ] 누락 participation과 cachedMemberCount를 온체인 기준으로 보정한다.
- [ ] CRON_SECRET 없는 호출을 거부한다.
- [ ] 10분 Vercel Cron과 `pnpm sync:onchain --env dev|demo`를 제공한다.
- [ ] 동일 block range 재실행 idempotency를 테스트한다.

**Done:** DB participation 삭제 후 sync로 정확히 복구되는 integration test 통과.

### Task E03: PostgreSQL rate limit과 global mint cap

**Priority/Status:** P1 / BLOCKED BY C03, D03  
**Owner:** Backend

**Files:**
- Create: `apps/web/src/server/security/rate-limit.ts`
- Create: `apps/web/src/server/security/hash-rate-key.ts`
- Test: `apps/web/src/server/security/rate-limit.test.ts`

- [ ] user 3/min, IP 20/hour, global mint 200/day 규칙을 구현한다.
- [ ] IP/user 원문 대신 keyed hash를 저장한다.
- [ ] challenge/consent/submit 중 비용을 유발하는 endpoint에 규칙을 적용한다.
- [ ] 차단 사유는 기록하되 email, signature, private key를 기록하지 않는다.

**Done:** boundary time과 concurrent request 테스트 통과.

### Task E04: Account preferences와 즉시 삭제

**Priority/Status:** P1 / BLOCKED BY D02, D05  
**Owner:** Backend + Frontend

**Files:**
- Create: `apps/web/src/app/api/me/preferences/route.ts`
- Create: `apps/web/src/app/api/me/route.ts`
- Create: `apps/web/src/server/users/delete-account.ts`
- Create: `apps/web/src/features/account/delete-account-dialog.tsx`
- Test: `apps/web/src/server/users/delete-account.test.ts`

- [ ] opt-in 변경과 timestamp를 저장한다.
- [ ] 삭제 재확인 후 email/profile/Privy link를 익명화하고 participation userId 연결을 제거한다.
- [ ] Privy Delete User API 성공을 확인한다.
- [ ] wallet/tx/token/on-chain record는 유지한다.
- [ ] wallet 접근 상실과 온체인 불변성 경고를 UI에 표시한다.

**Done:** 삭제 후 로그인 세션 무효, 개인정보 null, on-chain participation 조회 가능.

## 8. Phase F — Stitch UI 통합 (2026-07-22~24)

### Task F01: Stitch token을 Next.js 디자인 시스템으로 반영

**Priority/Status:** P1 / BLOCKED BY B06, D06  
**Owner:** Frontend

**Files:**
- Create: `apps/web/src/styles/tokens.css`
- Modify: `apps/web/src/app/globals.css`
- Create: `apps/web/src/components/ui/`
- Create: `apps/web/src/components/layout/`

- [ ] Stitch MCP의 승인 token만 CSS variable/component variant로 변환한다.
- [ ] EOGO wordmark, white/charcoal, green/blue accent, typography, spacing을 적용한다.
- [ ] 공용 card, badge, button, disclosure, timeline, status component를 만든다.
- [ ] dark mode와 임의 shadcn 기본 테마를 추가하지 않는다.

**Done:** token mapping이 `docs/stitch/design-tokens.md`와 1:1 대응.

### Task F02: Discovery와 Project Detail 구현

**Priority/Status:** P1 / BLOCKED BY F01, D01  
**Owner:** Frontend

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/projects/[slug]/page.tsx`
- Create: `apps/web/src/features/projects/project-card.tsx`
- Create: `apps/web/src/features/projects/project-detail.tsx`
- Create: `apps/web/src/features/projects/reduction-chart.tsx`
- Create: `apps/web/src/features/projects/verification-timeline.tsx`

- [ ] 3 project cards와 Coming Soon 상태를 Stitch screen에 맞춘다.
- [ ] Desktop detail을 왼쪽 data + 오른쪽 sticky CTA로 구현한다.
- [ ] Mobile은 single column + bottom CTA card로 구현한다.
- [ ] Demonstration label, metric source details, conditional chart, on-chain reference 상태를 표시한다.
- [ ] Forecast/monitored, standard/raw verification state를 혼동하지 않게 표시한다.

**Done:** Stitch Desktop/Mobile reference와 시각 QA 통과, FR-DISC/Detail 충족.

### Task F03: Participation, Completion, My Page 상태 화면

**Priority/Status:** P1 / BLOCKED BY F01, E01, E04  
**Owner:** Frontend

**Files:**
- Modify: `apps/web/src/features/participation/participation-stepper.tsx`
- Create: `apps/web/src/features/participation/completion.tsx`
- Create: `apps/web/src/features/participation/processing.tsx`
- Create: `apps/web/src/features/participation/failure.tsx`
- Create: `apps/web/src/features/account/my-page.tsx`

- [ ] Logged out/in, signing, submitted, confirming, complete, retryable/final failure variants를 Stitch 상태와 연결한다.
- [ ] required/optional consent와 Privacy/Terms 링크를 제공한다.
- [ ] My Page에 wallet, badge, joined/current Snapshot 비교, links, preference, delete를 표시한다.
- [ ] 처리 중 상태를 성공처럼 보이지 않게 한다.

**Done:** refresh/resume와 모든 상태 variant UI test 통과.

### Task F04: Privacy와 Terms

**Priority/Status:** P1 / BLOCKED BY F01  
**Owner:** Product + Frontend

**Files:**
- Create: `apps/web/src/app/privacy/page.tsx`
- Create: `apps/web/src/app/terms/page.tsx`
- Create: `apps/web/src/components/layout/footer.tsx`

- [ ] 수집 정보, 처리 목적, Privy/Supabase/Vercel/Pinata/S3, 삭제 정책을 영어로 명시한다.
- [ ] Demonstration Data, testnet, non-financial Badge, no carbon credit ownership, future opportunity 비보장을 명시한다.
- [ ] Footer와 consent 화면에서 링크한다.
- [ ] 정식 공개 전 법률 검토 필요성을 문서 내부에 표시한다.

**Done:** AC-13 콘텐츠 검수 통과.

## 9. Phase G — Hardening과 QA (2026-07-25~27)

### Task G01: 통합·복구 테스트

**Priority/Status:** P1 / BLOCKED BY E02, F03  
**Owner:** QA + Full-stack

**Files:**
- Create: `apps/web/tests/e2e/participation.spec.ts`
- Create: `apps/web/tests/e2e/recovery.spec.ts`
- Create: `apps/web/playwright.config.ts`

- [ ] happy path, optional consent off, duplicate, expired challenge, resume, account delete를 자동화한다.
- [ ] RPC timeout, IPFS error, chain success/DB failure, cron replay를 검증한다.
- [ ] 테스트가 실제 외부 Dev 서비스와 local contract mode를 명확히 구분하도록 tag한다.
- [ ] 성공 assertion은 receipt event와 DB row를 함께 확인한다.

**Done:** P0/P1 e2e suite green.

### Task G02: 보안·로그 검수

**Priority/Status:** P1 / BLOCKED BY E03, G01  
**Owner:** Security reviewer

**Files:**
- Create: `docs/runbooks/security-review.md`
- Modify: logging/error files identified during review

- [ ] client bundle, Vercel logs, API errors에 secret/private key/access token/full signature/email이 없는지 확인한다.
- [ ] authorization object ownership, cron secret, admin/relayer role을 검증한다.
- [ ] contract pause, relayer rotation, rate-limit, replay protections를 재검증한다.
- [ ] `pnpm audit` 결과를 실제 exploitable path 기준으로 처리한다.

**Done:** P0/P1 security finding 0건.

### Task G03: 지원 브라우저와 responsive QA

**Priority/Status:** P1 / BLOCKED BY F02, F03  
**Owner:** QA + Frontend

**Files:**
- Create: `docs/runbooks/browser-qa.md`

- [ ] Desktop Chrome 1440/1280에서 전체 핵심 경로를 확인한다.
- [ ] Desktop Edge, iPhone Safari, Android Chrome에서 login/sign/complete/My Page를 확인한다.
- [ ] wallet/signature popup 복귀와 sticky/mobile CTA를 확인한다.
- [ ] keyboard focus, label, contrast, reduced motion 기본 접근성을 확인한다.

**Done:** AC-14 전 브라우저 증거와 발견 이슈 해결.

### Task G04: 운영 Runbook과 모니터링

**Priority/Status:** P2 / BLOCKED BY E02  
**Owner:** Infra + Backend

**Files:**
- Create: `docs/runbooks/operations.md`
- Create: `docs/runbooks/reconciliation.md`
- Create: `docs/runbooks/relayer.md`

- [ ] participation 상태별 count/failure, relayer balance, cron block, Pinata/S3 결과, daily mint count 확인 절차를 작성한다.
- [ ] pause, relayer rotation, manual sync, failed request 재처리 절차를 명령 단위로 기록한다.
- [ ] 로그에서 개인정보를 다루지 않는 규칙을 명시한다.

**Done:** 새 운영자가 문서만으로 Dev 상태 점검과 sync 실행 가능.

## 10. Phase H — Demo Freeze와 제출 (2026-07-28~31)

### Task H01: Demo 환경 migration, seed, contract 배포

**Priority/Status:** P0 / BLOCKED BY G01, G02  
**Owner:** Infra + Contract + Backend

**Files:**
- Modify: `packages/contract-types/src/addresses.ts`
- Create: `docs/runbooks/demo-deploy.md`

- [ ] 검증된 commit에서 Demo contract를 새로 배포한다.
- [ ] Demo Admin/Relayer role과 Vietnam 활성화를 설정한다.
- [ ] Demo Supabase migration과 immutable v1-v3 seed를 실행한다.
- [ ] Production Vercel secret과 contract address를 연결한다.
- [ ] Demo contract/address/commit/CID를 runbook에 기록한다.

**Done:** Production URL에서 새 계정 1건 smoke mint 성공. Dev 자원과 완전 분리.

### Task H02: 실제 팀 계정 pre-mint 5~10건

**Priority/Status:** P1 / BLOCKED BY H01  
**Owner:** Product + QA

- [ ] 5~10개의 실제 팀 Google 계정이 정상 사용자 흐름으로 참여한다.
- [ ] 화면 숫자를 임의 수정하지 않는다.
- [ ] 각 mint의 tx/token/member와 DB/event sync를 확인한다.
- [ ] duplicate 참여 차단을 Demo에서 1회 확인한다.

**Done:** Demo contract count, Supabase cache, UI count가 모두 같음.

### Task H03: 제출 검증 스크립트

**Priority/Status:** P1 / BLOCKED BY H01, H02  
**Owner:** Backend/QA

**Files:**
- Create: `scripts/verify-demo.ts`
- Create: `scripts/verify-demo.test.ts`

- [ ] Production URL, current Snapshot URI/hash, contract address, member count, recent tx, tokenURI/image를 검증한다.
- [ ] DB cache와 chain count를 비교한다.
- [ ] 실패 항목이 있으면 non-zero exit와 정확한 항목명을 반환한다.
- [ ] `pnpm verify:demo` 명령을 추가한다.

**Done:** 모든 제출 링크를 한 명령으로 검증 가능.

### Task H04: 데모 영상과 제출 패키지

**Priority/Status:** P1 / BLOCKED BY H03  
**Owner:** Product + QA

**Files:**
- Create: `docs/submission/demo-script.md`
- Create: `docs/submission/submission-links.md`
- Create: `docs/submission/final-checklist.md`

- [ ] 2~3분 영상에 Discovery → Detail → Demo label → Login/Wallet → Consent → Signature → 1 block → Badge → tx/IPFS → My Page 비교를 포함한다.
- [ ] 공개 URL, Demo contract, representative tx/token, Snapshot URI/hash를 정리한다.
- [ ] 장애 대비 자료도 실제 성공 화면 캡처로 만들고 가짜 성공 상태를 사용하지 않는다.
- [ ] 정확한 제출 마감 시각 이전 제출 담당자와 확인 절차를 기록한다.

**Done:** 영상과 모든 링크를 제3자가 새 브라우저에서 확인.

### Task H05: Final smoke test와 Scope sign-off

**Priority/Status:** P0 / BLOCKED BY H04  
**Owner:** Product + Tech lead

- [ ] AC-01~AC-15를 하나씩 실행해 증거 링크를 남긴다.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm test:contracts && pnpm build && pnpm verify:demo`를 실행한다.
- [ ] 새 Google 계정과 모바일 브라우저에서 최종 핵심 경로를 재검증한다.
- [ ] Scope 밖 기능이 UI에 노출되지 않았는지 확인한다.
- [ ] 제출 후 Demo contract/config를 변경하지 않는 freeze를 선언한다.

**Done:** AC-01~15 모두 PASS. 미확인/조건부 PASS 없음.

## 11. Critical Path

```text
A01 → A02
  ├─ B01 → B02 ───────────────┐
  ├─ B03 → B04 ───────────────┤
  └─ C01 → C02/C03 → C04 ─────┤
A03 → A04 → B02/B04/B05/B06   │
                               ↓
                     D01→D03→D04→D05→D06
                               ↓
                       E01/E02/E03/E04
                               ↓
                         F01→F02/F03
                               ↓
                           G01/G02/G03
                               ↓
                        H01→H02→H03→H04→H05
```

핵심 Gate:

1. B02: Privy Embedded Wallet 실제 EIP-712 서명.
2. B04: 지정 Relayer의 실제 GIWA receipt/event.
3. B05: Pinata public CID와 S3 byte 일치.
4. B06: Stitch MCP 실제 조회.
5. D05: 최초 실제 end-to-end mint.

어느 Gate도 문서·mock·수동 데이터 입력만으로 통과 처리하지 않는다.

## 12. 병렬 실행 가능 묶음

- A01 완료 후: `B01/B03/C01` 병렬 가능.
- A04 완료 후: `B02/B04 준비/B05/B06` 병렬 가능. B04 실행은 B03 필요.
- C03 완료 후: `D01/D02` 병렬 가능.
- Vertical Slice 후: `E02/E03/E04` 병렬 가능.
- F01 완료 후: `F02/F03/F04` 병렬 가능.
- Demo Freeze 전: 코드 변경과 Demo pre-mint를 병렬 수행하지 않는다.

## 13. 일정별 완료 목표

| 날짜 | 종료 시 반드시 존재해야 하는 결과 |
| --- | --- |
| Jul 12 | Git/pnpm/CI skeleton, 외부 준비물 owner 목록 |
| Jul 14 | B02/B04/B05/B06 P0 Gate 결과 |
| Jul 16 | Snapshot hash, Dev DB schema/seed, public project API |
| Jul 18 | 실제 Vertical Slice 1회 성공 |
| Jul 21 | resume/retry/sync/rate limit/account delete |
| Jul 24 | Stitch Desktop/Mobile 핵심 화면 구현 |
| Jul 27 | contract/e2e/security/browser QA 완료 |
| Jul 29 | Demo freeze, 실제 5~10 pre-mints |
| Jul 30 | 영상, 링크, runbook, verify 명령 |
| Jul 31 | Final smoke, sign-off, 제출 |

## 14. 지금 바로 배정할 첫 Task

1. Full-stack: A01 저장소와 monorepo 초기화.
2. Infra/Product owner: A03 환경변수 계약 작성 후 A04 외부 리소스 생성.
3. Contract: A01 직후 B03 컨트랙트 골격/테스트.
4. Data/Full-stack: A02 직후 C01 Snapshot canonicalization.
5. Design: A04 Stitch 접근이 생기는 즉시 B06 대표 화면 Gate.

외부 계정이 없어도 A01, A02, A03, B01, B03, C01, C02는 시작 가능하다. 실제 통합 완료 판정은 A04 리소스 없이 수행하지 않는다.

## 15. 계획 자체 검증

- Scope AC-01~15는 D/F/E/G/H Task에 모두 매핑됨.
- Explicitly Out of Scope 기능은 Task에 없음.
- Scope 문서의 fallback 표현은 실행 Task에서 제거됨.
- 개인정보는 Supabase만, Snapshot/NFT 공개 자산은 Pinata+S3, 온체인은 wallet/project/snapshot/token만 저장.
- Dev/Demo Supabase, wallet, relayer, contract, Vercel 환경이 분리됨.
- Google Stitch MCP가 UI Source of Truth이며 다른 디자인 경로 없음.
- 현재 비-Git 빈 디렉터리 상태를 A01이 명시적으로 처리함.
