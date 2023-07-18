import { Injectable } from "@nestjs/common";
import { PromptDto } from "./app.controller";
import { Language } from "./language";
import fetch from "node-fetch";
import { PrismaService } from "./global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CustomLogger } from "./common/logger";
import { sendDiscordAlert, sendEmail } from "./modules/alerts/alerts.service";
import { 
  AADHAAR_GREETING_MESSAGE,
  CONTACT_AMAKRUSHI_HELPLINE, 
  GPT_RESPONSE_ERROR,  
  REPHRASE_YOUR_QUESTION, 
  TEXT_DETECTION_ERROR, 
  TEXT_TRANSLATION_ERROR, 
  UNABLE_TO_DETECT_LANGUAGE, 
  UNABLE_TO_PROCESS_REQUEST
} from "./common/constants";
import { fetchWithAlert } from "./common/utils";
import { isMostlyEnglish } from "./utils";
import { randomUUID } from "crypto";
import axios from "axios";
const { performance } = require("perf_hooks");
const path = require('path');
const filePath = path.resolve(__dirname, 'common/kisanPortalErrors.json');
const PMKissanProtalErrors = require(filePath);
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

export interface Document {
  combined_content: string;
  combined_prompt: string;
}

export interface ResponseForTS {
  message: {
    title: string;
    choices: string[];
    media_url: string;
    caption: string;
    msg_type: string;
    conversationId: string;
    split?: boolean;
  };
  to: string;
  messageId: string;
}

