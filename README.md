# SKKU Donors - 인수인계서 및 이용 설명서

> **성균관대학교 학술정보관 발전기금 (1398 LibraryON) 웹 시스템**
>
> 최종 업데이트: 2026-02-23

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [백엔드 아키텍처](#4-백엔드-아키텍처)
5. [주요 기능 설명](#5-주요-기능-설명)
6. [개발 환경 설정](#6-개발-환경-설정)
7. [진행 현황](#7-진행-현황)
8. [QA/QC 결과](#8-qaqc-결과)
9. [프로덕션화를 위한 개선 필요사항](#9-프로덕션화를-위한-개선-필요사항)
10. [API 명세](#10-api-명세)
11. [데이터베이스 스키마](#11-데이터베이스-스키마)
12. [참고사항](#12-참고사항)

---

## 1. 프로젝트 개요

### 목적
성균관대학교 학술정보관 **1398 LibraryON 프로젝트** 발전기금 모금을 위한 웹사이트.
기부자 명단 공개, 기부 현황 시각화, 관리자 대시보드 및 엑셀 기반 데이터 관리 기능을 제공.

### 주요 대상 사용자
- **일반 사용자**: 기부 현황 확인, 기부 참여 (외부 링크)
- **관리자**: 기부 데이터 관리 (엑셀 업로드), 대시보드 분석

### 외부 연동
- 기부 결제: `give.skku.edu` (외부 링크, 직접 연동 없음)
- 기부 안내: `fund.skku.edu` (외부 링크)

---

## 2. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| 스타일링 | Tailwind CSS | 4.x |
| 애니메이션 | Framer Motion | 12.x |
| 아이콘 | Lucide React | 0.522.x |
| 차트 | Recharts | 3.x |
| ORM | Prisma | 6.x |
| 데이터베이스 | SQLite | - |
| 엑셀 처리 | SheetJS (xlsx) | 0.18.x |
| 언어 | TypeScript | 5.x |

---

## 3. 프로젝트 구조

```
skku-donors/
├── prisma/
│   ├── schema.prisma          # DB 스키마 정의
│   ├── seed.ts                # 샘플 데이터 시딩 스크립트
│   └── donations.db           # SQLite 데이터베이스 파일
├── public/
│   ├── images/                # 이미지 리소스
│   └── svgs/                  # SVG 아이콘
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 루트 레이아웃 (Header + Footer)
│   │   ├── page.tsx           # 메인 페이지 (SPA, 섹션 네비게이션)
│   │   ├── globals.css        # 전역 스타일 + CSS 변수
│   │   ├── admin/
│   │   │   ├── layout.tsx     # 관리자 레이아웃 (사이드바)
│   │   │   ├── page.tsx       # 대시보드 (KPI + 차트)
│   │   │   ├── login/page.tsx # 로그인 페이지
│   │   │   └── upload/page.tsx# 엑셀 업로드 페이지
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── auth/route.ts    # 인증 API (로그인/로그아웃)
│   │       │   └── upload/route.ts  # 엑셀 업로드 API
│   │       └── donations/
│   │           ├── route.ts         # 기부 목록 API (페이징/필터)
│   │           ├── summary/route.ts # 요약 통계 API
│   │           ├── analytics/route.ts# 분석 데이터 API
│   │           └── export/route.ts  # 엑셀 내보내기 API
│   ├── components/
│   │   ├── Donors/
│   │   │   ├── HeroSection.tsx     # 히어로 배너
│   │   │   ├── SectionNav.tsx      # 섹션 네비게이션 (Sticky)
│   │   │   ├── ProjectVision.tsx   # 프로젝트 비전 소개
│   │   │   ├── DonationStatus.tsx  # 기부 현황 (카운트업 애니메이션)
│   │   │   ├── DonorList.tsx       # 기부자 명단 (테이블 + 페이징)
│   │   │   ├── DonorBenefits.tsx   # 기부자 예우 카드
│   │   │   └── DonationGuide.tsx   # 기부 안내 + 연락처
│   │   └── UI/
│   │       ├── Header.tsx          # 메가메뉴 헤더
│   │       └── Footer/Footer.tsx   # 푸터 (Family Site 포함)
│   ├── data/
│   │   └── MenuData.ts            # 헤더 메뉴 데이터 (학술정보관 전체 메뉴)
│   ├── lib/
│   │   └── prisma.ts              # Prisma 클라이언트 싱글턴
│   └── middleware.ts              # 인증 미들웨어
├── .env                           # 환경변수 (ADMIN_PASSWORD)
├── next.config.ts                 # Next.js 설정
├── package.json                   # 의존성
└── tsconfig.json                  # TypeScript 설정
```

### 사용하지 않는 파일 (레거시)
다음 파일들은 현재 import되지 않는 레거시 컴포넌트입니다:
- `src/components/Donors/DonarBenifits.tsx` → `DonorBenefits.tsx`로 대체됨
- `src/components/Donors/DonarGroup.tsx` → 미사용
- `src/components/Donors/DonationDetailCard.tsx` → 미사용
- `src/components/Donors/DonationInfoCard.tsx` → 미사용
- `src/components/Donors/DonorHeader.tsx` → 미사용
- `src/components/Donors/FAQCard.tsx` → 미사용
- `src/components/Donors/GuideFooter.tsx` → 미사용
- `src/components/Donors/GuideHero.tsx` → 미사용
- `src/components/Donors/NavigationTabs.tsx` → 미사용
- `src/components/Donors/ProjectCard.tsx` → 미사용

---

## 4. 백엔드 아키텍처

> 아키텍처 다이어그램은 `docs/backend-architecture.drawio` 파일을 draw.io에서 열어 확인할 수 있습니다.

### 아키텍처 요약

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Browser)                  │
│                                                           │
│  ┌─ Public Pages ─────────────────────────────────────┐  │
│  │ HeroSection → SectionNav → ProjectVision           │  │
│  │ → DonationStatus → DonorList → DonorBenefits       │  │
│  │ → DonationGuide                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─ Admin Pages (Protected) ──────────────────────────┐  │
│  │ /admin/login → /admin (Dashboard) → /admin/upload   │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ fetch()
┌───────────────────────▼─────────────────────────────────┐
│              MIDDLEWARE LAYER (src/middleware.ts)          │
│  /admin/* 경로 보호 | Cookie 기반 인증 (admin-token)      │
│  /admin/login 및 /api/* 는 통과                          │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│          API LAYER (Next.js Route Handlers)               │
│                                                           │
│  ┌─ Auth ────────────┐  ┌─ Import ──────────────────┐   │
│  │ POST  /auth       │  │ POST /admin/upload         │   │
│  │ DELETE /auth      │  │ (Excel → Parse → DB)       │   │
│  └────────────────────┘  └───────────────────────────┘   │
│  ┌─ Read (Public) ───────────────────────────────────┐   │
│  │ GET /donations          (목록, 페이징/필터/정렬)    │   │
│  │ GET /donations/summary  (요약 통계)                │   │
│  │ GET /donations/analytics(분석, 월별/유형별/기간별)  │   │
│  │ GET /donations/export   (엑셀 다운로드)            │   │
│  └───────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ Prisma Client
┌───────────────────────▼─────────────────────────────────┐
│                   DATA LAYER                              │
│                                                           │
│  ┌─ Prisma ORM ──────┐  ┌─ SQLite ──────────────────┐  │
│  │ Singleton Pattern  │──│ prisma/donations.db        │  │
│  │ Dev: Global 재사용 │  │                            │  │
│  └────────────────────┘  └───────────────────────────┘  │
│                                                           │
│  Donation Model:                                          │
│  id | name | donorType | amount(BigInt) | donatedAt       │
│  | purpose | note | createdAt                             │
└─────────────────────────────────────────────────────────┘
```

### 데이터 흐름

1. **기부 데이터 입력**: 관리자가 엑셀 파일 업로드 → SheetJS 파싱 → Prisma를 통해 SQLite에 저장
2. **기부 현황 표시**: 프론트엔드 컴포넌트가 `/api/donations/summary` API 호출 → 카운트업 애니메이션으로 표시
3. **기부자 명단**: `/api/donations` API (페이징, 검색, 필터, 정렬 지원) → 테이블 렌더링
4. **관리자 대시보드**: `/api/donations/analytics` API → Recharts로 차트 시각화 (월별 추이, 용도별, 유형별)
5. **엑셀 다운로드**: `/api/donations/export` API → XLSX 파일 생성 후 브라우저 다운로드

### 인증 흐름

```
Login → POST /api/admin/auth (비밀번호 검증)
  ├─ 성공 → Set-Cookie: admin-token=authenticated (httpOnly, 24h)
  └─ 실패 → 401 Error

/admin/* 접근 → middleware.ts
  ├─ admin-token 쿠키 존재 → 통과
  └─ 쿠키 없음 → /admin/login으로 리다이렉트

Logout → DELETE /api/admin/auth → 쿠키 삭제
```

---

## 5. 주요 기능 설명

### 5.1 메인 페이지 (`/`)

단일 페이지 구성(SPA-like)으로, 스크롤 기반 섹션 네비게이션.

| 섹션 | 컴포넌트 | 설명 |
|------|----------|------|
| 히어로 | `HeroSection` | 풀스크린 배경 이미지 + 기부참여 CTA 버튼 |
| 네비게이션 | `SectionNav` | 4개 섹션 탭 (Sticky, 스크롤 연동) |
| 프로젝트 비전 | `ProjectVision` | 3개 비전카드 + 이미지 갤러리 + 총 사업비 |
| 기부 현황 | `DonationStatus` | 실시간 API 연동, 카운트업 애니메이션 |
| 기부자 명단 | `DonorList` | 페이징 테이블, 검색/필터/정렬, 엑셀 다운로드 |
| 기부자 예우 | `DonorBenefits` | 4단계 기부자 등급별 혜택 카드 |
| 기부 안내 | `DonationGuide` | 기부 CTA + 연락처 (학술정보관, 발전협력팀) |

### 5.2 관리자 페이지 (`/admin/*`)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/admin/login` | 비밀번호 기반 인증 |
| 대시보드 | `/admin` | KPI 카드 4개 + 차트 3종 (월별추이, 용도별 파이, 유형별 바) + 최근 기부내역 테이블 |
| 엑셀 업로드 | `/admin/upload` | 엑셀 파일 선택 → 미리보기 → 업로드 |

### 5.3 헤더/푸터

- **Header**: 성균관대학교 학술정보관 전체 메뉴 구조를 메가메뉴로 구현 (모바일 전체화면 메뉴 포함)
- **Footer**: 개인정보처리방침, Family Site 드롭다운, 주소 정보

---

## 6. 개발 환경 설정

### 초기 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env 파일이 이미 존재)
# ADMIN_PASSWORD=skku-admin-2026

# 3. Prisma 클라이언트 생성
npx prisma generate

# 4. 데이터베이스 초기화 (선택사항 - 이미 donations.db 파일 존재)
npx prisma db push

# 5. 시드 데이터 삽입 (선택사항)
npx prisma db seed

# 6. 개발 서버 시작
npm run dev
```

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npx prisma studio` | DB 관리 UI |
| `npx prisma db seed` | 샘플 데이터 시딩 |
| `npx prisma generate` | Prisma 클라이언트 재생성 |

### 관리자 접속
- URL: `http://localhost:3000/admin/login`
- 비밀번호: `.env`의 `ADMIN_PASSWORD` 값

---

## 7. 진행 현황

### 완료된 기능 (Current State)

| 기능 | 상태 | 비고 |
|------|------|------|
| 메인 페이지 전체 UI | ✅ 완료 | 반응형, 애니메이션 |
| 섹션 네비게이션 (Sticky) | ✅ 완료 | 스크롤 연동 |
| 기부 현황 표시 (API 연동) | ✅ 완료 | 카운트업 애니메이션 |
| 기부자 명단 (페이징, 검색, 필터, 정렬) | ✅ 완료 | API 연동 |
| 엑셀 다운로드 | ✅ 완료 | .xlsx 생성 |
| 관리자 로그인/로그아웃 | ✅ 완료 | Cookie 기반 |
| 관리자 대시보드 (KPI + 차트) | ✅ 완료 | 기간 필터 |
| 엑셀 업로드 (파싱 + 미리보기 + DB 저장) | ✅ 완료 | 유연한 헤더 매칭 |
| 헤더 메가메뉴 | ✅ 완료 | 학술정보관 전체 메뉴 |
| 푸터 | ✅ 완료 | Family Site 포함 |
| 미들웨어 인증 보호 | ✅ 완료 | /admin/* 보호 |
| Prisma + SQLite 설정 | ✅ 완료 | 시드 데이터 포함 |
| 빌드 성공 | ✅ 완료 | Next.js 16 standalone |

### 미완료/추가 필요 기능

| 기능 | 우선순위 | 설명 |
|------|----------|------|
| HTTPS + 도메인 설정 | 🔴 높음 | 프로덕션 배포 시 필수 |
| 인증 강화 (JWT/세션) | 🔴 높음 | 현재 고정 쿠키값 방식은 보안 취약 |
| API 인증 보호 | 🔴 높음 | /api/admin/* 엔드포인트 인증 미적용 |
| 환경변수 관리 | 🔴 높음 | .env가 git에 포함되지 않도록 관리 |
| DB 마이그레이션 전략 | 🟡 중간 | PostgreSQL 등 프로덕션 DB로 전환 |
| 에러 페이지 (404, 500) | 🟡 중간 | 커스텀 에러 페이지 미구현 |
| SEO 최적화 | 🟡 중간 | OG 이미지, sitemap.xml 등 |
| 접근성 (a11y) | 🟡 중간 | ARIA 속성, 키보드 네비게이션 |
| 테스트 코드 | 🟡 중간 | 단위/통합 테스트 없음 |
| 관리자 기부 CRUD | 🟢 낮음 | 개별 기부 수정/삭제 기능 |
| 다국어 지원 | 🟢 낮음 | 영문 페이지 |
| 이미지 최적화 | 🟢 낮음 | next.config에서 unoptimized: true |

---

## 8. QA/QC 결과

### 8.1 빌드 검증

| 항목 | 결과 | 비고 |
|------|------|------|
| `npm run build` | ✅ 성공 | 경고 없음 (TypeScript 검증은 skip 중) |
| 정적 페이지 생성 | ✅ 12/12 | 모든 페이지 정상 생성 |
| API 라우트 | ✅ 6/6 | 모든 API 핸들러 정상 |

### 8.2 보안 이슈

| 이슈 | 심각도 | 설명 | 권장 조치 |
|------|--------|------|-----------|
| **인증 토큰 고정값** | 🔴 Critical | `admin-token=authenticated` 고정 문자열 사용. 쿠키값을 알면 누구나 관리자 접근 가능 | JWT 또는 랜덤 세션 토큰으로 변경 |
| **API 인증 미적용** | 🔴 Critical | `/api/admin/upload`, `/api/donations/export` 등 관리자 API에 인증 체크 없음 (미들웨어는 /admin/* 경로만 보호) | API route handler에서 쿠키 검증 추가 |
| **.env 파일 노출 위험** | 🟡 High | `.env`가 `.gitignore`에 포함되어 있는지 확인 필요 | `.gitignore`에 `.env` 추가 확인 |
| **비밀번호 평문 비교** | 🟡 High | `ADMIN_PASSWORD`를 평문으로 비교 | bcrypt 등 해시 비교로 변경 |
| **Rate Limiting 없음** | 🟡 Medium | 로그인 API에 rate limiting 없어 무차별 대입 공격에 취약 | rate limiter 미들웨어 추가 |
| **CORS 설정 없음** | 🟢 Low | Next.js 기본 동작에 의존 중 | 명시적 CORS 헤더 설정 |
| **CSP 미설정** | 🟢 Low | Content Security Policy 미설정 | CSP 헤더 추가 |

### 8.3 코드 품질 이슈

| 이슈 | 심각도 | 파일 | 설명 |
|------|--------|------|------|
| **TypeScript 검증 비활성** | 🟡 Medium | `next.config.ts` | `ignoreBuildErrors: true` 설정으로 타입 오류 무시 중 |
| **미사용 컴포넌트 잔존** | 🟡 Medium | `src/components/Donors/` | DonarBenifits, DonarGroup 등 10개 파일 미사용 |
| **이미지 최적화 비활성** | 🟢 Low | `next.config.ts` | `images.unoptimized: true`로 Next.js 이미지 최적화 비활성 |
| **BigInt 직렬화** | 🟢 Low | `donations/route.ts` | BigInt → Number 변환 시 큰 금액에서 정밀도 손실 가능 (현실적으로 문제 없음) |
| **하드코딩된 색상값** | 🟢 Info | 전체 컴포넌트 | CSS 변수가 정의되어 있으나, 컴포넌트에서 직접 hex 값 사용 |

### 8.4 UX/UI 이슈

| 이슈 | 심각도 | 설명 |
|------|--------|------|
| **Admin Header/Footer 중복** | 🟡 Medium | 관리자 페이지에서도 메인 Header/Footer가 렌더링됨 (admin/layout.tsx에서 `fixed inset-0`으로 덮어씌움) |
| **모바일 필터 UI** | 🟢 Low | DonorList 필터 영역이 모바일에서 줄바꿈이 다소 자연스럽지 않을 수 있음 |
| **SectionNav 플리커** | 🟢 Low | Sticky 전환 시 `fixed` ↔ `relative` 전환으로 컨텐츠 점프 가능 |
| **검색 즉시 실행** | 🟢 Info | DonorList에서 검색어 입력 시 `useEffect`로 즉시 API 호출 (디바운스 없음) |

### 8.5 기능 검증 체크리스트

| 기능 | 테스트 항목 | 예상 결과 |
|------|------------|-----------|
| 메인 페이지 | 초기 로딩 | HeroSection + 전체 섹션 렌더링 |
| 기부 현황 | API 호출 | `/api/donations/summary` 정상 응답 |
| 기부자 명단 | 페이징 | 10건 단위 페이징 정상 |
| 기부자 명단 | 검색 | 이름 기반 검색 동작 |
| 기부자 명단 | 정렬 | 금액 오름/내림차순 정렬 |
| 기부자 명단 | 용도 필터 | 도서관 발전기금 / 1398 LibraryON 필터 |
| 엑셀 다운로드 | 다운로드 | .xlsx 파일 정상 생성 |
| 관리자 로그인 | 올바른 비밀번호 | 대시보드로 리다이렉트 |
| 관리자 로그인 | 잘못된 비밀번호 | 에러 메시지 표시 |
| 대시보드 | 기간 필터 | 1개월/3개월/6개월/전체 전환 |
| 대시보드 | 차트 | 월별추이(Line), 용도별(Pie), 유형별(Bar) |
| 엑셀 업로드 | 파일 선택 | 미리보기 테이블 표시 |
| 엑셀 업로드 | 업로드 | DB 저장 + 성공 메시지 |
| 로그아웃 | 클릭 | 쿠키 삭제 + 로그인 페이지 이동 |

---

## 9. 프로덕션화를 위한 개선 필요사항

### Phase 1: 보안 강화 (필수)

1. **인증 시스템 교체**
   - 현재: 고정 쿠키값 (`authenticated`)
   - 변경: JWT 토큰 또는 NextAuth.js 도입
   - 세션 만료, 토큰 갱신 로직 추가

2. **API 엔드포인트 보호**
   - `/api/admin/*` 엔드포인트에 인증 미들웨어 적용
   - 현재 middleware.ts는 페이지 라우트만 보호하므로, API route handler 내부에서도 인증 검증 필요

3. **비밀번호 관리**
   - bcrypt 등을 활용한 해시 비교
   - 환경변수를 통한 안전한 관리

4. **Rate Limiting**
   - 로그인 API에 rate limiting 적용
   - 일반 API에도 적절한 제한 적용

### Phase 2: 인프라 개선 (권장)

5. **데이터베이스 전환**
   - SQLite → PostgreSQL 또는 MySQL
   - Prisma 마이그레이션 전략 수립
   - `prisma/migrations` 디렉토리 활용

6. **배포 환경 구성**
   - Docker 컨테이너화
   - CI/CD 파이프라인 (GitHub Actions)
   - 환경별 설정 분리 (dev / staging / prod)

7. **모니터링/로깅**
   - 에러 트래킹 (Sentry 등)
   - API 요청 로깅
   - 성능 모니터링

### Phase 3: 기능 개선 (선택)

8. **관리자 기능 확장**
   - 기부 데이터 개별 수정/삭제
   - 기부자 유형/용도 관리
   - 업로드 이력 관리

9. **TypeScript 엄격 모드**
   - `next.config.ts`에서 `ignoreBuildErrors: false`로 변경
   - 타입 오류 수정

10. **코드 정리**
    - 미사용 레거시 컴포넌트 삭제
    - CSS 변수 활용도 높이기
    - 컴포넌트 단위 테스트 추가

---

## 10. API 명세

### POST `/api/admin/auth`
로그인

**Request Body:**
```json
{ "password": "string" }
```

**Response (200):**
```json
{ "success": true }
```
- Set-Cookie: `admin-token=authenticated; HttpOnly; SameSite=Strict; MaxAge=86400`

**Response (401):**
```json
{ "error": "Invalid password" }
```

---

### DELETE `/api/admin/auth`
로그아웃

**Response (200):**
```json
{ "success": true }
```
- Set-Cookie: `admin-token=; MaxAge=0`

---

### POST `/api/admin/upload`
엑셀 파일 업로드

**Request:** `multipart/form-data` (`file` 필드)

**지원하는 엑셀 컬럼 (유연한 매칭):**

| 필드 | 필수 | 매칭 가능한 헤더명 |
|------|------|-------------------|
| name | ✅ | 기부자, 기부자명, 이름, name |
| donorType | ❌ | 기부자정보, 기부자 정보, donorType, 기부자유형, 유형 |
| amount | ✅ | 기부금액, 기부 금액, 금액, amount |
| donatedAt | ❌ | 기부일, 기부날짜, 기부일자, donatedAt, 날짜 |
| purpose | ❌ | 기부용도, 기부 용도, 용도, purpose |
| note | ❌ | 비고, note, 메모, 노트 |

**Response (200):**
```json
{ "success": true, "count": 15 }
```

---

### GET `/api/donations`
기부 목록 조회

**Query Parameters:**

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| page | 1 | 페이지 번호 |
| limit | 10 | 페이지당 항목 수 |
| search | "" | 이름 검색 |
| type | "" | 기부자 유형 필터 |
| purpose | "" | 기부 용도 필터 |
| sort | "desc" | 정렬 (금액 기준, asc/desc) |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "donorType": "동문",
      "amount": 1000000,
      "donatedAt": "2024-01-15T00:00:00.000Z",
      "purpose": "1398 LibraryON",
      "note": null,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 30,
  "page": 1,
  "totalPages": 3
}
```

---

### GET `/api/donations/summary`
기부 요약 통계

**Response (200):**
```json
{
  "totalCount": 30,
  "totalAmount": 101143333,
  "projects": [
    { "purpose": "도서관 발전기금", "count": 15, "amount": 66543333 },
    { "purpose": "1398 LibraryON", "count": 15, "amount": 34600000 }
  ]
}
```

---

### GET `/api/donations/analytics`
기부 분석 데이터

**Query Parameters:**

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| period | "all" | 기간 필터 (1m, 3m, 6m, all) |

**Response (200):**
```json
{
  "totalCount": 30,
  "totalAmount": 101143333,
  "avgAmount": 3371444,
  "latestDonation": "2025-06-01T00:00:00.000Z",
  "monthlyTrend": [
    { "month": "2019-10", "count": 1, "amount": 33333 }
  ],
  "byPurpose": [
    { "purpose": "도서관 발전기금", "count": 15, "amount": 66543333 }
  ],
  "byDonorType": [
    { "donorType": "교원", "count": 5, "amount": 65650000 }
  ]
}
```

---

### GET `/api/donations/export`
엑셀 파일 다운로드

**Response:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 파일명: `donations.xlsx`
- 컬럼: No., 기부자, 기부자 정보, 기부금액, 기부일, 기부용도, 비고

---

## 11. 데이터베이스 스키마

### Donation 모델

```prisma
model Donation {
  id        Int      @id @default(autoincrement())
  name      String                    // 기부자 이름
  donorType String                    // 기부자 유형 (교원, 직원, 동문, 학부, 일반)
  amount    BigInt                    // 기부 금액 (원)
  donatedAt DateTime                  // 기부 일자
  purpose   String                    // 기부 용도 (도서관 발전기금, 1398 LibraryON)
  note      String?                   // 비고 (선택)
  createdAt DateTime @default(now())  // 레코드 생성 시각
}
```

### 시드 데이터
- 총 30건의 샘플 데이터
- 도서관 발전기금: 15건 (2019~2022)
- 1398 LibraryON: 15건 (2023~2025)
- 기부자 유형: 교원, 직원, 동문, 학부, 일반

---

## 12. 참고사항

### 알려진 제한사항
1. **SQLite 동시성**: SQLite는 동시 쓰기에 제한이 있어, 다수 관리자가 동시에 업로드하면 lock 오류 가능
2. **BigInt 직렬화**: JSON 직렬화 시 `Number()`로 변환하므로, `Number.MAX_SAFE_INTEGER`(약 9,007조원) 이상 금액은 정밀도 손실
3. **이미지 unoptimized**: standalone 빌드를 위해 이미지 최적화 비활성화 상태
4. **Middleware deprecated 경고**: Next.js 16에서 middleware → proxy 전환 권장 경고 발생 (기능에 영향 없음)

### 주요 외부 링크
- 기부 참여: `https://give.skku.edu/skku/pay/step1_direct?dontype=602j8`
- 프로젝트 안내: `https://fund.skku.edu/1398-libraryon-project`

### 컬러 팔레트
| 용도 | 색상 | 코드 |
|------|------|------|
| Primary (Navy) | 성균관대 네이비 | `#1B3A5C` |
| Accent (Red) | 성균관대 레드 | `#C8102E` |
| Secondary (Green) | 보조색 | `#00563F` |
| Background | 배경 | `#F8F6F2` |
| Text | 본문 텍스트 | `#1F222D` |
| Muted | 보조 텍스트 | `#6B7280` |
| Border | 경계선 | `#E5E2DC` |
