import { Injectable } from "@nestjs/common";
import { PromptDto } from "./app.controller";
import { Language } from "./language";
// Overlap between LangchainAI and Prompt-Engine
export interface Prompt {
  input: PromptDto;
  output?: string;
  inputLanguage?: Language;
  inputTextInEnglish?: string;
  maxTokens?: number;
  outputLanguage?: Language;
  similarDocs?: any;

  // More output metadata
  timeTaken?: number;
  timestamp?: number;
  responseType?: string;
}
@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
