import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddProjectMemberDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRole } from '@prisma/client';

@ApiTags('프로젝트')
@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: '프로젝트 목록 조회', description: '사용자의 프로젝트 목록을 조회합니다' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '프로젝트 목록 조회 성공' })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.projectsService.findAll(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '프로젝트 상세 조회', description: '특정 프로젝트의 상세 정보를 조회합니다' })
  @ApiResponse({ status: 200, description: '프로젝트 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '프로젝트 생성', description: '새로운 프로젝트를 생성합니다' })
  @ApiResponse({ status: 201, description: '프로젝트 생성 성공' })
  async create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, createProjectDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '프로젝트 수정', description: '프로젝트 정보를 수정합니다' })
  @ApiResponse({ status: 200, description: '프로젝트 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, req.user.id, updateProjectDto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: '프로젝트 멤버 추가', description: '프로젝트에 새 멤버를 추가합니다' })
  @ApiResponse({ status: 201, description: '멤버 추가 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트 또는 사용자를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 멤버인 사용자' })
  async addMember(
    @Request() req,
    @Param('id') id: string,
    @Body() addMemberDto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(id, req.user.id, addMemberDto);
  }

  @Put(':projectId/members/:memberId/role')
  @ApiOperation({ summary: '멤버 역할 수정', description: '프로젝트 멤버의 역할을 수정합니다' })
  @ApiResponse({ status: 200, description: '역할 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트 또는 멤버를 찾을 수 없음' })
  async updateMemberRole(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body('role') role: ProjectRole,
  ) {
    return this.projectsService.updateMemberRole(projectId, memberId, req.user.id, role);
  }

  @Delete(':projectId/members/:memberId')
  @ApiOperation({ summary: '멤버 제거', description: '프로젝트에서 멤버를 제거합니다' })
  @ApiResponse({ status: 200, description: '멤버 제거 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트 또는 멤버를 찾을 수 없음' })
  async removeMember(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.projectsService.removeMember(projectId, memberId, req.user.id);
  }

  @ApiOperation({ summary: '프로젝트 통계 조회' })
  @ApiResponse({ status: 200, description: '프로젝트 통계 조회 성공' })
  @Get(':id/stats')
  getProjectStats(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProjectStats(id, req.user.id);
  }

  @ApiOperation({ summary: '프로젝트 활동 내역 조회' })
  @ApiResponse({ status: 200, description: '프로젝트 활동 내역 조회 성공' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '조회할 활동 내역 수' })
  @Get(':id/activities')
  getProjectActivities(
    @Param('id') id: string,
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.projectsService.getProjectActivities(id, req.user.id, limit ? parseInt(limit.toString()) : 10);
  }
} 