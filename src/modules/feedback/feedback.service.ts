import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './feedback.dto';
import { PrismaService } from 'src/global-services/prisma.service';
import { feedback } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFeedbackDto): Promise<feedback> {
    return this.prisma.feedback.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
    });
  }

  async findAll(): Promise<feedback[]> {
    return this.prisma.feedback.findMany();
  }

  async findOne(phoneNumber: string): Promise<feedback | null> {
    try {
      let feedback = await this.prisma.feedback.findUnique({
        where: { phoneNumber }
      });
      return feedback
    } catch {
      return null
    }
  }

  async update(data: CreateFeedbackDto): Promise<feedback> {
    return this.prisma.feedback.update({
      where: { phoneNumber: data.phoneNumber },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}