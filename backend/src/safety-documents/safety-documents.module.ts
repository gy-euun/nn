import { Module } from '@nestjs/common';
import { SafetyDocumentsService } from './safety-documents.service';
import { SafetyDocumentsController } from './safety-documents.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SafetyDocumentsController],
  providers: [SafetyDocumentsService],
  exports: [SafetyDocumentsService],
})
export class SafetyDocumentsModule {}
