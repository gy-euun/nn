import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Put,
} from '@nestjs/common';
import { SafetyDocumentsService } from './safety-documents.service';
import {
  CreateSafetyDocumentDto,
  GrantDocumentAccessDto,
  QuerySafetyDocumentDto,
  UpdateSafetyDocumentDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('안전 문서 관리')
@Controller('api/v1/safety-documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SafetyDocumentsController {
  constructor(private readonly safetyDocumentsService: SafetyDocumentsService) {}

  @Get()
  @ApiOperation({
    summary: '문서 목록 조회',
    description: '사용자가 접근 가능한 문서 목록을 조회합니다 (페이지네이션, 필터링 지원)',
  })
  @ApiResponse({ status: 200, description: '문서 목록 조회 성공' })
  async findAll(@Request() req, @Query() queryDto: QuerySafetyDocumentDto) {
    return this.safetyDocumentsService.findAll(req.user.id, queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '문서 상세 조회',
    description: '특정 문서의 상세 정보를 조회합니다',
  })
  @ApiParam({ name: 'id', description: '문서 ID' })
  @ApiResponse({ status: 200, description: '문서 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.safetyDocumentsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({
    summary: '문서 생성',
    description: '새로운 안전 문서를 생성합니다',
  })
  @ApiResponse({ status: 201, description: '문서 생성 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async create(@Body() createSafetyDocumentDto: CreateSafetyDocumentDto, @Request() req) {
    return this.safetyDocumentsService.create(createSafetyDocumentDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '문서 수정',
    description: '기존 안전 문서를 수정합니다',
  })
  @ApiParam({ name: 'id', description: '문서 ID' })
  @ApiResponse({ status: 200, description: '문서 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() updateSafetyDocumentDto: UpdateSafetyDocumentDto,
    @Request() req,
  ) {
    return this.safetyDocumentsService.update(id, updateSafetyDocumentDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '문서 삭제',
    description: '안전 문서를 삭제합니다',
  })
  @ApiParam({ name: 'id', description: '문서 ID' })
  @ApiResponse({ status: 200, description: '문서 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.safetyDocumentsService.remove(id, req.user.id);
  }

  @Post(':id/access')
  @ApiOperation({
    summary: '문서 접근 권한 부여',
    description: '특정 사용자에게 문서 접근 권한을 부여합니다',
  })
  @ApiParam({ name: 'id', description: '문서 ID' })
  @ApiResponse({ status: 201, description: '권한 부여 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '문서 또는 사용자를 찾을 수 없음' })
  async grantAccess(
    @Param('id') id: string,
    @Body() grantDocumentAccessDto: GrantDocumentAccessDto,
    @Request() req,
  ) {
    return this.safetyDocumentsService.grantAccess(id, grantDocumentAccessDto, req.user.id);
  }

  @Delete(':id/access/:userId')
  @ApiOperation({
    summary: '문서 접근 권한 제거',
    description: '특정 사용자의 문서 접근 권한을 제거합니다',
  })
  @ApiParam({ name: 'id', description: '문서 ID' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '권한 제거 성공' })
  @ApiResponse({ status: 400, description: '문서 소유자의 권한은 제거할 수 없습니다' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '문서 또는 권한을 찾을 수 없음' })
  async revokeAccess(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.safetyDocumentsService.revokeAccess(id, userId, req.user.id);
  }
}
