import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '좋은 정보 공유 감사합니다!',
  })
  @IsNotEmpty({ message: '댓글 내용은 필수입니다.' })
  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  content: string;

  @ApiProperty({
    description: '게시글 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: '게시글 ID는 필수입니다.' })
  @IsUUID('4', { message: '유효한 게시글 ID 형식이 아닙니다.' })
  postId: string;
} 