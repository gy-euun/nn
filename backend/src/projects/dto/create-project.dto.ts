import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: '화학 공장 안전 관리 프로젝트',
    description: '프로젝트 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '프로젝트 이름은 필수 입력 항목입니다' })
  @MinLength(2, { message: '프로젝트 이름은 최소 2자 이상이어야 합니다' })
  @MaxLength(100, { message: '프로젝트 이름은 최대 100자까지 가능합니다' })
  name: string;

  @ApiProperty({
    example: '화학 공장의 안전 관리를 위한 프로젝트입니다.',
    description: '프로젝트 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '프로젝트 설명은 최대 500자까지 가능합니다' })
  description?: string;

  @ApiProperty({
    example: '2023-01-01',
    description: '프로젝트 시작일',
  })
  @IsDateString()
  @IsNotEmpty({ message: '프로젝트 시작일은 필수 입력 항목입니다' })
  startDate: string;

  @ApiProperty({
    example: '2023-12-31',
    description: '프로젝트 종료일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
} 