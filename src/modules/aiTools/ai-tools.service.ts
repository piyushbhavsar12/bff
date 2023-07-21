import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../common/logger';
import { Language } from '../../language';
import { isMostlyEnglish } from '../../utils';

@Injectable()
export class AiToolsService {
  private logger: CustomLogger;
  constructor(
    private configService: ConfigService
  ) {
    this.logger = new CustomLogger("AiToolsService");
  }
  async detectLanguage(text: string): Promise<any> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var body = JSON.stringify({
      modelId: this.configService.get("TEXT_LANG_DETECTION_MODEL"),
      task: "txt-lang-detection",
      input:[{
        source: text?.replace("?","")?.trim()
      }],
      userId: null
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body
    };

    try {
        let response:any = await fetch(
            'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute',
            requestOptions
        )
        response = await response.json()
        let language: Language;
        if(response.output && response.output.length){
          language = response.output[0]?.langPrediction[0]?.langCode as Language
          return {
            language: language || 'unk',
            error: null
          }
        } else {
          return {
            language: 'unk',
            error: null
          }
        }
    } catch (error) {
        if(isMostlyEnglish(text?.replace("?","")?.trim())) {
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
      "authorization",
      this.configService.get("DHRUVA_CLIENT_API_KEY")
    );

    var raw = JSON.stringify({
      "config": {
        "language": {
          "sourceLanguage": source,
          "targetLanguage": target
        }
      },
      "input": [
        {
          "source": text?.replace("\n",".")
        }
      ]
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw.replace('"unk\"','"en\"'),
    };

    let translateURL = 'services/inference/translation?serviceId=ai4bharat/indictrans-v2-all-gpu--t4';
    translateURL = `${this.configService.get("DHRUVA_CLIENT_BASE_URL")}/${translateURL}`
    try {
      let response: any = await fetch(
        translateURL,
        requestOptions
      )
      response = await response.json()
      if(response.output && response.output.length)
      response = response.output[0]
      else response["target"] = ""
      let translated = response["target"] as string ? response["target"] as string : "";
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
        `Bearer ${this.configService.get("HUGGINGFACE_TEXT_CLASSIFICATION_API_KEY")}`
      );
      let body = {
        inputs: text
      }
      let response: any = await fetch(`${this.configService.get("HUGGINGFACE_TEXT_CLASSIFICATION_BASE_URL")}`, {
        headers: myHeaders,
        "body": JSON.stringify(body),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
      });
      response = await response.json()
      if(response.error){
        return {
          error: response.error
        }
      }
      const labels = response[0];
      let highestScore = -1;
      let highestScoreLabel = "LABEL_2"; // Default output if none of the scores are greater than 0.5
      for (const labelInfo of labels) {
        if (labelInfo.score > 0.5 && labelInfo.score > highestScore) {
          highestScore = labelInfo.score;
          highestScoreLabel = labelInfo.label;
        }
      }
      return highestScoreLabel
    } catch(error){
      console.log(error)
      return {
        error
      }
    }
  }
  
}