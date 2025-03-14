import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @ApiProperty({
    example: '화학 공장 안전 관리 프로젝트 (업데이트)',
    description: '프로젝트 이름',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: '프로젝트 이름은 최소 2자 이상이어야 합니다' })
  @MaxLength(100, { message: '프로젝트 이름은 최대 100자까지 가능합니다' })
  name?: string;

  @ApiProperty({
    example: '화학 공장의 안전 관리를 위한 업데이트된 프로젝트입니다.',
    description: '프로젝트 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '프로젝트 설명은 최대 500자까지 가능합니다' })
  description?: string;

  @ApiProperty({
    example: '2023-02-01',
    description: '프로젝트 시작일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-01-31',
    description: '프로젝트 종료일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: '프로젝트 상태',
    enum: ProjectStatus,
    required: false,
  })
  @IsEnum(ProjectStatus, { message: '유효한 프로젝트 상태가 아닙니다' })
  @IsOptional()
  status?: ProjectStatus;
} 