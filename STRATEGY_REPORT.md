# 성균관대학교 학술정보관 발전기금 페이지 - 전략 보고서

> 작성일: 2026-02-23
> 대상: skku-donors 프로젝트 코드베이스 전체 분석

---

## 1. 현황 요약

### 1.1 기술 스택
| 항목 | 버전/기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router) |
| UI 라이브러리 | React 19 |
| 스타일링 | Tailwind CSS 4 |
| 애니메이션 | Framer Motion 12 |
| 아이콘 | Lucide React |
| 언어 | TypeScript 5 |

### 1.2 페이지 구조 (현재)
```
RootLayout (layout.tsx)
├── Header (UI/Header.tsx)          ← 학술정보관 글로벌 헤더 (메가메뉴)
├── DonorsPage (page.tsx)           ← 단일 페이지, 탭 기반 SPA
│   ├── DonorHeader                 ← "학술정보관 발전기금" 타이틀
│   ├── NavigationTabs              ← 4개 탭 네비게이션
│   └── [탭별 콘텐츠]
│       ├── "안내"    → GuideHero + GuideFooter
│       ├── "기부현황" → DonationStatus + DonationDetailCard
│       ├── "기부자단" → DonorGroup (테이블 + 검색 + 페이지네이션)
│       └── "기부자혜택" → DonorBenefits (iframe 임베딩)
└── Footer (UI/Footer/Footer.tsx)   ← 학술정보관 글로벌 푸터
```

### 1.3 미사용 컴포넌트
- `DonationInfoCard.tsx` — 기부참여 안내 카드 (page.tsx에서 미사용)
- `FAQCard.tsx` — 문의 카드 (page.tsx에서 미사용)
- `ProjectCard.tsx` — 프로젝트 소개 플레이스홀더 (page.tsx에서 미사용)

---

## 2. 치명적 문제 (Critical Issues)

### 2.1 서강대학교 콘텐츠 잔존 (심각도: CRITICAL)

현재 코드에 **서강대학교** 관련 콘텐츠가 그대로 남아있습니다. 이것이 클라이언트가 "서강대 페이지와 너무 유사하다"고 우려한 핵심 원인입니다.

| 파일 | 문제 내용 |
|------|-----------|
| `GuideHero.tsx` | "**로욜라 원 프로젝트**" — 이것은 서강대학교 로욜라도서관의 프로젝트명 |
| `GuideHero.tsx` | "로욜라도서관은 대학교의 미래입니다" — 서강대 문구 |
| `GuideHero.tsx` | "loyola project - the next generation library" — 서강대 영문명 |
| `GuideFooter.tsx` | `https://library.sogang.ac.kr` — 서강대 도서관 링크 |
| `GuideFooter.tsx` | `https://give.sogang.ac.kr` — 서강대 기부 링크 |
| `GuideHero.tsx` | 색상 `#c61b26` — 서강대 레드 |

**조치 필요**: 모든 콘텐츠를 성균관대 "**1398 LibraryON 프로젝트**"로 교체해야 합니다.
- fund.skku.edu에 따르면 SKKU의 실제 프로젝트명: "1398 LibraryON 프로젝트"
- 의미: "전통을 켜다, 지식을 ON하다, 24시간 내내 살아있다"

### 2.2 PDF 클라이언트 수정 요청 미반영 (심각도: HIGH)

박민호(인문학술정보팀) 요청사항이 코드에 반영되지 않았습니다:

| 항목 | 현재 | 변경 필요 |
|------|------|-----------|
| 기부 링크 | `#` (빈 링크) | `https://give.skku.edu/skku/pay/step1_direct?dontype=602j8` |
| 버튼 문구 | "온라인 기부 바로가기" | "발전기금 기부참여" |
| 안내 문구 | (모금상품에서 "도서관(학술정보관) 발전기금" 선택) | (1398캠페인 > 1398LibraryOn(도서관)발전기금 온·오프라인 기부 참여) |

---

## 3. 백엔드 부재 분석 ("빙하 상태")

현재 모든 데이터가 프론트엔드에 하드코딩되어 있어 **실제 운영이 불가능**합니다.

### 3.1 하드코딩된 데이터 목록

