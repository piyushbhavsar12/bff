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