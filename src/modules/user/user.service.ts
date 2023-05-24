import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { query } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async conversationsList(userId: string): Promise<query[]> {
    try {
      const userHistory = await this.prisma.query.findMany({
        distinct: ["conversationId"],
        where: { 
          userId,
          isConversationDeleted: false
        },
        orderBy: [{ conversationId: "asc" }, { createdAt: "asc" }],
      });
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
  ): Promise<any[]> {
    try {
      let userHistory = await this.prisma.query.findMany({
        where: {
          conversationId: conversationId,
          userId,
          isConversationDeleted: false
        },
        orderBy: [{ createdAt: "asc" }]
      });
      userHistory = await Promise.all(userHistory.map( async (message) => {
        message['feedback'] = await this.prisma.messageFeedback.findMany({
          where:{
            queryId: message.id
          }
        })
        return message
      }))
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
