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
    ifAudio: (_,event) => event.data.prompt.input.type == "Audio",
    wordContactInQuery: (_, event) => /contact/i.test(event.data?.translated),
    ifMultipleAadhaar: (_,event) => {
        console.log("ifMultipleAadhaar")
        console.log(event.data.d.output.Message)
        return event.data.d.output.Message == "This mobile number taged with multiple records."
    }
}