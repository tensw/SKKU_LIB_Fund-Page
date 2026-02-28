# SKKU Library Fund Page - 분석 및 개선 리포트

> 작성일: 2026-03-01
> 대상: 기부자 관리 엑셀 업로드 데이터 충돌 방지 및 가상 데이터 전환

---

## 1. 현황 분석

### 1.1 현재 시스템 구조

```
[관리자] → 엑셀 파일 선택 → 클라이언트 미리보기 → "업로드" 클릭
                                                        ↓
                                              POST /api/admin/upload
                                                        ↓
                                              SheetJS로 파싱 → createMany()
                                                        ↓
                                              Donation 테이블에 전량 INSERT
```

### 1.2 DB 스키마 현황

```prisma
// prisma/schema.prisma
model Donation {
  id        Int      @id @default(autoincrement())
  name      String              // 기부자명
  donorType String              // 기부자 유형 (교원, 직원, 동문, 학부, 일반)
  amount    BigInt              // 기부금액
  donatedAt DateTime            // 기부일
  purpose   String              // 기부용도
  note      String?             // 비고
  createdAt DateTime @default(now())
}
```

- 단일 테이블, 인덱스 없음
- 유니크 제약조건 없음 → **동일 데이터 무한 중복 INSERT 가능**
- 데이터 출처(source) 구분 필드 없음 → **시드 데이터와 실 데이터 구별 불가**

---

## 2. 문제점 상세

### 문제 1: 엑셀 업로드 시 무조건 전량 INSERT

**파일**: `src/app/api/admin/upload/route.ts` (170-172행)

```typescript
await prisma.donation.createMany({
  data: validDonations,
});
```

| 시나리오 | 결과 | 심각도 |
|---------|------|--------|
| 같은 엑셀 파일을 2번 업로드 | 데이터 전량 중복 | **치명** |
| 금액만 수정된 엑셀 재업로드 | 기존 데이터 유지 + 수정본 추가 = 이중 데이터 | **치명** |
| 새 기부자 추가된 엑셀 업로드 | 기존 기부자까지 다시 INSERT | **치명** |
| 대량 엑셀 업로드 도중 오류 | 일부만 INSERT, 롤백 없음 | **높음** |

**근본 원인**: 기존 데이터와 대조 로직이 전혀 없다.

---

### 문제 2: 시드 데이터(가상 데이터)와 실 데이터 구분 불가

**파일**: `prisma/seed.ts`

- 30건의 가상 데이터가 `Donation` 테이블에 직접 INSERT
- 실 데이터가 들어와도 가상 데이터가 그대로 남음
- `source` 같은 출처 필드가 없어 프로그래밍적으로 구별 불가
- 대시보드 KPI, 차트, 이용자 페이지 통계 모두 가상+실 데이터 혼합 표시

| 영향받는 페이지 | 파일 | 증상 |
|---------------|------|------|
| 이용자 페이지 - 기부 현황 | `DonationStatus.tsx:55` | 가상 데이터 포함된 총액/건수 표시 |
| 이용자 페이지 - 기부자 명단 | `DonorList.tsx:60` | 가상 기부자가 실 기부자와 혼재 |
| 관리자 대시보드 - KPI | `admin/page.tsx:76` | 가상 데이터 포함 통계 |
| 관리자 대시보드 - 차트 | `admin/page.tsx:76` | 추이/분포 왜곡 |

---

### 문제 3: 업로드 프로세스에 리뷰 단계 없음

**파일**: `src/app/admin/upload/page.tsx`

현재 흐름: **파일 선택 → 미리보기 → 바로 업로드**

- 관리자가 기존 데이터와의 차이를 확인할 수 없음
- "이번 업로드로 뭐가 추가/변경되는지" 알 방법 없음
- 실수로 잘못된 파일 올려도 되돌리기 어려움

---

### 문제 4: 데이터 무결성 보장 장치 부재

