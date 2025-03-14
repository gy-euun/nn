import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWorkerCheckinDto {
  @ApiProperty({
    description: '출입 시간',
    example: '2025-03-15T08:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: '출입 시간은 날짜 형식이어야 합니다.' })
  @Type(() => Date)
  checkinTime?: Date;

  @ApiProperty({
    description: '퇴출 시간',
    example: '2025-03-15T17:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: '퇴출 시간은 날짜 형식이어야 합니다.' })
  @Type(() => Date)
  checkoutTime?: Date;

  @ApiProperty({
    description: '위치 정보',
    example: '현장 1층 출입구',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '위치 정보는 문자열이어야 합니다.' })
  location?: string;

  @ApiProperty({
    description: '근로자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '근로자 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 근로자 ID 형식이 아닙니다.' })
  workerId: string;
} 