import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { query } from '@prisma/client';
import { AuthGuard } from '../../common/auth-gaurd';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/conversations")
  async conversations(@Request() request, @Query('userid') adminUserId: string, @Query('page') page: number, @Query('perPage') perPage: number): Promise<query[]> {
    let userId = request.headers.userId
    if(request.headers.roles.indexOf('Admin') != -1) {
      userId = adminUserId
    }
    page = page?page:1
    perPage = perPage?perPage:10
    return this.userService.conversationsList(userId,parseInt(`${page}`),parseInt(`${perPage}`));
  }

  @Get("/chathistory/:conversationId")
  async chatHistory(@Param("conversationId") conversationId: string, @Request() request, @Query('userid') adminUserId: string): Promise<query[]> {
    let userId = request.headers.userId
    if(request.headers.roles.indexOf('Admin') != -1) {
      userId = adminUserId
    }
    return this.userService.conversationHistory(conversationId,userId);
  }

  @Get("conversations/delete/:conversationId")
  async deleteConversation(@Param("conversationId") conversationId: string, @Request() request): Promise<boolean> {
    const userId = request.headers.userId
    return this.userService.deleteConversation(conversationId,userId)
  }
}