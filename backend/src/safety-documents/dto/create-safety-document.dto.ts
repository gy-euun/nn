import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';
import { Type } from 'class-transformer';

export class CreateSafetyDocumentDto {
  @ApiProperty({
    description: '문서 제목',
    example: '현장 안전 매뉴얼 v1.2',
  })
  @IsNotEmpty({ message: '문서 제목은 필수입니다.' })
  @IsString({ message: '문서 제목은 문자열이어야 합니다.' })
  title: string;

  @ApiProperty({
    description: '문서 설명',
    example: '현장 작업자를 위한 안전 매뉴얼 최신 버전',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '문서 설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiProperty({
    description: '문서 저장 경로',
    example: '/uploads/safety-manuals/manual-v1.2.pdf',
  })
  @IsNotEmpty({ message: '문서 저장 경로는 필수입니다.' })
  @IsString({ message: '문서 저장 경로는 문자열이어야 합니다.' })
  filePath: string;

  @ApiProperty({
    description: '문서 타입',
    enum: DocumentType,
    example: DocumentType.MANUAL,
  })
  @IsNotEmpty({ message: '문서 타입은 필수입니다.' })
  @IsEnum(DocumentType, { message: '유효한 문서 타입이 아닙니다.' })
  documentType: DocumentType;

  @ApiProperty({
    description: '관련 프로젝트 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '유효한 프로젝트 ID 형식이 아닙니다.' })
  projectId?: string;

  @ApiProperty({
    description: '문서 유효 기간 시작일',
    example: '2025-01-01T00:00:00Z',
  })
  @IsNotEmpty({ message: '문서 유효 기간 시작일은 필수입니다.' })
  @IsDate({ message: '문서 유효 기간 시작일은 날짜 형식이어야 합니다.' })
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({
    description: '문서 유효 기간 종료일',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: '문서 유효 기간 종료일은 날짜 형식이어야 합니다.' })
  @Type(() => Date)
  validUntil?: Date;
} 