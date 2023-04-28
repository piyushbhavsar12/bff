import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { query } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/conversations/:userId")
  async conversations(@Param("userId") userId: string): Promise<query[]> {
    return this.userService.conversationsList(userId);
  }

  @Get("/chathistory/:userId/:conversationId")
  async chatHistory(@Param("userId") userId: string, @Param("conversationId") conversationId: string): Promise<query[]> {
    return this.userService.conversationHistory(conversationId,userId);
  }

  @Get("conversations/delete/:userId/:conversationId")
  async deleteConversation(@Param("userId") userId: string, @Param("conversationId") conversationId: string): Promise<boolean> {
    return this.userService.deleteConversation(conversationId,userId)
  }
}