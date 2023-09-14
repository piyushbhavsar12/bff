import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Language } from '../../language';
import { isMostlyEnglish } from 'src/common/utils';
import { MonitoringService } from '../monitoring/monitoring.service';
const fetch = require('node-fetch'); 
const { Headers } = fetch;
@Injectable()
export class AiToolsService {
  constructor(
    private configService: ConfigService,
    private readonly monitoringService: MonitoringService
  ) {}
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
        this.monitoringService.incrementBhashiniCount()
        let response:any = await fetch(
            'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute',
            requestOptions
        )
        response = await response.json()
        let language: Language;
        if(response.output && response.output.length){
          language = response.output[0]?.langPrediction[0]?.langCode as Language
          this.monitoringService.incrementBhashiniSuccessCount()
          return {
            language: language || 'unk',
            error: null
          }
        } else {
          this.monitoringService.incrementBhashiniFailureCount()
          return {
            language: 'unk',
            error: null
          }
        }
    } catch (error) {
        this.monitoringService.incrementBhashiniFailureCount()
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
        if(response["error"]){
          console.log(response["error"])
          throw new Error(response["error"])
        }
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
          },
          "postProcessors": [
            "itn"
          ],
        },
        {
          "audio":[
            {
              "audioContent": base64audio
            }
          ]
        }
      )
      if(response["error"]){
        console.log(response["error"])
        throw new Error(response["error"])
      }
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
      if(response["error"]){
        console.log(response["error"])
        throw new Error(response["error"])
      }
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
      this.monitoringService.incrementBhashiniCount()
      console.log(`${new Date()}: Waiting for ${this.configService.get("ULCA_CONFIG_URL")} (config API) to respond ...`)
      let response  = await fetch(this.configService.get("ULCA_CONFIG_URL"), requestOptions)
      if(response.status != 200){
        console.log(response)
        throw new Error(`${new Date()}: API call to '${this.configService.get("ULCA_CONFIG_URL")}' with config '${JSON.stringify(config,null,3)}' failed with status code ${response.status}`)
      }
      response = await response.json()
      console.log(`${new Date()}: Responded succesfully`)
      this.monitoringService.incrementBhashiniSuccessCount()
      return response
    } catch(error) {
      this.monitoringService.incrementBhashiniFailureCount()
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
      config['gender']='male'
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
      this.monitoringService.incrementBhashiniCount()
      console.log(`${new Date()}: Waiting for ${url} for task (${task}) to respond ...`)
      let response  = await fetch(url, requestOptions)
      if(response.status != 200){
        console.log(response)
        throw new Error(`${new Date()}: API call to '${url}' with config '${JSON.stringify(config,null,3)}' failed with status code ${response.status}`)
      }
      response = await response.json()
      console.log(`${new Date()}: Responded succesfully.`)
      this.monitoringService.incrementBhashiniSuccessCount()
      return response
    } catch(error) {
      this.monitoringService.incrementBhashiniFailureCount()
      console.log(error);
      return {
        error
      }
    }
  }
}