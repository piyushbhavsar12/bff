import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateFeedbackDto } from "./feedback.dto";
import { PrismaService } from "../../global-services/prisma.service";
import { feedback, conversationFeedback, query } from "@prisma/client";

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFeedbackDto, userId): Promise<feedback> {
    try {
      let feedback = await this.prisma.feedback.create({ data: {...data, userId} });
      return feedback;
    } catch (error) {
      throw new BadRequestException([
        "Something went wrong while creating feedback",
      ]);
    }
  }

  async findAll(page: number, perPage: number): Promise<any> {
    const feedbacks = await this.prisma.feedback.findMany({
      take: perPage,
      skip: (page - 1) * perPage
    });
    const totalFeedbacks = await this.prisma.feedback.count();
    return {
      pagination: {
        page,
        perPage,
        totalPages: Math.ceil(totalFeedbacks / perPage),
        totalFeedbacks,
      },
      feedbacks: feedbacks,
    };
  }

  //using raw queries as right now unable to add unique index to id without createdAt
  //error while migrating: cannot create a unique index without the column "createdAt" (used in partitioning)
  async likeQuery(id): Promise<query> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "query" SET 
        "reaction" = 1, 
        "updatedAt" = NOW() 
        WHERE "id" = '${id}'`);
    } catch {
      return null;
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "query" where id = '${id}'
    `);
  }

  async dislikeQuery(id): Promise<query> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "query" SET 
        "reaction" = -1, 
        "updatedAt" = NOW() 
        WHERE "id" = '${id}'`);
    } catch {
      return null;
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "query" where id = '${id}'
    `);
  }

  async removeReactionOnQuery(id): Promise<query> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "query" SET 
        "reaction" = 0, 
        "updatedAt" = NOW() 
        WHERE "id" = '${id}'`);
    } catch {
      return null;
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "query" where id = '${id}'
    `);
  }

  async createConversationFeedback(body): Promise<conversationFeedback> {
    try {
      let query = await this.prisma.query.findFirst({where:{conversationId:body.conversationId}})
      if(!query) throw new Error(`Converstion with id - ${body.conversationId} not found`)
      let feedback = await this.prisma.conversationFeedback.findUnique({
        where: {
          conversationId: body.conversationId
        }
      })
      if(!feedback) {
        feedback = await this.prisma.conversationFeedback.create({
          data: {
            rating: body.rating,
            review: body.review,
            conversationId: body.conversationId
          }
        });
      } else {
        feedback = await this.prisma.conversationFeedback.update({
          where: { conversationId: body.conversationId },
          data: {
            rating: body.rating,
            review: body.review
          }
        });
      }
      return feedback;
    } catch (error) {
      console.log(error)
      throw new BadRequestException([
        "Something went wrong while creating feedback",
      ]);
    }
  }
}
