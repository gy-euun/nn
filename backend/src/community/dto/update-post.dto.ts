import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '현장 안전 수칙 공유 (수정)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '게시글 제목은 문자열이어야 합니다.' })
  title?: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '수정된 내용: 오늘 현장에서 발견한 위험 요소와 대처 방법을 공유합니다...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '게시글 내용은 문자열이어야 합니다.' })
  content?: string;

  @ApiProperty({
    description: '관련 프로젝트 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '유효한 프로젝트 ID 형식이 아닙니다.' })
  projectId?: string;
} 