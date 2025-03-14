import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPostDto {
  @ApiProperty({
    description: '검색할 게시글 제목 또는 내용 (부분 일치)',
    example: '안전',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '검색어는 문자열이어야 합니다.' })
  search?: string;

  @ApiProperty({
    description: '특정 프로젝트의 게시글만 필터링',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '유효한 프로젝트 ID 형식이 아닙니다.' })
  projectId?: string;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 게시글 수',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
} 