| 컴포넌트 | 하드코딩 데이터 | 실제 필요한 것 |
|----------|----------------|----------------|
| `DonationStatus.tsx` | 참여 건수: `8,734건` | DB에서 실시간 집계 |
| `DonationStatus.tsx` | 기부 총액: `1,810,735,970원` | DB에서 실시간 합산 |
| `DonationDetailCard.tsx` | 로욜라 원: `758,796,273원 / 2,546건` | DB 카테고리별 집계 |
| `DonationDetailCard.tsx` | 발전기금: `852,552,601원 / 1,196건` | DB 카테고리별 집계 |
| `DonarGroup.tsx` | `MOCK_DATA` 15건 | DB 기부자 테이블 전체 |

### 3.2 필수 백엔드 요구사항

#### A. 데이터베이스 설계 (최소 스키마)

```
[donors] 기부자 테이블
─────────────────────────
id              PK
name            VARCHAR     기부자명 (또는 "익명기부자")
donor_type      ENUM        학부/대학원/교원/직원/동문/일반/기업
is_anonymous    BOOLEAN     익명 여부
created_at      TIMESTAMP

[donations] 기부 테이블
─────────────────────────
id              PK
donor_id        FK → donors
amount          BIGINT      기부금액 (원)
donated_at      DATE        기부일
purpose         ENUM        "1398_libraryon" | "library_fund" | ...
payment_method  VARCHAR     납부 방식
note            TEXT        비고
created_at      TIMESTAMP

[donation_summary] 집계 캐시 (선택사항)
─────────────────────────
id              PK
purpose         ENUM
total_amount    BIGINT
total_count     INT
updated_at      TIMESTAMP
```

#### B. API 엔드포인트 설계

```
GET  /api/donations/summary
     → { totalCount, totalAmount, byPurpose: [...] }

GET  /api/donations/donors?page=1&size=10&search=&type=&purpose=&sort=asc
     → { data: [...], totalItems, totalPages }

GET  /api/donations/donors/export?format=xlsx
     → Excel 파일 다운로드

POST /api/admin/donations          (관리자)
     → 기부 내역 등록

PUT  /api/admin/donations/:id      (관리자)
     → 기부 내역 수정

DELETE /api/admin/donations/:id    (관리자)
     → 기부 내역 삭제
```

#### C. 기술 추천 (Next.js 생태계 내)

| 계층 | 추천 기술 | 이유 |
|------|-----------|------|
| DB | PostgreSQL (Supabase 또는 직접 호스팅) | 관계형 데이터, 집계 쿼리 최적 |
| ORM | Prisma | Next.js와의 완벽한 통합, 타입 안전성 |
| API | Next.js Route Handlers (`/app/api/`) | 별도 서버 불필요 |
| 인증 | NextAuth.js + SKKU SSO 연동 | 관리자 인증 |
| 엑셀 | xlsx 또는 exceljs 라이브러리 | 기부자 목록 다운로드 |
| 캐싱 | ISR (Incremental Static Regeneration) | 집계 데이터 60초 캐시 |

---

## 4. 관리자 페이지 필요성 분석

### 4.1 결론: **관리자 페이지 필수**

현재 기부 데이터가 하드코딩된 상태에서 운영하려면, 데이터를 수정할 수 있는 관리 인터페이스가 반드시 필요합니다.

### 4.2 관리자 페이지 기능 요구사항

```
/admin (관리자 대시보드)
├── /admin/donations         ← 기부 내역 CRUD (등록/조회/수정/삭제)
├── /admin/donations/import  ← 엑셀 일괄 업로드
├── /admin/summary           ← 집계 현황 확인/수동 갱신
└── /admin/settings          ← 프로젝트명, 목표 금액 등 설정
```

| 기능 | 우선순위 | 설명 |
|------|----------|------|
| 기부 내역 등록 | P0 | 개별 기부 데이터 입력 |
| 기부 내역 조회/검색 | P0 | 필터링 + 페이지네이션 |
| 기부 내역 수정/삭제 | P0 | 오류 정정 |
| 엑셀 일괄 업로드 | P1 | 기존 데이터 마이그레이션 |
| 엑셀 다운로드 | P1 | 기부자 목록 내보내기 |
| 집계 대시보드 | P2 | 시각적 현황 확인 |
| 프로젝트 설정 | P2 | 프로젝트명/목표금액 동적 변경 |

### 4.3 관리자 인증

- **최소**: 환경변수 기반 ID/PW (간단하지만 보안 취약)
- **권장**: SKKU 통합인증(SSO) 연동 + 관리자 화이트리스트
- 접근 경로: `/admin` → 인증 미통과 시 `/admin/login`으로 리다이렉트

