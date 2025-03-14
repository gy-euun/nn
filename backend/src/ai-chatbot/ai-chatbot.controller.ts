import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiChatbotService } from './ai-chatbot.service';
import { ChatMessageDto, ChatFeedbackDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI 챗봇')
@Controller('api/v1/ai-chatbot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiChatbotController {
  constructor(private readonly aiChatbotService: AiChatbotService) {}

  @Post('messages')
  @ApiOperation({ summary: '메시지 전송', description: 'AI 챗봇에 메시지를 전송하고 응답을 받습니다' })
  @ApiResponse({ status: 201, description: '메시지 전송 성공' })
  async sendMessage(@Request() req, @Body() chatMessageDto: ChatMessageDto) {
    return this.aiChatbotService.processMessage(req.user.id, chatMessageDto);
  }

  @Get('messages')
  @ApiOperation({ summary: '대화 내역 조회', description: '사용자의 대화 내역을 조회합니다' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '대화 내역 조회 성공' })
  async getChatHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.aiChatbotService.getChatHistory(req.user.id, page, limit);
  }

  @Post('messages/:id/feedback')
  @ApiOperation({ summary: '피드백 제공', description: 'AI 챗봇 응답에 대한 피드백을 제공합니다' })
  @ApiResponse({ status: 201, description: '피드백 제공 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 메시지' })
  async provideFeedback(
    @Request() req,
    @Param('id') messageId: string,
    @Body() chatFeedbackDto: ChatFeedbackDto,
  ) {
    return this.aiChatbotService.saveFeedback(messageId, req.user.id, chatFeedbackDto);
  }
} 