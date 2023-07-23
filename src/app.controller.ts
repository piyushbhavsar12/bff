import { Controller, Get, Post, Headers, Body, Param } from "@nestjs/common";
import { AppService, Prompt } from "./app.service";
import { IsNotEmpty,IsUUID, IsOptional } from 'class-validator';
import { interpret } from "xstate";
import { botFlowMachine1, botFlowMachine2 } from "./xstate/prompt/prompt.machine";
import { Language } from "./language";
import { ConfigService } from "@nestjs/config";
import { AiToolsService } from "./modules/aiTools/ai-tools.service";
import { wordToNumber } from "./common/utils";
import { ConversationService } from "./modules/conversation/conversation.service";
import { PrismaService } from "./global-services/prisma.service";

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

@Controller()
export class AppController {
  private configService : ConfigService
  private aiToolsService: AiToolsService
  private conversationService: ConversationService
  private prismaService: PrismaService
  
  constructor(
    private readonly appService: AppService
  ) {
    this.prismaService = new PrismaService()
    this.configService = new ConfigService()
    this.aiToolsService = new AiToolsService(this.configService)
    this.conversationService = new ConversationService(this.prismaService,this.configService)
  }

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/prompt/:configid")
  async prompt(@Body() promptDto: any, @Headers() headers, @Param("configid") configid: string): Promise<any> {
    const userId = headers["user-id"]
    let conversation = await this.conversationService.getConversationState(
      userId,
      configid
    )
    console.log("conversation",conversation)
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
        if(response.error)
        return{
          text:"",
          error: "Something went wrong, please try again."
        }
        userInput = response["text"]
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

    if(prompt.inputLanguage != Language.en && userInput != 'resend OTP') {
      try {
        let response = await this.aiToolsService.translate(
          prompt.inputLanguage as Language,
          Language.en,
          userInput
        )
        if(!response['text'])
        return { error: "Sorry, We are unable to translate given input, please try again" }
        prompt.inputTextInEnglish = response["text"]
      } catch(error){
        console.log(error)
        return { error: "Sorry, We are unable to translate given input, please try again" }
      }
    } else {
      prompt.inputTextInEnglish = userInput
    }

    let botFlowMachine;
    switch(configid){
      case '1':
        botFlowMachine = botFlowMachine1
        break
      case '2':
        botFlowMachine = botFlowMachine2
        break
      default:
        botFlowMachine = botFlowMachine2
    }

    let defaultContext = {
      userQuestion:'',
      query: '',
      queryType: '',
      response: '',
      userAadhaarNumber: '',
      otp: '',
      error: '',
      currentState: "getUserQuestion",
      type: '',
      inputType: type,
      inputLanguage: prompt.inputLanguage,
      lastAadhaarDigits:'',
      state:'onGoing'
    }

    let botFlowService = interpret(botFlowMachine.withContext(conversation || defaultContext)).start();

    console.log("current state when API hit =", botFlowService.state.context.currentState)

    let isNumber = false;
    if(type == 'Audio' && ['askingAadhaarNumber','askingOTP'].indexOf(botFlowService.state.context.currentState) != -1) {
      let number = wordToNumber(prompt.inputTextInEnglish)
      if(/\d/.test(number)){
        isNumber = true
        prompt.inputTextInEnglish = number.toUpperCase()
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
          //@ts-ignore
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
        const currentContext = botFlowService.state.context;
        let updatedContext = {
          ...currentContext,
          state:'Done'
        };
        botFlowService.state.context = updatedContext;
        console.log("state done")
        resolve(state)
      })
    });

    console.log("final response",botFlowService.getSnapshot().context.response)
    console.log("final error",botFlowService.getSnapshot().context.error)
    let result = {
      textInEnglish: botFlowService.getSnapshot().context.response,
      text: botFlowService.getSnapshot().context.response,
      error: null
    }
    if(botFlowService.getSnapshot().context.error){
      const currentContext = botFlowService.state.context;
      let updatedContext = {
        ...currentContext,
        state:'Done'
      };
      botFlowService.state.context = updatedContext;
      result.textInEnglish = null
      result.text = null
      result.error = botFlowService.getSnapshot().context.error
    }
    prompt.inputLanguage = botFlowService.getSnapshot().context.inputLanguage as Language

    if(result.text){
      if(prompt.inputLanguage != Language.en && !isNumber) {
        try {
          let response = await this.aiToolsService.translate(
            Language.en,
            prompt.inputLanguage as Language,
            result.text
          )
          if(!response['text'])
          result.error = "Sorry, We are unable to translate given input, please try again"
          result.text = response["text"]
        } catch(error){
          console.log(error)
          return { error: "Sorry, We are unable to translate given input, please try again" }
        }
      }
    }

    await this.conversationService.saveConversation(
      userId,
      botFlowService.getSnapshot().context,
      botFlowService.state.context.state,
      configid
    )

    return result;
  }
}
