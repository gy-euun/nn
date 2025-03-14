import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessageDto, ChatFeedbackDto } from './dto';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface OpenAIMessage {
  content: string;
}

interface OpenAIChoice {
  message: OpenAIMessage;
}

interface OpenAIResponseData {
  choices: OpenAIChoice[];
}

@Injectable()
export class AiChatbotService {
  private readonly logger = new Logger(AiChatbotService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o';
  }

  // 사용자 메시지 처리 및 AI 응답 생성
  async processMessage(userId: string, chatMessageDto: ChatMessageDto) {
    try {
      // 사용자 메시지 저장
      const userMessage = await this.prisma.chatMessage.create({
        data: {
          content: chatMessageDto.content,
          isUserMessage: true,
          userId,
        },
      });

      // 이전 대화 내역 조회 (최근 10개)
      const chatHistory = await this.prisma.chatMessage.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20, // 최근 20개 메시지 (현재 메시지 포함)
      });

      // 대화 내역을 시간순으로 정렬
      const sortedHistory = [...chatHistory].sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );

      // OpenAI API 요청 메시지 구성
      const messages = [
        {
          role: 'system',
          content: `당신은 산업 안전 전문가입니다. 사용자의 안전 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.
                    한국의 산업안전보건법과 관련 규정에 따라 답변하세요.
                    답변은 명확하고 실용적이어야 합니다.
                    불확실한 정보는 제공하지 마세요.
                    답변은 한국어로 제공하세요.`,
        },
        // 이전 대화 내역 추가
        ...sortedHistory.map(msg => ({
          role: msg.isUserMessage ? 'user' : 'assistant',
          content: msg.content,
        })),
      ];

      // OpenAI API 호출
      const response = await this.callOpenAI(messages);

      // AI 응답 저장
      const aiMessage = await this.prisma.chatMessage.create({
        data: {
          content: response,
          isUserMessage: false,
          userId,
        },
      });

      return {
        id: aiMessage.id,
        content: aiMessage.content,
        createdAt: aiMessage.createdAt,
      };
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack);
      throw error;
    }
  }

  // OpenAI API 호출
  private async callOpenAI(messages: any[]) {
    try {
      const response: AxiosResponse<OpenAIResponseData> = await lastValueFrom(
        this.httpService.post<OpenAIResponseData>(
          this.apiUrl,
          {
            model: this.model,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        ),
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(`OpenAI API response: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error('AI 응답을 생성하는 중 오류가 발생했습니다');
    }
  }

  // 사용자 대화 내역 조회
  async getChatHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({
        where: {
          userId,
        },
      }),
    ]);

    // 시간순으로 정렬하여 반환
    const sortedMessages = [...messages].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );

    return {
      data: sortedMessages.map(message => ({
        id: message.id,
        content: message.content,
        isUserMessage: message.isUserMessage,
        createdAt: message.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 피드백 저장 (향후 구현)
  async saveFeedback(messageId: string, userId: string, feedbackDto: ChatFeedbackDto) {
    // 메시지 존재 여부 확인
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.userId !== userId || message.isUserMessage) {
      throw new Error('유효하지 않은 메시지입니다');
    }

    // 피드백 저장 로직 (향후 피드백 테이블 추가 시 구현)
    // 현재는 로그만 남김
    this.logger.log(
      `Feedback for message ${messageId}: isHelpful=${feedbackDto.isHelpful}, comment=${
        feedbackDto.comment || 'N/A'
      }`,
    );

    return {
      success: true,
      message: '피드백이 성공적으로 저장되었습니다',
    };
  }
} 