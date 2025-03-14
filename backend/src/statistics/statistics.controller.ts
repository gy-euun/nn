import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('통계')
@Controller('api/v1/statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('risk-assessments/project/:projectId')
  @ApiOperation({
    summary: '프로젝트별 위험성 평가 통계',
    description: '특정 프로젝트의 위험성 평가 관련 통계를 조회합니다',
  })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async getRiskAssessmentStatsByProject(
    @Param('projectId') projectId: string,
    @Request() req,
  ) {
    return this.statisticsService.getRiskAssessmentStatsByProject(
      projectId,
      req.user.id,
    );
  }

  @Get('worker-checkins/project/:projectId')
  @ApiOperation({
    summary: '프로젝트별 근로자 출입 통계',
    description: '특정 프로젝트의 근로자 출입 관련 통계를 조회합니다',
  })
  @ApiParam({ name: 'projectId', description: '프로젝트 ID' })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  async getWorkerCheckinStats(
    @Param('projectId') projectId: string,
    @Request() req,
  ) {
    return this.statisticsService.getWorkerCheckinStats(
      projectId,
      req.user.id,
    );
  }

  @Get('chatbot')
  @ApiOperation({
    summary: 'AI 챗봇 사용 통계',
    description: '현재 사용자의 AI 챗봇 사용 관련 통계를 조회합니다',
  })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  async getChatbotStats(@Request() req) {
    return this.statisticsService.getChatbotStats(req.user.id);
  }
} 