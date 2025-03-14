import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';
import { Type } from 'class-transformer';

export class QuerySafetyDocumentDto {
  @ApiProperty({
    description: '검색할 문서 제목 (부분 일치)',
    example: '안전 매뉴얼',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '문서 제목은 문자열이어야 합니다.' })
  title?: string;

  @ApiProperty({
    description: '문서 타입으로 필터링',
    enum: DocumentType,
    example: DocumentType.MANUAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(DocumentType, { message: '유효한 문서 타입이 아닙니다.' })
  documentType?: DocumentType;

  @ApiProperty({
    description: '특정 프로젝트 문서 필터링',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '유효한 프로젝트 ID 형식이 아닙니다.' })
  projectId?: string;

  @ApiProperty({
    description: '현재 유효한 문서만 필터링 (현재 날짜가 validFrom과 validUntil 사이)',
    example: 'true',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  onlyValid?: boolean;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 문서 수',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
} 