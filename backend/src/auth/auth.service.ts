import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 사용자 등록
   */
  async register(registerDto: RegisterDto) {
    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(registerDto.password);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: 'USER', // 기본 역할
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // JWT 토큰 생성
    const token = this.generateToken(user.id);

    return { user, token };
  }

  /**
   * 로그인
   */
  async login(loginDto: LoginDto) {
    // 이메일로 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 비밀번호 확인
    const isPasswordValid = await this.comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // JWT 토큰 생성
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  /**
   * 비밀번호 재설정 이메일 요청
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('등록되지 않은 이메일입니다');
    }

    // 비밀번호 재설정 토큰 생성 (실제 구현에서는 랜덤한 문자열을 생성)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1시간 후 만료

    // 토큰 저장
    await this.prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: resetToken,
        expires: resetTokenExpiry,
      },
      create: {
        userId: user.id,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    });

    // 실제 구현에서는 이메일 전송 로직 추가
    // 여기서는 토큰만 반환
    return {
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      // 개발용으로만 토큰 반환
      token: resetToken,
    };
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // 토큰으로 사용자 찾기
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        token: resetPasswordDto.token,
        expires: { gt: new Date() }, // 만료되지 않은 토큰
      },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new BadRequestException('유효하지 않거나 만료된 토큰입니다');
    }

    // 새 비밀번호 해싱
    const hashedPassword = await this.hashPassword(resetPasswordDto.password);

    // 비밀번호 업데이트
    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    });

    // 토큰 삭제
    await this.prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    return {
      message: '비밀번호가 성공적으로 재설정되었습니다.',
    };
  }

  /**
   * 헬퍼 메소드: 비밀번호 해싱
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * 헬퍼 메소드: 비밀번호 비교
   */
  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 헬퍼 메소드: JWT 토큰 생성
   */
  private generateToken(userId: string): string {
    const payload = { userId };
    return this.jwtService.sign(payload);
  }

  /**
   * 사용자 정보로 사용자 조회
   */
  async findUserById(userId: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }
} 