import { assign, interpret, send, sendTo } from 'xstate';
import { PromptContext, inputMessageProcessor } from './prompt.machine'
import { randomUUID } from 'crypto';
import { Prompt } from 'src/app.service';

export const promptActions = {

  updateContext: assign<PromptContext,any>((context, event) => {
    try {
      let ret = {
        ...context,
        workflow: [...context.workflow,{
          state: context.currentState,
          timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`,
        }]
      }
      if(!context.prompt.input.messageId) ret.prompt.input.messageId = randomUUID()
      if(context.propertiesToBeUpdate){
        for(let i=0; i<context.propertiesToBeUpdate.length; i++){
          eval(`ret.${context.propertiesToBeUpdate[i]['key']}=event.data.${context.propertiesToBeUpdate[i]['value']}`)
        }
      }
      console.log(context.workflow)
      return ret
    } catch(error){
      console.log(error)
      return context
    }
  }),

  setStartTimeForCompleteFlow: assign<PromptContext, any>((context, _) => {
    return {
      ...context,
      prompt: {
        ...context.prompt,
        timestamp: new Date().getTime()
      }
    }
  }),

  setStartTime: assign<PromptContext, any>((context, _) => {
    return {
      ...context,
      currentStateStartTime: Date.now()
    }
  }),

  updateContextWithError: assign<PromptContext, any>((context, event) => {
    return {
      ...context,
      prompt: {
        ...context.prompt,
        error: event.data
      },
      workflow: [...context.workflow,{
        state: "error",
        timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`,
        error: event.data
      }]
    }
  }),


  transformInput: sendTo("inputMessageProcessor", "START_PROCESSING"),
  classifyQuery: ()=>{console.log("classifyQuery")}

  // transformInput: assign<any,any>(async (context, event) => {
  //   try{
  //     console.log("inside transformInput")
  //     let prompt: Prompt = {
  //       input: {
  //         body: event.data.query,
  //         type: event.data.type,
  //         userId: event.data.userId
  //       },
  //     };

  //     send('NESTED_MACHINE_EVENT', { to: 'child' })

  //     const promptProcessingService = interpret(
  //       inputMessageProcessor.withContext({
  //         prompt,
  //         workflow: []
  //       })
  //     ).start()
  //     console.log("started inputMessageProcessor")
  //     promptProcessingService.subscribe((state)=>{
  //       console.log("inputMessageProcessor current state", state.value)
  //     })
  //     await new Promise((resolve) => {
  //       promptProcessingService.onDone((state) => {
  //         resolve(state);
  //       });
  //     });
  //     console.log("done inputMessageProcessor")
  //     let result = promptProcessingService.getSnapshot().context.prompt
  //     // Stop the state machine
  //     promptProcessingService.stop();
  //     console.log("output",{
  //       ...context,
  //       query: result.output,
  //       queryInEnglish: result.outputInEnglish
  //     })
  //     return {
  //       ...context,
  //       query: result.output,
  //       queryInEnglish: result.outputInEnglish
  //     }
  //   }catch (error){
  //     console.log("error...")
  //   }
  // })

};
 