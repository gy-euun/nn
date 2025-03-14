import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AssessmentStatus } from '@prisma/client';

export class UpdateRiskAssessmentDto {
  @ApiProperty({
    example: '철골 작업 위험성 평가 (수정)',
    description: '위험성 평가 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '제목은 최소 2자 이상이어야 합니다' })
  @MaxLength(100, { message: '제목은 최대 100자까지 입력 가능합니다' })
  title?: string;

  @ApiProperty({
    example: '3층 철골 작업에 대한 위험성 평가 및 관리 방안 (수정)',
    description: '위험성 평가 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '설명은 최대 500자까지 입력 가능합니다' })
  description?: string;

  @ApiProperty({
    enum: AssessmentStatus,
    example: 'COMPLETED',
    description: '위험성 평가 상태',
    required: false,
  })
  @IsOptional()
  @IsEnum(AssessmentStatus, { message: '유효한 평가 상태가 아닙니다' })
  status?: AssessmentStatus;
} 