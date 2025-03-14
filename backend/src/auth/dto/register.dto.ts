import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다' })
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: '사용자 비밀번호 (최소 8자)',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다' })
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다' })
  name: string;
} 