import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('인증')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입', description: '새 사용자 계정 생성' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '기존 사용자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '비밀번호 재설정 요청', description: '비밀번호 재설정 이메일 발송' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 이메일 발송 성공',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정', description: '새 비밀번호 설정' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 토큰',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인한 사용자 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  getProfile(@Request() req) {
    return this.authService.findUserById(req.user.id);
  }
} 