---

## 5. 프론트엔드 로직 개선 사항

### 5.1 컴포넌트 구조 문제

| 문제 | 위치 | 개선 방안 |
|------|------|-----------|
| 헤더 중복 | `layout.tsx` + `page.tsx` 모두 Header 렌더링 | `DonorHeader`를 발전기금 전용 히어로로 통합 |
| 파일명 오타 | `DonarGroup` → `DonorGroup`, `DonarBenifits` → `DonorBenefits` | 파일명/import 일괄 수정 |
| 미사용 컴포넌트 | `DonationInfoCard`, `FAQCard`, `ProjectCard` | 통합하거나 제거 |
| iframe 의존 | `DonorBenefits`가 fund.skku.edu를 iframe으로 삽입 | 자체 콘텐츠로 전환 (CORS/보안 이슈) |
| 라우팅 부재 | 전체가 단일 페이지 + useState 탭 | Next.js App Router 활용 검토 |

### 5.2 UX/접근성 문제

| 문제 | 설명 |
|------|------|
| URL 비공유성 | 탭 전환이 URL에 반영되지 않아 특정 탭 공유 불가 |
| 모바일 대응 미흡 | `DonarGroup`의 테이블이 모바일에서 가로 스크롤 필요 |
| Footer 데스크톱 전용 | `Footer.tsx`에 `hidden xl:block` → 태블릿 이하에서 푸터 미표시 |
| 검색 실시간성 | `DonarGroup` 검색이 "조회" 버튼 클릭 시에만 동작 (예상과 다를 수 있음) |
| 엑셀 다운로드 미구현 | Download 버튼은 있으나 기능 없음 |
| 애니메이션 접근성 | `prefers-reduced-motion` 미고려 |

### 5.3 SEO/성능

| 문제 | 설명 |
|------|------|
| `"use client"` 과다 | 메인 페이지가 전체 CSR → SSR 이점 상실 |
| 메타데이터 부족 | Open Graph, 구조화 데이터 미설정 |
| 이미지 최적화 | `.jpg` 직접 사용 → WebP/AVIF 변환 필요 |

---

## 6. 참조 대학 벤치마킹 요약

