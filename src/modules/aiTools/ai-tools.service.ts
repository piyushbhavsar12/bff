import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../common/logger';
import { Language } from '../../language';
import { isMostlyEnglish } from 'src/common/utils';
const fetch = require('node-fetch'); 
const { Headers } = fetch;

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
    text: string
  ) {
    try {
      let config = {
        "language": {
            "sourceLanguage": source,
            "targetLanguage": target
        }
      }
      let bhashiniConfig: any = await this.getBhashiniConfig('translation',config)
      console.log('bhashiniConfig',bhashiniConfig)
      
      let textArray = text.split("\n")
      for(let i=0;i<textArray.length;i++){
        let response: any = await this.computeBhashini(
          bhashiniConfig?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
          "translation",
          bhashiniConfig?.pipelineResponseConfig[0].config[0].serviceId,
          bhashiniConfig?.pipelineInferenceAPIEndPoint?.callbackUrl,
          config,
          {
            "input":[
              {
                // "source": text?.replace("\n",".")
                "source": textArray[i]
              }
            ]
          }
        )
        textArray[i]=response?.pipelineResponse[0]?.output[0]?.target
      }
      return {
        text: textArray.join('\n'),
        error: null
      }
    } catch(error){
      console.log(error)
      return {
        text:"",
        error: error
      }
    }
  }

  async speechToText(
    base64audio: string,
    language: Language
  ) {
    try {
      let config: any = await this.getBhashiniConfig('asr',{
        "language": {
            "sourceLanguage": language
        }
      })
  
      let response: any = await this.computeBhashini(
        config?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
        "asr",
        config?.pipelineResponseConfig[0].config[0].serviceId,
        config?.pipelineInferenceAPIEndPoint?.callbackUrl,
        {
          "language": {
              "sourceLanguage": language
          }
        },
        {
          "audio":[
            {
              "audioContent": base64audio
            }
          ]
        }
      )
      return {
        text: response?.pipelineResponse[0]?.output[0]?.source,
        error: null
      }
    } catch(error){
      console.log(error)
      return {
        text:"",
        error: error
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
        inputs: text,
        options:{
          wait_for_model:true
        }
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

  async getBhashiniConfig(task,config) {
    var myHeaders = new Headers();
    myHeaders.append("userID", this.configService.get("ULCA_USER_ID"));
    myHeaders.append("ulcaApiKey", this.configService.get("ULCA_API_KEY"));
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "pipelineTasks": [
        {
          "taskType": task,
          "config": config
        }
      ],
      "pipelineRequestConfig": {
        "pipelineId": "64392f96daac500b55c543cd"
      }
    });

    var requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    try{
      let response  = await fetch(this.configService.get("ULCA_CONFIG_URL"), requestOptions)
      response = await response.json()
      return response
    } catch(error) {
      console.log(error);
      return {
        error
      }
    }
  }

  async computeBhashini(authorization, task, serviceId, url, config, input) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", " */*");
    myHeaders.append("Authorization", authorization);
    myHeaders.append("Content-Type", "application/json");
    config['serviceId']=serviceId
    var raw = JSON.stringify({
      "pipelineTasks": [
        {
          "taskType": task,
          "config": config
        }
      ],
      "inputData": input
    });
    var requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    try{
      let response  = await fetch(url, requestOptions)
      response = await response.json()
      return response
    } catch(error) {
      console.log(error);
      return {
        error
      }
    }
  }
}