import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CustomLogger } from "../../common/logger";


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
  ): Promise<void> {
    await this.prisma.conversation.upsert({
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
    const conversation = await this.prisma.conversation.findFirst({
        where: { 
            userId,
            flowId,
            state: 'onGoing'
        },
    });
    
    return conversation?.context || null;
  }
}
