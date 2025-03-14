import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { RiskLevel } from '@prisma/client';

export class UpdateRiskFactorDto {
  @ApiProperty({
    example: '고소 작업 추락 위험 (수정)',
    description: '위험 요소 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '제목은 최소 2자 이상이어야 합니다' })
  @MaxLength(100, { message: '제목은 최대 100자까지 입력 가능합니다' })
  title?: string;

  @ApiProperty({
    example: '작업 높이 3m 이상에서의 추락 위험 (수정)',
    description: '위험 요소 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '설명은 최소 2자 이상이어야 합니다' })
  @MaxLength(500, { message: '설명은 최대 500자까지 입력 가능합니다' })
  description?: string;

  @ApiProperty({
    example: 3,
    description: '발생 가능성 (1-5 점수)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '발생 가능성은 정수여야 합니다' })
  @Min(1, { message: '발생 가능성은 최소 1점 이상이어야 합니다' })
  @Max(5, { message: '발생 가능성은 최대 5점까지 입력 가능합니다' })
  likelihood?: number;

  @ApiProperty({
    example: 4,
    description: '심각도 (1-5 점수)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '심각도는 정수여야 합니다' })
  @Min(1, { message: '심각도는 최소 1점 이상이어야 합니다' })
  @Max(5, { message: '심각도는 최대 5점까지 입력 가능합니다' })
  severity?: number;

  @ApiProperty({
    enum: RiskLevel,
    example: 'MEDIUM',
    description: '위험 수준',
    required: false,
  })
  @IsOptional()
  @IsEnum(RiskLevel, { message: '유효한 위험 수준이 아닙니다' })
  riskLevel?: RiskLevel;

  @ApiProperty({
    example: '안전벨트 착용, 안전망 설치, 작업 전 안전교육 실시, 정기적 장비 점검',
    description: '통제 조치',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '통제 조치는 최소 2자 이상이어야 합니다' })
  @MaxLength(500, { message: '통제 조치는 최대 500자까지 입력 가능합니다' })
  controlMeasures?: string;
} 