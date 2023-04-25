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
        where: { userId },
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
    conversationId: number,
    userId: string
  ): Promise<query[]> {
    try {
      const userHistory = await this.prisma.query.findMany({
        where: {
          conversationId: parseInt(`${conversationId}`)
            ? parseInt(`${conversationId}`)
            : null,
          userId,
        },
        orderBy: [{ createdAt: "asc" }],
      });
      return userHistory;
    } catch (error) {
      throw new BadRequestException([
        "Something went wrong while fetching conversation history",
      ]);
    }
  }
}