| 항목 | 현재 상태 | 위험 |
|-----|----------|------|
| 복합 유니크 키 | 없음 | 동일 기부 건 무한 중복 |
| 트랜잭션 | 없음 | 부분 INSERT 발생 가능 |
| 업로드 이력 | 없음 | 누가 언제 무엇을 올렸는지 추적 불가 |
| 인덱스 | 없음 | 데이터 증가 시 조회 성능 저하 |

---

## 3. 개선 방안

### 3.1 핵심 전략: "스테이징 → 대조 → 리뷰 → 반영" 2단계 업로드

```
[현재] 엑셀 → 바로 INSERT (1단계)

[개선] 엑셀 → 스테이징 INSERT + 대조 (1단계)
              → 관리자 디프 리뷰 + 승인 (2단계)
              → 본 테이블 반영 (확정)
```

#### 상세 플로우

```
┌──────────────────────────────────────────────────────────┐
│                    1단계: 분석                             │
│                                                          │
│  [엑셀 업로드] → POST /api/admin/upload/analyze           │
│       ↓                                                  │
│  StagingDonation 테이블에 임시 저장                         │
│       ↓                                                  │
│  기존 Donation 테이블과 자동 대조                            │
│       ↓                                                  │
│  각 행에 상태 부여:                                        │
│    • "new"       → 신규 데이터 (기존에 없음)                 │
│    • "duplicate" → 완전 일치 (건너뜀)                       │
│    • "conflict"  → 부분 일치, 값 다름 (관리자 판단 필요)      │
│       ↓                                                  │
│  분석 결과 반환 → 프론트엔드에서 디프 테이블 표시              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    2단계: 반영                             │
│                                                          │
│  관리자가 충돌 건별로 선택:                                  │
│    • 기존 유지 (skip)                                     │
│    • 신규로 덮어쓰기 (overwrite)                           │
│       ↓                                                  │
│  [확인] 버튼 → POST /api/admin/upload/confirm              │
│       ↓                                                  │
│  트랜잭션 내에서:                                          │
│    1. "new" 건 → Donation INSERT                          │
│    2. "conflict" + overwrite → Donation UPDATE            │
│    3. "duplicate" + skip → 무시                            │
│    4. StagingDonation 정리                                │
│       ↓                                                  │
│  결과 요약 반환 (추가 N건, 수정 M건, 건너뜀 K건)              │
└──────────────────────────────────────────────────────────┘
```

---

### 3.2 중복 판별 기준

**복합 키**: `name + donatedAt + purpose`

> 같은 사람이 같은 날짜에 같은 용도로 기부한 건 = 동일 건으로 간주

| 기존 DB | 업로드 데이터 | name+date+purpose | amount | 판정 |
|---------|-------------|-------------------|--------|------|
| 이석원, 2019-10-22, 도서관발전기금, 33,333원 | 이석원, 2019-10-22, 도서관발전기금, 33,333원 | 일치 | 일치 | **duplicate** (건너뜀) |
| 이석원, 2019-10-22, 도서관발전기금, 33,333원 | 이석원, 2019-10-22, 도서관발전기금, 50,000원 | 일치 | 다름 | **conflict** (관리자 선택) |
| — | 김철수, 2026-01-15, 1398 LibraryON, 100,000원 | 매칭없음 | — | **new** (추가) |

---

### 3.3 시드 데이터 → 실 데이터 전환

#### 스키마에 `source` 필드 추가

```prisma
model Donation {
  ...
  source    String   @default("manual")  // "seed" | "excel" | "manual"
  ...
}
```

#### 전환 로직

1. 기존 시드 데이터: `source = "seed"` 로 마킹
2. 첫 엑셀 업로드 시 관리자에게 모달 표시:
   > "현재 시드(테스트) 데이터 30건이 존재합니다.
   > 실 데이터 업로드와 함께 시드 데이터를 삭제하시겠습니까?"
   - **[삭제하고 업로드]**: `DELETE WHERE source = 'seed'` 후 업로드 진행
   - **[유지하고 업로드]**: 시드 데이터 유지, 업로드만 진행
