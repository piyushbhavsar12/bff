import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { query } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async conversationsList(userId: string, page: number, perPage: number): Promise<any[]> {
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
        let lastUpdatedMessage = await this.prisma.query.findFirst({
          where:{
            conversationId: message.conversationId
          },
          orderBy: [{ updatedAt: "desc"}]
        })
        message['lastConversationAt'] = lastUpdatedMessage.updatedAt
        message['feedback'] = await this.prisma.conversationFeedback.findUnique({
          where:{
            conversationId: message.conversationId
          }
        })
        return message
      }))
      return userHistory;
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
