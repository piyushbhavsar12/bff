import { Injectable } from "@nestjs/common";
import { PromptDto } from "./app.controller";
import { Language } from "./language";
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "./global-services/prisma.service";
import { ConfigService } from "@nestjs/config";

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
  };
  to: string;
  messageId: string;
}

@Injectable()
export class AppService {
  baseURL = "http://127.0.0.1:5000";
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    // AUTH_HEADER = this.configService.get("AUTH_HEADER");
  }
  async translate(
    source: Language,
    target: Language,
    text: string
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
      text: text,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const translated = await fetch(
      `${this.configService.get(
        "AI_TOOLS_BASE_URL"
      )}/text_translation/bhashini/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => result["translated"] as string)
      .catch((error) => console.log("error", error));

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
      .catch((error) => console.log("error", error));

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

    const similarDocs: Document[] | void = await fetch(
      `${this.configService.get("AI_TOOLS_BASE_URL")}/embeddings/openai/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => (result ? (result as Document[]) : []))
      .catch((error) => console.log("error", error));

    if (similarDocs) return similarDocs;
    else return [];
  }

  async llm(prompt: any[]): Promise<string> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    console.log(prompt);

    var raw = JSON.stringify({
      prompt: prompt,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const response = await fetch(
      `${this.configService.get("AI_TOOLS_BASE_URL")}/llm/openai/chatgpt3`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log({ result });
        return result["choices"][0].message.content;
      })
      .catch((error) => console.log("error", error));

    return response;
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
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }

  async processPrompt(promptDto: PromptDto): Promise<any> {
    let prompt: Prompt = {
      input: promptDto,
    };
    prompt.timestamp = new Date().getTime();

    console.log("CP-1");
    // Detect language of incoming prompt
    prompt = await this.detectLanguage(prompt);

    console.log("CP-2");

    // Translate incoming prompt from indic to en
    if (prompt.inputLanguage === Language.en) {
      prompt.inputTextInEnglish = prompt.input.body;
    } else {
      prompt.inputTextInEnglish = await this.translate(
        prompt.inputLanguage,
        Language.en,
        prompt.input.body
      );
    }

    console.log("CP-3", JSON.stringify(prompt));
    // Get the concept from user chatHistory
    const userHistory = await this.prisma.query.findMany({
      where: {
        userId: prompt.input.userId,
      },
    });
    // construct the prompt for chatGPT3
    let chatGPT3Prompt = [];
    if (userHistory.length > 0) {
      chatGPT3Prompt.push({
        role: "system",
        content:
          "For a converation between a user and AI. From the conversation, extract the last scheme, crop, pest, animal discussed by the user. If any are not applicable don't show them",
      });
      for (let i = 0; i < userHistory.length; i++) {
        chatGPT3Prompt.push({
          role: "user",
          content: userHistory[i].queryInEnglish,
        });
        chatGPT3Prompt.push({
          role: "assistant",
          content: userHistory[i].responseInEnglish,
        });
      }
      chatGPT3Prompt.push({
        role: "user",
        content: prompt.inputTextInEnglish,
      });

      console.log({ chatGPT3Prompt });
      const chatGPT3Response = await this.llm(chatGPT3Prompt);
      console.log("CP-4");

      const promptForSimilaritySearch =
        chatGPT3Response + " " + prompt.inputTextInEnglish;

      // Similarity Search
      console.log({ promptForSimilaritySearch });
      const similarDocs: Document[] = await this.similaritySearch(
        promptForSimilaritySearch
      );

      const previousSummaryHistory = chatGPT3Response;

      const userQuestion =
        "The user has asked a question: " + prompt.inputTextInEnglish + "\n";

      const expertContext =
        "Some expert context is provided in dictionary format here:" +
        JSON.stringify(similarDocs.slice(0, 1)) +
        "\n";

      const chatGPT3PromptWithSimilarDocs =
        "Some important elements of the conversation so far between the user and AI have been extracted in a dictionary here: " +
        previousSummaryHistory +
        " " +
        userQuestion +
        " " +
        expertContext;

      const chatGPT3FinalResponse = await this.llm([
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

      console.log({ chatGPT3FinalResponse });
      let responseInInputLanguge = chatGPT3FinalResponse;
      if (prompt.inputLanguage !== Language.en) {
        responseInInputLanguge = await this.translate(
          Language.en,
          prompt.inputLanguage,
          chatGPT3FinalResponse
        );
      }
      const resp: ResponseForTS = {
        message: {
          title: responseInInputLanguge,
          choices: [],
          media_url: null,
          caption: null,
          msg_type: "text",
        },
        to: prompt.input.from,
        messageId: prompt.input.messageId,
      };

      await this.sendMessageBackToTS(resp);
      await this.prisma.query.create({
        data: {
          userId: prompt.input.userId,
          query: prompt.input.body,
          response: chatGPT3FinalResponse,
          responseTime: new Date().getTime() - prompt.timestamp,
          queryInEnglish: prompt.inputTextInEnglish,
          responseInEnglish: chatGPT3FinalResponse,
        },
      });
    } else {
      const promptForSimilaritySearch = prompt.inputTextInEnglish;

      console.log("CP-4");
      // Similarity Search
      console.log("2", { promptForSimilaritySearch });
      const similarDocs: Document[] = await this.similaritySearch(
        promptForSimilaritySearch
      );

      const expertContext =
        "Some expert context is provided in dictionary format here:" +
        JSON.stringify(similarDocs.slice(0, 1)) +
        "\n";

      const chatGPT3PromptWithSimilarDocs =
        prompt.inputTextInEnglish + " " + expertContext;

      let chatGPT3FinalResponse = await this.llm([
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
      console.log("CP-5", JSON.stringify(chatGPT3FinalResponse));
      // Translate the answer to original language
      let responseInInputLanguge = chatGPT3FinalResponse;
      if (prompt.inputLanguage !== Language.en) {
        responseInInputLanguge = await this.translate(
          Language.en,
          prompt.inputLanguage,
          chatGPT3FinalResponse
        );
      }
      const resp: ResponseForTS = {
        message: {
          title: responseInInputLanguge,
          choices: [],
          media_url: null,
          caption: null,
          msg_type: "text",
        },
        to: prompt.input.from,
        messageId: prompt.input.messageId,
      };

      await this.sendMessageBackToTS(resp);
      await this.prisma.query.create({
        data: {
          userId: prompt.input.userId,
          query: prompt.input.body,
          response: responseInInputLanguge,
          responseTime: new Date().getTime() - prompt.timestamp,
          queryInEnglish: prompt.inputTextInEnglish,
          responseInEnglish: chatGPT3FinalResponse,
        },
      });
    }

    // Store that response to the query in the database
    // Return the reponse to the user
  }
  getHello(): string {
    return "Hello World!";
  }
}
