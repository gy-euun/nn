import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, QueryNotificationDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 사용자의 알림 목록 조회
   */
  async findAll(userId: string, queryDto: QueryNotificationDto) {
    const { type, isRead, page = 1, limit = 10 } = queryDto;

    // 검색 조건 생성
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead }),
    };

    // 총 알림 수 조회
    const total = await this.prisma.notification.count({ where });

    // 알림 목록 조회
    const notifications = await this.prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: notifications,
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
   * 알림 생성
   */
  async create(createNotificationDto: CreateNotificationDto) {
    // 사용자 존재 여부 확인
    const userExists = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!userExists) {
      throw new NotFoundException('지정된 사용자를 찾을 수 없습니다.');
    }

    // 알림 생성
    return this.prisma.notification.create({
      data: {
        title: createNotificationDto.title,
        content: createNotificationDto.content,
        type: createNotificationDto.type,
        link: createNotificationDto.link,
        entityId: createNotificationDto.entityId,
        user: {
          connect: {
            id: createNotificationDto.userId,
          },
        },
      },
    });
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('잘못된 접근입니다.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }

  /**
   * 알림 삭제
   */
  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('잘못된 접근입니다.');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { id };
  }

  /**
   * 모든 알림 삭제
   */
  async removeAll(userId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return { success: true };
  }
} 