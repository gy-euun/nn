# 데이터베이스 보안 전략

## 민감 정보 암호화 방법

### 1. 패스워드 해싱

사용자 패스워드는 bcrypt를 사용하여 해싱되어 저장됩니다.

```typescript
// 패스워드 해싱 예시
import * as bcrypt from 'bcrypt';

// 패스워드 해싱 (저장 시)
const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

// 패스워드 검증 (로그인 시)
const isMatch = await bcrypt.compare(inputPassword, storedHashedPassword);
```

### 2. 개인정보 암호화 (pgcrypto 활용)

민감한 개인정보는 데이터베이스 레벨에서 암호화하여 저장합니다.

**PostgreSQL pgcrypto 확장 설치**:

```sql
-- PostgreSQL 데이터베이스에 접속한 후 실행
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Node.js에서 암호화/복호화 구현**:

```typescript
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  private readonly IV_LENGTH = 16;
  
  // 데이터 암호화
  encrypt(data: any): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  // 데이터 복호화
  decrypt(encryptedData: string): any {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

### 3. 전송 중 데이터 보안

- TLS/SSL을 사용하여 데이터베이스 연결
- HTTPS를 통한 API 통신
- 민감한 쿼리 파라미터 암호화

## 데이터베이스 접근 제어

### 1. 최소 권한 원칙

```sql
-- 애플리케이션 사용자 생성
CREATE USER app_user WITH PASSWORD 'strong_password';

-- 필요한 권한만 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 특정 테이블에는 제한된 권한만 부여
REVOKE DELETE ON sensitive_table FROM app_user;
```

### 2. 연결 제한

```
# postgresql.conf 설정
listen_addresses = 'localhost'  # 개발 환경
listen_addresses = '10.0.0.1'   # 프로덕션 환경 (특정 IP만)

# pg_hba.conf 설정
host    all             all             127.0.0.1/32            md5
host    all             all             10.0.0.0/24            md5
```

### 3. 사용자 역할 분리

```sql
-- 관리자 역할
CREATE ROLE admin_role;
GRANT ALL PRIVILEGES ON DATABASE industrial_safety_db TO admin_role;

-- 읽기 전용 역할
CREATE ROLE readonly_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_role;

-- 보고서 역할
CREATE ROLE reporting_role;
GRANT SELECT ON reports_view, statistics_view TO reporting_role;
```

## 데이터베이스 감사 및 모니터링

### 1. 감사 로깅 활성화

```
# postgresql.conf 설정
log_statement = 'mod'           # 데이터 수정 쿼리 로깅
log_min_duration_statement = 500  # 느린 쿼리 로깅 (500ms 이상)
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

### 2. 테이블 레벨 감사 추적

```sql
-- 감사 테이블 생성
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 감사 트리거 함수 생성
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log(table_name, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log(table_name, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log(table_name, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 중요 테이블에 감사 트리거 적용
CREATE TRIGGER user_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON "User"
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

## 데이터베이스 백업 및 복원 전략

### 1. 정기 백업 설정

- 자동 일일 백업 (전체 백업)
- 매시간 WAL 아카이빙 (증분 백업)
- 30일 보관 정책

**백업 스크립트 예시**:

```bash
#!/bin/bash
DB_NAME="industrial_safety_db"
BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql"

# 백업 디렉토리 확인
mkdir -p $BACKUP_DIR

# 백업 실행
pg_dump -h localhost -U postgres -d $DB_NAME -F c -b -v -f "$BACKUP_FILE"

# 30일 이상된 백업 삭제
find $BACKUP_DIR -name "$DB_NAME-*.sql" -mtime +30 -delete
```

### 2. 복구 시간 목표 (RTO) 및 복구 지점 목표 (RPO)

- RTO (Recovery Time Objective): 4시간 이내 
- RPO (Recovery Point Objective): 최대 1시간 데이터 손실 허용

### 3. 복구 테스트

- 분기별 복구 테스트 진행
- 복구 절차 문서화 및 리허설

## 개발 환경과 프로덕션 환경 분리

### 1. 환경별 설정 분리

```typescript
// .env.development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/industrial_safety_db?schema=public"

// .env.production
DATABASE_URL="postgresql://app_user:strong_password@production-db.example.com:5432/industrial_safety_db?schema=public&ssl=true"
```

### 2. 프로덕션 환경 추가 보안 설정

```sql
-- 프로덕션 환경에서만 적용
ALTER SYSTEM SET password_encryption = 'scram-sha-256';  -- 강력한 패스워드 해싱
ALTER SYSTEM SET ssl = on;                             -- SSL 강제
ALTER SYSTEM SET log_min_duration_statement = 1000;    -- 느린 쿼리 모니터링
``` 