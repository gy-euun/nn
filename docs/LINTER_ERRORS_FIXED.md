# 린터 에러 수정 내용

## 개요

본 문서는 산업 안전 종합 관리 플랫폼의 API 구현 과정에서 발생한 린터 에러와 그 해결 방법을 정리합니다.

## 주요 린터 에러 목록

1. **모듈 관련 에러**
   - `Cannot find module '@nestjs/jwt' or its corresponding type declarations.`
   - `Cannot find module '@nestjs/passport' or its corresponding type declarations.`
   - `Cannot find module 'passport-jwt' or its corresponding type declarations.`
   - `Cannot find module './guards/jwt-auth.guard' or its corresponding type declarations.`

2. **스키마 필드 관련 에러**
   - `Object literal may only specify known properties, and 'lastLogin' does not exist in type ...`
   - `Object literal may only specify known properties, and 'profileImage' does not exist in type ...`
   - `Property 'passwordReset' does not exist on type 'PrismaService'.`

## 해결 방법

### 1. 모듈 설치

다음 명령어를 통해 인증에 필요한 패키지와 타입 정의를 설치했습니다:

```bash
npm install @nestjs/jwt passport passport-jwt @nestjs/passport
```

### 2. 스키마 필드 추가 및 마이그레이션

1. `User` 모델에 필요한 필드 추가:
   - `lastLogin: DateTime?` - 마지막 로그인 시간
   - `profileImage: String?` - 프로필 이미지 URL

   ```prisma
   model User {
     id                String            @id @default(uuid())
     email             String            @unique
     password          String
     name              String
     role              UserRole          @default(USER)
     createdAt         DateTime          @default(now())
     updatedAt         DateTime          @updatedAt
     lastLogin         DateTime?
     profileImage      String?
     // 다른 필드들...
   }
   ```

2. Prisma 마이그레이션 수행:
   ```bash
   npx prisma migrate dev --name add_profile_image
   ```

3. Prisma 클라이언트 재생성:
   ```bash
   npx prisma generate
   ```

### 3. `PasswordReset` 모델 추가

비밀번호 재설정 기능을 위해 `PasswordReset` 모델을 추가했습니다:

```prisma
model PasswordReset {
  id        String   @id @default(uuid())
  token     String   @unique
  expires   DateTime
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. 빌드 수행

TypeScript 변경사항을 적용하기 위해 프로젝트를 다시 빌드했습니다:

```bash
npm run build
```

## 결과

위와 같은 조치를 통해 모든 린터 에러를 해결하고, 정상적으로 애플리케이션이 빌드 및 실행되도록 했습니다. 이제 Swagger UI를 통해 API를 테스트할 수 있습니다:

- Swagger UI: `http://localhost:3000/api`

## 참고사항

1. Prisma 스키마 변경 후 항상 `prisma generate` 명령어를 실행하여 타입 정의를 최신 상태로 유지해야 합니다.
2. 타입 에러가 계속 발생하는 경우 IDE에서 TypeScript 서버를 재시작하거나 프로젝트를 다시 빌드하는 것이 도움이 될 수 있습니다.
3. 변경사항이 많은 경우 TypeScript 서버가 변경사항을 즉시 반영하지 못할 수 있으므로, 에디터를 재시작하는 것도 고려해볼 수 있습니다. 