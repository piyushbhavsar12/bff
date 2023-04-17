import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';
import { feedback } from '@prisma/client';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createOrUpdate(@Body() createFeedbackDto: CreateFeedbackDto): Promise<feedback> {
    let feedback = await this.feedbackService.findOne(createFeedbackDto.userId)
    if (feedback) {
      return this.feedbackService.update(createFeedbackDto)
    }
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  async findAll(): Promise<feedback[]> {
    return this.feedbackService.findAll();
  }
}