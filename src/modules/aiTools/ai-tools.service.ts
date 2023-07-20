import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../common/logger';
import { Language } from '../../language';
import { isMostlyEnglish } from '../../utils';
import { fetchWithAlert } from '../../common/utils';
// import { flagsmith } from '../../flagsmith.module';

@Injectable()
export class AiToolsService {
  private logger: CustomLogger;
  constructor(
    private configService: ConfigService
  ) {
    // AUTH_HEADER = this.configService.get("AUTH_HEADER");
    this.logger = new CustomLogger("AiToolsService");
  }
  async detectLanguage(text: string): Promise<any> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    var raw = JSON.stringify({
      text: text.replace("?","")?.trim(),
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    try {
        let response = await fetch(
            `${this.configService.get(
              "AI_TOOLS_BASE_URL"
            )}/text_lang_detection/bhashini/remote/`,
            requestOptions
        )
        response = await response.json()
        return {
            language: response["language"] ? response["language"] as Language : 'unk',
            error: null
        }
    } catch (error) {
        if(isMostlyEnglish(text.replace("?","")?.trim())) {
            return {
                language: Language.en,
                error: error.message
            }
        } else {
            return {
                language: 'unk',
                error: error.message
            }
        }
    }
  }

  async translate(
    source: Language,
    target: Language,
    text: string,
    userMobile?: string,
  ): Promise<any> {
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

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw.replace('"unk\"','"or\"'),
    };
    let translateURL = 'text_translation/bhashini/remote/';
    translateURL = `${this.configService.get("AI_TOOLS_BASE_URL")}/${translateURL}`
    try {
      let response = await fetch(
        translateURL,
        requestOptions
      )
      response = await response.json()
      let translated = response["translated"] as string ? response["translated"] as string : "";
      return {
        translated,
        error: translated ? null : `unable to translated text ${text} trom ${source} to ${target}`
      }
    } catch(error) {
      return {
        translated: "",
        error: error.message
      }
    }
  }

  async speechToText(base64audio,inputLanguage){
    try{
      let modelId;
      switch(inputLanguage){
        case 'en':
          modelId = this.configService.get("STT_MODEL_ID_EN")
          break;
        case 'hi':
          modelId = this.configService.get("STT_MODEL_ID_HI")
          break;
        case 'bn':
          modelId = this.configService.get("STT_MODEL_ID_BN")
          break;
        case 'ta':
          modelId = this.configService.get("STT_MODEL_ID_TA")
          break;
        case 'te':
          modelId = this.configService.get("STT_MODEL_ID_TE")
          break;
        default:
          modelId = this.configService.get("STT_MODEL_ID_EN")
      }

      let body = {
        modelId,
        task: "asr",
        audioContent: base64audio,
        source: inputLanguage,
        userId: null
      }
      let response = await fetch(this.configService.get("ULCA_STT_BASE_URL"), {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
        },
        "body": JSON.stringify(body),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
      });
      response = await response.json()
      return response
    } catch(error){
      console.log(error)
      return {
        error
      }
    }
  }

  async textClassification(text: string) {
    try{
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append(
        "Authorization",
        this.configService.get("AI_TOOLS_AUTH_HEADER")
      );
      let body = {
        text
      }
      let response: any = await fetch(`${this.configService.get("AI_TOOLS_BASE_URL")}/text_classification/grievance_recognition/local/`, {
        headers: myHeaders,
        "body": JSON.stringify(body),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
      });
      response = await response.text()
      return response
    } catch(error){
      console.log(error)
      return {
        error
      }
    }
  }

  async llm(prompt: any): Promise<{ response: string; allContent: any; error: any }> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    var raw = JSON.stringify({
      prompt: prompt,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    try {
      let response = await fetchWithAlert(
        `${this.configService.get("AI_TOOLS_BASE_URL")}/llm/openai/chatgpt3`,
        requestOptions
      )
      response = await response.json()
      const error = Object.keys(response).indexOf('error')!=-1
        return {
          response: error ? null : response["choices"][0].message.content,
          allContent: error ? null : response,
          error: error ? response.error : null
        };
    } catch(error) {
      return {response:null, allContent:null, error: error.message? error.message : "Unable to fetch gpt response."}
    }
  }

  
}