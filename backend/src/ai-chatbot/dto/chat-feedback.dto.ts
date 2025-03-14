import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatFeedbackDto {
  @ApiProperty({
    example: true,
    description: '응답이 도움이 되었는지 여부',
  })
  @IsNotEmpty({ message: '피드백 여부는 필수 입력 항목입니다' })
  @IsBoolean()
  isHelpful: boolean;

  @ApiProperty({
    example: '응답이 명확하고 도움이 되었습니다.',
    description: '피드백 코멘트',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '코멘트는 최대 500자까지 입력 가능합니다' })
  comment?: string;
} 