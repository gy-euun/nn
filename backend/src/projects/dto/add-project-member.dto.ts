import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class AddProjectMemberDto {
  @ApiProperty({
    example: 'member@example.com',
    description: '초대할 사용자의 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다' })
  email: string;

  @ApiProperty({
    example: 'MEMBER',
    description: '멤버 역할',
    enum: ProjectRole,
  })
  @IsEnum(ProjectRole, { message: '유효한 프로젝트 역할이 아닙니다' })
  @IsNotEmpty({ message: '역할은 필수 입력 항목입니다' })
  role: ProjectRole;
} 