3. 이후 업로드부터는 시드 데이터 존재 여부 자동 체크하여 프롬프트 표시

---

### 3.4 스키마 변경 사항

```prisma
model Donation {
  id        Int      @id @default(autoincrement())
  name      String
  donorType String
  amount    BigInt
  donatedAt DateTime
  purpose   String
  note      String?
  source    String   @default("excel")   // NEW: "seed" | "excel" | "manual"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt          // NEW: 수정 시점 추적

  @@unique([name, donatedAt, purpose])   // NEW: 중복 방지 복합 유니크 키
  @@index([donatedAt])                   // NEW: 날짜 조회 성능
  @@index([purpose])                     // NEW: 용도 필터 성능
  @@index([source])                      // NEW: 출처 필터 성능
}

model StagingDonation {                  // NEW: 스테이징 테이블
  id             Int      @id @default(autoincrement())
  batchId        String                  // 업로드 배치 ID (UUID)
  name           String
  donorType      String
  amount         BigInt
  donatedAt      DateTime
  purpose        String
  note           String?
  status         String   @default("pending")  // "new" | "duplicate" | "conflict"
  conflictInfo   String?                 // 충돌 시 기존 데이터 정보 (JSON)
  existingId     Int?                    // 충돌 시 기존 Donation ID
  createdAt      DateTime @default(now())

  @@index([batchId])
}
```

---

### 3.5 API 변경 사항

| 엔드포인트 | 메서드 | 변경 | 설명 |
|-----------|--------|------|------|
| `/api/admin/upload/analyze` | POST | **신규** | 1단계: 엑셀 파싱 → 스테이징 저장 → 대조 결과 반환 |
| `/api/admin/upload/confirm` | POST | **신규** | 2단계: 관리자 결정 반영 → 본 테이블 반영 |
| `/api/admin/upload/cancel` | POST | **신규** | 업로드 취소 → 스테이징 정리 |
| `/api/admin/upload` | POST | **삭제** | 기존 1단계 업로드 (대체됨) |
| `/api/donations` | GET | 유지 | 변경 없음 (source 필드 자동 포함) |
| `/api/donations/summary` | GET | 유지 | 변경 없음 |

---

### 3.6 프론트엔드 변경 사항

#### 관리자 업로드 페이지 (`admin/upload/page.tsx`)

**현재**: 파일 선택 → 미리보기 → [업로드]
**개선**: 파일 선택 → 미리보기 → [분석] → **디프 리뷰 테이블** → [확정]

디프 리뷰 테이블 UI:

```
┌──────┬────────┬──────────┬──────────┬──────────┬──────┬──────────┐
│ 상태  │ 기부자  │ 기부자정보 │ 기부금액   │ 기부일    │ 용도  │ 처리     │
├──────┼────────┼──────────┼──────────┼──────────┼──────┼──────────┤
│ 🟢신규│ 김철수  │ 동문     │ 100,000  │ 2026.01  │ 1398 │ 추가     │
│ 🟡충돌│ 이석원  │ 직원     │ 50,000   │ 2019.10  │ 발전  │ [▼ 선택] │
│      │        │          │ (기존:33,333)│        │      │          │
│ ⚫중복│ 신숙원  │ 교원     │ 30,000,000│ 2021.12 │ 발전  │ 건너뜀   │
└──────┴────────┴──────────┴──────────┴──────────┴──────┴──────────┘

                    요약: 신규 5건 추가 / 충돌 2건 / 중복 23건 건너뜀

                    [취소]                              [확정 반영]
```

충돌 건의 드롭다운:
- **기존 유지** (기본값) → 해당 건 건너뜀
- **신규로 덮어쓰기** → 기존 데이터를 업로드 데이터로 UPDATE

---

### 3.7 예외 상황 대응표

