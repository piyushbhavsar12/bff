import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';
import { feedback, query } from '@prisma/client';

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

  @Get("query/like/:id")
  async likeQuery(@Param('id') id: string): Promise<query> {
    return this.feedbackService.likeQuery(id);
  }

  @Get("query/dislike/:id")
  async dislikeQuery(@Param('id') id: string): Promise<query> {
    return this.feedbackService.dislikeQuery(id);
  }

  @Get("query/removelike/:id")
  async removeLike(@Param('id') id: string): Promise<query> {
    return this.feedbackService.removeReactionOnQuery(id);
  }
}