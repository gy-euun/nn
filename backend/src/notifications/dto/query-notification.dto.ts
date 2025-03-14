import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../enums/notification-type.enum';

export class QueryNotificationDto {
  @ApiProperty({
    description: '알림 타입으로 필터링',
    enum: NotificationType,
    example: NotificationType.PROJECT_INVITATION,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType, { message: '유효한 알림 타입이 아닙니다.' })
  type?: NotificationType;

  @ApiProperty({
    description: '읽음 상태로 필터링',
    example: false,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: '읽음 상태는 불리언이어야 합니다.' })
  isRead?: boolean;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 알림 수',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
} 