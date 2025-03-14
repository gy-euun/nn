import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '@prisma/client';

@ApiTags('사용자')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회', description: '로그인한 사용자 자신의 정보를 조회합니다' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 수정', description: '로그인한 사용자 자신의 정보를 수정합니다' })
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 조회', description: '특정 사용자의 정보를 조회합니다' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUser(@Request() req, @Param('id') id: string) {
    // ADMIN만 다른 사용자 정보 조회 가능
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('다른 사용자 정보를 조회할 권한이 없습니다');
    }
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 역할 수정', description: '특정 사용자의 역할을 수정합니다 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '사용자 역할 수정 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async updateUserRole(
    @Request() req,
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    // ADMIN만 역할 변경 가능
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('사용자 역할을 변경할 권한이 없습니다');
    }
    return this.usersService.updateRole(id, role);
  }
} 