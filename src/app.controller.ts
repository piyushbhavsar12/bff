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
import { CustomLogger } from "./common/logger";

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
  private logger: CustomLogger
  
  constructor(
    private readonly appService: AppService
  ) {
    this.prismaService = new PrismaService()
    this.configService = new ConfigService()
    this.aiToolsService = new AiToolsService(this.configService)
    this.conversationService = new ConversationService(this.prismaService,this.configService)
    this.logger = new CustomLogger("AppController");
  }

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/prompt/:configid")
  async prompt(@Body() promptDto: any, @Headers() headers, @Param("configid") configid: string): Promise<any> {
    const userId = headers["user-id"]
    let verboseLogger = this.logger.logWithCustomFields({
      userId: userId,
      flowId: configid
    },"verbose")
    let errorLogger = this.logger.logWithCustomFields({
      userId: userId,
      flowId: configid
    },"error")
    verboseLogger("User input", promptDto)
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
        verboseLogger("Detected Language =", prompt.inputLanguage)
      }
    } else if (promptDto.media){
      if(promptDto.media.category=="base64audio" && promptDto.media.text){
        type = "Audio"
        prompt.inputLanguage = promptDto.inputLanguage as Language
        let response = await this.aiToolsService.speechToText(promptDto.media.text,prompt.inputLanguage)
        if(response.error) {
          errorLogger(response.error)
          return{
            text:"",
            error: "Something went wrong, please try again."
          }
        }
        userInput = response["text"]
        verboseLogger("speech to text =",userInput)
      } else {
        errorLogger("Unsupported media")
        return {
          text: "",
          media: promptDto.media,
          mediaCaption: "",
          error: "Unsupported media"
        }
      }
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
    verboseLogger("current state when API hit =", botFlowService.state.context.currentState)
    let isNumber = false;

    if(type == 'Audio' && (botFlowService.state.context.currentState == 'confirmInput1' || botFlowService.state.context.currentState == 'getUserQuestion')) {
      let res =  {
        text: userInput,
        textInEnglish: "",
        error: null
      }
      res['audio'] = await this.aiToolsService.textToSpeech(res.text,prompt.inputLanguage)
      return res
    } else {
      //translate to english
      if(prompt.inputLanguage != Language.en && userInput != 'resend OTP') {
        try {
          let response = await this.aiToolsService.translate(
            prompt.inputLanguage as Language,
            Language.en,
            userInput
          )
          if(!response['text']) {
            errorLogger("Sorry, We are unable to translate given input, please try again")
            return { error: "Sorry, We are unable to translate given input, please try again" }
          }
          prompt.inputTextInEnglish = response["text"]
          verboseLogger("translated english text =", prompt.inputTextInEnglish)
        } catch(error){
          errorLogger("Sorry, We are unable to translate given input, please try again")
          return { error: "Sorry, We are unable to translate given input, please try again" }
        }
      } else {
        prompt.inputTextInEnglish = userInput
      }

      if(type == 'Audio' && ['askingAadhaarNumber','askingOTP','askLastAaadhaarDigits','confirmInput2','confirmInput3','confirmInput4'].indexOf(botFlowService.state.context.currentState) != -1) {
        let number = wordToNumber(prompt.inputTextInEnglish)
        if(/\d/.test(number)){
          isNumber = true
          prompt.inputTextInEnglish = number.toUpperCase()
          verboseLogger("english text to numbers conversion =",prompt.inputTextInEnglish)
        }
      }
    }


    const currentContext = botFlowService.state.context;
    let updatedContext = {
      ...currentContext,
      inputType: type,
      type:""
    };
    botFlowService.state.context = updatedContext;

    botFlowService.send('USER_INPUT', { data: prompt.inputTextInEnglish });

    await new Promise((resolve) => {
      botFlowService.subscribe((state) => {
        verboseLogger('Current state:', state.value);
        updatedContext = {
          ...state.context,
          //@ts-ignore
          currentState: state.value
        };
        botFlowService.state.context = updatedContext;
        console.log('Current context:', state.context);
        if(state.context.type=="pause"){
          verboseLogger("paused state", state.value)
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
        verboseLogger("state done")
        resolve(state)
      })
    });

    verboseLogger("final response",botFlowService.getSnapshot().context.response)
    verboseLogger("final error",botFlowService.getSnapshot().context.error)
    let result = {
      textInEnglish: botFlowService.getSnapshot().context.response,
      text: botFlowService.getSnapshot().context.response,
      error: null,
      audio: null,
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
    prompt.inputLanguage = promptDto.inputLanguage

    if(result.text){
      if(prompt.inputLanguage != Language.en && !isNumber) {
        try {
          let response = await this.aiToolsService.translate(
            Language.en,
            prompt.inputLanguage as Language,
            result.text
          )
          if(!response['text']){
            errorLogger("Sorry, We are unable to translate given input, please try again")
            result.error = "Sorry, We are unable to translate given input, please try again"
          }
          result.text = response["text"]
          verboseLogger("input language translated text =",result.text)
        } catch(error){
          errorLogger(error)
          return { error: "Sorry, We are unable to translate given input, please try again" }
        }
      }
      try{
        let textToaudio = result.text
        if(botFlowService.state.context.currentState == 'endFlow'){
          let resArray = result.text.split("\n")
          let compareText = result.textInEnglish.split('\n')
          if(compareText[compareText.length-1].slice(0,12)=="Registration"){
            textToaudio = ""
          } else {
            textToaudio = resArray[resArray.length-1]
          }
        }
        verboseLogger("textToaudio =",textToaudio)
        result['audio'] = await this.aiToolsService.textToSpeech(textToaudio,isNumber ? Language.en : prompt.inputLanguage)
      } catch(error){
        result['audio'] = {text: "",error: error.message}
      }
    }

    await this.conversationService.saveConversation(
      userId,
      botFlowService.getSnapshot().context,
      botFlowService.state.context.state,
      configid
    )

    verboseLogger("current state while returning response =", botFlowService.state.context.currentState)
    verboseLogger("response text", result.text)
    verboseLogger("response textInEnglish", result.textInEnglish)
    verboseLogger("response error", result.error)
    return result;
  }
}
