# SKKU 도서관 발전기금 사이트

성균관대학교 학술정보관 발전기금 독립 사이트

## 프로젝트 구조

\`\`\`
donors-standalone/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   ├── page.tsx        # 메인 페이지
│   │   └── globals.css     # 전역 스타일
│   └── components/
│       └── Donors/         # 발전기금 관련 컴포넌트
├── public/
│   └── images/            # 이미지 파일
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
\`\`\`

## 설치

\`\`\`bash
cd donors-standalone
npm install
# 또는
pnpm install
\`\`\`

## 개발 서버 실행

\`\`\`bash
npm run dev
# 또는
pnpm dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 빌드

\`\`\`bash
npm run build
npm start
\`\`\`

## 배포

이 프로젝트는 Next.js standalone 모드로 빌드되며, Docker나 다른 호스팅 환경에서 배포할 수 있습니다.

## 주요 기능

- **안내**: 로욜라 원 프로젝트 소개
- **기부현황**: 기부 통계 및 상세 내역
- **기부자단**: 기부자 명단 조회
- **기부자혜택**: 기부자 혜택 안내 (iframe)

