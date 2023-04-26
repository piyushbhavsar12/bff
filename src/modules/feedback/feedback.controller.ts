
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';
import { feedback, query } from '@prisma/client';

@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createOrUpdate(
    @Body() createFeedbackDto: CreateFeedbackDto
  ): Promise<feedback> {
    let feedback = await this.feedbackService.findOne(createFeedbackDto.userId);
    if (feedback) {
      return this.feedbackService.update(createFeedbackDto);
    }
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  async findAll(@Query("page") page: number, @Query("perPage") perPage: number) {
    try {
      page = page ? parseInt(`${page}`) : 1;
      perPage = perPage ? parseInt(`${perPage}`) : 10;
      const faqs = await this.feedbackService.findAll(page,perPage);
      return faqs;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