@Injectable()
export class AppService {
  private logger: CustomLogger;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    // AUTH_HEADER = this.configService.get("AUTH_HEADER");
    this.logger = new CustomLogger("AppService");
  }
  // async translate(
  //   source: Language,
  //   target: Language,
  //   text: string,
  //   prompt: Prompt
  // ): Promise<string> {
  //   var myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append(
  //     "Authorization",
  //     this.configService.get("AI_TOOLS_AUTH_HEADER")
  //   );

  //   var raw = JSON.stringify({
  //     source_language: source,
  //     target_language: target,
  //     text: text.replace("\n","."),
  //   });

  //   if(raw.indexOf('"unk\"') !== -1) {
  //     // sendEmail(
  //     //   JSON.parse(this.configService.get("SENDGRID_ALERT_RECEIVERS")),
  //     //   "Error while detecting language",
  //     //   `
  //     //   Environment: ${this.configService.get("ENVIRONMENT")}
  //     //   userId: ${prompt.input.userId}
  //     //   input text: ${text}
  //     //   source_language: ${source}
  //     //   target_language: ${target}
  //     //   `
  //     // )
  //     sendDiscordAlert(
  //       "Error while detecting language",
  //       `
  //       Environment: ${this.configService.get("ENVIRONMENT")}
  //       userId: ${prompt.input.userId}
  //       input text: ${text}
  //       source_language: ${source}
  //       target_language: ${target}
  //       `,
  //       16711680
  //     )
  //   }

  //   var requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw.replace('"unk\"','"or\"'),
  //   };

  //   const translated = await fetch(
  //     `${this.configService.get(
  //       "AI_TOOLS_BASE_URL"
  //     )}/text_translation/azure/remote`,
  //     requestOptions
  //   )
  //     .then((response) => response.json())
  //     .then((result) => result["translated"] as string)
  //     .catch((error) => this.logger.logWithCustomFields({
  //       messageId: prompt.input.messageId,
  //       userId: prompt.input.userId
  //     },"error")("error", error));

  //   return translated ? translated : "";
  // }

  // async detectLanguage(prompt: Prompt): Promise<Prompt> {
  //   var myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append(
  //     "Authorization",
  //     this.configService.get("AI_TOOLS_AUTH_HEADER")
  //   );

  //   var raw = JSON.stringify({
  //     text: prompt.input.body?.replace("?","")?.trim(),
  //   });

  //   var requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //   };

  //   const language = await fetch(
  //     `${this.configService.get(
  //       "AI_TOOLS_BASE_URL"
  //     )}/text_lang_detection/bhashini/remote`,
  //     requestOptions
  //   )
  //     .then((response) => response.json())
  //     .then((result) =>
  //       result["language"] ? (result["language"] as Language) : null
  //     )
  //     .catch((error) => {
  //       this.logger.logWithCustomFields({
  //         messageId: prompt.input.messageId,
  //         userId: prompt.input.userId
  //       },"error")("error", error)
  //       if(isMostlyEnglish(prompt.input.body?.replace("?","")?.trim())){
  //         return Language.en
  //       } else {
  //         return 'unk'
  //       }
  //   });

  //   prompt.inputLanguage = language as Language;
  //   return prompt;
  // }

  async similaritySearch(text: String): Promise<Document[]> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    var raw = JSON.stringify({
      prompt: text,
      similarity_score_range: 0.015,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };
    const similarDocs: Document[] | void = await fetchWithAlert(
      `${this.configService.get("AI_TOOLS_BASE_URL")}/embeddings/openai/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => (result ? (result as Document[]) : []))
      .catch((error) => this.logger.verbose("error", error));

    if (similarDocs) return similarDocs;
    else return [];
  }

  async llm(prompt: any, userData: Prompt): Promise<{ response: string; allContent: any; error: any }> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );
    let promptLogger = this.logger.logWithCustomFields({
      messageId: userData.input.messageId,
      userId: userData.input.userId
    },"verbose")
    promptLogger(prompt)

    var raw = JSON.stringify({
      prompt: prompt,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const response = await fetchWithAlert(
      `${this.configService.get("AI_TOOLS_BASE_URL")}/llm/openai/chatgpt3`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        promptLogger({ result });
        const error = Object.keys(result).indexOf('error')!=-1
        return {
          response: error ? null : result["choices"][0].message.content,
          allContent: error ? null : result,
          error: error ? result.error : null
        };
      })
      .catch((error) => this.logger.logWithCustomFields({
        messageId: userData.input.messageId,
        userId: userData.input.userId
      },"error")("error", error));

    if (response) return response;
    else return {response:null, allContent:null, error: "Unable to fetch gpt response."};
  }

  async sendMessageBackToTS(resp: ResponseForTS) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(resp),
    };

    const response = await fetch(
      `${this.configService.get(
        "TRANSPORT_SOCKET_URL"
      )}/botMsg/adapterOutbound`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => this.logger.logWithCustomFields({
        messageId: resp.messageId
      },"verbose")(result))
      .catch((error) => this.logger.logWithCustomFields({
        messageId: resp.messageId
      },"error")("error", error));
  }

  async sendError(
    socketMessage,
    socketMessageInInputLanguage,
    prompt,
    coreferencedPrompt,
    sendError = false,
    error = null,
    errorRate = 0
  ) {
    await this.sendMessageBackToTS({
      message: {
        title: socketMessageInInputLanguage,
        choices: [],
        media_url: null,
        caption: null,
        msg_type: "text",
        conversationId: prompt.input.conversationId
      },
      to: prompt.input.userId,
      messageId: prompt.input.messageId,
    })
    await this.prisma.query.create({ 
      data: {
        id: prompt.input.messageId,
        userId: prompt.input.userId,
        query: prompt.input.body,
        response: socketMessage,
        responseTime: new Date().getTime() - prompt.timestamp,
        queryInEnglish: prompt.inputTextInEnglish,
        responseInEnglish: socketMessageInInputLanguage,
        conversationId: prompt.input.conversationId
      },
    })
    if(sendError) throw new Error(error)
  }

  async processPrompt(promptDto: PromptDto): Promise<any> {
    let errorRate = 0;
    let prompt: Prompt = {
      input: promptDto,
    };
    prompt.timestamp = new Date().getTime();
    prompt.responseType = "";

    let promptLogger = this.logger.logWithCustomFields({
      messageId: prompt.input.messageId, 
      userId: prompt.input.userId 
    },"verbose")
    promptLogger("CP-1");
    // Detect language of incoming prompt
    prompt.inputLanguage = Language.en;
    promptLogger("CP-2");
    prompt.inputTextInEnglish = prompt.input.text;
  
    promptLogger("CP-3", prompt);
    // construct the prompt for chatGPT3
    let history = [];
    let allContent;
    let coreferencedPrompt;
    //NOTE: have to check the similarity between coreferencedPrompt and prompt.inputTextInEnglish
    let finalChatGPTQuestion =  coreferencedPrompt?.replace("User:","") || prompt.inputTextInEnglish
    console.log("finalChatGPTQuestion",finalChatGPTQuestion)
    // Check for older similar prompts
    promptLogger("CP-4.1");

    let responseInInputLanguge = "";
    let chatGPT3FinalResponse = "";
    let allContentSummarization;
    let olderSimilarQuestionId;
    console.log({ allContent });
    // If something is very simlar return older response
    const startTime = performance.now();
  
    let type='Mobile'
    if(/^[6-9]\d{9}$/.test(prompt.input.identifier)) {
      type='Mobile'
    } else if(prompt.input.identifier.length==14 && /^[6-9]\d{9}$/.test(prompt.input.identifier.substring(0,10))){
      type='MobileAadhar'
    } else if(prompt.input.identifier.length==12 && /^\d+$/.test(prompt.input.identifier)){
      type = "Aadhar"
    } else if(prompt.input.identifier.length == 11) { 
      type = "Ben_id"
    }
    console.log("ChatbotBeneficiaryStatus")
    console.log("using...",prompt.input.identifier, type)
    let userErrors = [];
    try {
      let data = JSON.stringify({
        "EncryptedRequest": `{\"Types\":\"${type}",\"Values\":\"${prompt.input.identifier}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`
      });
      console.log("body", data)
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.configService.get("PM_KISAN_BASE_URL")}/ChatbotBeneficiaryStatus`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

      let errors: any = await axios.request(config)
      errors = await errors.data
      console.log("related issues",errors)
      errors = JSON.parse(errors.d.output)
      if(errors.Rsponce == "True"){
        Object.entries(errors).forEach(([key, value]) => {
          if(key!="Rsponce" && key != "Message"){
            if(value){
              console.log(`ERRORVALUE: ${key} ${value}`);
              userErrors.push(PMKissanProtalErrors[`${value}`])
            }
          }
        });
      }
    } catch (error) {
      console.log("ChatbotBeneficiaryStatus error")
      console.log(error)
    }
    chatGPT3FinalResponse = userErrors.join("\n")

    promptLogger("response", responseInInputLanguge || chatGPT3FinalResponse)
  
    let res: any;
    try {
      let type = "Mobile";
      if(/^[6-9]\d{9}$/.test(prompt.input.identifier)) {
        type = "Mobile"
      } else if(prompt.input.identifier.length==14 && /^[6-9]\d{9}$/.test(prompt.input.identifier.substring(0,10))){
        type = "MobileAadhar"
      } else if(prompt.input.identifier.length==12 && /^\d+$/.test(prompt.input.identifier)){
        type = "Aadhar"
      } else if(prompt.input.identifier.length == 11) { 
        type = "Ben_id"
      }
      console.log("user datails")
      console.log("using...",prompt.input.identifier, type)

      let data = JSON.stringify({
        "EncryptedRequest": `{\"Types\":\"${type}\",\"Values\":\"${prompt.input.identifier}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.configService.get("PM_KISAN_BASE_URL")}/ChatbotUserDetails`,
        headers: { 
          'Content-Type': 'application/json', 
          'Cookie': 'BIGipServerPMKISAN_exlink_80=3818190346.20480.0000'
        },
        data : data
      };
      res = await axios.request(config)
      res = await res.data
      res.d.output = JSON.parse(res.d.output)
      res["status"] = res.d.output.Rsponce != "False" ? "OK" : "NOT_OK"
    } catch {
      res = {
        status: "NOT_OK"
      }
    }
    if(res.status == "OK") {
      let data = res.d.output
      await this.sendMessageBackToTS({
        message: {
          title: AADHAAR_GREETING_MESSAGE(
            data.BeneficiaryName,
            data.FatherName,
            data.DOB,
            data.Address,
            data.DateOfRegistration
          ),
          choices: [],
          media_url: null,
          caption: null,
          msg_type: "text",
          conversationId: prompt.input.conversationId,
          split: true
        },
        to: prompt.input.from,
        messageId: randomUUID(),
      })
    }
    // const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    // await delay(5000)
    for(let i=0;i<userErrors.length;i++){
      let error = userErrors[i]
      const resp: ResponseForTS = {
        message: {
          title: error,
          choices: [],
          media_url: null,
          caption: null,
          msg_type: "text",
          conversationId: prompt.input.conversationId
        },
        to: prompt.input.from,
        messageId: randomUUID(),
      };
      if(error)
      await this.sendMessageBackToTS(resp);
    }
    promptLogger(`Total query response time = ${new Date().getTime() - prompt.timestamp}`)
    if(new Date().getTime() - prompt.timestamp > 25000) errorRate+=1
    await this.prisma.query.create({
      data: {
        id: prompt.input.messageId,
        userId: prompt.input.userId,
        query: prompt.input.text,
        response: responseInInputLanguge || chatGPT3FinalResponse,
        responseTime: new Date().getTime() - prompt.timestamp,
        queryInEnglish: prompt.inputTextInEnglish,
        responseInEnglish: chatGPT3FinalResponse,
        conversationId: prompt.input.conversationId,
      },
    });

    // Store that response to the query in the database
    // Return the reponse to the user
  }
  getHello(): string {
    return "Hello World!";
  }
}
