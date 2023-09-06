import { Controller, Get, Post, Headers, Body, Param } from "@nestjs/common";
import { AppService, Prompt } from "./app.service";
import { IsNotEmpty,IsUUID, IsOptional } from 'class-validator';
import { interpret } from "xstate";
import { Language } from "./language";
import { ConfigService } from "@nestjs/config";
import { AiToolsService } from "./modules/aiTools/ai-tools.service";
import { formatStringsToTable, wordToNumber } from "./common/utils";
import { ConversationService } from "./modules/conversation/conversation.service";
import { PrismaService } from "./global-services/prisma.service";
import { CustomLogger } from "./common/logger";
import { MonitoringService } from "./modules/monitoring/monitoring.service";
import { PromptServices } from "./xstate/prompt/prompt.service";
const uuid = require('uuid');
const path = require('path');
const filePath = path.resolve(__dirname, './common/en.json');
const engMessage = require(filePath);

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
  private promptService: PromptServices
  private logger: CustomLogger
  
  constructor(
    private readonly appService: AppService,
    private readonly monitoringService: MonitoringService
  ) {
    this.prismaService = new PrismaService()
    this.configService = new ConfigService()
    this.aiToolsService = new AiToolsService(this.configService,this.monitoringService)
    this.conversationService = new ConversationService(this.prismaService,this.configService)
    this.promptService = new PromptServices(this.prismaService,this.configService,this.aiToolsService)
    this.logger = new CustomLogger("AppController");
  }

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/prompt/:configid")
  async prompt(@Body() promptDto: any, @Headers() headers, @Param("configid") configid: string): Promise<any> {
    this.monitoringService.incrementPromptCount()
    //get userId from headers
    const userId = headers["user-id"]
    let messageType = 'intermediate_response'
    //setup loggers
    let verboseLogger = this.logger.logWithCustomFields({
      userId: userId,
      flowId: configid
    },"verbose")
    let errorLogger = this.logger.logWithCustomFields({
      userId: userId,
      flowId: configid
    },"error")
    verboseLogger("User input", promptDto)
    //create or get user and conversation
    let user;
    try{
      user = await this.prismaService.user.findUnique({
        where:{
          id: userId
        }
      })
    }catch{
      verboseLogger("creating new user with id =",userId)
    }
    if(!user) {
      user = await this.prismaService.user.create({
        data:{
          id: userId
        }
      })
    }
    let conversation = await this.conversationService.getConversationState(
      userId,
      configid
    )
    //input setup
    let prompt: Prompt = {
      input: promptDto
    }
    let userInput = promptDto.text;
    let type = "text"
    //handle text and audio
    if(promptDto.text){
      type = "Text"
      if(/^\d+$/.test(userInput)){
        prompt.inputLanguage = Language.en
      } else {
        let response = await this.aiToolsService.detectLanguage(userInput)
        prompt.inputLanguage = response["language"] as Language
        //@ts-ignore
        if(prompt.inputLanguage == 'unk'){
          prompt.inputLanguage = prompt.input.inputLanguage as Language
        }
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

    //Save user message
    await this.prismaService.message.create({
      data:{
        text: type=="Text"?promptDto.text:null,
        audio: type=="Audio"?promptDto.media.text:null,
        type: "User",
        userId,
        flowId: configid || '3',
        messageType
      }
    })
    //get flow
    let botFlowMachine;
    switch(configid){
      case '1':
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine1")
        break
      case '2':
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine2")
        break
      case '3':
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine3")
        break
      default:
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine3")
    }

    let defaultContext = {
      userId,
      userQuestion:'',
      query: '',
      queryType: '',
      response: '',
      userAadhaarNumber: user.identifier && configid=='3' ? user.identifier : '',
      otp: '',
      error: '',
      currentState: "getUserQuestion",
      type: '',
      inputType: type,
      inputLanguage: prompt.inputLanguage,
      lastAadhaarDigits:'',
      state:'onGoing',
      isOTPVerified: user.isVerified
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
      res['messageId'] = uuid.v4()
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
        // let number = wordToNumber(prompt.inputTextInEnglish)
        let number = prompt.inputTextInEnglish.replace(/\s/g, '')
        prompt.inputTextInEnglish = number.toUpperCase()
        isNumber = true
        // if(/\d/.test(number)){
        //   isNumber = true
        //   prompt.inputTextInEnglish = number.toUpperCase()
        //   verboseLogger("english text to numbers conversion =",prompt.inputTextInEnglish)
        // }
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
      let placeholder;
      if(
        result.text==engMessage["label.popUpTitle"] || 
        result.text==engMessage["label.popUpTitleValid"] ||
        result.text==engMessage["label.noRecordsFound"]
      ){
        placeholder = engMessage["label.popUpTitle.short"]
      } else if(
        result.text==engMessage["label.popUpTitle2"]
      ){
        placeholder = engMessage["label.popUpTitle2.short"]
      }else if(
        result.text==engMessage["label.popUpTitle3"]
      ){
        placeholder = engMessage["label.popUpTitle3.short"]
      }else if(
        result.text==engMessage["label.invalid_question"]
      ){
        placeholder = engMessage["label.popUpTitle.short"]
      }
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
      if(prompt.inputLanguage != Language.en && placeholder){
        try {
          let response = await this.aiToolsService.translate(
            Language.en,
            prompt.inputLanguage as Language,
            placeholder
          )
          if(!response['text']){
            errorLogger("Sorry, We are unable to translate given input, please try again")
            result.error = "Sorry, We are unable to translate given input, please try again"
          }
          result['placeholder'] = response["text"]
        } catch(error){
          errorLogger(error)
          return { error: "Sorry, We are unable to translate given input, please try again" }
        }
      } else if(placeholder) {
        result['placeholder'] = placeholder
      }
      try{
        let textToaudio = result.text
        if(botFlowService.state.context.currentState == 'endFlow'){
          messageType = "final_response"
          let resArray = result.text.split("\n")
          let compareText = result.textInEnglish.split('\n')
          if(compareText[compareText.length-1].slice(0,12)=="Registration"){
            textToaudio = ""
          } else {
            textToaudio = resArray.pop() 
          }
          verboseLogger("Array to convert",resArray)
          result.text = `${formatStringsToTable(resArray)}\n${textToaudio}`
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

    let msg = await this.prismaService.message.create({
      data:{
        text: result?.text ? result?.text : result.error? result.error : null,
        audio: result?.audio?.text ? result?.audio?.text : null,
        type: "System",
        userId,
        flowId: configid || '3',
        messageType
      }
    })
    result["messageId"] = msg.id
    result["messageType"] = messageType
    verboseLogger("current state while returning response =", botFlowService.state.context.currentState)
    verboseLogger("response text", result.text)
    verboseLogger("response textInEnglish", result.textInEnglish)
    verboseLogger("response error", result.error)
    return result;
  }
}
