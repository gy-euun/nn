import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { AccessLevel } from '../enums/access-level.enum';

export class DocumentAccessDto {
  @ApiProperty({
    description: '문서 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '문서 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 문서 ID 형식이 아닙니다.' })
  documentId: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  userId: string;

  @ApiProperty({
    description: '접근 권한 레벨',
    enum: AccessLevel,
    example: AccessLevel.READ,
  })
  @IsNotEmpty({ message: '접근 권한 레벨은 필수입니다.' })
  @IsEnum(AccessLevel, { message: '유효한 접근 권한 레벨이 아닙니다.' })
  accessLevel: AccessLevel;
}

export class GrantDocumentAccessDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  userId: string;

  @ApiProperty({
    description: '접근 권한 레벨',
    enum: AccessLevel,
    example: AccessLevel.READ,
  })
  @IsNotEmpty({ message: '접근 권한 레벨은 필수입니다.' })
  @IsEnum(AccessLevel, { message: '유효한 접근 권한 레벨이 아닙니다.' })
  accessLevel: AccessLevel;
} 