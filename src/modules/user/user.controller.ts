import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { query } from '@prisma/client';
import { AuthGuard } from 'src/common/auth-gaurd';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/conversations")
  async conversations(@Request() request): Promise<query[]> {
    const userId = request.headers.userId
    return this.userService.conversationsList(userId);
  }

  @Get("/chathistory/:conversationId")
  async chatHistory(@Param("conversationId") conversationId: string, @Request() request): Promise<query[]> {
    const userId = request.headers.userId
    return this.userService.conversationHistory(conversationId,userId);
  }

  @Get("conversations/delete/:conversationId")
  async deleteConversation(@Param("conversationId") conversationId: string, @Request() request): Promise<boolean> {
    const userId = request.headers.userId
    return this.userService.deleteConversation(conversationId,userId)
  }
}