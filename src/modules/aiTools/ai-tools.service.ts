import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../common/logger';
import { Language } from '../../language';
import { isMostlyEnglish } from 'src/common/utils';
const fetch = require('node-fetch'); 
const { Headers } = fetch;
import { Counter } from "prom-client";

const bhashiniCounter: Counter<string> = new Counter({
  name: 'bhashini_api_count',
  help: 'Counts the API requests in Bhashini service',
});
const bhashiniSuccessCounter: Counter<string> = new Counter({
  name: 'bhashini_api_success_count',
  help: 'Counts the successful API requests in Bhashini service',
});
const bhashiniFailureCounter: Counter<string> = new Counter({
  name: 'bhashini_api_failure_count',
  help: 'Counts the failed API requests in Bhashini service',
});
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
        bhashiniCounter.inc(1)
        let response:any = await fetch(
            'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute',
            requestOptions
        )
        response = await response.json()
        let language: Language;
        if(response.output && response.output.length){
          language = response.output[0]?.langPrediction[0]?.langCode as Language
          bhashiniSuccessCounter.inc(1)
          return {
            language: language || 'unk',
            error: null
          }
        } else {
          bhashiniFailureCounter.inc(1)
          return {
            language: 'unk',
            error: null
          }
        }
    } catch (error) {
        bhashiniFailureCounter.inc(1)
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

  async textToSpeech(
    text: string,
    language: Language
  ) {
    try {
      let config: any = await this.getBhashiniConfig('tts',{
        "language": {
            "sourceLanguage": language
        }
      })
  
      let response: any = await this.computeBhashini(
        config?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
        "tts",
        config?.pipelineResponseConfig[0].config[0].serviceId,
        config?.pipelineInferenceAPIEndPoint?.callbackUrl,
        {
          "language": {
              "sourceLanguage": language
          }
        },
        {
          "input":[
            {
              "source": text
            }
          ]
        }
      )
      return {
        text: response?.pipelineResponse[0]?.audio[0]?.audioContent,
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
      let body = {
        text: text
      }
      let response: any = await fetch(`${this.configService.get("HUGGINGFACE_TEXT_CLASSIFICATION_BASE_URL")}`, {
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
      bhashiniCounter.inc(1)
      let response  = await fetch(this.configService.get("ULCA_CONFIG_URL"), requestOptions)
      response = await response.json()
      bhashiniSuccessCounter.inc(1)
      return response
    } catch(error) {
      bhashiniFailureCounter.inc(1)
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
    if(task == 'tts'){
      config['gender']='female'
      config['samplingRate']=8000
    }
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
      bhashiniCounter.inc(1)
      let response  = await fetch(url, requestOptions)
      response = await response.json()
      bhashiniSuccessCounter.inc(1)
      return response
    } catch(error) {
      bhashiniFailureCounter.inc(1)
      console.log(error);
      return {
        error
      }
    }
  }
}