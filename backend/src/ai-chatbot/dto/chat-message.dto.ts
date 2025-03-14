import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({
    example: '고소 작업시 안전벨트를 착용해야 하나요?',
    description: '사용자 질문',
  })
  @IsNotEmpty({ message: '메시지 내용은 필수 입력 항목입니다' })
  @IsString()
  @MaxLength(1000, { message: '메시지는 최대 1000자까지 입력 가능합니다' })
  content: string;
} 