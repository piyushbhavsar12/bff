import { Controller, Get, Post, Headers, Body, UseInterceptors } from "@nestjs/common";
import { AppService } from "./app.service";
import { AlertInterceptor } from "./common/alerts.interceptor";
import { IsNotEmpty,IsUUID, IsOptional } from 'class-validator';

export class PromptDto {
  @IsNotEmpty()
  body: string;
  @IsOptional()
  media: string;
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsOptional()
  appId: string;
  @IsOptional()
  channel: string;
  @IsNotEmpty()
  @IsUUID()
  from: string;
  @IsOptional()
  context: string;
  @IsOptional()
  to: string;
  @IsNotEmpty()
  @IsUUID()
  messageId: string;
  @IsOptional()
  @IsUUID()
  conversationId: string;
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
