import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRiskAssessmentDto {
  @ApiProperty({
    example: '철골 작업 위험성 평가',
    description: '위험성 평가 제목',
  })
  @IsNotEmpty({ message: '제목은 필수 입력 항목입니다' })
  @IsString()
  @MinLength(2, { message: '제목은 최소 2자 이상이어야 합니다' })
  @MaxLength(100, { message: '제목은 최대 100자까지 입력 가능합니다' })
  title: string;

  @ApiProperty({
    example: '3층 철골 작업에 대한 위험성 평가 및 관리 방안',
    description: '위험성 평가 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '설명은 최대 500자까지 입력 가능합니다' })
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '프로젝트 ID',
  })
  @IsNotEmpty({ message: '프로젝트 ID는 필수 입력 항목입니다' })
  @IsString()
  projectId: string;
} 