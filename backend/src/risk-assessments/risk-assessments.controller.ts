import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  Query,
  Res,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RiskAssessmentsService } from './risk-assessments.service';
import {
  CreateRiskAssessmentDto,
  UpdateRiskAssessmentDto,
  CreateRiskFactorDto,
  UpdateRiskFactorDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('위험성 평가')
@Controller('api/v1/risk-assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RiskAssessmentsController {
  constructor(private readonly riskAssessmentsService: RiskAssessmentsService) {}

  @Get()
  @ApiOperation({ summary: '위험성 평가 목록 조회', description: '사용자의 위험성 평가 목록을 조회합니다' })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: '프로젝트 ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '위험성 평가 목록 조회 성공' })
  async findAll(
    @Request() req,
    @Query('projectId') projectId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.riskAssessmentsService.findAll(req.user.id, projectId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '위험성 평가 상세 조회', description: '특정 위험성 평가의 상세 정보를 조회합니다' })
  @ApiResponse({ status: 200, description: '위험성 평가 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가를 찾을 수 없음' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.riskAssessmentsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '위험성 평가 생성', description: '새로운 위험성 평가를 생성합니다' })
  @ApiResponse({ status: 201, description: '위험성 평가 생성 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  async create(@Request() req, @Body() createRiskAssessmentDto: CreateRiskAssessmentDto) {
    return this.riskAssessmentsService.create(req.user.id, createRiskAssessmentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '위험성 평가 수정', description: '위험성 평가 정보를 수정합니다' })
  @ApiResponse({ status: 200, description: '위험성 평가 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가를 찾을 수 없음' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateRiskAssessmentDto: UpdateRiskAssessmentDto,
  ) {
    return this.riskAssessmentsService.update(id, req.user.id, updateRiskAssessmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '위험성 평가 삭제', description: '위험성 평가를 삭제합니다' })
  @ApiResponse({ status: 200, description: '위험성 평가 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가를 찾을 수 없음' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.riskAssessmentsService.remove(id, req.user.id);
  }

  @Post(':id/risk-factors')
  @ApiOperation({ summary: '위험 요소 추가', description: '위험성 평가에 위험 요소를 추가합니다' })
  @ApiResponse({ status: 201, description: '위험 요소 추가 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가를 찾을 수 없음' })
  async addRiskFactor(
    @Request() req,
    @Param('id') id: string,
    @Body() createRiskFactorDto: CreateRiskFactorDto,
  ) {
    return this.riskAssessmentsService.addRiskFactor(id, req.user.id, createRiskFactorDto);
  }

  @Put(':assessmentId/risk-factors/:factorId')
  @ApiOperation({ summary: '위험 요소 수정', description: '위험 요소 정보를 수정합니다' })
  @ApiResponse({ status: 200, description: '위험 요소 수정 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가 또는 위험 요소를 찾을 수 없음' })
  async updateRiskFactor(
    @Request() req,
    @Param('assessmentId') assessmentId: string,
    @Param('factorId') factorId: string,
    @Body() updateRiskFactorDto: UpdateRiskFactorDto,
  ) {
    return this.riskAssessmentsService.updateRiskFactor(
      assessmentId,
      factorId,
      req.user.id,
      updateRiskFactorDto,
    );
  }

  @Delete(':assessmentId/risk-factors/:factorId')
  @ApiOperation({
    summary: '위험 요소 삭제',
    description: '특정 위험성 평가의 위험 요소를 삭제합니다',
  })
  @ApiResponse({ status: 200, description: '위험 요소 삭제 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가 또는 위험 요소 찾을 수 없음' })
  async removeRiskFactor(
    @Param('assessmentId') assessmentId: string,
    @Param('factorId') factorId: string,
    @Request() req,
  ) {
    return this.riskAssessmentsService.removeRiskFactor(assessmentId, factorId, req.user.id);
  }

  @Get(':id/export-pdf')
  @ApiOperation({
    summary: '위험성 평가 PDF 내보내기',
    description: '위험성 평가 정보와 위험 요소들을 PDF 형식으로 내보냅니다',
  })
  @ApiResponse({ status: 200, description: 'PDF 다운로드 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '위험성 평가 찾을 수 없음' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="risk-assessment.pdf"')
  async exportToPdf(
    @Param('id') id: string,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileName = `risk-assessment-${id}.pdf`;
    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    
    return this.riskAssessmentsService.exportToPdf(id, req.user.id);
  }
} 