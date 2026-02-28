# 엑셀 업로드 2단계 개편 — 작업 인수인계서

> 작성일: 2026-03-01
> 작업자: Claude Code (Opus 4.6)
> 기준 커밋: `44e064e` (docs: 프로젝트 기획안 작성)
> 근거 문서: `ANALYSIS_REPORT.md`

---

## 1. 변경 개요

기존 엑셀 업로드는 **파일 선택 → 미리보기 → 바로 INSERT** 방식으로, 중복 데이터가 무한히 쌓이는 치명적 문제가 있었다.

이를 **2단계 디프 리뷰 방식**으로 전면 개편:

```
[개선 전]  파일 → 미리보기 → INSERT (중복 무한 발생)
[개선 후]  파일 → 분석(staging) → 디프 리뷰 → 확정 반영(트랜잭션)
```

---

## 2. 변경 파일 목록

### 수정 (4개)

| 파일 | 변경 내용 | +/- |
|------|----------|-----|
| `prisma/schema.prisma` | source 필드, updatedAt, 복합 유니크 키, 인덱스 3개, StagingDonation 모델 추가 | +24 |
| `prisma/seed.ts` | 전 30건에 `source: "seed"` 태깅 | +30/-30 |
| `src/app/admin/upload/page.tsx` | 3단계 UI 전면 재작성 (261행 → 571행) | +465/-84 |
| `src/app/api/admin/upload/route.ts` | 직접 INSERT 제거, 410 Gone 반환 | +7/-10 |

### 신규 (3개)

| 파일 | 역할 |
|------|------|
| `src/app/api/admin/upload/analyze/route.ts` | 1단계: 엑셀 파싱 → StagingDonation 저장 → 기존 데이터 비교 |
| `src/app/api/admin/upload/confirm/route.ts` | 2단계: 트랜잭션 확정 반영 (INSERT/UPDATE/SKIP) |
| `src/app/api/admin/upload/cancel/route.ts` | 분석 취소 시 staging 정리 |

### 문서/테스트 (2개)

| 파일 | 역할 |
|------|------|
| `ANALYSIS_REPORT.md` | 문제 분석 및 해결 전략 보고서 |
| `tests/qa-upload-flow.ts` | QA/QC 자동 테스트 (6개 시나리오, 24개 검증) |

---

## 3. 상세 변경 내역

### 3-1. DB 스키마 (`prisma/schema.prisma`)

**Donation 모델 변경:**

| 항목 | Before | After |
|------|--------|-------|
| source 필드 | 없음 | `source String @default("excel")` — seed/excel/manual 구분 |
| updatedAt 필드 | 없음 | `updatedAt DateTime @updatedAt` |
| 중복 방지 | 없음 | `@@unique([name, donatedAt, purpose])` 복합 유니크 키 |
| 인덱스 | 없음 | `@@index([donatedAt])`, `@@index([purpose])`, `@@index([source])` |

**StagingDonation 모델 (신규):**

| 필드 | 타입 | 용도 |
|------|------|------|
| batchId | String | 업로드 배치 식별 UUID |
| status | String | `"new"` / `"duplicate"` / `"conflict"` |
| conflictInfo | String? | 기존 데이터와의 차이 (JSON) |
| existingId | Int? | 충돌 시 기존 Donation의 ID |

### 3-2. 시드 데이터 (`prisma/seed.ts`)

- 전 30건에 `source: "seed"` 추가
- 실 데이터 업로드 시 시드 데이터를 선택적으로 삭제 가능

### 3-3. Analyze API (`/api/admin/upload/analyze`)

```
POST /api/admin/upload/analyze
Content-Type: multipart/form-data (file 필드)

→ 엑셀 파싱 (유연한 헤더 매칭)
→ 24시간 이상 된 스테이징 자동 정리
→ 기존 Donation과 복합키(name+donatedAt+purpose) 대조
→ 각 행에 상태 부여:
    - new: 기존에 없는 신규 데이터
    - duplicate: 기존과 완전히 동일 (금액, 유형, 비고 모두 일치)
    - conflict: 키는 같지만 다른 필드가 다름 (금액 변경 등)
→ StagingDonation 테이블에 배치 저장

Response: { batchId, summary, hasSeedData, seedCount, rows[] }
```

### 3-4. Confirm API (`/api/admin/upload/confirm`)

```
POST /api/admin/upload/confirm
Body: { batchId, deleteSeedData?, decisions? }

→ 트랜잭션 내에서:
    1. deleteSeedData=true면 source="seed" 전건 삭제
    2. status="new" → INSERT
    3. status="conflict" + decision="overwrite" → UPDATE (기존 데이터 덮어쓰기)
    4. status="conflict" + decision="skip" 또는 "duplicate" → SKIP
    5. 해당 batchId의 StagingDonation 전건 삭제

Response: { success, summary: { added, updated, skipped, seedDeleted } }
```

### 3-5. Cancel API (`/api/admin/upload/cancel`)

```
POST /api/admin/upload/cancel
Body: { batchId }

→ StagingDonation에서 해당 배치 전건 삭제
Response: { success, deletedCount }
```

### 3-6. 구 API Deprecated (`/api/admin/upload`)

- 기존 POST 엔드포인트는 **410 Gone** 반환
- `{ error: "이 API는 더 이상 사용되지 않습니다...", deprecated: true }`

### 3-7. 관리자 업로드 페이지 (`/admin/upload`)

**3단계 UI 상태 머신:**

```
Step 1 (upload)  →  Step 2 (review)  →  Step 3 (done)
  파일 선택           디프 리뷰 테이블       완료 요약
  미리보기 테이블      충돌 처리 드롭다운     새 업로드 버튼
  [분석하기]           시드 삭제 토글
                      [취소] [확정 반영]
```

