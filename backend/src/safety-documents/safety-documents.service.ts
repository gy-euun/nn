import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSafetyDocumentDto,
  DocumentAccessDto,
  GrantDocumentAccessDto,
  QuerySafetyDocumentDto,
  UpdateSafetyDocumentDto,
} from './dto';
import { Prisma } from '@prisma/client';
import { AccessLevel } from './enums/access-level.enum';

@Injectable()
export class SafetyDocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 문서 목록 조회 (페이지네이션, 필터링 지원)
   */
  async findAll(userId: string, queryDto: QuerySafetyDocumentDto) {
    const { title, documentType, projectId, onlyValid, page = 1, limit = 10 } = queryDto;

    // 검색 조건 생성
    const where: Prisma.SafetyDocumentWhereInput = {
      OR: [
        // 사용자가 만든 문서
        { userId },
        // 사용자에게 접근 권한이 부여된 문서
        {
          documentAccesses: {
            some: {
              userId,
            },
          },
        },
      ],
      // 선택적 필터링 조건들
      ...(title && {
        title: {
          contains: title,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(documentType && { documentType }),
      ...(projectId && { projectId }),
      ...(onlyValid && {
        validFrom: { lte: new Date() }, // 시작일이 현재 또는 과거
        OR: [
          { validUntil: null }, // 만료일이 없거나
          { validUntil: { gte: new Date() } }, // 만료일이 현재 또는 미래
        ],
      }),
    };

    // 총 문서 수 조회
    const total = await this.prisma.safetyDocument.count({ where });

    // 문서 목록 조회
    const documents = await this.prisma.safetyDocument.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        documentAccesses: {
          select: {
            userId: true,
            accessLevel: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  /**
   * 특정 문서 상세 조회
   */
  async findOne(id: string, userId: string) {
    const document = await this.prisma.safetyDocument.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        documentAccesses: {
          select: {
            userId: true,
            accessLevel: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    // 사용자 권한 확인
    const hasAccess =
      document.userId === userId ||
      document.documentAccesses.some((access) => access.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('이 문서에 접근할 권한이 없습니다.');
    }

    return document;
  }

  /**
   * 새로운 문서 생성
   */
  async create(dto: CreateSafetyDocumentDto, userId: string) {
    // 프로젝트 ID가 제공된 경우 존재 여부 확인
    if (dto.projectId) {
      const projectExists = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!projectExists) {
        throw new NotFoundException('지정된 프로젝트를 찾을 수 없습니다.');
      }

      // 사용자가 해당 프로젝트에 접근할 수 있는지 확인
      const projectMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId: dto.projectId,
          },
        },
      });

      if (!projectMember) {
        throw new ForbiddenException('이 프로젝트에 문서를 추가할 권한이 없습니다.');
      }
    }

    // 문서 생성
    const data: any = {
      title: dto.title,
      description: dto.description,
      filePath: dto.filePath,
      documentType: dto.documentType,
      validFrom: dto.validFrom,
      validUntil: dto.validUntil,
      user: {
        connect: {
          id: userId,
        },
      },
    };

    // 프로젝트 ID가 있는 경우에만 추가
    if (dto.projectId) {
      data.project = {
        connect: {
          id: dto.projectId,
        },
      };
    }

    return this.prisma.safetyDocument.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
  }

  /**
   * 문서 수정
   */
  async update(id: string, dto: UpdateSafetyDocumentDto, userId: string) {
    const document = await this.prisma.safetyDocument.findUnique({
      where: { id },
      include: {
        documentAccesses: true,
      },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    // 수정 권한 확인
    const userAccess = document.documentAccesses.find(
      (access) => access.userId === userId,
    );

    const canUpdate =
      document.userId === userId || // 문서 소유자이거나
      userAccess?.accessLevel === AccessLevel.WRITE || // WRITE 권한이 있거나
      userAccess?.accessLevel === AccessLevel.ADMIN; // ADMIN 권한이 있는 경우

    if (!canUpdate) {
      throw new ForbiddenException('이 문서를 수정할 권한이 없습니다.');
    }

    // 프로젝트 ID가 변경된 경우 유효성 검사
    if (dto.projectId && dto.projectId !== document.projectId) {
      const projectExists = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!projectExists) {
        throw new NotFoundException('지정된 프로젝트를 찾을 수 없습니다.');
      }

      // 사용자가 해당 프로젝트에 접근할 수 있는지 확인
      const projectMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId: dto.projectId,
          },
        },
      });

      if (!projectMember) {
        throw new ForbiddenException('이 프로젝트에 문서를 추가할 권한이 없습니다.');
      }
    }

    // 문서 업데이트
    const data: any = {};
    
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.filePath !== undefined) data.filePath = dto.filePath;
    if (dto.documentType !== undefined) data.documentType = dto.documentType;
    if (dto.validFrom !== undefined) data.validFrom = dto.validFrom;
    if (dto.validUntil !== undefined) data.validUntil = dto.validUntil;
    
    // 프로젝트 ID 처리
    if (dto.projectId !== undefined) {
      if (dto.projectId === null) {
        data.project = { disconnect: true };
      } else {
        data.project = { connect: { id: dto.projectId } };
      }
    }

    return this.prisma.safetyDocument.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
  }

  /**
   * 문서 삭제
   */
  async remove(id: string, userId: string) {
    const document = await this.prisma.safetyDocument.findUnique({
      where: { id },
      include: {
        documentAccesses: true,
      },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    // 삭제 권한 확인
    const userAccess = document.documentAccesses.find(
      (access) => access.userId === userId,
    );

    const canDelete =
      document.userId === userId || // 문서 소유자이거나
      userAccess?.accessLevel === AccessLevel.ADMIN; // ADMIN 권한이 있는 경우

    if (!canDelete) {
      throw new ForbiddenException('이 문서를 삭제할 권한이 없습니다.');
    }

    // 문서 삭제 (접근 권한도 함께 삭제됨 - cascade)
    return this.prisma.safetyDocument.delete({
      where: { id },
    });
  }

  /**
   * 문서 접근 권한 부여
   */
  async grantAccess(documentId: string, dto: GrantDocumentAccessDto, userId: string) {
    const document = await this.prisma.safetyDocument.findUnique({
      where: { id: documentId },
      include: {
        documentAccesses: true,
      },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    // 권한 부여 권한 확인
    const userAccess = document.documentAccesses.find(
      (access) => access.userId === userId,
    );

    const canManageAccess =
      document.userId === userId || // 문서 소유자이거나
      userAccess?.accessLevel === AccessLevel.ADMIN; // ADMIN 권한이 있는 경우

    if (!canManageAccess) {
      throw new ForbiddenException('이 문서의 권한을 관리할 권한이 없습니다.');
    }

    // 사용자 존재 여부 확인
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!targetUser) {
      throw new NotFoundException('지정된 사용자를 찾을 수 없습니다.');
    }

    // 이미 권한이 있는지 확인
    const existingAccess = await this.prisma.documentAccess.findUnique({
      where: {
        userId_documentId: {
          userId: dto.userId,
          documentId,
        },
      },
    });

    if (existingAccess) {
      // 기존 권한 업데이트
      return this.prisma.documentAccess.update({
        where: {
          userId_documentId: {
            userId: dto.userId,
            documentId,
          },
        },
        data: {
          accessLevel: dto.accessLevel,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // 새 권한 생성
      return this.prisma.documentAccess.create({
        data: {
          userId: dto.userId,
          documentId,
          accessLevel: dto.accessLevel,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }
  }

  /**
   * 문서 접근 권한 제거
   */
  async revokeAccess(documentId: string, userId: string, currentUserId: string) {
    const document = await this.prisma.safetyDocument.findUnique({
      where: { id: documentId },
      include: {
        documentAccesses: true,
      },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    // 문서 소유자의 권한은 제거할 수 없음
    if (document.userId === userId) {
      throw new BadRequestException('문서 소유자의 권한은 제거할 수 없습니다.');
    }

    // 권한 제거 권한 확인
    const userAccess = document.documentAccesses.find(
      (access) => access.userId === currentUserId,
    );

    const canManageAccess =
      document.userId === currentUserId || // 문서 소유자이거나
      userAccess?.accessLevel === AccessLevel.ADMIN; // ADMIN 권한이 있는 경우

    if (!canManageAccess) {
      throw new ForbiddenException('이 문서의 권한을 관리할 권한이 없습니다.');
    }

    // 권한 제거
    const existingAccess = await this.prisma.documentAccess.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });

    if (!existingAccess) {
      throw new NotFoundException('해당 사용자에게 부여된 권한을 찾을 수 없습니다.');
    }

    return this.prisma.documentAccess.delete({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });
  }
}
