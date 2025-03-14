import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateWorkerEducationDto,
  CreateWorkerCheckinDto,
} from './dto';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 프로젝트의 근로자 목록 조회
   */
  async findAll(projectId: string, userId: string, page = 1, limit = 10) {
    // 사용자가 프로젝트 멤버인지 확인
    await this.checkProjectAccess(projectId, userId);

    // 총 근로자 수 조회
    const total = await this.prisma.worker.count({
      where: { projectId },
    });

    // 근로자 목록 조회
    const workers = await this.prisma.worker.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            educations: true,
            checkins: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data: workers.map((worker) => ({
        id: worker.id,
        name: worker.name,
        contactNumber: worker.contactNumber,
        position: worker.position,
        projectId: worker.projectId,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt,
        educationCount: worker._count.educations,
        checkinCount: worker._count.checkins,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * 특정 근로자 조회
   */
  async findOne(id: string, userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        educations: {
          orderBy: {
            completionDate: 'desc',
          },
        },
        checkins: {
          orderBy: {
            checkinTime: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!worker) {
      throw new NotFoundException('근로자를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인
    await this.checkProjectAccess(worker.projectId, userId);

    return worker;
  }

  /**
   * 근로자 생성
   */
  async create(createWorkerDto: CreateWorkerDto, userId: string) {
    // 사용자가 프로젝트 멤버인지 확인
    const projectMember = await this.checkProjectAccess(
      createWorkerDto.projectId,
      userId,
      [ProjectRole.OWNER, ProjectRole.ADMIN],
    );

    // 근로자 생성
    const worker = await this.prisma.worker.create({
      data: {
        name: createWorkerDto.name,
        contactNumber: createWorkerDto.contactNumber,
        position: createWorkerDto.position,
        project: {
          connect: {
            id: createWorkerDto.projectId,
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return worker;
  }

  /**
   * 근로자 정보 업데이트
   */
  async update(id: string, updateWorkerDto: UpdateWorkerDto, userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
    });

    if (!worker) {
      throw new NotFoundException('근로자를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인
    await this.checkProjectAccess(worker.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.ADMIN,
    ]);

    // 프로젝트 변경 요청이 있는 경우
    if (
      updateWorkerDto.projectId &&
      updateWorkerDto.projectId !== worker.projectId
    ) {
      // 새 프로젝트에 대한 권한 확인
      await this.checkProjectAccess(updateWorkerDto.projectId, userId, [
        ProjectRole.OWNER,
        ProjectRole.ADMIN,
      ]);
    }

    // 업데이트할 데이터 준비
    const data: any = {};
    if (updateWorkerDto.name !== undefined) data.name = updateWorkerDto.name;
    if (updateWorkerDto.contactNumber !== undefined)
      data.contactNumber = updateWorkerDto.contactNumber;
    if (updateWorkerDto.position !== undefined)
      data.position = updateWorkerDto.position;

    // 프로젝트 변경이 있는 경우
    if (updateWorkerDto.projectId !== undefined) {
      data.project = {
        connect: {
          id: updateWorkerDto.projectId,
        },
      };
    }

    // 근로자 업데이트
    const updatedWorker = await this.prisma.worker.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedWorker;
  }

  /**
   * 근로자 삭제
   */
  async remove(id: string, userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
    });

    if (!worker) {
      throw new NotFoundException('근로자를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 관리자인지 확인
    await this.checkProjectAccess(worker.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.ADMIN,
    ]);

    // 근로자 삭제 (교육 이력 및 출입 기록은 cascade로 삭제됨)
    await this.prisma.worker.delete({
      where: { id },
    });

    return { id };
  }

  /**
   * 근로자 교육 이력 추가
   */
  async addEducation(
    createWorkerEducationDto: CreateWorkerEducationDto,
    userId: string,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: createWorkerEducationDto.workerId },
    });

    if (!worker) {
      throw new NotFoundException('근로자를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인
    await this.checkProjectAccess(worker.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.ADMIN,
    ]);

    // 만료일이 이수일보다 이전인지 검사
    if (
      createWorkerEducationDto.expiryDate &&
      createWorkerEducationDto.completionDate > createWorkerEducationDto.expiryDate
    ) {
      throw new BadRequestException('만료일은 이수일보다 이후여야 합니다.');
    }

    // 교육 이력 생성
    const education = await this.prisma.workerEducation.create({
      data: {
        title: createWorkerEducationDto.title,
        description: createWorkerEducationDto.description,
        completionDate: createWorkerEducationDto.completionDate,
        expiryDate: createWorkerEducationDto.expiryDate,
        worker: {
          connect: {
            id: createWorkerEducationDto.workerId,
          },
        },
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return education;
  }

  /**
   * 교육 이력 삭제
   */
  async removeEducation(educationId: string, userId: string) {
    const education = await this.prisma.workerEducation.findUnique({
      where: { id: educationId },
      include: {
        worker: true,
      },
    });

    if (!education) {
      throw new NotFoundException('교육 이력을 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 관리자인지 확인
    await this.checkProjectAccess(education.worker.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.ADMIN,
    ]);

    // 교육 이력 삭제
    await this.prisma.workerEducation.delete({
      where: { id: educationId },
    });

    return { id: educationId };
  }

  /**
   * 근로자 출입 기록 추가
   */
  async addCheckin(
    createWorkerCheckinDto: CreateWorkerCheckinDto,
    userId: string,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: createWorkerCheckinDto.workerId },
    });

    if (!worker) {
      throw new NotFoundException('근로자를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인
    await this.checkProjectAccess(worker.projectId, userId);

    // 체크인 시간이 없으면 현재 시간으로 설정
    const checkinTime = createWorkerCheckinDto.checkinTime || new Date();

    // 체크아웃 시간이 체크인 시간보다 이전인지 검사
    if (
      createWorkerCheckinDto.checkoutTime &&
      checkinTime > createWorkerCheckinDto.checkoutTime
    ) {
      throw new BadRequestException('퇴출 시간은 출입 시간보다 이후여야 합니다.');
    }

    // 출입 기록 생성
    const checkin = await this.prisma.workerCheckin.create({
      data: {
        checkinTime,
        checkoutTime: createWorkerCheckinDto.checkoutTime,
        location: createWorkerCheckinDto.location,
        worker: {
          connect: {
            id: createWorkerCheckinDto.workerId,
          },
        },
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return checkin;
  }

  /**
   * 퇴출 처리 (체크아웃 시간 업데이트)
   */
  async checkout(checkinId: string, userId: string) {
    const checkin = await this.prisma.workerCheckin.findUnique({
      where: { id: checkinId },
      include: {
        worker: true,
      },
    });

    if (!checkin) {
      throw new NotFoundException('출입 기록을 찾을 수 없습니다.');
    }

    if (checkin.checkoutTime) {
      throw new BadRequestException('이미 퇴출 처리된 기록입니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인
    await this.checkProjectAccess(checkin.worker.projectId, userId);

    // 퇴출 시간 업데이트
    const updatedCheckin = await this.prisma.workerCheckin.update({
      where: { id: checkinId },
      data: {
        checkoutTime: new Date(),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedCheckin;
  }

  /**
   * 사용자가 프로젝트에 접근할 권한이 있는지 확인
   * @returns 프로젝트 멤버 정보
   */
  private async checkProjectAccess(
    projectId: string,
    userId: string,
    allowedRoles: ProjectRole[] = [
      ProjectRole.OWNER,
      ProjectRole.ADMIN,
      ProjectRole.MEMBER,
    ],
  ) {
    // 프로젝트 존재 여부 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    // 사용자가 프로젝트 멤버인지 확인
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!projectMember) {
      throw new ForbiddenException('이 프로젝트에 접근할 권한이 없습니다.');
    }

    // 사용자가 허용된 역할을 가지고 있는지 확인
    if (!allowedRoles.includes(projectMember.role)) {
      throw new ForbiddenException('이 작업을 수행할 권한이 없습니다.');
    }

    return projectMember;
  }
} 