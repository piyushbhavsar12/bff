export const USING_GPT4_ALERT = (
    userId,
    inputTextInEnglish,
    chatGPT3FinalResponse,
    previousSummaryHistory
) => `Using GPT4 as there were no simlar documents found for below query\n
UserId: ${userId}\n\n
Query: ${inputTextInEnglish}\n\n
Response: ${chatGPT3FinalResponse}\n\n
User History: ${previousSummaryHistory}`

export const AI_TOOLS_DELAY_ALERT = (
    responseTime,
    url,
    options
) => `Below Ai-Tool request took ${responseTime/1000}sec to respond\n
URL: ${url}\n
Request options: ${JSON.stringify(options)}`