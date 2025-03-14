import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 정리 (선택적)
  await prisma.comment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.workerCheckin.deleteMany();
  await prisma.workerEducation.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.documentAccess.deleteMany();
  await prisma.safetyDocument.deleteMany();
  await prisma.riskFactor.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 관리자 사용자 생성
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '관리자',
      password: await bcrypt.hash('password123', 10),
      role: 'ADMIN',
    },
  });

  // 일반 사용자 생성
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: '테스트 사용자',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
    },
  });

  // 테스트 프로젝트 생성
  const project = await prisma.project.create({
    data: {
      name: '테스트 프로젝트',
      description: '개발 환경 테스트를 위한 프로젝트입니다.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      status: 'ACTIVE',
    },
  });

  // 프로젝트 멤버 추가
  await prisma.projectMember.create({
    data: {
      role: 'OWNER',
      userId: adminUser.id,
      projectId: project.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      role: 'MEMBER',
      userId: normalUser.id,
      projectId: project.id,
    },
  });

  // 위험성 평가 생성
  const riskAssessment = await prisma.riskAssessment.create({
    data: {
      title: '초기 위험성 평가',
      description: '프로젝트 시작 단계 위험성 평가',
      status: 'DRAFT',
      userId: adminUser.id,
      projectId: project.id,
    },
  });

  // 위험 요소 추가
  await prisma.riskFactor.create({
    data: {
      title: '고소 작업 위험',
      description: '2m 이상 고소 작업 시 추락 위험',
      likelihood: 3, // 중간
      severity: 4, // 높음
      riskLevel: 'HIGH',
      controlMeasures: '안전 벨트 착용, 작업 구역 표시, 안전모 착용 필수',
      assessmentId: riskAssessment.id,
    },
  });

  console.log('시드 데이터가 생성되었습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 