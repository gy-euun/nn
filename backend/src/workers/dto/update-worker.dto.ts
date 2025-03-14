import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateWorkerDto {
  @ApiProperty({
    description: '근로자 이름',
    example: '홍길동',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '근로자 이름은 문자열이어야 합니다.' })
  name?: string;

  @ApiProperty({
    description: '연락처',
    example: '010-1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '연락처는 문자열이어야 합니다.' })
  contactNumber?: string;

  @ApiProperty({
    description: '직책 또는 직무',
    example: '용접공',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '직책은 문자열이어야 합니다.' })
  position?: string;

  @ApiProperty({
    description: '프로젝트 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '유효한 프로젝트 ID 형식이 아닙니다.' })
  projectId?: string;
} 