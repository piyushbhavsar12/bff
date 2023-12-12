import { ConfigService } from "@nestjs/config";
import { AiToolsService } from "../../modules/aiTools/ai-tools.service";
import { AADHAAR_GREETING_MESSAGE } from "../../common/constants";
import { UserService } from "../../modules/user/user.service";
import axios from "axios";
import { decryptRequest, encryptRequest, titleCase } from "../../common/utils";
import { PrismaService } from "src/global-services/prisma.service";
import { Injectable } from "@nestjs/common";
import { botFlowMachine1, botFlowMachine2, botFlowMachine3 } from "./prompt.machine";
import { createMachine } from "xstate";
import { promptActions } from "./prompt.actions";
import { promptGuards } from "./prompt.gaurds";
import { MonitoringService } from "src/modules/monitoring/monitoring.service";
const path = require('path');
const filePath = path.resolve(__dirname, '../../common/kisanPortalErrors.json');
const PMKissanProtalErrors = require(filePath);
import * as moment from "moment";
const fetch = require('../../common/fetch');
import * as NodeGeocoder from 'node-geocoder';


@Injectable()
export class PromptServices {
    private userService: UserService;
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService,
        private aiToolsService: AiToolsService,
        private monitoringService: MonitoringService
    ){
        this.userService = new UserService(this.prismaService, this.configService, this.monitoringService)
    }

    async getInput (context) {
        console.log("getInput")
        return context
    }
    
    async weatherClassifier(context) {
        console.log("weatherClassifier")
        try{
            let response: any = await this.aiToolsService.textClassificationForWeather(context.query)
            if (response.error) throw new Error(`${response.error}, please try again.`)
            if (response == `LABEL_6`) return "weather"
            if (response == `LABEL_5`) return "sale"
            else {
                return "invalid"
            }
        } catch (error){
            return Promise.reject(error)
        }
    }

    async questionClassifier (context) {
        console.log("questionClassifier")
        try{
            let response: any = await this.aiToolsService.textClassification(context.query)
            if (response.error) throw new Error(`${response.error}, please try again.`)
            if (response == `"Invalid"`) return "convo"
            if (response == `"convo_starter"`) return "convo"
            if (response == `"convo_ender"`) return "convo"
            if (response == `"Installment not received"`) return "payment"
            else {
                return "invalid"
            }
        } catch (error){
            return Promise.reject(error)
        }
    }

    async logError (_, event) {
        console.log("logError")
        console.log(event.data)
        return event.data
    }

    async validateAadhaarNumber (context, event) {
        try{
            const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
            let res;
            if(/^[6-9]\d{9}$/.test(userIdentifier)) {
                this.monitoringService.incrementMobileNumberCount()
                res = await this.userService.sendOTP(userIdentifier,"Mobile")
            } else if(userIdentifier.length==14 && /^[6-9]\d{9}$/.test(userIdentifier.substring(0,10))){
                res = await this.userService.sendOTP(userIdentifier,"MobileAadhar")
            } else if(userIdentifier.length==12 && /^\d+$/.test(userIdentifier)){
                this.monitoringService.incrementAadhaarCount()
                res = await this.userService.sendOTP(userIdentifier,"Aadhar")
            } else if(userIdentifier.length == 11) { 
                this.monitoringService.incrementRegistrationIdCount()
                res = await this.userService.sendOTP(userIdentifier,"Ben_id")
            } else {
                return Promise.resolve('Please enter a valid Beneficiary ID/Aadhaar Number/Phone number');
            }
            if(res) {
                if(res.d.output.Message == `No Record Found for this (${context.userAadhaarNumber}) Aadhar/Ben_id/Mobile.`){
                    this.monitoringService.incrementNoUserRecordsFoundCount()
                }
                return Promise.resolve(res.d.output.Message);
            }
            this.monitoringService.incrementSomethingWentWrongCount()
            throw new Error('Something went wrong.')
        } catch (error) {
            console.log(error)
            return Promise.reject(new Error('Something went wrong.'))
        }
        
    }

    async validateOTP (context, event) {
        const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
        const otp = context.otp;
        let res;
        // Perform OTP validation logic here
        if(/^[6-9]\d{9}$/.test(userIdentifier)) {
            res = await this.userService.verifyOTP(userIdentifier,otp,"Mobile")
        } else if(userIdentifier.length==14 && /^[6-9]\d{9}$/.test(userIdentifier.substring(0,10))){
            res = await this.userService.verifyOTP(userIdentifier,otp,"MobileAadhar")
        } else if(userIdentifier.length==12 && /^\d+$/.test(userIdentifier)){
            res = await this.userService.verifyOTP(userIdentifier,otp,"Aadhar")
        } else if(userIdentifier.length == 11) { 
            res = await this.userService.verifyOTP(userIdentifier,otp,"Ben_id")
        } else {
            return Promise.reject(new Error('Something went wrong, Please try again by asking your question.'));
        }
        if(res){
            return Promise.resolve(res.d.output.Message);
        } else {
            return Promise.reject(new Error('Something went wrong, Please try again by asking your question.'));
        }
    }

    async fetchUserData (context, event) {
        const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
        let res;
        let type='Mobile'
        if(/^[6-9]\d{9}$/.test(userIdentifier)) {
            type='Mobile'
            res = await this.userService.getUserData(userIdentifier,"Mobile")
        } else if(userIdentifier.length==14 && /^[6-9]\d{9}$/.test(userIdentifier.substring(0,10))){
            type='MobileAadhar'
            res = await this.userService.getUserData(userIdentifier,"MobileAadhar")
        } else if(userIdentifier.length==12 && /^\d+$/.test(userIdentifier)){
            type = "Aadhar"
            res = await this.userService.getUserData(userIdentifier,"Aadhar")
        } else if(userIdentifier.length == 11) { 
            type = "Ben_id"
            res = await this.userService.getUserData(userIdentifier,"Ben_id")
        }else {
            return Promise.reject(new Error('Please enter a valid Beneficiary ID/Aadhaar Number/Phone number'));
        }
        if(res.d.output.Message=='Unable to get user details'){
            return Promise.reject(new Error(res.d.output.Message))
        }
        let userDetails = AADHAAR_GREETING_MESSAGE(
            titleCase(res.d.output['BeneficiaryName']),
            titleCase(res.d.output['FatherName']),
            res.d.output['DOB'],
            res.d.output['Address'],
            res.d.output['DateOfRegistration'],
            res.d.output['LatestInstallmentPaid'],
            res.d.output['Reg_No'],
            titleCase(res.d.output['StateName']),
            titleCase(res.d.output['DistrictName']),
            titleCase(res.d.output['SubDistrictName']),
            titleCase(res.d.output['VillageName']),
            res.d.output['eKYC_Status']
        )

        console.log("ChatbotBeneficiaryStatus")
        console.log("using...",userIdentifier, type)
        let userErrors = [];
        try {
        let encryptedData = await encryptRequest(`{\"Types\":\"${type}",\"Values\":\"${userIdentifier}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`)
        let data = JSON.stringify({
            "EncryptedRequest": `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`
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
        let decryptedData: any = await decryptRequest(errors.d.output,encryptedData.d.token)
        errors = JSON.parse(decryptedData.d.decryptedvalue)
        if(errors.Rsponce == "True"){
            Object.entries(errors).forEach(([key, value]) => {
            if(key!="Rsponce" && key != "Message"){
                if(value && PMKissanProtalErrors[`${value}`] && PMKissanProtalErrors[`${value}`]["types"].indexOf(context.queryType)!=-1){
                    console.log(`ERRORVALUE: ${key} ${value}`);
                    userErrors.push(PMKissanProtalErrors[`${value}`]["text"].replace('{{farmer_name}}',titleCase(res.d.output['BeneficiaryName'])))
                }
            }
            });
        }
        if(!userErrors.length){
            userErrors.push(PMKissanProtalErrors["No Errors"]["text"]
                .replace('{{farmer_name}}',titleCase(res.d.output['BeneficiaryName']))
                .replace('{{latest_installment_paid}}',res.d.output['LatestInstallmentPaid'])
                .replace('{{Reg_Date (DD-MM-YYYY)}}', moment(res.d.output['DateOfRegistration']).format('DD-MM-YYYY'))
            )
        }
        } catch (error) {
            console.log("ChatbotBeneficiaryStatus error")
            console.log(error)
        }
        return `${userDetails}${userErrors.join("\n")}`
    }

    async wadhwaniClassifier (context) {
        console.log("wadhwaniClassifier")
        try{
            let response: any = await this.aiToolsService.getResponseViaWadhwani(context.query)
            if (response.error) throw new Error(`${response.error}, please try again.`)
            return response;
        } catch (error){
            return Promise.reject(error)
        }
    }

    async getWeatherInfo (context) {
        console.log("getWeatherInfo")
        try{
            if(!context.lat || !context.long){
                return "Please enable location and try again."
            }
            var requestOptions: RequestInit= {
                method: 'GET',
                redirect: 'follow'
              };
              
            let weather: any = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${context.lat},${context.long}?unitGroup=metric&key=${this.configService.get('WEATHER_PROVIDER_API_KEY')}&contentType=json`, requestOptions)
                .then(response => response.json())
                .then(result => {return result})
                .catch(error => console.log('error', error));
            let weatherString = '🌦️ *Weather Forecast for the Next 10 Days*';
            weather.days.slice(0,10).forEach((data,index)=>{
                weatherString+=`
*Day ${index+1}:*
- Date: ${data.datetime}
- Temperature: ${data.temp}°C
- Conditions: ${data.conditions}
- Precipitation: ${data.precip*10}%

`
            })
            weatherString+=`
Feel free to reach out if you need more details or have any specific concerns. Happy farming! 🚜🌾

The data is shared from https://weather.visualcrossing.com
            `
            return weatherString
        } catch (error){
            return Promise.reject(error)
        }
    }

    async checkCropNER (context) {
        console.log("checkCropNER")
        try{
            if(!context.lat || !context.long){
                return "Please enable location and try again."
            }
            let response: any = await this.aiToolsService.classificationForCrop(context.query)
            if (response.error) throw new Error(`${response.error}, please try again.`)
            if (response.entity_group != `CROP`) return false
            const options = {
                provider: 'mapbox',
                apiKey: process.env['MAP_BOX_API_KEY'], // Replace with your Google Maps API key
                formatter: 'json',
              };
              const geocoder = NodeGeocoder(options);
              
            let location_info = await geocoder.reverse({ lat: context.lat, lon: context.long })
            let crop = response.word.charAt(0).toUpperCase() + response.word.slice(1)
            let api_key = this.configService.get("MARKET_DATA_API_KEY");
            let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${api_key}&format=json&limit=1000&filters[state]=${location_info[0].state}&filters[district]=${location_info[0].district}&filters[commodity]=${crop}`
            let cropData = await fetch(url)
                .then(response => response.json())
                .then(result => {return result})
                .catch(error => console.log('error', error));
            if(!cropData.records.length) return "Data is not available at https://agmarknet.gov.in/"
            let returnString = `*Crop:* ${cropData.records[0].commodity}`
            cropData.records.forEach(data=>{
                returnString+=`
*Market:* ${data.market}
*Current Wholesale Rate:* ${data.modal_price}
`
            })
            returnString+=`
Please note that these rates are subject to change based on market conditions. For real-time and more detailed information, we recommend checking with your local market or contacting relevant agricultural authorities.

If you have any further questions or need assistance, feel free to ask. Wishing you a successful harvest!
            `
            return returnString
        } catch (error){
            return Promise.reject(error)
        }
    }

    allFunctions() {
        return {
            getInput: this.getInput.bind(this),
            questionClassifier: this.questionClassifier.bind(this),
            logError: this.logError.bind(this),
            validateAadhaarNumber: this.validateAadhaarNumber.bind(this),
            validateOTP: this.validateOTP.bind(this),
            fetchUserData: this.fetchUserData.bind(this),
            wadhwaniClassifier: this.wadhwaniClassifier.bind(this),
            weatherClassifier: this.weatherClassifier.bind(this),
            getWeatherInfo: this.getWeatherInfo.bind(this),
            checkCropNER: this.checkCropNER.bind(this)
        }
    }

    getXstateMachine(name:string){
        let machine
        switch(name){
            case "botFlowMachine1":
                machine = createMachine(
                    botFlowMachine1,{
                    actions: promptActions,
                    services: this.allFunctions(),
                    guards: promptGuards
                })
                break
            case "botFlowMachine2":
                machine = createMachine(
                    botFlowMachine2,{
                    actions: promptActions,
                    services: this.allFunctions(),
                    guards: promptGuards
                })
                break
            case "botFlowMachine3":
                machine = createMachine(
                    botFlowMachine3,{
                    actions: promptActions,
                    services: this.allFunctions(),
                    guards: promptGuards
                })
                break
            default:
                machine = createMachine(
                    botFlowMachine3,{
                    actions: promptActions,
                    services: this.allFunctions(),
                    guards: promptGuards
                })
        }
        return machine
    }
}