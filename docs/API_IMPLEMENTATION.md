# API 구현 현황

## 개요

이 문서는 산업 안전 종합 관리 플랫폼의 API 구현 현황을 추적합니다. API_SPEC.md 문서에 정의된 API 엔드포인트의 구현 상태를 기록합니다.

## 인증 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/auth/register` | POST | 회원가입 | ✅ 구현 완료 | - |
| `/api/v1/auth/login` | POST | 로그인 | ✅ 구현 완료 | - |
| `/api/v1/auth/forgot-password` | POST | 비밀번호 재설정 요청 | ✅ 구현 완료 | 실제 이메일 발송 기능 미구현 |
| `/api/v1/auth/reset-password` | POST | 비밀번호 재설정 | ✅ 구현 완료 | - |
| `/api/v1/auth/me` | GET | 내 정보 조회 | ✅ 구현 완료 | JWT 인증 필요 |

## 사용자 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/users/me` | GET | 사용자 정보 조회 | 🔄 구현 예정 | - |
| `/api/v1/users/me` | PUT | 사용자 정보 수정 | 🔄 구현 예정 | - |

## 프로젝트 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/projects` | GET | 프로젝트 목록 조회 | 🔄 구현 예정 | - |
| `/api/v1/projects` | POST | 프로젝트 생성 | 🔄 구현 예정 | - |
| `/api/v1/projects/{id}` | GET | 프로젝트 상세 조회 | 🔄 구현 예정 | - |
| `/api/v1/projects/{id}` | PUT | 프로젝트 수정 | 🔄 구현 예정 | - |
| `/api/v1/projects/{id}/members` | POST | 프로젝트 멤버 추가 | 🔄 구현 예정 | - |

## 위험성 평가 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/projects/{id}/risk-assessments` | GET | 위험성 평가 목록 조회 | 🔄 구현 예정 | - |
| `/api/v1/risk-assessment/analyze` | POST | 위험성 평가 생성 | 🔄 구현 예정 | GPT API 연동 필요 |
| `/api/v1/risk-assessment/{id}` | GET | 위험성 평가 상세 조회 | 🔄 구현 예정 | - |
| `/api/v1/risk-assessment/{assessment_id}/factors/{factor_id}` | PUT | 위험 요인 개선조치 업데이트 | 🔄 구현 예정 | - |

## AI 챗봇 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/chatbot/query` | POST | 챗봇 메시지 전송 | 🔄 구현 예정 | GPT API 연동 필요 |
| `/api/v1/chatbot/feedback` | POST | 챗봇 피드백 제공 | 🔄 구현 예정 | - |

## 안전자료실 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/safety-docs` | GET | 문서 목록 조회 | 🔄 구현 예정 | - |
| `/api/v1/safety-docs` | POST | 문서 업로드 | 🔄 구현 예정 | 파일 업로드 기능 필요 |
| `/api/v1/safety-docs/{id}` | GET | 문서 상세 조회 | 🔄 구현 예정 | - |
| `/api/v1/safety-docs/{id}/download` | GET | 문서 다운로드 | 🔄 구현 예정 | - |

## 근로자 관리 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/workers` | GET | 근로자 목록 조회 | 🔄 구현 예정 | - |
| `/api/v1/workers` | POST | 근로자 추가 | 🔄 구현 예정 | - |
| `/api/v1/workers/{id}` | GET | 근로자 상세 조회 | 🔄 구현 예정 | - |
| `/api/v1/workers/{id}/checkin` | POST | 근로자 출입 기록 | 🔄 구현 예정 | - |

## 알림 API

| 엔드포인트 | 메소드 | 설명 | 상태 | 비고 |
|------------|--------|------|------|------|
| `/api/v1/notifications` | GET | 알림 목록 조회 | 🔄 구현 예정 | - |
| `/api/v1/notifications/{id}/read` | PUT | 알림 읽음 처리 | 🔄 구현 예정 | - |

## 구현 계획

1. **1단계: 인증 및 사용자 관리 API (완료)**
   - 회원가입, 로그인, 비밀번호 재설정
   - JWT 기반 인증 시스템

2. **2단계: 프로젝트 관리 API (진행 중)**
   - 프로젝트 CRUD
   - 프로젝트 멤버 관리

3. **3단계: 위험성 평가 및 안전 문서 API**
   - 위험성 평가 생성 및 관리
   - 안전 문서 업로드 및 관리
   - OpenAI API 연동

4. **4단계: 근로자 관리 및 알림 API**
   - 근로자 등록 및 관리
   - 출입 기록 관리
   - 알림 시스템

5. **5단계: AI 챗봇 API**
   - 챗봇 메시지 처리
   - 문서 참조 기능
   - 피드백 시스템

## API 테스트 환경

- **Swagger UI**: `http://localhost:3000/api`
- **Postman 컬렉션**: `docs/postman/industrial-safety-api.json` (예정)

## 인증 및 권한 관리

- **인증 방식**: JWT (JSON Web Token)
- **토큰 만료 시간**: 1일 (환경 변수로 설정 가능)
- **권한 레벨**:
  - `ADMIN`: 시스템 관리자
  - `USER`: 일반 사용자
  - 프로젝트별 역할: `OWNER`, `ADMIN`, `MEMBER` 