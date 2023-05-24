
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, CreateMessageFeedbackDto } from './feedback.dto';
import { feedback, query } from '@prisma/client';
import { AuthGuard } from "src/common/auth-gaurd";

@Controller("feedback")
@UseGuards(AuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() request
  ): Promise<feedback> {
    const userId = request.headers.userId
    return this.feedbackService.create(createFeedbackDto, userId);
  }

  @Get()
  async findAll(@Query("page") page: number, @Query("perPage") perPage: number) {
    try {
      page = page ? parseInt(`${page}`) : 1;
      perPage = perPage ? parseInt(`${perPage}`) : 10;
      const reviews = await this.feedbackService.findAll(page,perPage);
      return reviews;
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

  @Post("message")
  async messageFeedback(@Body() body: CreateMessageFeedbackDto){
    return this.feedbackService.createMessageFeedback(body)
  }
}
