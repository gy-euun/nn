import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateRiskAssessmentDto, 
  UpdateRiskAssessmentDto,
  CreateRiskFactorDto,
  UpdateRiskFactorDto 
} from './dto';
import { AssessmentStatus, ProjectRole, RiskLevel } from '@prisma/client';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class RiskAssessmentsService {
  constructor(private prisma: PrismaService) {}

  // 위험성 평가 목록 조회
  async findAll(userId: string, projectId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // 프로젝트 멤버인지 확인 (프로젝트 ID가 제공된 경우)
    if (projectId) {
      const projectMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });

      if (!projectMember) {
        throw new ForbiddenException('이 프로젝트에 접근할 권한이 없습니다');
      }
    }

    // 조회 조건 구성
    const where = projectId
      ? {
          projectId,
          project: {
            members: {
              some: { userId },
            },
          },
        }
      : {
          // 프로젝트 ID가 없는 경우 사용자가 속한 모든 프로젝트의 위험성 평가 조회
          project: {
            members: {
              some: { userId },
            },
          },
        };

    const [assessments, total] = await Promise.all([
      this.prisma.riskAssessment.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              riskFactors: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.prisma.riskAssessment.count({ where }),
    ]);

    return {
      data: assessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        status: assessment.status,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
        user: assessment.user,
        project: assessment.project,
        riskFactorCount: assessment._count.riskFactors,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 위험성 평가 상세 조회
  async findOne(id: string, userId: string) {
    const assessment = await this.prisma.riskAssessment.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        riskFactors: {
          select: {
            id: true,
            title: true,
            description: true,
            likelihood: true,
            severity: true,
            riskLevel: true,
            controlMeasures: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('위험성 평가를 찾을 수 없습니다');
    }

    // 사용자가 프로젝트 멤버인지 확인
    const projectMember = assessment.project.members.find((member) => member.userId === userId);
    if (!projectMember) {
      throw new ForbiddenException('이 위험성 평가에 접근할 권한이 없습니다');
    }

    // 응답 형식 조정
    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      status: assessment.status,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
      project: {
        id: assessment.project.id,
        name: assessment.project.name,
      },
      user: assessment.user,
      role: projectMember.role,
      riskFactors: assessment.riskFactors,
    };
  }

  // 위험성 평가 생성
  async create(userId: string, createRiskAssessmentDto: CreateRiskAssessmentDto) {
    // 프로젝트 존재 여부 및 접근 권한 확인
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: createRiskAssessmentDto.projectId,
        },
      },
    });

    if (!projectMember) {
      throw new ForbiddenException('이 프로젝트에 접근할 권한이 없습니다');
    }

    // 프로젝트 멤버 권한 확인 (VIEWER는 생성 불가)
    if (!(projectMember.role === ProjectRole.OWNER || 
          projectMember.role === ProjectRole.ADMIN || 
          projectMember.role === ProjectRole.MEMBER)) {
      throw new ForbiddenException('위험성 평가를 생성할 권한이 없습니다');
    }

    // 위험성 평가 생성
    const assessment = await this.prisma.riskAssessment.create({
      data: {
        title: createRiskAssessmentDto.title,
        description: createRiskAssessmentDto.description,
        status: AssessmentStatus.DRAFT,
        userId,
        projectId: createRiskAssessmentDto.projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return assessment;
  }

  // 위험성 평가 업데이트
  async update(id: string, userId: string, updateRiskAssessmentDto: UpdateRiskAssessmentDto) {
    // 위험성 평가 존재 여부 확인
    const assessment = await this.prisma.riskAssessment.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('위험성 평가를 찾을 수 없습니다');
    }

    // 접근 권한 확인
    const projectMember = assessment.project.members.find((member) => member.userId === userId);
    if (!projectMember) {
      throw new ForbiddenException('이 위험성 평가에 접근할 권한이 없습니다');
    }

    // 수정 권한 확인
    const isCreator = assessment.userId === userId;
    const hasEditPermission =
      isCreator ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN;

    if (!hasEditPermission) {
      throw new ForbiddenException('위험성 평가를 수정할 권한이 없습니다');
    }

    // 상태가 APPROVED인 경우, OWNER나 ADMIN만 수정 가능
    if (
      assessment.status === AssessmentStatus.APPROVED &&
      !(projectMember.role === ProjectRole.OWNER || projectMember.role === ProjectRole.ADMIN)
    ) {
      throw new ForbiddenException('승인된 위험성 평가는 관리자나 소유자만 수정할 수 있습니다');
    }

    // 상태가 REJECTED인 경우 초안으로 변경
    let newStatus = updateRiskAssessmentDto.status;
    if (assessment.status === AssessmentStatus.REJECTED && !newStatus) {
      newStatus = AssessmentStatus.DRAFT;
    }

    // 위험성 평가 업데이트
    const updatedAssessment = await this.prisma.riskAssessment.update({
      where: { id },
      data: {
        ...(updateRiskAssessmentDto.title && { title: updateRiskAssessmentDto.title }),
        ...(updateRiskAssessmentDto.description !== undefined && {
          description: updateRiskAssessmentDto.description,
        }),
        ...(newStatus && { status: newStatus }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedAssessment;
  }

  // 위험성 평가 삭제
  async remove(id: string, userId: string) {
    // 위험성 평가 존재 여부 확인
    const assessment = await this.prisma.riskAssessment.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('위험성 평가를 찾을 수 없습니다');
    }

    // 접근 권한 확인
    const projectMember = assessment.project.members.find((member) => member.userId === userId);
    if (!projectMember) {
      throw new ForbiddenException('이 위험성 평가에 접근할 권한이 없습니다');
    }

    // 삭제 권한 확인
    const isCreator = assessment.userId === userId;
    const hasDeletePermission =
      isCreator ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN;

    if (!hasDeletePermission) {
      throw new ForbiddenException('위험성 평가를 삭제할 권한이 없습니다');
    }

    // 위험성 평가 삭제 (위험 요소도 함께 삭제)
    await this.prisma.riskAssessment.delete({
      where: { id },
    });

    return { message: '위험성 평가가 성공적으로 삭제되었습니다' };
  }

  // 위험 요소 추가
  async addRiskFactor(
    assessmentId: string,
    userId: string,
    createRiskFactorDto: CreateRiskFactorDto,
  ) {
    // 위험성 평가 존재 여부 및 접근 권한 확인
    const assessment = await this.prisma.riskAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        project: {
          include: {
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('위험성 평가를 찾을 수 없습니다');
    }

    // 접근 권한 확인
    const projectMember = assessment.project.members.find((member) => member.userId === userId);
    if (!projectMember) {
      throw new ForbiddenException('이 위험성 평가에 접근할 권한이 없습니다');
    }

    // 추가 권한 확인
    const isCreator = assessment.userId === userId;
    const hasEditPermission =
      isCreator ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN ||
      projectMember.role === ProjectRole.MEMBER;

    if (!hasEditPermission) {
      throw new ForbiddenException('위험 요소를 추가할 권한이 없습니다');
    }

    // 승인된 상태인 경우 수정 권한 확인
    if (
      assessment.status === AssessmentStatus.APPROVED &&
      !(projectMember.role === ProjectRole.OWNER || projectMember.role === ProjectRole.ADMIN)
    ) {
      throw new ForbiddenException('승인된 위험성 평가는 관리자나 소유자만 수정할 수 있습니다');
    }

    // 위험 요소 생성
    const riskFactor = await this.prisma.riskFactor.create({
      data: {
        title: createRiskFactorDto.title,
        description: createRiskFactorDto.description,
        likelihood: createRiskFactorDto.likelihood,
        severity: createRiskFactorDto.severity,
        riskLevel: createRiskFactorDto.riskLevel,
        controlMeasures: createRiskFactorDto.controlMeasures,
        assessmentId,
      },
    });

    // 위험성 평가 상태 업데이트 (REJECTED였다면 DRAFT로 변경)
    if (assessment.status === AssessmentStatus.REJECTED) {
      await this.prisma.riskAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.DRAFT },
      });
    }

    return riskFactor;
  }

  // 위험 요소 업데이트
  async updateRiskFactor(
    assessmentId: string,
    factorId: string,
    userId: string,
    updateRiskFactorDto: UpdateRiskFactorDto,
  ) {
    // 위험성 평가 존재 여부 및 접근 권한 확인
    const assessment = await this.prisma.riskAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        project: {
          include: {
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('위험성 평가를 찾을 수 없습니다');
    }

    // 접근 권한 확인
    const projectMember = assessment.project.members.find((member) => member.userId === userId);
    if (!projectMember) {
      throw new ForbiddenException('이 위험성 평가에 접근할 권한이 없습니다');
    }

    // 위험 요소 존재 여부 확인
    const riskFactor = await this.prisma.riskFactor.findFirst({
      where: {
        id: factorId,
        assessmentId,
      },
    });

    if (!riskFactor) {
      throw new NotFoundException('위험 요소를 찾을 수 없습니다');
    }

    // 수정 권한 확인
    const isCreator = assessment.userId === userId;
    const hasEditPermission =
      isCreator ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN ||
      projectMember.role === ProjectRole.MEMBER;

    if (!hasEditPermission) {
      throw new ForbiddenException('위험 요소를 수정할 권한이 없습니다');
    }

    // 승인된 상태인 경우 수정 권한 확인
    if (
      assessment.status === AssessmentStatus.APPROVED &&
      !(projectMember.role === ProjectRole.OWNER || projectMember.role === ProjectRole.ADMIN)
    ) {
      throw new ForbiddenException('승인된 위험성 평가는 관리자나 소유자만 수정할 수 있습니다');
    }

    // 위험 요소 업데이트
    const updatedRiskFactor = await this.prisma.riskFactor.update({
      where: { id: factorId },
      data: {
        ...(updateRiskFactorDto.title && { title: updateRiskFactorDto.title }),
        ...(updateRiskFactorDto.description && { description: updateRiskFactorDto.description }),
        ...(updateRiskFactorDto.likelihood && { likelihood: updateRiskFactorDto.likelihood }),
        ...(updateRiskFactorDto.severity && { severity: updateRiskFactorDto.severity }),
        ...(updateRiskFactorDto.riskLevel && { riskLevel: updateRiskFactorDto.riskLevel }),
        ...(updateRiskFactorDto.controlMeasures && {
          controlMeasures: updateRiskFactorDto.controlMeasures,
        }),
      },
    });

    // 위험성 평가 상태 업데이트 (REJECTED였다면 DRAFT로 변경)
    if (assessment.status === AssessmentStatus.REJECTED) {
      await this.prisma.riskAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.DRAFT },
      });
    }

    return updatedRiskFactor;
  }

  // 위험 요소 삭제
  async removeRiskFactor(assessmentId: string, factorId: string, userId: string) {
    // 위험성 평가 존재 여부 및 접근 권한 확인
    const assessment = await this.prisma.riskAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        project: {
          include: {
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('위험성 평가를 찾을 수 없습니다');
    }

    // 접근 권한 확인
    const projectMember = assessment.project.members.find((member) => member.userId === userId);
    if (!projectMember) {
      throw new ForbiddenException('이 위험성 평가에 접근할 권한이 없습니다');
    }

    // 위험 요소 존재 여부 확인
    const riskFactor = await this.prisma.riskFactor.findFirst({
      where: {
        id: factorId,
        assessmentId,
      },
    });

    if (!riskFactor) {
      throw new NotFoundException('위험 요소를 찾을 수 없습니다');
    }

    // 삭제 권한 확인
    const isCreator = assessment.userId === userId;
    const hasDeletePermission =
      isCreator ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN;

    if (!hasDeletePermission) {
      throw new ForbiddenException('위험 요소를 삭제할 권한이 없습니다');
    }

    // 승인된 상태인 경우 수정 권한 확인
    if (
      assessment.status === AssessmentStatus.APPROVED &&
      !(projectMember.role === ProjectRole.OWNER || projectMember.role === ProjectRole.ADMIN)
    ) {
      throw new ForbiddenException('승인된 위험성 평가는 관리자나 소유자만 수정할 수 있습니다');
    }

    // 위험 요소 삭제
    await this.prisma.riskFactor.delete({
      where: { id: factorId },
    });

    // 위험성 평가 상태 업데이트 (REJECTED였다면 DRAFT로 변경)
    if (assessment.status === AssessmentStatus.REJECTED) {
      await this.prisma.riskAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.DRAFT },
      });
    }

    return { message: '위험 요소가 성공적으로 삭제되었습니다' };
  }

  /**
   * 위험성 평가 PDF 내보내기
   * 위험성 평가 정보와 위험 요소들을 PDF 형식으로 생성
   */
  async exportToPdf(id: string, userId: string): Promise<StreamableFile> {
    // 위험성 평가 상세 정보 조회
    const assessment = await this.findOne(id, userId);
    
    // PDF 생성
    const pdfBuffer = await this.generatePdf(assessment);
    
    // 스트림으로 변환하여 반환
    const stream = new Readable();
    stream.push(pdfBuffer);
    stream.push(null);
    
    return new StreamableFile(stream);
  }
  
  /**
   * PDF 생성 헬퍼 메서드
   */
  private async generatePdf(assessment: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });
      
      // PDF 내용을 chunks 배열에 저장
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // 제목 및 기본 정보
      doc.fontSize(20).text('위험성 평가 보고서', { align: 'center' });
      doc.moveDown();
      
      // 평가 정보
      doc.fontSize(16).text('1. 기본 정보');
      doc.moveDown(0.5);
      doc.fontSize(12).text(`제목: ${assessment.title}`);
      doc.fontSize(12).text(`프로젝트: ${assessment.project.name}`);
      doc.fontSize(12).text(`상태: ${this.translateStatus(assessment.status)}`);
      doc.fontSize(12).text(`작성자: ${assessment.user.name} (${assessment.user.email})`);
      doc.fontSize(12).text(`작성일: ${assessment.createdAt.toLocaleDateString('ko-KR')}`);
      doc.fontSize(12).text(`최종 수정일: ${assessment.updatedAt.toLocaleDateString('ko-KR')}`);
      
      if (assessment.description) {
        doc.moveDown(0.5);
        doc.fontSize(12).text(`설명: ${assessment.description}`);
      }
      
      doc.moveDown();
      
      // 위험 요소 목록
      doc.fontSize(16).text('2. 위험 요소 목록');
      doc.moveDown(0.5);
      
      if (assessment.riskFactors.length === 0) {
        doc.fontSize(12).text('등록된 위험 요소가 없습니다.');
      } else {
        // 위험 요소 통계
        const riskLevelCounts = {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
          CRITICAL: 0,
        };
        
        assessment.riskFactors.forEach((factor: any) => {
          riskLevelCounts[factor.riskLevel]++;
        });
        
        doc.fontSize(12).text(`총 위험 요소: ${assessment.riskFactors.length}개`);
        doc.fontSize(12).text(`위험 수준 분포: 낮음(${riskLevelCounts.LOW}), 중간(${riskLevelCounts.MEDIUM}), 높음(${riskLevelCounts.HIGH}), 심각(${riskLevelCounts.CRITICAL})`);
        
        doc.moveDown();
        
        // 각 위험 요소 상세 정보
        assessment.riskFactors.forEach((factor: any, index: number) => {
          doc.fontSize(14).text(`위험 요소 ${index + 1}: ${factor.title}`);
          doc.moveDown(0.5);
          doc.fontSize(12).text(`설명: ${factor.description}`);
          doc.fontSize(12).text(`가능성: ${factor.likelihood} / 5`);
          doc.fontSize(12).text(`심각도: ${factor.severity} / 5`);
          doc.fontSize(12).text(`위험 수준: ${this.translateRiskLevel(factor.riskLevel)}`);
          doc.fontSize(12).text(`제어 조치: ${factor.controlMeasures}`);
          doc.moveDown();
        });
      }
      
      // 서명란
      doc.moveDown();
      doc.fontSize(16).text('3. 승인');
      doc.moveDown(0.5);
      
      doc.fontSize(12).text('작성자 서명: ___________________', { align: 'left' });
      doc.fontSize(12).text('날짜: ___________________', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).text('검토자 서명: ___________________', { align: 'left' });
      doc.fontSize(12).text('날짜: ___________________', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).text('승인자 서명: ___________________', { align: 'left' });
      doc.fontSize(12).text('날짜: ___________________', { align: 'left' });
      
      // 푸터
      doc.moveDown();
      const now = new Date();
      doc.fontSize(10).text(`이 문서는 ${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR')}에 생성되었습니다.`, { align: 'center' });
      
      // PDF 생성 완료
      doc.end();
    });
  }
  
  /**
   * 상태 코드를 한글로 변환
   */
  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      DRAFT: '초안',
      COMPLETED: '완료',
      APPROVED: '승인됨',
      REJECTED: '반려됨',
    };
    
    return statusMap[status] || status;
  }
  
  /**
   * 위험 수준을 한글로 변환
   */
  private translateRiskLevel(riskLevel: string): string {
    const riskLevelMap: Record<string, string> = {
      LOW: '낮음',
      MEDIUM: '중간',
      HIGH: '높음',
      CRITICAL: '심각',
    };
    
    return riskLevelMap[riskLevel] || riskLevel;
  }
} 