| UI 요소 | 설명 |
|---------|------|
| Step Indicator | 상단 1→2→3 단계 표시 (완료 시 녹색) |
| 미리보기 테이블 | 엑셀 데이터 최대 50행 표시 |
| Summary Cards | 전체/신규/충돌/중복 4개 KPI 카드 |
| 시드 데이터 경고 | 노란 배너, 삭제/유지 토글 |
| 디프 리뷰 테이블 | 상태 배지(초록/노랑/회색), 충돌 행에 드롭다운 |
| 완료 화면 | 추가/수정/건너뜀/시드삭제 결과 요약 |

---

## 4. QA/QC 테스트 결과

### 테스트 환경
- 일시: 2026-03-01 (KST)
- 환경: Next.js dev server (localhost:3000) + SQLite
- 방법: DB 기반 더미 엑셀을 프로그래밍 방식으로 생성 → analyze/confirm/cancel API 직접 호출
- 스크립트: `tests/qa-upload-flow.ts`

### 테스트 시나리오

| TC | 시나리오 | 검증 항목 | 결과 |
|----|---------|----------|------|
| **TC-01** | 신규 데이터만 업로드 | analyze 200, 3건 모두 new, batchId 생성, 시드 감지, confirm 3건 추가 | **PASS (6/6)** |
| **TC-02** | 중복 데이터 포함 업로드 | TC-01 데이터 재업로드 시 2건 duplicate 감지, 신규 1건만 추가 | **PASS (4/4)** |
| **TC-03** | 충돌 + 덮어쓰기 | 금액 변경된 데이터 → conflict 감지, conflictInfo 존재, overwrite로 기존 데이터 갱신 | **PASS (5/5)** |
| **TC-04** | 시드 데이터 삭제 | deleteSeedData=true → 시드 30건 삭제, 신규 1건 추가 | **PASS (3/3)** |
| **TC-05** | 취소 API | cancel 호출 → staging 정리, 이후 confirm 시 404 반환 | **PASS (4/4)** |
| **TC-06** | 구 API Deprecated | POST /api/admin/upload → 410 Gone, deprecated=true | **PASS (2/2)** |

### 최종 결과

```
╔═══════════════════════════════════════════════╗
║  24/24 PASS, 0 FAIL                          ║
╚═══════════════════════════════════════════════╝
```

### 검증된 데이터 흐름

```
TC-01: [엑셀 3건 신규] → analyze(3 new) → confirm(added=3)
TC-02: [기존 2건 + 신규 1건] → analyze(2 dup, 1 new) → confirm(added=1, skipped=2)
TC-03: [금액 변경 1건 + 신규 1건] → analyze(1 conflict, 1 new) → confirm(updated=1, added=1)
TC-04: [신규 1건 + 시드삭제] → analyze(1 new) → confirm(added=1, seedDeleted=30)
TC-05: [신규 1건] → analyze → cancel(deleted=1) → confirm(404)
TC-06: [구 API] → 410 Gone
```

---

## 5. 아키텍처 다이어그램

```
┌─────────────────┐     ┌───────────────────────────────────────┐
│  Admin Upload    │     │            Backend API                │
│  Page (React)    │     │                                       │
│                  │     │  ┌─────────────────────┐              │
│  Step1: 파일선택  │────▶│  │ POST /analyze       │              │
│  + 미리보기      │     │  │  엑셀 파싱           │              │
│                  │     │  │  기존 데이터 대조     │              │
│                  │     │  │  StagingDonation 저장 │              │
│                  │◀────│  └─────────────────────┘              │
│                  │     │                                       │
│  Step2: 디프리뷰 │     │  ┌─────────────────────┐              │
│  + 의사결정      │────▶│  │ POST /confirm       │              │
│                  │     │  │  트랜잭션:           │              │
│                  │     │  │  - seed 삭제 (선택)  │              │
│                  │     │  │  - new → INSERT      │              │
│                  │     │  │  - conflict → UPDATE │              │
│                  │     │  │  - duplicate → SKIP  │              │
│                  │◀────│  │  staging 정리        │              │
│                  │     │  └─────────────────────┘              │
│  Step3: 완료     │     │                                       │
│                  │     │  ┌─────────────────────┐              │
│  [취소 시]       │────▶│  │ POST /cancel        │              │
│                  │     │  │  staging 전건 삭제   │              │
│                  │◀────│  └─────────────────────┘              │
└─────────────────┘     └───────────────────────────────────────┘
                                       │
                               ┌───────┴───────┐
                               │    SQLite DB   │
                               │               │
                               │  Donation      │
                               │  (본 테이블)    │
                               │               │
                               │  Staging       │
                               │  Donation      │
                               │  (임시 테이블)  │
                               └───────────────┘
```

---

## 6. 주의사항 / 인수인계 메모

1. **StagingDonation 자동 정리**: analyze API 호출 시 24시간 이상 된 staging 데이터는 자동 삭제됨
2. **복합 유니크 키**: `[name, donatedAt, purpose]` — 같은 사람이 같은 날 같은 용도로 기부하면 1건으로 간주
3. **BigInt 주의**: amount 필드는 BigInt 타입. JSON 직렬화 시 `Number()`로 변환 필요
4. **구 API**: `/api/admin/upload` POST는 410으로 막아뒀으나, 프론트엔드에서는 이미 `/analyze`만 호출하므로 영향 없음
5. **시드 데이터**: `source="seed"` 30건은 개발/데모용. 프로덕션 배포 전 삭제 필요 (업로드 UI에서도 삭제 가능)
