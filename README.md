# 산업 안전 종합 관리 플랫폼

산업 현장의 안전과 효율성을 향상시키는 종합 관리 솔루션입니다.

## 프로젝트 구조

```
industrial-safety-app/
├── frontend/           # HTML/CSS/JS (KRDS 컴포넌트 기반) 프론트엔드
├── backend/            # NestJS 백엔드
└── docs/               # 프로젝트 문서
```

## 기술 스택

### 프론트엔드
* **기반 기술**: HTML/CSS/JavaScript (바닐라)
* **UI 라이브러리**: KRDS HTML Component Kit
* **빌드 도구**: Vite
* **스타일링**: SCSS
* **HTTP 클라이언트**: Axios

### 백엔드
- **프레임워크**: NestJS
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **API**: RESTful + 선택적 GraphQL
- **인증**: JWT + OAuth2.0

### AI/ML
- **LLM API**: OpenAI API
- **벡터 DB**: Supabase Vecs (pgvector)
- **임베딩**: OpenAI 임베딩 API

### 인프라/DevOps
- **클라우드**: 네이버 클라우드
- **배포**: 네이버 클라우드
- **CI/CD**: GitHub Actions
- **모니터링**: 네이버 클라우드

## 개발 환경 설정

### 사전 요구사항
- Node.js 18 이상
- npm 9 이상
- PostgreSQL 14 이상

### 프론트엔드 설정

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 백엔드 설정

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# .env 파일 설정
# .env.example 파일을 복사하여 .env 파일을 생성하고 필요한 환경 변수를 설정합니다.

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run start:dev
```

## API 문서

백엔드 서버가 실행되면 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:
http://localhost:3000/api

## 배포

### 프론트엔드 배포

```bash
cd frontend
npm run build
```

### 백엔드 배포

```bash
cd backend
npm run build
```

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 