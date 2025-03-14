import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddProjectMemberDto } from './dto';
import { ProjectRole, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          status: true,
          createdAt: true,
          members: {
            where: {
              userId,
            },
            select: {
              role: true,
            },
          },
          _count: {
            select: {
              members: true,
              riskAssessments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.prisma.project.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    return {
      data: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        createdAt: project.createdAt,
        role: project.members[0]?.role,
        memberCount: project._count.members,
        riskAssessmentCount: project._count.riskAssessments,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            riskAssessments: true,
            documents: true,
            workers: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 사용자가 프로젝트 멤버인지 확인
    const userMember = project.members.find((member) => member.user.id === userId);
    if (!userMember) {
      throw new ForbiddenException('이 프로젝트에 접근할 권한이 없습니다');
    }

    // 응답 형식 조정
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      role: userMember.role,
      members: project.members.map((member) => ({
        role: member.role,
        user: member.user,
      })),
      stats: {
        riskAssessments: project._count.riskAssessments,
        safetyDocuments: project._count.documents,
        workers: project._count.workers,
      },
    };
  }

  async create(userId: string, createProjectDto: CreateProjectDto) {
    // 프로젝트 생성
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        startDate: new Date(createProjectDto.startDate),
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
        status: ProjectStatus.ACTIVE,
        members: {
          create: {
            userId,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return {
      ...project,
      role: ProjectRole.OWNER,
    };
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    // 프로젝트 및 사용자 권한 확인
    const projectMember = await this.checkProjectMemberRole(
      id,
      userId,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
      '프로젝트를 수정할 권한이 없습니다',
    );

    // 프로젝트 업데이트
    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        ...(updateProjectDto.name && { name: updateProjectDto.name }),
        ...(updateProjectDto.description !== undefined && { description: updateProjectDto.description }),
        ...(updateProjectDto.startDate && { startDate: new Date(updateProjectDto.startDate) }),
        ...(updateProjectDto.endDate && { endDate: new Date(updateProjectDto.endDate) }),
        ...(updateProjectDto.endDate === null && { endDate: null }),
        ...(updateProjectDto.status && { status: updateProjectDto.status }),
      },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return {
      ...updatedProject,
      role: projectMember.role,
    };
  }

  async addMember(projectId: string, requesterId: string, addMemberDto: AddProjectMemberDto) {
    // 프로젝트 및 요청자 권한 확인
    await this.checkProjectMemberRole(
      projectId,
      requesterId,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
      '프로젝트에 멤버를 추가할 권한이 없습니다',
    );

    // 이메일로 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email: addMemberDto.email },
    });

    if (!user) {
      throw new NotFoundException(`이메일이 ${addMemberDto.email}인 사용자를 찾을 수 없습니다`);
    }

    // 이미 프로젝트 멤버인지 확인
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('이 사용자는 이미 프로젝트 멤버입니다');
    }

    // 프로젝트 멤버 추가
    const projectMember = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: addMemberDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      role: projectMember.role,
      user: projectMember.user,
    };
  }

  async updateMemberRole(
    projectId: string,
    memberId: string,
    requesterId: string,
    role: ProjectRole,
  ) {
    // 요청자 권한 확인 (OWNER만 가능)
    await this.checkProjectMemberRole(
      projectId,
      requesterId,
      [ProjectRole.OWNER],
      '멤버 역할을 변경할 권한이 없습니다',
    );

    // 업데이트할 멤버 확인
    const memberToUpdate = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!memberToUpdate) {
      throw new NotFoundException('해당 멤버를 찾을 수 없습니다');
    }

    // OWNER 역할은 변경할 수 없음
    if (memberToUpdate.role === ProjectRole.OWNER) {
      throw new BadRequestException('프로젝트 소유자의 역할은 변경할 수 없습니다');
    }

    // 역할 업데이트
    const updatedMember = await this.prisma.projectMember.update({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      role: updatedMember.role,
      user: updatedMember.user,
    };
  }

  async removeMember(projectId: string, memberId: string, requesterId: string) {
    // 요청자가 제거하려는 멤버인지 확인
    const isSelfRemoval = memberId === requesterId;

    // 요청자 권한 확인
    const requesterMember = await this.checkProjectMemberRole(
      projectId,
      requesterId,
      isSelfRemoval ? [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER] : [ProjectRole.OWNER, ProjectRole.ADMIN],
      '멤버를 제거할 권한이 없습니다',
    );

    // 제거할 멤버 확인
    const memberToRemove = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!memberToRemove) {
      throw new NotFoundException('해당 멤버를 찾을 수 없습니다');
    }

    // OWNER는 제거할 수 없음
    if (memberToRemove.role === ProjectRole.OWNER) {
      throw new BadRequestException('프로젝트 소유자는 제거할 수 없습니다');
    }

    // ADMIN이 다른 ADMIN을 제거하려는 경우 방지 (OWNER만 가능)
    if (
      memberToRemove.role === ProjectRole.ADMIN &&
      requesterMember.role === ProjectRole.ADMIN
    ) {
      throw new ForbiddenException('관리자는 다른 관리자를 제거할 수 없습니다');
    }

    // 멤버 제거
    await this.prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
    });

    return { message: '멤버가 성공적으로 제거되었습니다' };
  }

  // 프로젝트 멤버 권한 확인 헬퍼 메서드
  private async checkProjectMemberRole(
    projectId: string,
    userId: string,
    allowedRoles: ProjectRole[],
    errorMessage = '이 작업을 수행할 권한이 없습니다',
  ) {
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

    if (!allowedRoles.includes(projectMember.role)) {
      throw new ForbiddenException(errorMessage);
    }

    return projectMember;
  }

  /**
   * 프로젝트 통계 조회
   * 위험성 평가, 안전 문서, 근로자 등의 통계 정보를 제공
   */
  async getProjectStats(projectId: string, userId: string) {
    // 프로젝트 및 사용자 권한 확인
    await this.checkProjectMemberRole(
      projectId,
      userId,
      [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER],
      '프로젝트 통계를 조회할 권한이 없습니다',
    );

    // 프로젝트 기본 정보 조회
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 위험성 평가 통계
    const riskAssessmentStats = await this.prisma.$transaction([
      this.prisma.riskAssessment.count({
        where: { projectId },
      }),
      this.prisma.riskAssessment.count({
        where: { 
          projectId,
          status: 'APPROVED',
        },
      }),
      this.prisma.riskFactor.count({
        where: {
          assessment: {
            projectId,
          },
          riskLevel: 'HIGH',
        },
      }),
      this.prisma.riskFactor.count({
        where: {
          assessment: {
            projectId,
          },
          riskLevel: 'CRITICAL',
        },
      }),
    ]);

    // 안전 문서 통계
    const documentStats = await this.prisma.$transaction([
      this.prisma.safetyDocument.count({
        where: { projectId },
      }),
      this.prisma.safetyDocument.count({
        where: { 
          projectId,
          validFrom: { lte: new Date() },
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
      }),
    ]);

    // 근로자 통계
    const workerStats = await this.prisma.$transaction([
      this.prisma.worker.count({
        where: { projectId },
      }),
      this.prisma.workerCheckin.count({
        where: {
          worker: {
            projectId,
          },
          checkinTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // 멤버 통계
    const memberCount = await this.prisma.projectMember.count({
      where: { projectId },
    });

    return {
      project,
      stats: {
        members: memberCount,
        riskAssessments: {
          total: riskAssessmentStats[0],
          approved: riskAssessmentStats[1],
          highRiskFactors: riskAssessmentStats[2],
          criticalRiskFactors: riskAssessmentStats[3],
        },
        documents: {
          total: documentStats[0],
          valid: documentStats[1],
        },
        workers: {
          total: workerStats[0],
          checkedInToday: workerStats[1],
        },
      },
    };
  }

  /**
   * 프로젝트 활동 내역 조회
   * 최근 위험성 평가, 문서 업로드, 멤버 변경 등의 활동 내역을 제공
   */
  async getProjectActivities(projectId: string, userId: string, limit = 10) {
    // 프로젝트 및 사용자 권한 확인
    await this.checkProjectMemberRole(
      projectId,
      userId,
      [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER],
      '프로젝트 활동 내역을 조회할 권한이 없습니다',
    );

    // 최근 위험성 평가 활동
    const riskAssessments = await this.prisma.riskAssessment.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // 최근 안전 문서 활동
    const documents = await this.prisma.safetyDocument.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        documentType: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // 최근 멤버 변경 활동
    const memberActivities = await this.prisma.projectMember.findMany({
      where: { projectId },
      select: {
        id: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // 모든 활동을 날짜순으로 정렬
    const allActivities = [
      ...riskAssessments.map(item => ({
        type: 'RISK_ASSESSMENT',
        id: item.id,
        title: item.title,
        status: item.status,
        user: item.user,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      ...documents.map(item => ({
        type: 'DOCUMENT',
        id: item.id,
        title: item.title,
        documentType: item.documentType,
        user: item.user,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      ...memberActivities.map(item => ({
        type: 'MEMBER',
        id: item.id,
        role: item.role,
        user: item.user,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
     .slice(0, limit);

    return {
      activities: allActivities,
    };
  }
} 