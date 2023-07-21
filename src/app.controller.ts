import { Controller, Get, Post, Headers, Body, UseInterceptors, Param, UnsupportedMediaTypeException } from "@nestjs/common";
import { AppService, Prompt } from "./app.service";
import { AlertInterceptor } from "./modules/alerts/alerts.interceptor";
import { IsNotEmpty,IsUUID, IsOptional } from 'class-validator';
import { interpret } from "xstate";
import { botFlowMachine1, botFlowMachine2 } from "./xstate/prompt/prompt.machine";
import { Language } from "./language";
import { ConfigService } from "@nestjs/config";
import { AiToolsService } from "./modules/aiTools/ai-tools.service";
import { wordToNumber } from "./common/utils";

export class PromptDto {
  @IsNotEmpty()
  type: "Text"|"Audio" ;
  @IsNotEmpty()
  text: string;
  @IsNotEmpty()
  @IsUUID()
  userId: string;


  @IsOptional()
  inputLanguage?: string;
  @IsOptional()
  media?: string;
  @IsOptional()
  appId?: string;
  @IsOptional()
  channel?: string;
  @IsOptional()
  @IsUUID()
  from?: string;
  @IsOptional()
  context?: string;
  @IsOptional()
  to?: string;
  @IsOptional()
  @IsUUID()
  messageId?: string;
  @IsOptional()
  @IsUUID()
  conversationId?: string;
  @IsOptional()
  identifier?: string;
}

const conversationMap = new Map<string, any>();

@Controller()
export class AppController {
  private configService : ConfigService
  private aiToolsService: AiToolsService
  
  constructor(
    private readonly appService: AppService
  ) {
    this.configService = new ConfigService()
    this.aiToolsService = new AiToolsService(this.configService)
  }

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(AlertInterceptor)
  @Post("/prompt/:configid")
  async prompt(@Body() promptDto: any, @Headers() headers, @Param("configid") configid: string): Promise<any> {
    const userId = headers["user-id"]
    let prompt: Prompt = {
      input: promptDto
    }
    let userInput = promptDto.text;
    let type = "text"
    if(promptDto.text){
      type = "Text"
      if(/^\d+$/.test(userInput)){
        prompt.inputLanguage = Language.en
      } else {
        let response = await this.aiToolsService.detectLanguage(userInput)
        prompt.inputLanguage = response["language"] as Language
      }
    } else if (promptDto.media){
      if(promptDto.media.category=="base64audio" && promptDto.media.text){
        type = "Audio"
        prompt.inputLanguage = promptDto.inputLanguage as Language
        let response = await this.aiToolsService.speechToText(promptDto.media.text,prompt.inputLanguage)
        if(!response)
        return{
          text:"",
          error: "Something went wrong, please try again."
        }
        userInput = response["data"]["source"]
        console.log("speech to text",userInput)
      } else {
        return {
          text: "",
          media: promptDto.media,
          mediaCaption: "",
          error: "Unsupported media"
        }
      }
    }
    if(prompt.inputLanguage != Language.en) {
      try {
        let response = await this.aiToolsService.translate(
          prompt.inputLanguage as Language,
          Language.en,
          userInput
        )
        if(!response['translated'])
        return { error: "Sorry, We are unable to translate given input, please try again" }
        prompt.inputTextInEnglish = response["translated"]
      } catch(error){
        console.log(error)
        return { error: "Sorry, We are unable to translate given input, please try again" }
      }
    } else {
      prompt.inputTextInEnglish = userInput
    }
    console.log("converted to english",prompt.inputTextInEnglish)
    if(type == 'Audio') {
      let number = wordToNumber(prompt.inputTextInEnglish)
      if(/\d/.test(number))
      prompt.inputTextInEnglish = number.toUpperCase()
    }
    let botFlowService = conversationMap.get(`${userId}${configid}`);
    if (!botFlowService) {
      // Create a new bot flow service for a new conversation
      if(configid=="1"){
        const newBotFlowService = interpret(botFlowMachine1.withContext({
          query: '',
          queryType: '',
          response: '',
          userAadhaarNumber: '',
          otp: '',
          userData: null,
          error: '',
          currentState: "getUserQuestion",
          type: '',
          inputType: type,
          inputLanguage: prompt.inputLanguage
        })).start();
        conversationMap.set(`${userId}${configid}`, newBotFlowService);
        botFlowService = newBotFlowService;
      } else if(configid=="2"){
        const newBotFlowService = interpret(botFlowMachine2.withContext({
          query: '',
          queryType: '',
          response: '',
          userAadhaarNumber: '',
          otp: '',
          userData: null,
          error: '',
          currentState: "getUserQuestion",
          type: '',
          inputType: type,
          inputLanguage: prompt.inputLanguage,
          lastAadhaarDigits:""
        })).start();
        conversationMap.set(`${userId}${configid}`, newBotFlowService);
        botFlowService = newBotFlowService;
      } else {
        const newBotFlowService = interpret(botFlowMachine1.withContext({
          query: '',
          queryType: '',
          response: '',
          userAadhaarNumber: '',
          otp: '',
          userData: null,
          error: '',
          currentState: "getUserQuestion",
          type: '',
          inputType: type,
          inputLanguage: prompt.inputLanguage
        })).start();
        conversationMap.set(`${userId}${configid}`, newBotFlowService);
        botFlowService = newBotFlowService;
      }
    }
    const currentContext = botFlowService.state.context;
    console.log("start context",)
    let updatedContext = {
      ...currentContext,
      inputType: type,
      type:""
    };
    botFlowService.state.context = updatedContext;
    console.log("sending user input",prompt.inputTextInEnglish)
    botFlowService.send('USER_INPUT', { data: prompt.inputTextInEnglish });
    await new Promise((resolve) => {
      botFlowService.subscribe((state) => {
        console.log('Current state:', state.value);
        updatedContext = {
          ...state.context,
          currentState: state.value
        };
        botFlowService.state.context = updatedContext;
        console.log('Current context:', state.context);
        if(state.context.type=="pause"){
          console.log("paused state", state.value)
          resolve(state)
        }
      });
      botFlowService.onDone((state)=>{
        console.log("state done")
        conversationMap.delete(`${userId}${configid}`)
        resolve(state)
      })
    });
    console.log("final response",botFlowService.getSnapshot().context.response)
    console.log("final error",botFlowService.getSnapshot().context.error)
    let result = {
      text: botFlowService.getSnapshot().context.response,
      error: null
    }
    if(botFlowService.getSnapshot().context.error){
      conversationMap.delete(`${userId}${configid}`)
      result.text = null,
      result.error = botFlowService.getSnapshot().context.error
    }
    prompt.inputLanguage = botFlowService.getSnapshot().context.inputLanguage
    if(result.text){
      if(prompt.inputLanguage != Language.en) {
        try {
          let response = await this.aiToolsService.translate(
            Language.en,
            prompt.inputLanguage as Language,
            result.text
          )
          if(response["error"])
          result.error = "unable to translate given language"
          result.text = response["translated"]
        } catch(error){
          console.log(error)
          return { error: "unable to translate given language" }
        }
      }
    }
    return result;
  }
}
