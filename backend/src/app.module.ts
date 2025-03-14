import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { RiskAssessmentsModule } from './risk-assessments/risk-assessments.module';
import { AiChatbotModule } from './ai-chatbot/ai-chatbot.module';
import { SafetyDocumentsModule } from './safety-documents/safety-documents.module';
import { WorkersModule } from './workers/workers.module';
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    RiskAssessmentsModule,
    AiChatbotModule,
    SafetyDocumentsModule,
    WorkersModule,
    StatisticsModule,
    NotificationsModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
