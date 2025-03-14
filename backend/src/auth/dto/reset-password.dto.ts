import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-123456',
    description: '비밀번호 재설정 토큰',
  })
  @IsString()
  @IsNotEmpty({ message: '토큰은 필수 항목입니다' })
  token: string;

  @ApiProperty({
    example: 'newSecurePassword123',
    description: '새 비밀번호 (최소 8자)',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다' })
  password: string;
} 