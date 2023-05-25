import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { query } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { CustomLogger } from "src/common/logger";

@Injectable()
export class UserService {
  private logger: CustomLogger;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.logger = new CustomLogger("UserService");
  }

  async conversationsList(userId: string, page: number, perPage: number): Promise<any> {
    try {
      let userHistory = await this.prisma.query.findMany({
        distinct: ["conversationId"],
        where: { 
          userId,
          isConversationDeleted: false
        },
        orderBy: [{ conversationId: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      });
      userHistory = await Promise.all(userHistory.map( async (message) => {
        //get last conversed date
        let lastUpdatedMessage = await this.prisma.query.findFirst({
          where:{
            conversationId: message.conversationId
          },
          orderBy: [{ updatedAt: "desc"}]
        })
        message['lastConversationAt'] = lastUpdatedMessage.updatedAt
        //get users mobile number
        var myHeaders = new Headers();
        myHeaders.append("x-application-id", this.configService.get('FRONTEND_APPLICATION_ID'));
        myHeaders.append("Authorization", this.configService.get('FUSION_AUTH_API_KEY'));
        var requestOptions: RequestInit = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };
        try {
          let res: any = await fetch(`${this.configService.get('FUSION_AUTH_BASE_URL')}/api/user?userId=${message.userId}`, requestOptions)
          res = await res.json()
          message['mobileNumber'] = res.user.mobilePhone
        } catch(error) {
          this.logger.error(error)
          message['mobileNumber'] = null
        }
        //get conversation feedbacks
        message['feedback'] = await this.prisma.conversationFeedback.findUnique({
          where:{
            conversationId: message.conversationId
          }
        })
        return message
      }))
      const conversations = await this.prisma.query.findMany({
        distinct: ['conversationId'],
        where: {
          userId,
          isConversationDeleted: false,
        },
      });
      const totalConversations = conversations.length;
      const totalPages = Math.ceil(totalConversations / perPage);
      const pagination = { page, perPage, totalPages, totalConversations };
      return {pagination, userHistory};
    } catch (error) {
      throw new BadRequestException([
        "Something went wrong while fetching user history",
      ]);
    }
  }

  async conversationHistory(
    conversationId: string,
    userId: string
  ): Promise<query[]> {
    try {
      const userHistory = await this.prisma.query.findMany({
        where: {
          conversationId: conversationId,
          userId,
          isConversationDeleted: false
        },
        orderBy: [{ createdAt: "asc" }]
      });
      return userHistory;
    } catch (error) {
      throw new BadRequestException([
        "Something went wrong while fetching conversation history",
      ]);
    }
  }

  async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const userHistory = await this.prisma.query.updateMany({
        where: {
          conversationId: conversationId,
          userId
        },
        data: {
          isConversationDeleted: true
        }
      });
      return userHistory? true: false;
    } catch (error) {
      throw new BadRequestException([
        "Something went wrong while deleting conversation history",
      ]);
    }
  }
}
