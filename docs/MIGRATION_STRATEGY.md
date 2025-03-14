# 데이터베이스 마이그레이션 전략

## 개발 환경에서의 마이그레이션

1. **마이그레이션 생성**
   ```bash
   npx prisma migrate dev --name 변경_내용_요약
   ```
   - 스키마 변경 후 항상 이 명령어 실행
   - 마이그레이션 이름은 변경 내용을 간결하게 표현 (예: add_user_profile)

2. **마이그레이션 롤백**
   - Prisma는 공식적인 롤백 기능을 제공하지 않음
   - 롤백이 필요한 경우:
     - 이전 상태로 스키마 복원
     - `npx prisma migrate dev` 실행하여 복원 마이그레이션 생성

3. **스키마 리셋 (개발 환경 전용)**
   ```bash
   npx prisma migrate reset
   ```
   - 데이터베이스 삭제 후 재생성
   - 모든 마이그레이션 적용
   - 시드 데이터 재생성

## 스테이징 환경에서의 마이그레이션

1. **마이그레이션 적용**
   ```bash
   npx prisma migrate deploy
   ```
   - 개발 환경에서 생성된 마이그레이션 파일 적용
   - CI/CD 파이프라인에 포함시켜 자동화

2. **테스트 절차**
   - 마이그레이션 전 데이터베이스 백업
   - 마이그레이션 적용 후 API 및 데이터 무결성 테스트

## 프로덕션 환경에서의 마이그레이션

1. **마이그레이션 계획**
   - 다운타임이 필요한지 확인
   - 마이그레이션 위험성 평가
   - 롤백 전략 수립

2. **마이그레이션 적용**
   ```bash
   npx prisma migrate deploy
   ```
   - 정기 유지보수 시간에 적용
   - 모니터링 시스템 강화

3. **주의사항**
   - `cascadeDelete` 관계 변경 시 주의
   - 필수 필드 추가 시 기본값 제공 필요
   - 대용량 테이블 스키마 변경 시 성능 고려

## 복잡한 마이그레이션 처리

1. **데이터 마이그레이션이 필요한 경우**
   - 별도의 마이그레이션 스크립트 작성
   - 배치 프로세스로 대용량 데이터 처리

2. **예시: 컬럼 분할**
   ```typescript
   // migrations/scripts/split_name_column.ts
   import { PrismaClient } from '@prisma/client';
   
   const prisma = new PrismaClient();
   
   async function migrateData() {
     const users = await prisma.user.findMany({
       select: { id: true, fullName: true }
     });
     
     for (const user of users) {
       const [firstName, lastName] = user.fullName.split(' ');
       await prisma.user.update({
         where: { id: user.id },
         data: { firstName, lastName }
       });
     }
   }
   
   migrateData()
     .catch(console.error)
     .finally(() => prisma.$disconnect());
   ```

3. **실행 방법**
   ```bash
   # 스키마 변경 마이그레이션 적용
   npx prisma migrate deploy
   
   # 데이터 마이그레이션 스크립트 실행
   npx ts-node migrations/scripts/split_name_column.ts
   ```

## 마이그레이션 히스토리 관리

1. **Git을 통한 관리**
   - `prisma/migrations` 디렉토리를 Git에 포함
   - 팀원 간 마이그레이션 동기화

2. **마이그레이션 명명 규칙**
   - 날짜_변경내용 형식 권장 (자동 생성됨)
   - 동일한 마이그레이션에 여러 스키마 변경 포함 가능

## 마이그레이션 모범 사례

1. **마이그레이션 단위 최소화**
   - 하나의 마이그레이션에 관련 변경 사항만 포함
   - 큰 변경은 여러 단계로 나누어 진행

2. **개발 주기 중 마이그레이션 계획**
   - 스프린트 시작 시 스키마 변경 계획 수립
   - 마이그레이션 위험 평가

3. **데이터베이스 무결성 유지**
   - 참조 무결성 검사
   - 데이터 마이그레이션 검증 쿼리

4. **성능 고려**
   - 대용량 테이블 변경 시 성능 영향 예측
   - 필요한 경우 다운타임 계획

## 일반적인 마이그레이션 시나리오

### 1. 새 필드 추가

```prisma
// 선택적 필드 추가 (영향 적음)
model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
  bio   String? // 새로운 선택적 필드
}

// 필수 필드 추가 (기본값 필요)
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  name       String
  isActive   Boolean  @default(true) // 새로운 필수 필드
  updatedAt  DateTime @default(now()) // 새로운 필수 필드
}
```

### 2. 필드 이름 변경

Prisma는 필드 이름 변경을 지원하지 않으므로 수동 처리 필요:

```prisma
// 1. 새 필드 추가
model User {
  id        String @id @default(uuid())
  email     String @unique
  fullName  String // 기존 필드
  name      String? // 새 필드 (임시로 선택적)
}

// 2. 데이터 마이그레이션 스크립트 작성
// 3. 기존 필드 제거 및 새 필드 필수화
model User {
  id        String @id @default(uuid())
  email     String @unique
  name      String // 새 필드 (이제 필수)
}
```

### 3. 관계 변경

```prisma
// 일대다 관계를 다대다로 변경
// 1. 중간 테이블 추가
model Post {
  id        String     @id @default(uuid())
  title     String
  tags      TagsOnPosts[]
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  posts     TagsOnPosts[]
}

model TagsOnPosts {
  post      Post       @relation(fields: [postId], references: [id])
  postId    String
  tag       Tag        @relation(fields: [tagId], references: [id])
  tagId     String
  
  @@id([postId, tagId])
}
``` 