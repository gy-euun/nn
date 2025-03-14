import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel, AssessmentStatus } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * 프로젝트별 위험성 평가 통계 (성능 최적화)
   */
  async getRiskAssessmentStatsByProject(projectId: string, userId: string) {
    // 프로젝트 접근 권한 확인
    await this.checkProjectAccess(projectId, userId);

    // 위험성 평가 상태별 통계 - 인덱스 활용을 위해 쿼리 최적화
    const statusStats = await this.prisma.riskAssessment.groupBy({
      by: ['status'],
      where: {
        projectId,
      },
      _count: {
        id: true,
      },
    });

    // 위험 요소 위험 수준별 통계 - JOIN 쿼리 성능 최적화
    const riskLevelStats = await this.prisma.riskFactor.groupBy({
      by: ['riskLevel'],
      where: {
        assessment: {
          projectId,
        },
      },
      _count: {
        id: true,
      },
    });

    // 월별 위험성 평가 생성 통계 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 타입 에러를 피하기 위해 raw query 사용
    const monthlyStats = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        EXTRACT(YEAR FROM "createdAt") as year,
        COUNT(*) as count
      FROM "RiskAssessment"
      WHERE "projectId" = ${projectId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY 
        EXTRACT(YEAR FROM "createdAt"),
        EXTRACT(MONTH FROM "createdAt")
      ORDER BY 
        EXTRACT(YEAR FROM "createdAt") ASC,
        EXTRACT(MONTH FROM "createdAt") ASC
    ` as any[];

    // 결과 포맷팅
    const formattedStatusStats = Object.values(AssessmentStatus).map(
      (status) => {
        const found = statusStats.find((item) => item.status === status);
        return {
          status,
          count: found ? found._count.id : 0,
        };
      },
    );

    const formattedRiskLevelStats = Object.values(RiskLevel).map((level) => {
      const found = riskLevelStats.find((item) => item.riskLevel === level);
      return {
        level,
        count: found ? found._count.id : 0,
      };
    });

    return {
      statusStats: formattedStatusStats,
      riskLevelStats: formattedRiskLevelStats,
      monthlyStats,
    };
  }

  /**
   * 근로자 출입 통계 (성능 최적화)
   */
  async getWorkerCheckinStats(projectId: string, userId: string) {
    // 프로젝트 접근 권한 확인
    await this.checkProjectAccess(projectId, userId);

    // 일별 출입 통계 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 타입 에러를 피하기 위해 raw query 사용 - 인덱스 힌트 추가
    const dailyStats = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(DAY FROM "checkinTime") as day,
        EXTRACT(MONTH FROM "checkinTime") as month,
        EXTRACT(YEAR FROM "checkinTime") as year,
        COUNT(*) as count
      FROM "WorkerCheckin"
      JOIN "Worker" ON "WorkerCheckin"."workerId" = "Worker"."id"
      WHERE "Worker"."projectId" = ${projectId}
        AND "checkinTime" >= ${thirtyDaysAgo}
      GROUP BY 
        EXTRACT(YEAR FROM "checkinTime"),
        EXTRACT(MONTH FROM "checkinTime"),
        EXTRACT(DAY FROM "checkinTime")
      ORDER BY 
        EXTRACT(YEAR FROM "checkinTime") ASC,
        EXTRACT(MONTH FROM "checkinTime") ASC,
        EXTRACT(DAY FROM "checkinTime") ASC
    ` as any[];

    // 근로자별 출입 통계 (상위 10명) - 쿼리 성능 최적화
    const workerStats = await this.prisma.workerCheckin.groupBy({
      by: ['workerId'],
      where: {
        worker: {
          projectId,
        },
        checkinTime: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // 근로자 정보 조회 - 한 번의 쿼리로 모든 데이터 가져오기
    const workerIds = workerStats.map((item) => item.workerId);
    const workers = await this.prisma.worker.findMany({
      where: {
        id: {
          in: workerIds,
        },
      },
      select: {
        id: true,
        name: true,
        position: true,
      },
    });

    // 결과 포맷팅
    const formattedWorkerStats = workerStats.map((item) => {
      const worker = workers.find((w) => w.id === item.workerId);
      return {
        workerId: item.workerId,
        name: worker ? worker.name : 'Unknown',
        position: worker ? worker.position : null,
        count: item._count.id,
      };
    });

    return {
      dailyStats,
      workerStats: formattedWorkerStats,
    };
  }

  /**
   * AI 챗봇 사용 통계 (성능 최적화)
   */
  async getChatbotStats(userId: string) {
    // 일별 메시지 통계 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 타입 에러를 피하기 위해 raw query 사용 - 인덱스 활용을 위한 최적화
    const dailyStats = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(DAY FROM "createdAt") as day,
        EXTRACT(MONTH FROM "createdAt") as month,
        EXTRACT(YEAR FROM "createdAt") as year,
        "isUserMessage",
        COUNT(*) as count
      FROM "ChatMessage"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY 
        EXTRACT(YEAR FROM "createdAt"),
        EXTRACT(MONTH FROM "createdAt"),
        EXTRACT(DAY FROM "createdAt"),
        "isUserMessage"
      ORDER BY 
        EXTRACT(YEAR FROM "createdAt") ASC,
        EXTRACT(MONTH FROM "createdAt") ASC,
        EXTRACT(DAY FROM "createdAt") ASC
    ` as any[];

    // 사용자 메시지와 AI 응답을 분리
    const userMessages = dailyStats.filter((item: any) => item.isusermessage);
    const aiResponses = dailyStats.filter((item: any) => !item.isusermessage);

    return {
      userMessages,
      aiResponses,
      totalUserMessages: userMessages.reduce((sum, item: any) => sum + Number(item.count), 0),
      totalAiResponses: aiResponses.reduce((sum, item: any) => sum + Number(item.count), 0),
    };
  }

  /**
   * 사용자가 프로젝트에 접근할 권한이 있는지 확인 (에러 처리 개선)
   */
  private async checkProjectAccess(projectId: string, userId: string) {
    // 프로젝트 존재 여부 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인 - 복합 키 인덱스 활용
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!projectMember) {
      throw new NotFoundException('이 프로젝트에 접근할 권한이 없습니다.');
    }

    return projectMember;
  }
} 