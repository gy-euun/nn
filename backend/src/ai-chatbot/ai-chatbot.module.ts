import { Module } from '@nestjs/common';
import { AiChatbotService } from './ai-chatbot.service';
import { AiChatbotController } from './ai-chatbot.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [AiChatbotController],
  providers: [AiChatbotService],
  exports: [AiChatbotService],
})
export class AiChatbotModule {} 