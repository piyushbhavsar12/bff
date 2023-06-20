export const USING_GPT4_ALERT = (
    userId,
    inputTextInEnglish,
    chatGPT3FinalResponse,
    previousSummaryHistory
) => `
Environment: ${process.env.ENVIRONMENT}
Using GPT4 as there were no similar documents found for below query\n
UserId: ${userId}\n\n
Query: ${inputTextInEnglish}\n\n
Response: ${chatGPT3FinalResponse}\n\n
User History: ${previousSummaryHistory}`

export const AI_TOOLS_DELAY_ALERT = (
    responseTime,
    url,
    options
) => `
Environment: ${process.env.ENVIRONMENT}
Below Ai-Tool request took ${responseTime/1000}sec to respond\n
URL: ${url}\n
Request options: ${JSON.stringify(options)}`

export const AI_TOOLS_ERROR = (
    url,
    options,
    error
) => `
Environment: ${process.env.ENVIRONMENT}
Below Ai-Tool request has failed:\n
URL: ${url}\n
Request options: ${JSON.stringify(options)}\n
Error: ${error}`

export const INVALID_REQUEST_ERROR = (request,error) => `
Environment: ${process.env.ENVIRONMENT}
Error occurred while processing request:\n\n${JSON.stringify(
    { 
        url: request.url, 
        body: request.body,
        query: request.query, 
        params: request.params 
    },
    null,
    2,
)}\n\n${error.stack}`

export const TEXT_TRANSLATION_ERROR = (userId,text,source,target) => `
Error while translating the text
Environment: ${process.env.ENVIRONMENT}
userId: ${userId}
url: /text_translation/google/remote
input text: ${text}
source_language: ${source}
target_language: ${target}
`

export const TEXT_DETECTION_ERROR = (userId,text,response) => `
Error while detecting the texts
Environment: ${process.env.ENVIRONMENT}
userId: ${userId}
url: /text_lang_detection/bhashini/remote
input text: ${text}
response: ${response}
`
export const GPT_RESPONSE_ERROR = (userId, input, output) => `
Error from gpt
url: /llm/openai/chatgpt3
userId: ${userId},
input: ${JSON.stringify(input,null,2)},
output: ${JSON.stringify(output,null,2)}
`
export const UNABLE_TO_DETECT_LANGUAGE = "Sorry, we are unable to detect the language. Please try rephrasing your question"

export const REPHRASE_YOUR_QUESTION = (inputLanguage) =>
inputLanguage && inputLanguage == 'en' ? "Please try rephrasing your question or try again later." :
"ଦୟାକରି ଆପଣଙ୍କର ପ୍ରଶ୍ନର ପୁନରାବୃତ୍ତି କରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ପରେ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ |";

export const UNABLE_TO_PROCESS_REQUEST = (inputLanguage) =>
inputLanguage && inputLanguage == 'en' ? "We are unable to process your request at the moment. Please try again later or contact our support team" :
"ଆମେ ବର୍ତ୍ତମାନ ଆପଣଙ୍କ ଅନୁରୋଧ ପ୍ରକ୍ରିୟାକରଣ କରିବାରେ ଅସମର୍ଥ | ଦୟାକରି ପରେ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ଆମର ସମର୍ଥନ ଦଳ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |"

export const CONTACT_AMAKRUSHI_HELPLINE = (inputLanguage) => 
inputLanguage && inputLanguage == 'en' ? "You can contact the Ama Krushi helpline by dialing 155333. They will provide you with information and reply to your queries within 24 hours." : "ଆପଣ 155333 ଡାଏଲ୍ କରି ଆମା କ୍ରୁସି ହେଲ୍ପଲାଇନ ସହିତ ଯୋଗାଯୋଗ କରିପାରିବେ | ସେମାନେ ଆପଣଙ୍କୁ ସୂଚନା ପ୍ରଦାନ କରିବେ ଏବଂ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଆପଣଙ୍କ ପ୍ରଶ୍ନର ଉତ୍ତର ଦେବେ |"

export const PMKissanProtalErrors = [
    { id: 1, error: "Account number is not Correct", message: "Dear farmer, it appears there is a discrepancy with the account number you've provided us in your PMKISAN application. For us to effectively process your application, we kindly request that you review the account number, ensuring it aligns with your personal banking details, and resubmit your information. Thank you." },
    { id: 2, error: "Gender is not correct", message: "Greetings, we've encountered an issue in your PMKISAN application regarding the gender information provided. The gender you've selected doesn't match our records. Please kindly review and update your gender information correctly on the application form and submit it again. We appreciate your cooperation." },
    { id: 3, error: "Installment not received", message: "Dear valued farmer, we acknowledge your concern about not having received your installment. We want to assure you that our team is investigating this matter thoroughly to understand the cause of the delay. We strive to rectify the issue and ensure the prompt transfer of your installment into your account. We appreciate your patience." },
    { id: 4, error: "Online Application is pending for Approval", message: "We wish to inform you that your online PMKISAN application is currently under review. Our team is working diligently to process your application. Once the approval is complete, you will receive an update regarding the status. We appreciate your patience and understanding during this process." },
    { id: 5, error: "Payment Related", message: "We understand you may be having payment-related concerns. At PMKISAN, we are committed to ensuring that all transactions are handled efficiently and effectively. Please provide more details about your issue so that we can address it directly and offer the most accurate solution. Thank you for bringing this to our attention." },
    { id: 6, error: "Problem in Adhaar Correction", message: "Dear applicant, we understand that you're encountering difficulties in making corrections to your Aadhaar details in your PMKISAN application. We apologize for the inconvenience and advise you to follow the correct steps listed on our website. If you continue facing issues, please contact our support team for further assistance." },
    { id: 7, error: "Problem in bio-metric based e-kyc", message: "We've noted your difficulty in completing the biometric-based e-KYC process. This could be due to a technical glitch or inaccurate input of information. Please retry the process, ensuring that your details are accurate and that the biometric device is working properly. If the problem persists, reach out to our helpdesk for further support." },
    { id: 8, error: "Problem in OTP based e-kyc", message: "We understand you're experiencing issues while completing the OTP-based e-KYC verification process for your PMKISAN application. Please ensure you're entering the OTP received on your registered mobile number within the given timeframe. If you did not receive an OTP, kindly request for it to be resent. If you continue facing difficulties, please contact our customer support for additional help." },
    { id: 9, error: "Transaction Failed", message: "Dear farmer, we are sincerely sorry to learn about your unsuccessful transaction attempt. This could have occurred due to various reasons, including network errors or incorrect banking information. Please retry the transaction, ensuring all entered details are correct. If this issue persists, we encourage you to get in touch with our customer support or your bank for further assistance." }
  ];