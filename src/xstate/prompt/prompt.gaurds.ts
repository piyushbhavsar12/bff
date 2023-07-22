export const promptGuards = {
    unableToDetectLanguage: (_, event) => event.data.language == 'unk',
    unableToTranslate: (_, event) => event.data.error!=null,
    isUserHistoryEmpty: (_, event) => event.data.length === 0,
    ifSimilarQuestionFound: (_, event) => event.data?.length > 0,
    ifSimilarDocsFound: (_, event) => event.data?.length > 0,
    llmResponseIsEmpty: (_, event) => {
        if(!event.data['response']){
            return true
        }
        if(event.data.error){
            return true
        }
    },
    ifText: (_,event) => event.data.prompt.input.type == "Text",
    ifAudio: (_,event) => {
        console.log("if audio",event.data)
        console.log(event.data.inputType == "Audio")
        return event.data.inputType == "Audio"
    },
    wordContactInQuery: (_, event) => /contact/i.test(event.data?.translated),
    ifMultipleAadhaar: (_,event) => {
        return event.data == "This mobile number taged with multiple records."
    },
    ifNoRecordsFound: (context,event)=> {
        return event.data == `No Record Found for this (${context.userAadhaarNumber}) Aadhar/Ben_id/Mobile.`
    },
    ifOTPSend: (_,event)=>{
        return event.data == 'OTP send successfully!'
    },
    ifTryAgain: (_,event)=>{
        return event.data == 'Try again'
    },
    ifNotValidAadhaar: (_,event) =>  event.data == "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number",
    ifInvalidOTP: (_,event) => event.data == "OTP not verified",
    resendOTP: (_,event) => {
        console.log("if resendOTP",event.data)
        return event.data.query == "resend OTP"
    }
}