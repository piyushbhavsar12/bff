import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './feedback.dto';
import { PrismaService } from 'src/global-services/prisma.service';
import { feedback } from '@prisma/client';

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
}