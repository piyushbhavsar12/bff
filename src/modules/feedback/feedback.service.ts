import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './feedback.dto';
import { PrismaService } from 'src/global-services/prisma.service';
import { feedback, query } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFeedbackDto): Promise<feedback> {
    try {
      let feedback = await this.prisma.feedback.create({data});
      return feedback
    } catch(error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('phoneNumber')) {
        throw new BadRequestException(['A feedback with the same phone number already exists']);
      } else {
        throw new BadRequestException(['Something went wrong while creating feedback']);
      }
    }
  }

  async findAll(): Promise<feedback[]> {
    return this.prisma.feedback.findMany();
  }

  async findOne(userId: string): Promise<feedback | null> {
    try {
      let feedback = await this.prisma.feedback.findUnique({
        where: { userId }
      });
      return feedback
    } catch {
      return null
    }
  }

  async update(data: CreateFeedbackDto): Promise<feedback> {
    return this.prisma.feedback.update({
      where: { userId: data.userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
  //using raw queries as right now unable to add unique index to id without createdAt
  //error while migrating: cannot create a unique index without the column "createdAt" (used in partitioning)
  async likeQuery(id): Promise<query> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "query" SET 
        "reaction" = 1, 
        "updatedAt" = NOW() 
        WHERE "id" = '${id}'`
      )
    } catch {
      return null
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "query" where id = '${id}'
    `)
  }

  async dislikeQuery(id): Promise<query> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "query" SET 
        "reaction" = -1, 
        "updatedAt" = NOW() 
        WHERE "id" = '${id}'`
      )
    } catch {
      return null
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "query" where id = '${id}'
    `)
  }

  async removeReactionOnQuery(id): Promise<query> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "query" SET 
        "reaction" = 0, 
        "updatedAt" = NOW() 
        WHERE "id" = '${id}'`
      )
    } catch {
      return null
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "query" where id = '${id}'
    `)
  }
}