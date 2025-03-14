import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: '알림 제목',
    example: '프로젝트 초대',
  })
  @IsNotEmpty({ message: '알림 제목은 필수입니다.' })
  @IsString({ message: '알림 제목은 문자열이어야 합니다.' })
  title: string;

  @ApiProperty({
    description: '알림 내용',
    example: '홍길동님이 "안전 관리 프로젝트"에 초대하셨습니다.',
  })
  @IsNotEmpty({ message: '알림 내용은 필수입니다.' })
  @IsString({ message: '알림 내용은 문자열이어야 합니다.' })
  content: string;

  @ApiProperty({
    description: '알림 타입',
    enum: NotificationType,
    example: NotificationType.PROJECT_INVITATION,
  })
  @IsNotEmpty({ message: '알림 타입은 필수입니다.' })
  @IsEnum(NotificationType, { message: '유효한 알림 타입이 아닙니다.' })
  type: NotificationType;

  @ApiProperty({
    description: '알림 대상 사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '알림 대상 사용자 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  userId: string;

  @ApiProperty({
    description: '알림 관련 링크 (선택)',
    example: '/projects/550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '관련 링크는 문자열이어야 합니다.' })
  link?: string;

  @ApiProperty({
    description: '관련 엔티티 ID (선택)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '유효한 엔티티 ID 형식이 아닙니다.' })
  entityId?: string;
} 