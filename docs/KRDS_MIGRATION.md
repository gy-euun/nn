# KRDS UI 마이그레이션 가이드

## 개요

이 문서는 산업 안전 종합 관리 플랫폼의 프론트엔드를 Next.js 기반에서 KRDS HTML Component Kit 기반으로 마이그레이션하는 전략과 절차를 설명합니다.

## 마이그레이션 이유

- KRDS UI 라이브러리의 표준 컴포넌트를 직접 활용하기 위함
- 한국형 디자인 시스템 표준을 준수하기 위함
- 복잡한 React 생태계보다 순수 웹 기술로 단순화하기 위함
- 퍼블리셔와 개발자 간 협업 용이성 증가
- 공식 문서와 예제를 그대로 적용 가능

## 새로운 개발 환경

### 디렉토리 구조

```
frontend/
├── src/
│   ├── assets/           # 이미지, 폰트 등 정적 리소스
│   ├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── js/               # JavaScript 모듈
│   ├── layouts/          # 페이지 레이아웃 템플릿
│   ├── pages/            # 각 페이지 HTML
│   └── styles/           # SCSS 스타일시트
├── public/               # 정적 파일
├── vite.config.js        # Vite 설정 파일
└── package.json          # 프로젝트 설정 및 의존성
```

### 기술 스택

- **HTML**: 표준 마크업 언어
- **CSS/SCSS**: 스타일링
- **JavaScript**: 클라이언트 로직
- **Vite**: 빌드 도구
- **KRDS HTML Component Kit**: UI 컴포넌트 라이브러리
- **Axios**: API 통신

## 마이그레이션 계획

### 1. 환경 설정 단계

1. **Vite 프로젝트 생성**
   ```bash
   npm create vite@latest frontend-new -- --template vanilla
   cd frontend-new
   npm install
   ```

2. **KRDS UI 라이브러리 설치**
   ```bash
   npm install @krds-uiux/krds-uiux
   ```

3. **필요한 패키지 설치**
   ```bash
   npm install axios sass --save
   ```

### 2. 컴포넌트 마이그레이션 단계

1. **기본 템플릿 구조 생성**
   - 메인 레이아웃 (header, footer, sidebar)
   - 공통 컴포넌트 마크업 구현

2. **페이지별 마이그레이션**
   - 로그인/회원가입 페이지
   - 대시보드 페이지
   - 프로젝트 관리 페이지
   - 위험성 평가 페이지
   - 안전 문서 관리 페이지
   - 근로자 관리 페이지
   - 커뮤니티 페이지
   - 챗봇 인터페이스

3. **스타일 적용**
   - KRDS 디자인 시스템의 색상, 타이포그래피, 간격 등 적용
   - 반응형 레이아웃 구현

### 3. 기능 구현 단계

1. **API 통신 구현**
   ```javascript
   // src/js/api.js
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:3000/api/v1';

   // Axios 인스턴스 생성
   const api = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000,
     headers: {
       'Content-Type': 'application/json',
     }
   });

   // 요청 인터셉터 설정
   api.interceptors.request.use(config => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   // API 함수들 구현
   export const authAPI = {
     login: (credentials) => api.post('/auth/login', credentials),
     register: (userData) => api.post('/auth/register', userData),
     getMe: () => api.get('/auth/me'),
   };

   export const projectAPI = {
     getProjects: () => api.get('/projects'),
     getProjectById: (id) => api.get(`/projects/${id}`),
     createProject: (data) => api.post('/projects', data),
     updateProject: (id, data) => api.put(`/projects/${id}`, data),
   };

   // 나머지 API 함수들...
   ```

2. **인증 기능 구현**
   ```javascript
   // src/js/auth.js
   import { authAPI } from './api.js';

   export const login = async (email, password) => {
     try {
       const response = await authAPI.login({ email, password });
       const { token, user } = response.data;
       
       // 토큰 저장
       localStorage.setItem('token', token);
       localStorage.setItem('user', JSON.stringify(user));
       
       return { success: true, user };
     } catch (error) {
       return { 
         success: false, 
         error: error.response?.data?.message || '로그인에 실패했습니다.' 
       };
     }
   };

   export const logout = () => {
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     window.location.href = '/login.html';
   };

   export const isAuthenticated = () => {
     return !!localStorage.getItem('token');
   };

   export const getCurrentUser = () => {
     const userStr = localStorage.getItem('user');
     return userStr ? JSON.parse(userStr) : null;
   };
   ```

3. **페이지 라우팅**
   - 단순 HTML 페이지 기반 라우팅
   - 필요시 history API 활용

### 4. 테스트 단계

1. **크로스 브라우저 테스트**
   - Chrome, Firefox, Safari, Edge 호환성 확인

2. **반응형 디자인 테스트**
   - 모바일, 태블릿, 데스크톱 화면 테스트

3. **성능 최적화**
   - 이미지 최적화
   - JavaScript 코드 분할
   - CSS 최적화

## 마이그레이션 일정

| 단계 | 기간 | 주요 작업 |
|------|------|-----------|
| 환경 설정 | 1주 | Vite 설정, KRDS 라이브러리 통합, 기본 구조 설계 |
| 컴포넌트 마이그레이션 | 3주 | 페이지별 마크업 및 스타일 구현 |
| 기능 구현 | 2주 | API 통신, 인증, 데이터 관리 등 |
| 테스트 및 최적화 | 1주 | 다양한 환경에서 테스트 및 성능 최적화 |

## 참고 자료

- [KRDS UI 공식 문서](https://github.com/KRDS-uiux/krds-uiux)
- [Vite 공식 문서](https://vitejs.dev/guide/)
- [MDN 웹 문서](https://developer.mozilla.org/ko/) 