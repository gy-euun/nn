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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, QueryNotificationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('알림')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: '알림 목록 조회',
    description: '사용자의 알림 목록을 조회합니다 (페이지네이션, 필터링 지원)',
  })
  @ApiResponse({ status: 200, description: '알림 목록 조회 성공' })
  async findAll(@Request() req, @Query() queryDto: QueryNotificationDto) {
    return this.notificationsService.findAll(req.user.id, queryDto);
  }

  @Post()
  @ApiOperation({
    summary: '알림 생성',
    description: '새로운 알림을 생성합니다 (시스템 또는 관리자용)',
  })
  @ApiResponse({ status: 201, description: '알림 생성 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Put(':id/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다',
  })
  @ApiParam({ name: 'id', description: '알림 ID' })
  @ApiResponse({ status: 200, description: '알림 읽음 처리 성공' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({
    summary: '모든 알림 읽음 처리',
    description: '사용자의 모든 알림을 읽음 상태로 변경합니다',
  })
  @ApiResponse({ status: 200, description: '모든 알림 읽음 처리 성공' })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '알림 삭제',
    description: '특정 알림을 삭제합니다',
  })
  @ApiParam({ name: 'id', description: '알림 ID' })
  @ApiResponse({ status: 200, description: '알림 삭제 성공' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없음' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.remove(id, req.user.id);
  }

  @Delete()
  @ApiOperation({
    summary: '모든 알림 삭제',
    description: '사용자의 모든 알림을 삭제합니다',
  })
  @ApiResponse({ status: 200, description: '모든 알림 삭제 성공' })
  async removeAll(@Request() req) {
    return this.notificationsService.removeAll(req.user.id);
  }
} 