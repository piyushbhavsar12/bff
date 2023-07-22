import { ConfigService } from "@nestjs/config";
import { AiToolsService } from "../../modules/aiTools/ai-tools.service";
import { Language } from "../../language";
import { CustomLogger } from "../../common/logger";
import { AADHAAR_GREETING_MESSAGE } from "../../common/constants";
import { UserService } from "../../modules/user/user.service";
import { PrismaService } from "../../global-services/prisma.service";
import axios from "axios";
const path = require('path');
const filePath = path.resolve(__dirname, '../../common/kisanPortalErrors.json');
const PMKissanProtalErrors = require(filePath);

const prismaService = new PrismaService()
const configService = new ConfigService()
const aiToolsService = new AiToolsService(configService)
const userService = new UserService(
    prismaService,
    configService
)
const logger = new CustomLogger('promptService')

export const promptServices = {

    getInput: async (context)=> {
        console.log("getInput",context)
        return context
    },

    convertSpeechToText: async (context)=>{
        console.log("convertSpeechToText")
        return {
            text:"where is my money?",
            error: null
        }
    },

    detectLanguage: async (context) => {
        console.log("detectLanguage")
        let response = await aiToolsService.detectLanguage(context.prompt.input.body)
        return response
    },

    translateInput: async (context) => {
        console.log("translateInput")
        if(context.prompt.input.inputLanguage != Language.en) {
            let response = await aiToolsService.translate(
                context.prompt.input.inputLanguage as Language,
                Language.en,
                context.prompt.input.body
            )
            return response
        } else {
            return {
                translated: context.prompt.input.body,
                error: null
            }
        }
    },

    questionClassifier: async (context) => {
        console.log("questionClassifier")
        try{
            let response: any = await aiToolsService.textClassification(context.query)
            if (response.error) throw new Error(`${response.error}, please try again.`)
            if (response == "LABEL_2"){
                throw new Error("Please enter a question related to PM Kisan portal:")
            }
            if (response=="LABEL_1") return "payment"
            if (response=="LABEL_0") return "aadhaar"
            return response;
        } catch (error){
            return Promise.reject(error)
        }
    },

    getUserStatusFromPMKisan: async(context)=> {
        console.log("getUserStatusFromPMKisan")
        return {
            status:[
                'marked as dead',
                'aadhaar not verified'
            ]
        }
    },

    translateOutput: async (context) => {
        console.log("translateOutput")
        if(context.prompt.input.inputLanguage != Language.en) {
            let response = {
                translated: [],
                error:[]
            };
            for(let i=0; i<context.prompt.outputInEnglish.length; i++){
                let res = await aiToolsService.translate(
                    Language.en,
                    context.prompt.input.inputLanguage as Language,
                    context.prompt.outputInEnglish[i],
                )
                response.translated.push(res["translated"])
                if(res.error)
                response.error.push(res.error)
            }
            return response
        } else {
            return {
                translated: context.prompt.outputInEnglish,
                error: null
            }
        }
    },

    storeAndSendMessage: async (context) => {
        try{
            console.log("storeAndSendMessage")

            // await prismaService.query.create({
            //     data: {
            //         id: context.prompt.input.messageId,
            //         userId: context.prompt.input.userId,
            //         query: context.prompt.input.body,
            //         response: `${context.prompt.output}`,
            //         responseTime: new Date().getTime() - context.prompt.timestamp,
            //         queryInEnglish: context.prompt.inputTextInEnglish,
            //         responseInEnglish: `${context.prompt.outputInEnglish}`,
            //         conversation: {
            //             create: {
            //                 id: context.prompt.input.conversationId,
            //                 userId: context.prompt.input.userId
            //             }
            //         },
            //         workflow: {
            //             create: {
            //                 userId: context.prompt.input.userId,
            //                 content: context.workflow,
            //             },
            //         }
            //     },
            // });

            return context.prompt.output
        } catch(error){
            console.log(error)
            throw new Error(error)
        }
    },

    done: async (context) => {
        console.log("done")
        logger.logWithCustomFields({
            userId: context.prompt.input.userId,
            messageId: context.prompt.input.messageId
        },'verbose')('done',context)
        return context
    },

    logError: async (_, event) =>{
        console.log("logError")
        console.log(event.data)
        return event.data
    },

    validateAadhaarNumber: async (context, event) => {
        try{
            console.log("validating user identifier")
            const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
            console.log("userIdentifier",userIdentifier)
            console.log(userIdentifier.length)
            console.log(/^[6-9]\d{9}$/.test(userIdentifier.substring(0,10)))
            let res;
            if(/^[6-9]\d{9}$/.test(userIdentifier)) {
                res = await userService.sendOTP(userIdentifier,"Mobile")
            } else if(userIdentifier.length==14 && /^[6-9]\d{9}$/.test(userIdentifier.substring(0,10))){
                res = await userService.sendOTP(userIdentifier,"MobileAadhar")
            } else if(userIdentifier.length==12 && /^\d+$/.test(userIdentifier)){
                res = await userService.sendOTP(userIdentifier,"Aadhar")
            } else if(userIdentifier.length == 11) { 
                res = await userService.sendOTP(userIdentifier,"Ben_id")
            } else {
                return Promise.resolve('Please enter a valid Beneficiary ID/Aadhaar Number/Phone number');
            }
            if(res) {
                return Promise.resolve(res.d.output.Message);
            }
            throw new Error('Something went wrong.')
        } catch (error) {
            console.log(error)
            return Promise.reject(new Error('Something went wrong.'))
        }
        
    },

    validateOTP: async (context, event) => {
        const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
        const otp = context.otp;
        let res;
        // Perform OTP validation logic here
        if(/^[6-9]\d{9}$/.test(userIdentifier)) {
            res = await userService.verifyOTP(userIdentifier,otp,"Mobile")
        } else if(userIdentifier.length==14 && /^[6-9]\d{9}$/.test(userIdentifier.substring(0,10))){
            res = await userService.verifyOTP(userIdentifier,otp,"MobileAadhar")
        } else if(userIdentifier.length==12 && /^\d+$/.test(userIdentifier)){
            res = await userService.verifyOTP(userIdentifier,otp,"Aadhar")
        } else if(userIdentifier.length == 11) { 
            res = await userService.verifyOTP(userIdentifier,otp,"Ben_id")
        } else {
            return Promise.reject(new Error('Something went wrong, Please try again by asking your question.'));
        }
        if(res){
            return Promise.resolve(res.d.output.Message);
        } else {
            return Promise.reject(new Error('Something went wrong, Please try again by asking your question.'));
        }
    },

    fetchUserData: async (context, event) => {
        const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
        let res;
        let type='Mobile'
        if(/^[6-9]\d{9}$/.test(userIdentifier)) {
            type='Mobile'
            res = await userService.getUserData(userIdentifier,"Mobile")
        } else if(userIdentifier.length==14 && /^[6-9]\d{9}$/.test(userIdentifier.substring(0,10))){
            type='MobileAadhar'
            res = await userService.getUserData(userIdentifier,"MobileAadhar")
        } else if(userIdentifier.length==12 && /^\d+$/.test(userIdentifier)){
            type = "Aadhar"
            res = await userService.getUserData(userIdentifier,"Aadhar")
        } else if(userIdentifier.length == 11) { 
            type = "Ben_id"
            res = await userService.getUserData(userIdentifier,"Ben_id")
        }else {
            return Promise.reject(new Error('Please enter a valid Beneficiary ID/Aadhaar Number/Phone number'));
        }
        if(res.d.output.Message=='Unable to get user details'){
            return Promise.reject(new Error(res.d.output.Message))
        }
        let userDetails = AADHAAR_GREETING_MESSAGE(
            res.d.output['BeneficiaryName'],
            res.d.output['FatherName'],
            res.d.output['DOB'],
            res.d.output['Address'],
            res.d.output['DateOfRegistration']
        )

        console.log("ChatbotBeneficiaryStatus")
        console.log("using...",userIdentifier, type)
        let userErrors = [];
        try {
        let data = JSON.stringify({
            "EncryptedRequest": `{\"Types\":\"${type}",\"Values\":\"${userIdentifier}\",\"Token\":\"${configService.get("PM_KISSAN_TOKEN")}\"}`
        });
        console.log("body", data)
        
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${configService.get("PM_KISAN_BASE_URL")}/ChatbotBeneficiaryStatus`,
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
                if(value && PMKissanProtalErrors[`${value}`]["types"].indexOf(context.queryType)!=-1){
                    console.log(`ERRORVALUE: ${key} ${value}`);
                    userErrors.push(PMKissanProtalErrors[`${value}`]["text"])
                }
            }
            });
        }
        } catch (error) {
        console.log("ChatbotBeneficiaryStatus error")
        console.log(error)
        }
        return `${userDetails}${userErrors.join("\n")}`
        
    }
}