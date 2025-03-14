import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다' })
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: '사용자 비밀번호',
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다' })
  password: string;
} 