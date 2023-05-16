import { Injectable } from "@nestjs/common";
import { PromptDto } from "./app.controller";
import { Language } from "./language";
import fetch from "node-fetch";
import { PrismaService } from "./global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { EmbeddingsService } from "./modules/embeddings/embeddings.service";
import { CustomLogger } from "./common/logger";
import { PromptHistoryService } from "./modules/prompt-history/prompt-history.service";
import { sendDiscordAlert, sendEmail } from "./modules/alerts/alerts.service";
import { 
  CONTACT_AMAKRUSHI_HELPLINE, 
  NEURAL_CORE_RESPONSE_ERROR, 
  REPHRASE_YOUR_QUESTION, 
  TEXT_DETECTION_ERROR, 
  TEXT_TRANSLATION_ERROR, 
  UNABLE_TO_DETECT_LANGUAGE, 
  UNABLE_TO_PROCESS_REQUEST
} from "./common/constants";
import { fetchWithAlert } from "./common/utils";
const { performance } = require("perf_hooks");

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
  };
  to: string;
  messageId: string;
}

@Injectable()
export class AppService {
  private logger: CustomLogger;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private embeddingsService: EmbeddingsService,
    private promptHistoryService: PromptHistoryService
  ) {
    // AUTH_HEADER = this.configService.get("AUTH_HEADER");
    this.logger = new CustomLogger("AppService");
  }
  async translate(
    source: Language,
    target: Language,
    text: string,
    userId: string
  ): Promise<string> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    var raw = JSON.stringify({
      source_language: source,
      target_language: target,
      text: text.replace("\n","."),
    });

    if(raw.indexOf('"unk\"') !== -1) {
      sendEmail(
        JSON.parse(this.configService.get("SENDGRID_ALERT_RECEIVERS")),
        "Error while detecting language",
        `
        Environment: ${this.configService.get("ENVIRONMENT")}
        userId: ${userId}
        input text: ${text}
        source_language: ${source}
        target_language: ${target}
        `
      )
      sendDiscordAlert(
        "Error while detecting language",
        `
        Environment: ${this.configService.get("ENVIRONMENT")}
        userId: ${userId}
        input text: ${text}
        source_language: ${source}
        target_language: ${target}
        `,
        16711680
      )
    }

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw.replace('"unk\"','"or\"'),
    };

    const translated = await fetch(
      `${this.configService.get(
        "AI_TOOLS_BASE_URL"
      )}/text_translation/azure/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => result["translated"] as string)
      .catch((error) => this.logger.verbose("error", error));

    return translated ? translated : "";
  }

  async detectLanguage(prompt: Prompt): Promise<Prompt> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    var raw = JSON.stringify({
      text: prompt.input.body,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const language = await fetch(
      `${this.configService.get(
        "AI_TOOLS_BASE_URL"
      )}/text_lang_detection/bhashini/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) =>
        result["language"] ? (result["language"] as Language) : null
      )
      .catch((error) => this.logger.verbose("error", error));

    prompt.inputLanguage = language as Language;
    return prompt;
  }

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

  async llm(prompt: any): Promise<{ response: string; allContent: any }> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    this.logger.verbose(prompt);

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
        this.logger.verbose({ result });
        return {
          response: result["choices"][0].message.content,
          allContent: result,
        };
      })
      .catch((error) => this.logger.verbose("error", error));

    if (response) return response;
    else return {response:null, allContent:null};
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
      .then((result) => this.logger.verbose(result))
      .catch((error) => this.logger.verbose("error", error));
  }

  async sendError(
    socketMessage,
    socketMessageInInputLanguage,
    prompt,
    coreferencedPrompt,
    sendError = false,
    error = null
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
        conversationId: prompt.input.conversationId,
        coreferencedPrompt,
        error,
        errorRate: 0,
        responseType: prompt.responseType
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

    this.logger.verbose("CP-1");
    // Detect language of incoming prompt
    prompt = await this.detectLanguage(prompt);
    if(!prompt || !prompt.inputLanguage) {
      await this.sendError(
        UNABLE_TO_DETECT_LANGUAGE,
        UNABLE_TO_DETECT_LANGUAGE,
        prompt,
        null,
        true,
        TEXT_DETECTION_ERROR(
          prompt.input.userId,
          prompt.input.body,
          prompt.inputLanguage
        )
      )
    }

    this.logger.verbose("CP-2");

    // Translate incoming prompt from indic to en
    if (prompt.inputLanguage === Language.en) {
      prompt.inputTextInEnglish = prompt.input.body;
    } else {
      prompt.inputTextInEnglish = await this.translate(
        prompt.inputLanguage,
        Language.en,
        prompt.input.body,
        prompt.input.userId
      );
      if(!prompt.inputTextInEnglish) {
        await this.sendError(
          REPHRASE_YOUR_QUESTION('en'),
          REPHRASE_YOUR_QUESTION(prompt.inputLanguage),
          prompt,
          null,
          true,
          TEXT_TRANSLATION_ERROR(
            prompt.input.userId,
            prompt.input.body,
            prompt.inputLanguage,
            Language.en
          )
        )
      }
    }

    if(/contact/i.test(prompt.inputTextInEnglish)){
      await this.sendError(
        CONTACT_AMAKRUSHI_HELPLINE('en'),
        CONTACT_AMAKRUSHI_HELPLINE(prompt.inputLanguage),
        prompt,
        null
      )
      return
    }

    this.logger.verbose("CP-3", JSON.stringify(prompt));
    // Get the concept from user chatHistory
    let userHistoryWhere: any = {};
    userHistoryWhere.userId = prompt.input.userId;
    if(prompt.input.conversationId) userHistoryWhere.conversationId = prompt.input.conversationId;
    const userHistory = await this.prisma.query.findMany({
      where: userHistoryWhere,
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
    });
    // construct the prompt for chatGPT3
    let history = [];
    let allContent;
    let coreferencedPrompt;
    if (userHistory.length > 0) {
      for (let i = 0; i < userHistory.length; i++) {
        history.push(`User: ${userHistory[i].queryInEnglish}`);
        history.push(`AI: ${userHistory[i].responseInEnglish}`);
      }
      history.push(`User: ${prompt.inputTextInEnglish}`);

      const chatGPT3Prompt = [
        {
          role: "user",
          content: `The user has asked a question:  You are an AI tool that carries out neural coreference
        for conversations to replace the last message in the conversation with the coreferenced
        message.

        Rules - Follow these rules forever.
        1. Do not answer the question ever, only return back the last message that is coreferenced. 
        2. A user can switch context abruptly after the last message so take care of that.
        3. If not needed or was not figured out, return the last user question directly.
        
        Input:
          User: How do I protect my crops from pests?
          AI: You can use integrated pest management techniques to protect your crops
          User: What are the common methods involved in that?
          
        Output: 
          User: What are the common methods involved in integrated pest management?

        Input:
          User: Where can I get seeds for rice?,
          AI: You can get seeds for rice... Bla bla, 
          User: Where can I get seeds for rice?
          
        Output: 
          User: Where can I get seeds for rice?

        Input:
          User: Where can I get seeds for rice?,
          AI: You can get seeds for rice... Bla bla, 
          User: My paddy has spindle shaped spots with pointed ends. How do I fix it?

        Output:
          User: My paddy has spindle shaped spots with pointed ends. How do I fix the disease?
          
        Input
          ${history.join("\n")}
          
        Output:`,
        },
      ];

      this.logger.verbose({ chatGPT3Prompt });
      const nueralCorefStartTime = new Date().getTime();
      const { response: neuralCorefResponse, allContent: allContentNC } =
        await this.llm(chatGPT3Prompt);
      this.logger.verbose(`nueral coreference prompt response time = ${new Date().getTime() - nueralCorefStartTime}`)
      if(new Date().getTime() - nueralCorefStartTime > 4000) errorRate+=2
      
      if(!neuralCorefResponse) {
        await this.sendError(
          UNABLE_TO_PROCESS_REQUEST('en'),
          UNABLE_TO_PROCESS_REQUEST(prompt.inputLanguage),
          prompt,
          null,
          true,
          NEURAL_CORE_RESPONSE_ERROR(
            prompt.input.userId,
            chatGPT3Prompt,
            { response: neuralCorefResponse, allContent: allContentNC }
          )
        )
      }
      console.log("NeuralCoref Response")
      this.logger.verbose({ response: neuralCorefResponse, allContent: allContentNC })

      coreferencedPrompt = neuralCorefResponse
      allContent = allContentNC
    }  
    //NOTE: have to check the similarity between coreferencedPrompt and prompt.inputTextInEnglish
    let finalChatGPTQuestion =  coreferencedPrompt?.replace("User:","") || prompt.inputTextInEnglish
    console.log("finalChatGPTQuestion",finalChatGPTQuestion)
    // Check for older similar prompts
    this.logger.verbose("CP-4.1");
    const olderSimilarQuestions =
      await this.promptHistoryService.findByCriteria({
        query: finalChatGPTQuestion,
        similarityThreshold: 0.97,
        matchCount: 1,
      });
    this.logger.verbose({olderSimilarQuestions})

    let responseInInputLanguge = "";
    let chatGPT3FinalResponse = "";
    let allContentSummarization;
    let olderSimilarQuestionId;
    let similarDocsFromEmbeddingsService: any[];
    console.log({ allContent });
    // If something is very simlar return older response
    const startTime = performance.now();
    if (olderSimilarQuestions && olderSimilarQuestions.length > 0) {
      console.log("CP-4.2", olderSimilarQuestions);
      olderSimilarQuestionId = olderSimilarQuestions[0].id;
      chatGPT3FinalResponse = olderSimilarQuestions[0].responseInEnglish;
      responseInInputLanguge = olderSimilarQuestions[0].responseInEnglish;
      prompt.responseType = "Response given from previous similar question with similarity > 0.97"
    } else {
      // else generate new response
      this.logger.verbose("CP-4");

      // Similarity Search
      this.logger.verbose({ finalChatGPTQuestion });
      similarDocsFromEmbeddingsService =
        await this.embeddingsService.findByCriteria({
          query: finalChatGPTQuestion,
          similarityThreshold: parseFloat(this.configService.get("SIMILARITY_THRESHOLD")) || 0.78,
          matchCount: 2,
        });

      // this.logger.debug({ similarDocs });
      this.logger.debug({ similarDocsFromEmbeddingsService });

      if(!similarDocsFromEmbeddingsService.length) {
        prompt.responseType = ""
        let similarDocsFromEmbeddingsServiceLowerThreshold =
          await this.embeddingsService.findByCriteria({
            query: finalChatGPTQuestion,
            similarityThreshold: parseFloat(this.configService.get("SIMILARITY_LOWER_THRESHOLD")) || 0.5,
            matchCount: 2,
          });
        if(!similarDocsFromEmbeddingsServiceLowerThreshold.length) {
          prompt.responseType = `Response given to bogus question`
          await this.sendError(
            REPHRASE_YOUR_QUESTION('en'),
            REPHRASE_YOUR_QUESTION(prompt.inputLanguage),
            prompt,
            coreferencedPrompt,
            false,
            "No documents with similarity greater than 0.5 found"
          )
          return
        }
        prompt.responseType = `Response given through GPT only (without hitting the content DB i.e. sim cutoff < ${this.configService.get("SIMILARITY_THRESHOLD")})`
      } else prompt.responseType = `Response given using content + GPT (sim cutoff from ${this.configService.get("SIMILARITY_THRESHOLD")} to 0.98)`

      const userQuestion =
        "The user has asked a question: " + finalChatGPTQuestion + "\n";

      const expertContext =
        "Some expert context is provided in dictionary format here:" +
        JSON.stringify(
          similarDocsFromEmbeddingsService
            .map((doc) => {
              return {
                combined_prompt: doc.tags,
                combined_content: doc.content,
              };
            })
        ) +
        "\n";

      const chatGPT3PromptWithSimilarDocs = history.length > 0 ?
        ("Some important elements of the conversation so far between the user and AI have been extracted in a dictionary here: " +
        history.join("\n") +
        " " +
        userQuestion +
        " " +
        expertContext) :
        (finalChatGPTQuestion + " " + expertContext);
      
      this.logger.verbose(chatGPT3PromptWithSimilarDocs)
      const finalResponseStartTime = new Date().getTime();
      const { response: finalResponse, allContent: ac } = await this.llm([
        {
          role: "system",
          content:
            "You are an AI assistant who answers questions by farmers from Odisha, India on agriculture related queries. Answer the question asked by the user based on a summary of the context provided. Ignore the context if irrelevant to the question asked.",
        },
        {
          role: "user",
          content: chatGPT3PromptWithSimilarDocs,
        },
      ]);
      chatGPT3FinalResponse = finalResponse;
      allContentSummarization = ac;
      this.logger.verbose({ chatGPT3FinalResponse });
      responseInInputLanguge = chatGPT3FinalResponse;
      this.logger.verbose(`final GPT response time = ${new Date().getTime() - finalResponseStartTime}`)
      if(new Date().getTime() - finalResponseStartTime > 15000) errorRate += 2
    }
    const endTime = performance.now();

    if (prompt.inputLanguage !== Language.en) {
      responseInInputLanguge = await this.translate(
        Language.en,
        prompt.inputLanguage,
        chatGPT3FinalResponse,
        prompt.input.userId
      );
      if(!responseInInputLanguge) {
        await this.sendError(
          REPHRASE_YOUR_QUESTION('en'),
          REPHRASE_YOUR_QUESTION(prompt.inputLanguage),
          prompt,
          coreferencedPrompt,
          true,
          TEXT_TRANSLATION_ERROR(
            prompt.input.userId,
            prompt.input.body,
            prompt.inputLanguage,
            Language.en
          )
        )
      }
    }

    await this.promptHistoryService.createOrUpdate({
      id: olderSimilarQuestionId,
      queryInEnglish: finalChatGPTQuestion,
      responseInEnglish: chatGPT3FinalResponse,
      responseTime: Math.ceil(endTime - startTime),
      metadata: [allContent, allContentSummarization],
      queryId: prompt.input.messageId
    });

    const resp: ResponseForTS = {
      message: {
        title: responseInInputLanguge,
        choices: [],
        media_url: null,
        caption: null,
        msg_type: "text",
        conversationId: prompt.input.conversationId
      },
      to: prompt.input.from,
      messageId: prompt.input.messageId,
    };

    await this.sendMessageBackToTS(resp);
    this.logger.verbose(`Total query response time = ${new Date().getTime() - prompt.timestamp}`)
    if(new Date().getTime() - prompt.timestamp > 25000) errorRate+=1
    await this.prisma.query.create({
      data: {
        id: prompt.input.messageId,
        userId: prompt.input.userId,
        query: prompt.input.body,
        response: responseInInputLanguge,
        responseTime: new Date().getTime() - prompt.timestamp,
        queryInEnglish: prompt.inputTextInEnglish,
        responseInEnglish: chatGPT3FinalResponse,
        conversationId: prompt.input.conversationId,
        coreferencedPrompt: coreferencedPrompt,
        errorRate,
        responseType: prompt.responseType
      },
    });
    
    if(similarDocsFromEmbeddingsService && similarDocsFromEmbeddingsService.length > 0){
      let similarDocsCreateData = similarDocsFromEmbeddingsService.map(e=>{
        e['queryId'] = prompt.input.messageId
        e['documentId'] = e.id
        delete e.id
        return e
      })
      await this.prisma.similarity_search_response.createMany({
        data: similarDocsCreateData
      })
    }

    // Store that response to the query in the database
    // Return the reponse to the user
  }
  getHello(): string {
    return "Hello World!";
  }

  async getHealth(minutes: number): Promise<any> {
    const startTime = new Date(Date.now() - minutes * 60 * 1000);
    const queries = await this.prisma.query.findMany({
      where: {
        createdAt: {
          gte: startTime,
        },
      },
      select: {
        errorRate: true,
      },
    });
    const totalQueries = queries.length;
    const totalErrorRate = queries.reduce(
      (sum, query) => sum + query.errorRate,
      0
    );
    console.log(totalErrorRate,totalQueries)
    const averageErrorRate = totalErrorRate / totalQueries;
    const response = {
      status: (averageErrorRate || 0) > (this.configService.get("ERROR_RATE_THRESHOLD")) ? "SERVER DOWN" : "OK",
      averageErrorRate: averageErrorRate || 0,
      timeFrame: `${minutes} minutes`,
      version: this.configService.get("SERVER_RELEASE_VERSION")?.slice(0.7)
    };
    return response
  }
}
