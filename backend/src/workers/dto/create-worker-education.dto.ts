import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWorkerEducationDto {
  @ApiProperty({
    description: '교육 제목',
    example: '현장 안전 기본 교육',
  })
  @IsNotEmpty({ message: '교육 제목은 필수입니다.' })
  @IsString({ message: '교육 제목은 문자열이어야 합니다.' })
  title: string;

  @ApiProperty({
    description: '교육 내용',
    example: '작업장 안전 수칙 및 화재 대피 요령 교육',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '교육 내용은 문자열이어야 합니다.' })
  description?: string;

  @ApiProperty({
    description: '교육 이수일',
    example: '2025-01-15T09:00:00Z',
  })
  @IsNotEmpty({ message: '교육 이수일은 필수입니다.' })
  @IsDate({ message: '교육 이수일은 날짜 형식이어야 합니다.' })
  @Type(() => Date)
  completionDate: Date;

  @ApiProperty({
    description: '교육 만료일',
    example: '2025-07-15T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: '교육 만료일은 날짜 형식이어야 합니다.' })
  @Type(() => Date)
  expiryDate?: Date;

  @ApiProperty({
    description: '근로자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '근로자 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 근로자 ID 형식이 아닙니다.' })
  workerId: string;
} 