| # | 예외 상황 | 대응 방법 |
|---|----------|----------|
| 1 | 같은 엑셀 2번 업로드 | 복합 유니크 키로 전부 "duplicate" 처리 → 0건 추가 |
| 2 | 금액만 수정된 엑셀 재업로드 | "conflict"로 감지 → 관리자가 건별 선택 |
| 3 | 비고만 수정된 경우 | name+date+purpose 동일이면 "conflict" → 관리자 선택 |
| 4 | 이름 철자 다름 (오타) | 별개 건으로 "new" 처리 (정확한 매칭만 수행) |
| 5 | 날짜 포맷 불일치 | 기존 parseDate() 활용 (YYYY.MM.DD, YYYY-MM-DD, Excel serial 등 지원) |
| 6 | 빈 행/잘못된 데이터 | 스테이징 단계에서 validation → 에러 행 별도 표시 |
| 7 | 대량 업로드 (수천 건) | 배치 처리 + $transaction 으로 원자성 보장 |
| 8 | 업로드 중 브라우저 닫힘 | 스테이징에만 반영 → 본 테이블 무영향 → 오래된 스테이징 자동 정리 |
| 9 | 분석 후 방치 (확정 안 함) | 24시간 이상 미확정 스테이징 배치 → 다음 분석 시 자동 정리 |
| 10 | 동일인이 같은 날 같은 용도로 2번 기부 | 실제로는 드문 케이스. 금액 다르면 유니크 위반 없이 각각 INSERT |

---

## 4. 변경 파일 목록

| 파일 | 작업 | 설명 |
|-----|------|------|
| `prisma/schema.prisma` | **수정** | source, updatedAt 필드 추가, 유니크키/인덱스, StagingDonation 모델 |
| `prisma/seed.ts` | **수정** | source: "seed" 필드 추가 |
| `src/app/api/admin/upload/route.ts` | **수정** | 기존 POST → analyze/confirm/cancel 3개 API로 분리 |
| `src/app/api/admin/upload/analyze/route.ts` | **신규** | 1단계: 엑셀 파싱 + 스테이징 + 대조 |
| `src/app/api/admin/upload/confirm/route.ts` | **신규** | 2단계: 확정 반영 |
| `src/app/api/admin/upload/cancel/route.ts` | **신규** | 업로드 취소 + 스테이징 정리 |
| `src/app/admin/upload/page.tsx` | **수정** | 2단계 업로드 UI (디프 리뷰 테이블 추가) |

---

## 5. 구현 우선순위

| 단계 | 작업 | 의존성 |
|-----|------|--------|
| **Phase 1** | 스키마 변경 (source, updatedAt, StagingDonation, 인덱스) | 없음 |
| **Phase 2** | seed.ts 수정 (source: "seed" 추가) | Phase 1 |
| **Phase 3** | analyze API 구현 | Phase 1 |
| **Phase 4** | confirm API 구현 | Phase 3 |
| **Phase 5** | cancel API 구현 | Phase 1 |
| **Phase 6** | 업로드 페이지 UI 개편 (디프 리뷰 테이블) | Phase 3, 4 |
| **Phase 7** | 기존 upload API 제거 | Phase 6 |

---

## 6. 결론

현재 시스템의 핵심 결함은 **"엑셀 업로드 = 무조건 INSERT"** 라는 단순한 구조에 있다.
실 운영 환경에서는 같은 데이터를 여러 번 올리거나, 수정된 데이터를 다시 올리는 상황이 반드시 발생한다.

이를 해결하기 위해:
1. **스테이징 테이블**로 업로드 데이터를 임시 격리
2. **복합 유니크 키**로 중복을 자동 감지
3. **디프 리뷰 UI**로 관리자에게 투명한 판단 근거 제공
4. **source 필드**로 시드/실 데이터 완전 분리

이 네 가지 장치를 도입하면, 클라이언트가 원하는 "엑셀을 밀어넣으면 이전 정보부터 최신 정보까지 깔끔하게 정리"가 가능해진다.
