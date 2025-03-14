import { Module } from '@nestjs/common';
import { RiskAssessmentsService } from './risk-assessments.service';
import { RiskAssessmentsController } from './risk-assessments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskAssessmentsController],
  providers: [RiskAssessmentsService],
  exports: [RiskAssessmentsService],
})
export class RiskAssessmentsModule {} 