### 6.1 서울대학교 (friends.snu.ac.kr)
- **핵심 특징**: 따뜻한 베이지(#f5efe0) 색상, 스토리텔링 중심, QR코드 기부
- **우수점**: "투명한 기금 관리" 섹션, 기부 스토리, 네이밍 예우
- **통계 표시**: 모금액 + 납입 건수를 대형 숫자로 강조

### 6.2 고려대학교 (library.korea.ac.kr/give)
- **핵심 특징**: 마룬(#ab0033) 액센트, 탭 인터페이스(금전기부/도서기증 분리)
- **우수점**: 자동 스크롤 기부자 목록, PDF 안내자료 다운로드
- **통계 표시**: 참여 건수 + 기부 총액 + 도서 기증 건수/권수 4개 지표

### 6.3 성균관대 발전기금 (fund.skku.edu)
- **핵심 특징**: GSAP 스크롤 애니메이션, donus.org 결제 연동
- **우수점**: "1398 LibraryON" 브랜딩, 공간명 헌정 제도
- **사업비**: 50억 원 (삼성학술정보관 + 중앙학술정보관)

### 6.4 연세대학교 (giving.yonsei.ac.kr)
- **핵심 특징**: 다단계 메뉴, 기부자 영상 콘텐츠
- **우수점**: Executive/Presidential Club 등급 체계, My Give Account
- **기부 방식**: 정기후원 + 일시기부 이원화

---

## 7. 디자인 개선 전략

### 7.1 서강대 유사성 탈피 핵심 포인트

| 현재 (서강대 유사) | 개선 방향 (SKKU 독자성) |
|-------------------|----------------------|
| "로욜라 원 프로젝트" | **"1398 LibraryON 프로젝트"** |
| 빨간색 `#c61b26` 중심 | SKKU 브랜드 컬러 활용 (진녹/남색 계열 + 포인트 레드) |
| 단순 텍스트 + 이미지 레이아웃 | 스크롤 애니메이션 + 시각적 스토리텔링 |
| 정적 통계 | 애니메이션 카운터 + 진행률 바 |
| 탭 기반 SPA | 스크롤 기반 원페이지 또는 라우트 분리 |

### 7.2 SKKU 브랜드 컬러 제안

```
Primary:    #00563F  (성균 전통 녹색)
Secondary:  #1B3A5C  (남색/네이비)
Accent:     #C8102E  (SKKU 레드 — 절제 사용)
Background: #F8F6F2  (따뜻한 아이보리)
Text:       #1F222D  (기존 헤더 텍스트 색상 유지)
Muted:      #6B7280  (보조 텍스트)
```

### 7.3 추천 레이아웃 구조

```
[글로벌 헤더 — lib.skku.edu 스타일]
│
[히어로 섹션]
│  ← 전면 이미지 + "1398 LibraryON" 타이포그래피
│  ← "발전기금 기부참여" CTA 버튼
│
[프로젝트 소개]
│  ← 비전 설명 + 3개 핵심 가치 카드
│  ← 도서관 이미지 갤러리
│
[기부 현황 (실시간)]
│  ← 애니메이션 카운터 (총 기부액, 참여 건수)
│  ← 프로젝트별 상세 (1398 LibraryON / 도서관 발전기금)
│  ← 목표 달성률 프로그레스 바
│
[기부자 명단]
│  ← 검색/필터/정렬
│  ← 테이블 (반응형)
│  ← 엑셀 다운로드
│
[기부자 예우]
│  ← 등급별 혜택 카드 (자체 콘텐츠)
│  ← fund.skku.edu 연결 링크
│
[기부 참여 안내]
│  ← 기부 방법 안내
│  ← "발전기금 기부참여" CTA 버튼
│  ← (1398캠페인 > 1398LibraryOn(도서관)발전기금 온·오프라인 기부 참여)
│
[문의]
│  ← 학술정보관 연락처
│  ← 발전협력팀 연락처
│
[글로벌 푸터 — lib.skku.edu 스타일]
```

---

## 8. 구현 로드맵 (우선순위별)

### Phase 1: 즉시 수정 (긴급)
- [ ] 서강대 콘텐츠 완전 제거 (로욜라 → 1398 LibraryON)
- [ ] 클라이언트 PDF 요청사항 반영 (링크/문구 수정)
- [ ] GuideFooter.tsx의 sogang.ac.kr 링크 → skku.edu로 변경

### Phase 2: 디자인 리뉴얼
- [ ] SKKU 브랜드 컬러 적용
- [ ] 히어로 섹션 전면 재디자인
- [ ] 헤더/푸터를 lib.skku.edu 스타일과 통일
- [ ] 반응형 디자인 완성 (모바일/태블릿)
- [ ] 스크롤 애니메이션 강화

### Phase 3: 백엔드 구축
- [ ] DB 스키마 설계 및 생성
- [ ] Prisma ORM 설정
- [ ] API 엔드포인트 구현 (집계/목록/검색)
- [ ] 프론트엔드 API 연동 (하드코딩 제거)
- [ ] 엑셀 다운로드 기능 구현

### Phase 4: 관리자 페이지
- [ ] 관리자 인증 구현
- [ ] 기부 내역 CRUD 인터페이스
- [ ] 엑셀 일괄 업로드
- [ ] 집계 대시보드

### Phase 5: 안정화
- [ ] SEO 최적화 (OG 태그, 구조화 데이터)
- [ ] 성능 최적화 (ISR, 이미지 최적화)
- [ ] 접근성 검수 (WCAG 2.1 AA)
- [ ] 배포 및 운영 환경 설정

---

## 9. 결론

현재 프로젝트는 **서강대학교 발전기금 페이지를 템플릿으로 사용하여 콘텐츠만 일부 교체한 상태**이며, 서강대 고유 콘텐츠(로욜라 프로젝트명, 링크 등)가 그대로 남아있습니다. 이것이 클라이언트 우려의 직접적 원인입니다.

프론트엔드 기능(탭 네비게이션, 기부 현황, 기부자 목록, 검색/필터링, 기부자 혜택)은 클라이언트가 원하는 범위를 충족하고 있으나, **모든 데이터가 하드코딩**되어 실제 운영이 불가능합니다. 백엔드(DB + API) 구축과 관리자 페이지는 서비스 런칭의 필수 조건입니다.

디자인은 SKKU 고유의 "1398 LibraryON" 브랜딩과 학교 색상을 기반으로 전면 재설계하여, 서강대와의 유사성을 완전히 제거하고 성균관대학교만의 정체성을 확립해야 합니다.
