# 성균관대학교 학술정보관 발전기금 | 1398 LibraryON

> **전통을 켜다, 지식을 ON하다** — 체험형 지식문화공간, 미래형 첨단 도서관의 기준

성균관대학교 학술정보관 **1398 LibraryON 프로젝트** 발전기금 모금 웹 시스템입니다.
기부 현황 시각화, 기부자 명단 공개, 관리자 대시보드 및 엑셀 기반 데이터 관리를 제공합니다.

---

## 주요 기능

### 사용자 페이지 (`/`)
- 프로젝트 비전 소개 (스마트 도서관, 멀티 학습 공간, 문화 체험)
- 기부 현황 실시간 표시 (카운트업 애니메이션)
- 기부자 명단 조회 (검색, 필터, 정렬, 페이징)
- 기부자 예우 등급 안내
- 기부 참여 안내 및 연락처
- 엑셀 다운로드

### 관리자 페이지 (`/admin`)
- 비밀번호 기반 로그인
- 대시보드: KPI 카드 + 차트 3종 (월별 추이, 용도별, 유형별)
- 기간별 필터 (1개월 / 3개월 / 6개월 / 전체)
- 엑셀 파일 업로드 (유연한 헤더 매칭, 미리보기)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, Standalone) |
| UI | React 19 + Tailwind CSS 4 |
| Animation | Framer Motion |
| Charts | Recharts |
| ORM | Prisma 6 |
| Database | SQLite |
| Excel | SheetJS (xlsx) |
| Icons | Lucide React |
| Language | TypeScript 5 |

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. Prisma 클라이언트 생성
npx prisma generate

# 3. DB 초기화 + 시드 데이터
npx prisma db push
npx prisma db seed

# 4. 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 관리자 접속
- URL: `http://localhost:3000/admin/login`
- 비밀번호: `.env` 파일의 `ADMIN_PASSWORD` 값

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npx prisma studio` | DB 관리 UI |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # 메인 페이지
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── admin/                      # 관리자 페이지
│   │   ├── page.tsx                #   대시보드
│   │   ├── login/page.tsx          #   로그인
│   │   └── upload/page.tsx         #   엑셀 업로드
│   └── api/
│       ├── admin/auth/route.ts     # 인증 API
│       ├── admin/upload/route.ts   # 업로드 API
│       └── donations/              # 기부 데이터 API
│           ├── route.ts            #   목록 (페이징/필터)
│           ├── summary/route.ts    #   요약 통계
│           ├── analytics/route.ts  #   분석 데이터
│           └── export/route.ts     #   엑셀 내보내기
├── components/
│   ├── Donors/                     # 기부 관련 컴포넌트
│   └── UI/                         # Header, Footer
├── lib/prisma.ts                   # Prisma 클라이언트
└── middleware.ts                   # 인증 미들웨어

prisma/
├── schema.prisma                   # DB 스키마
└── seed.ts                         # 시드 데이터 (30건)

docs/
└── backend-architecture.drawio     # 아키텍처 다이어그램
```

---

## 아키텍처

```
Client (Browser)
  ├── Public: Hero → Vision → Status → DonorList → Benefits → Guide
  └── Admin:  Login → Dashboard (Charts) → Upload (Excel)
        │
        ▼
Middleware (/admin/* 경로 보호, Cookie 인증)
        │
        ▼
API Layer (Next.js Route Handlers)
  ├── Auth:  POST/DELETE /api/admin/auth
  ├── Import: POST /api/admin/upload
  └── Read:  GET /api/donations, /summary, /analytics, /export
        │
        ▼
Data Layer (Prisma ORM → SQLite)
  └── Donation { id, name, donorType, amount, donatedAt, purpose, note }
```

상세 아키텍처 다이어그램: `docs/backend-architecture.drawio` (draw.io에서 열기)

---

## API 요약

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/admin/auth` | 로그인 | - |
| DELETE | `/api/admin/auth` | 로그아웃 | - |
| POST | `/api/admin/upload` | 엑셀 업로드 | Cookie |
| GET | `/api/donations` | 기부 목록 (페이징/필터/정렬) | - |
| GET | `/api/donations/summary` | 요약 통계 | - |
| GET | `/api/donations/analytics` | 분석 데이터 (기간 필터) | - |
| GET | `/api/donations/export` | 엑셀 다운로드 | - |

---

## 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `ADMIN_PASSWORD` | 관리자 비밀번호 | `skku-admin-2026` |

---

## 문서

| 문서 | 설명 |
|------|------|
| [HANDOVER.md](./HANDOVER.md) | 인수인계서 (상세 구조, API 명세, QA/QC, 개선사항) |
| [docs/backend-architecture.drawio](./docs/backend-architecture.drawio) | 백엔드 아키텍처 다이어그램 |

---

## 라이선스

성균관대학교 학술정보관 내부 프로젝트
