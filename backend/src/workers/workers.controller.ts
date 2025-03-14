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
import { WorkersService } from './workers.service';
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateWorkerEducationDto,
  CreateWorkerCheckinDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('근로자 관리')
@Controller('api/v1/workers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get('project/:projectId')
  @ApiOperation({
    summary: '프로젝트의 근로자 목록 조회',
    description: '특정 프로젝트에 속한 근로자 목록을 조회합니다',
  })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '근로자 목록 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async findAll(
    @Param('projectId') projectId: string,
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workersService.findAll(
      projectId,
      req.user.id,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '근로자 상세 조회',
    description: '특정 근로자의 상세 정보와 교육 이력, 최근 출입 기록을 조회합니다',
  })
  @ApiParam({ name: 'id', description: '근로자 ID' })
  @ApiResponse({ status: 200, description: '근로자 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '근로자를 찾을 수 없음' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.workersService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({
    summary: '근로자 등록',
    description: '새로운 근로자를 등록합니다',
  })
  @ApiResponse({ status: 201, description: '근로자 등록 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async create(@Body() createWorkerDto: CreateWorkerDto, @Request() req) {
    return this.workersService.create(createWorkerDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '근로자 정보 수정',
    description: '근로자 정보를 수정합니다',
  })
  @ApiParam({ name: 'id', description: '근로자 ID' })
  @ApiResponse({ status: 200, description: '근로자 정보 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '근로자를 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
    @Request() req,
  ) {
    return this.workersService.update(id, updateWorkerDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '근로자 삭제',
    description: '근로자를 삭제합니다',
  })
  @ApiParam({ name: 'id', description: '근로자 ID' })
  @ApiResponse({ status: 200, description: '근로자 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '근로자를 찾을 수 없음' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.workersService.remove(id, req.user.id);
  }

  @Post('education')
  @ApiOperation({
    summary: '근로자 교육 이력 추가',
    description: '근로자의 교육 이력을 추가합니다',
  })
  @ApiResponse({ status: 201, description: '교육 이력 추가 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '근로자를 찾을 수 없음' })
  async addEducation(
    @Body() createWorkerEducationDto: CreateWorkerEducationDto,
    @Request() req,
  ) {
    return this.workersService.addEducation(
      createWorkerEducationDto,
      req.user.id,
    );
  }

  @Delete('education/:id')
  @ApiOperation({
    summary: '근로자 교육 이력 삭제',
    description: '근로자의 교육 이력을 삭제합니다',
  })
  @ApiParam({ name: 'id', description: '교육 이력 ID' })
  @ApiResponse({ status: 200, description: '교육 이력 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '교육 이력을 찾을 수 없음' })
  async removeEducation(@Param('id') id: string, @Request() req) {
    return this.workersService.removeEducation(id, req.user.id);
  }

  @Post('checkin')
  @ApiOperation({
    summary: '근로자 출입 기록 추가',
    description: '근로자의 출입 기록을 추가합니다',
  })
  @ApiResponse({ status: 201, description: '출입 기록 추가 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '근로자를 찾을 수 없음' })
  async addCheckin(
    @Body() createWorkerCheckinDto: CreateWorkerCheckinDto,
    @Request() req,
  ) {
    return this.workersService.addCheckin(
      createWorkerCheckinDto,
      req.user.id,
    );
  }

  @Put('checkout/:id')
  @ApiOperation({
    summary: '근로자 퇴출 처리',
    description: '근로자의 퇴출 시간을 기록합니다',
  })
  @ApiParam({ name: 'id', description: '출입 기록 ID' })
  @ApiResponse({ status: 200, description: '퇴출 처리 성공' })
  @ApiResponse({ status: 400, description: '이미 퇴출 처리된 기록' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '출입 기록을 찾을 수 없음' })
  async checkout(@Param('id') id: string, @Request() req) {
    return this.workersService.checkout(id, req.user.id);
  }
} 