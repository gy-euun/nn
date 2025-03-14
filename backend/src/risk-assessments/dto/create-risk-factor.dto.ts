import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { RiskLevel } from '@prisma/client';

export class CreateRiskFactorDto {
  @ApiProperty({
    example: '고소 작업 추락 위험',
    description: '위험 요소 제목',
  })
  @IsNotEmpty({ message: '제목은 필수 입력 항목입니다' })
  @IsString()
  @MinLength(2, { message: '제목은 최소 2자 이상이어야 합니다' })
  @MaxLength(100, { message: '제목은 최대 100자까지 입력 가능합니다' })
  title: string;

  @ApiProperty({
    example: '작업 높이 3m 이상에서의 추락 위험',
    description: '위험 요소 설명',
  })
  @IsNotEmpty({ message: '설명은 필수 입력 항목입니다' })
  @IsString()
  @MinLength(2, { message: '설명은 최소 2자 이상이어야 합니다' })
  @MaxLength(500, { message: '설명은 최대 500자까지 입력 가능합니다' })
  description: string;

  @ApiProperty({
    example: 4,
    description: '발생 가능성 (1-5 점수)',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: '발생 가능성은 필수 입력 항목입니다' })
  @IsInt({ message: '발생 가능성은 정수여야 합니다' })
  @Min(1, { message: '발생 가능성은 최소 1점 이상이어야 합니다' })
  @Max(5, { message: '발생 가능성은 최대 5점까지 입력 가능합니다' })
  likelihood: number;

  @ApiProperty({
    example: 5,
    description: '심각도 (1-5 점수)',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: '심각도는 필수 입력 항목입니다' })
  @IsInt({ message: '심각도는 정수여야 합니다' })
  @Min(1, { message: '심각도는 최소 1점 이상이어야 합니다' })
  @Max(5, { message: '심각도는 최대 5점까지 입력 가능합니다' })
  severity: number;

  @ApiProperty({
    enum: RiskLevel,
    example: 'HIGH',
    description: '위험 수준',
  })
  @IsNotEmpty({ message: '위험 수준은 필수 입력 항목입니다' })
  @IsEnum(RiskLevel, { message: '유효한 위험 수준이 아닙니다' })
  riskLevel: RiskLevel;

  @ApiProperty({
    example: '안전벨트 착용, 안전망 설치, 작업 전 안전교육 실시',
    description: '통제 조치',
  })
  @IsNotEmpty({ message: '통제 조치는 필수 입력 항목입니다' })
  @IsString()
  @MinLength(2, { message: '통제 조치는 최소 2자 이상이어야 합니다' })
  @MaxLength(500, { message: '통제 조치는 최대 500자까지 입력 가능합니다' })
  controlMeasures: string;
} 