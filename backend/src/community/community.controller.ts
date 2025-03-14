import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  QueryPostDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('커뮤니티')
@Controller('api/v1/community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: '게시글 목록을 조회합니다 (페이지네이션, 검색, 필터링 지원)',
  })
  @ApiResponse({ status: 200, description: '게시글 목록 조회 성공' })
  async findAllPosts(@Query() queryDto: QueryPostDto) {
    return this.communityService.findAllPosts(queryDto);
  }

  @Get('posts/:id')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글의 상세 정보와 댓글을 조회합니다',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async findOnePost(@Param('id') id: string) {
    return this.communityService.findOnePost(id);
  }

  @Post('posts')
  @ApiOperation({
    summary: '게시글 작성',
    description: '새로운 게시글을 작성합니다',
  })
  @ApiResponse({ status: 201, description: '게시글 작성 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.communityService.createPost(createPostDto, req.user.id);
  }

  @Put('posts/:id')
  @ApiOperation({
    summary: '게시글 수정',
    description: '기존 게시글을 수정합니다',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.communityService.updatePost(id, updatePostDto, req.user.id);
  }

  @Delete('posts/:id')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글을 삭제합니다',
  })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async removePost(@Param('id') id: string, @Request() req) {
    return this.communityService.removePost(id, req.user.id);
  }

  @Post('comments')
  @ApiOperation({
    summary: '댓글 작성',
    description: '게시글에 댓글을 작성합니다',
  })
  @ApiResponse({ status: 201, description: '댓글 작성 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async createComment(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.communityService.createComment(createCommentDto, req.user.id);
  }

  @Delete('comments/:id')
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글을 삭제합니다',
  })
  @ApiParam({ name: 'id', description: '댓글 ID' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async removeComment(@Param('id') id: string, @Request() req) {
    return this.communityService.removeComment(id, req.user.id);
  }
} 