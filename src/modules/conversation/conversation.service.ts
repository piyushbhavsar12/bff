import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CustomLogger } from "../../common/logger";
import { feedback } from "@prisma/client";


@Injectable()
export class ConversationService {
  private logger: CustomLogger;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.logger = new CustomLogger("ConversationService");
  }

  async saveConversation(
    userId: string,
    context: any,
    state: string,
    flowId: string
  ): Promise<any> {
     return await this.prisma.conversation.upsert({
        where: { userId_flowId: {userId, flowId} },
        create: { 
            userId,
            context,
            state,
            flowId
         },
        update: { state, context },
      });
  }

  async getConversationState(
    userId: string,
    flowId: string
  ): Promise<any | null> {
    const conversation: any = await this.prisma.conversation.findFirst({
        where: { 
            userId,
            flowId,
            state: 'onGoing'
        },
    });
    
    return conversation?.context ? {...conversation.context, id:conversation.id} : null;
  }

  async createOrUpdateFeedback(
    feedback: any
  ): Promise<feedback> {
    const feedbackResponse: feedback = await this.prisma.feedback.upsert({
      where: { conversationId: feedback.conversationId},
      create: {
        conversationId: feedback.conversationId,
        translation: feedback.translation,
        information: feedback.information,
        chatbotFunctionality: feedback.chatbotFunctionality,
        feedback: feedback.feedback
      },
      update:{
        translation: feedback.translation,
        information: feedback.information,
        chatbotFunctionality: feedback.chatbotFunctionality,
        feedback: feedback.feedback
      }
    });
    return feedbackResponse
  }
}
