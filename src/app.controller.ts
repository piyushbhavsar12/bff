import { Controller, Get, Post, Headers, Body, UseInterceptors } from "@nestjs/common";
import { AppService } from "./app.service";
import { AlertInterceptor } from "./common/alerts.interceptor";

export interface PromptDto {
  body: string;
  media: string;
  userId: string;
  appId: string;
  channel: string;
  from: string;
  context: string;
  to: string;
  messageId: string;
  conversationId?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(AlertInterceptor)
  @Post("/prompt")
  prompt(@Body() promptDto: PromptDto, @Headers() headers): any {
    return this.appService.processPrompt(promptDto);
  }
}
