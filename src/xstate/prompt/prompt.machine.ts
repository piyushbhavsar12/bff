// @ts-nocheck
import { assign, createMachine } from 'xstate';
import { promptServices } from './prompt.service';
import { PromptDto } from '../../app.controller';
import { Language } from '../../language';
import { promptActions } from './prompt.actions';
import { promptGuards } from './prompt.gaurds';

export interface PromptContext {
  prompt: {
    input: PromptDto;
    output?: any;
    outputInEnglish?: any;
    inputLanguage?: Language;
    inputTextInEnglish?: string;
    maxTokens?: number;
    outputLanguage?: Language;
    similarDocs?: any;

    // More output metadata
    timeTaken?: number;
    timestamp?: number;
    responseType?: string;
    userHistory?: any[];
    getUserStatusFromPMKisan?: string;
    similarQuestion?: any[];
    errorRate?: number;
    class?: string;
    response?: any;
  };
  currentStateStartTime?: any;
  workflow?: Array<{
    state?: string;
    description?: string;
    input?: any;
    output?: any;
    timeTaken?: string;
  }>,
  currentState?: string;
  propertiesToBeUpdate?: any;
  // other context properties
}

export const promptMachine = createMachine<PromptContext>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AtsgLgBQwGM5YBLAOygDoLkBXHAYgnXLBvIDd0BrdtLLgLpisMpQ70cCCt0IBDHKVYBtAAwBddRsQp0ZJa10gAHogC0AZgDsANioAWAKxObahx4CMdzwBoQAJ6Ilpb2TrYATGqe0U7WdrbOAL5J-gLY+EQkFNS0DMys7LK8-BgZwqLiueRSMlwiisrk2iqeOkggyPqkhuTGZgiettZU1p4RDmrRAJwAHIme0w7+QQiW3lSeHpYR1k7uETFODilpZUJZYjmS+WCoGKhUyAA2igBm6KiYT+eZItkSPLSYoKXotTTGLoGJr9CyzQ6bJwRWZqCJLcZOWZ+QKIRbTKiJNHWabokKzPanTq-CoA6iEVicO44ADKyDA8kIAAsACroblgExMFhsKiwHCKUqCP6Va70rhM1nsrm8-mC7SQ7q9WEIczE-F2SwktS2WzrWxxFaIBzWNSOY3zCKhSxqY62SnpC7-K4SOWM1Astkcnl8gVCwqi8U4SXlS5VKi+hWB5UhtVtDXQowdAZIsLTVHjTyzELTU2WhBOaYjaauawROu2ea193U2PXCBgKOEHAAGXklDo8hgBRFxT4PylNO91HbnZ7fagA5gdTkjVUmnVHShPRhWdxDns00Os3hDnrKMsZcPESoWOPtbU1g89ebE9bEhnYC7vf7g7Aw6K9Rjh60q0lQH5fvOi5gMuDRguuaabpqO6gAM5hOJ4TibI6JrDLMDh4XhZazJWdp7NYzrHpYlEvjGXpxuBc4-kOdwPE8rw4B8XzjrRMrvh2n6MQuv4waCTTgu0egZn0u46jYB7Og4oS2FMylok4ZbWOSjhLHsxo7HsEw0Z6vHUDgqB9rA7FgAAkjU+TCgB3BAS2dHXGZFlWbZtQgquzTrhCiFSdq5iKba3gOJ4kWnpY+GzOpOKDPhIz6Q+tgYaETapFSr6uRI7nkJZEpefZ4ajtGxmgflhVRsVwL1KJa5aAhknbpmKG4iSVBIjFWxTDM8xllstaOHY4SaQ4h54UZIFTlQVWeXZTAsZ8bHvJ83zAZOcbzUVi0ib54npq10ntbJtj4hE+yPnh0yLJMhEJZ4OwOFQaghHsGHhFihzTVtsqvFcbwBAAinQdwBP+HBOeVM1xoQANkEDoPg-tcFaAFLVajJ5h5qM1oluEkXxLMg3zJ4WExHh5qGtaTi-W+dII6QSNg6gEPLY8LxrVxm0M-GTMsyjPloxumPIaYFg2vYylPtMMXneSyyPWMIypSWPiTXW9O5dQMA4AAqrAdzMpGdCwAAYmUeAALIANKkLAfaQ2V3EVbNeuG8bpsW1bdsO32qNif5EmdEhbUSzqMSWJsWLod4KJpeE8WrHWw3IsSsdvSWNjayZVAe0bqAm4oZuW1gNv2475CMBzq0cetruw9cBdeyXPvl37VeB41ouh0F2MfY4oSKcS0TmvhZaHJdXV1nmj5DJYFa55V5kFVZADyDBSM7gEw39eWr9VYCbzg3n1QdwdHVjp3mFi+KnnFjoYbdHhKynJq2udGGPg+SJzCcWVeY6zmofDeW8Sojl3o3feplQEShPmfFcItmp92OsFSK9gJrOBii4c6HhiSTz2PYKi-8dg7H2O4Zes0dpRgQbce4K0ub1x5i5PONDj7gLqkgoO6MQ5bmvhHXUhZXr3VPOPQ0QxJ7KVtMeVwNghqjSoXGMUnwwAAEFyAQGZGATR1sSC-h3tDaBfMVGoHUZo7Ruj9FLmFjw3u-DxaoSeteCIiQXQYN2AcEmCUyGzCoJWSYNpqzKUiEo64pjzFaJ0RAPRYgDG1yYZxDarDQIRI0VEqxcSbHnxFhjVBAjULzyoIvEINhFJy3QtMSe6sCQklcT1JYqI6aAJSbNTkfYIDPDAAAUQYagQxJRjHAPaZorpvSHjdz8rwq+jiLAxHcP408agUR9UupWMsMViKOBRJpROIRFgpCyuQdA7Z4CblaVUGZ4cnEumvEsKIKyphrOsGWc02ynkPgwss1wYTASLSuSdQRpoqB1nqYcCKkV9jJ1xEifxKysS0ymNWX5dIGSJiVMGVUOAAXaiiNHU8tYkoohLC6C8CVrQvVrI6CY55vB5maWcHKecGLfiEjAHF2NIX+MXpWMYiRyIxGxKscimCdKHgbK4PMlgUUgI8rtKQHKb7DBnpiKiBK1C8rfriZE9g3o2EXliKiFEZXw3kIDEGrNVhi2uRYE0owdjEvwg-Eeg1hj4jViaEV6FQktKZaBFuRdvZl0wBXf2gKHE2sjpFLqiQbqPgFeQyeD58SLHtK4Y49LpW+p4ivOVtDOGKsEeRV6V4hiKUignF5CVLqhAJKNYiJpjhTWzW7ZROBVHpMsTE6xYBC2oRLHafcSIsRpVrNChAaJzqvUik9YkrhkQuhlSMzpPS+l9osHMeweEnx1jwirbxqwHVbpwfMd689rAyocuunUkwh4VmNI2446wMIbOtMlbwl0JjkJ+YcoAA */
    id: 'promptProcessing',
    predictableActionArguments: true,
    initial: 'input',
    context: {
      prompt: null,
      workflow: [],
      currentState: 'input'
    },
    states: {
      input: {
        entry: ['setStartTimeForCompleteFlow','setStartTime'],
        invoke: {
          src:'getInput',
          onDone: [
            {
              cond: "ifText",
              target:"detectLanguage",
              actions:[
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'getInput',
                  propertiesToBeUpdate: null
                }),
                "updateContext"
              ]
            },
            {
              cond: "ifAudio",
              target: "convertSpeechToText",
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'getInput',
                  propertiesToBeUpdate: null
                }),
                "updateContext"
              ]
            }
          ],
          onError: "handleError"
        }
      },
      convertSpeechToText: {
        entry: ['setStartTime'],
        invoke: {
          src: "convertSpeechToText",
          onDone: [
            {
              cond: "ifError",
              target: "handleError"
            },{
              target: "translateInput",
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'convertSpeechToText',
                  propertiesToBeUpdate: [{key:"prompt.input.body",value:"text"}]
                }),
              "updateContext"
              ]
            }
          ],
          onError: "handleError"
        },
      },
      detectLanguage: {
        entry: ['setStartTime'],
        invoke: {
          src: 'detectLanguage',
          onDone: [
            {
              target: 'translateInput',
              cond: 'unableToDetectLanguage',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'unableToDetectLanguage',
                  propertiesToBeUpdate: null
                }),
                'updateContext'
              ]
            },
            {
              target: 'translateInput',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'detectLanguage',
                  propertiesToBeUpdate: [{key:"prompt.input.inputLanguage",value:"language"}]
                }),
                'updateContext'
              ]
            }
          ],
          onError: 'handleError',
        }
      },
      translateInput: {
        entry: ['setStartTime'],
        invoke: {
          src: 'translateInput',
          onDone: [
            {
              cond: 'unableToTranslate',
              target: 'handleError',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'unableToTranslateInput',
                  propertiesToBeUpdate: null
                }),
                'updateContext',
              ]
            },
            {
              target: 'classifyQuery',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'translateInput',
                  propertiesToBeUpdate: [{key:"prompt.inputTextInEnglish",value:"translated"}]
                }),
                'updateContext'
              ]
            }
          ],
          onError: 'handleError',
        },
      },
      classifyQuery: {
        entry: ['setStartTime'],
        invoke: {
          src: 'classifyQuery',
          onDone: [
            {
              target: 'getUserStatusFromPMKisan',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'classifyQuery',
                  propertiesToBeUpdate: [{key:"prompt.class",value:"class"}]
                }),
                'updateContext'
              ]
            },
          ],
          onError: 'handleError',
        },
      },
      getUserStatusFromPMKisan: {
        entry: ['setStartTime'],
        invoke: {
          src: 'getUserStatusFromPMKisan',
          onDone: [
            {
              target: 'translateOutput',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'getUserStatusFromPMKisan',
                  propertiesToBeUpdate: [{key:"prompt.outputInEnglish",value:"status"}]
                }),
                "updateContext"
              ]
            }
          ],
          onError: 'handleError',
        },
      },
      translateOutput: {
        entry: ['setStartTime'],
        invoke: {
          src: 'translateOutput',
          onDone: [
            {
              cond: 'unableToTranslate',
              target: 'handleError',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'unableToTranslateOutput',
                  propertiesToBeUpdate: null
                }),
                'updateContext'
              ]
            },
            {
              target: 'storeAndSendMessage',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'translateOutput',
                  propertiesToBeUpdate: [{key:"prompt.output",value:"translated"}]
                }),
                'updateContext'
              ],
            }
          ],
          onError: 'handleError',
        },
      },
      storeAndSendMessage: {
        entry: ['setStartTime'],
        invoke: {
          src: 'storeAndSendMessage',
          onDone: [
            {
              target: 'done',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'storeAndSendMessage',
                  propertiesToBeUpdate: [{key:"prompt.response",value:"translated"}]
                }),
                'updateContext'
              ]
            }
          ],
          onError: 'handleError',
        },
      },
      handleError: {
        invoke: {
          src: 'logError',
          onDone: {
            target: 'done',
            actions: ['updateContextWithError']
          }
        }
      },
      done: {
        type: 'final',
        invoke: {
          src: 'done'
        }
      }
    },
},
{
  services: promptServices,
  actions: promptActions,
  guards: promptGuards
}
);



export const botFlowMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCMD2AXAYgG1QdwDoZ0BVWMAJwEUBXOdAS1QDsBiEgZQFEAlAfQCSAOQAKJACoBtAAwBdRKAAOqWA0YsFIAB6IATAEYAnAQAc0gCwB2fboDMus-pOGArABoQAT0S3Dx17b6LgBsluaGNpa25gC+MR5oWLiEAIawANYMzFAAgikQABYpKRRCNAC2yJTs3PzCYlJymsqq6syaOgjBhsEEui6WJsG2ltLSfv0e3gi+-i6BIWERulGx8SCJOPgEAG4p2AwQKYzZeYXFpRVVFKwQLGAEWTuo6Q+bybv7h8dZuflFJTKlUoCCeqAAxj8WDJZDDmio1Ex2khtIgbBYCJYBhFLBF9EZcVM9C5jLpdMESS4TCFbNJLME4gkMFtCHsDkcTn9zoCrtVKBRUBQCIpsMcAGaC8oEd7bNnfTlnAGXYEUUHMZ6QtowuEolqIjQozro8yY7H6XH4gmGIkIcxBTHSBaBcmGaRktZMpLbNKZbIAeXEIhqvEEogkOqUCLaHTRw161MMVgs5hc7uCNv6lkx5JJwzpBhcjI2zI+co5vwDQbuzAeYNe0pLsq+5f9gbVGqhzG1TV1UaRMYQRkMJgIRhc5lstKGY1s7i8aPNBDGY3NwXNIQshfWMtZzZ+raD-MFwtF6AlFClO8+7P3UEr7Yhne78l7rX7hrRfhHY4nU+CM7naYVlsAgrApQxyRMcJnEMIsrzFMB0HBApfjISgABFjhSW57kedUXjeRtCAQpCUOyNCKEw9AUgfTUkWfeE3wNUBOl0cw3VMEloMpfQ1xMG0TBArEZygilol0Yc4KIggSOQ1DyEorDWCPIURXFSUGy9YjELk8iFKomiwTo6E5AjEA9WjD8EDYjiE241xeKcG19ECPoXBnd1aUsLE4nWZhUAgOBNB3Rj9WRFjEAAWnTecEEilwCD8JLkuSoYpK0ohEIo2h6HfSMmPC1FbV0G1zDsUCJOsboKRzExLHSlkCB9X5FQuIFrlCyyIttcwRzdaJE3mWwTHxG1ZkSyryX6djqS3T1GrLW9Wp5FVOryoqIJNMDghTV1QlEsa-AmwxLCm8dpFmhqPmag81uYor9HMYYlzpZxBl60YnNizMHUCGwyt44I0u3aTFs5Ss7sKo1cV0PpnF48lhpJU6MwGX7eKpGxzUCK7tlksioAogzIYHAwTFhukLHxJ6KTGcxnPtMD5jtcmIKCeqQYylSSas8lpH0Ag11OwxbApboXMsDNXFA+YgknVNHSpXHCDAZgIBZHnur5gWhYk0WQgiEYBIF9zl1F4dJ1CNY4iAA */
    id: 'botFlow',
    initial: 'getUserQuestion',
    context: {
      query: '',
      queryType: '',
      response: '',
      userAadhaarNumber: '',
      otp: '',
      userData: null,
      error: '',
      currentState: "getUserQuestion",
      type: ''
    },
    states: {
      getUserQuestion: {
        on: {
          USER_INPUT: {
            target: 'askingAadhaarNumber',
            actions: [
              assign({
                response: () => 'Please enter your Mobile/Aadhaar/Benificiary Id:',
                type: 'pause'
              })
            ]
          }
        }
      },
      askingAadhaarNumber: {
        on: {
          USER_INPUT: {
            target: 'validatingAadhaarNumber',
            actions: [
              assign({
                userAadhaarNumber: (context, event) => `${context.userAadhaarNumber}${event.data}`,
                type: ''
              })
            ]
          }
        }
      },
      validatingAadhaarNumber: {
        invoke: {
          src: 'validateAadhaarNumber',
          onDone: [
            {
              cond: "ifMultipleAadhaar",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: () => 'Please enter last four digits of your aadhaar',
                  type: 'pause'
                })
              ]
            },
            {
              target: "askingOTP"
            }
          ],
          onError: {
            target: 'error',
            actions: [
              assign({
                error: (_, event) => event.data.message,
                type: ''
              })
            ]
          }
        }
      },
      askingOTP: {
        entry: assign({
          response: () => 'Please enter the OTP sent to your registered mobile number:',
          type: 'pause'
        }),
        on: {
          USER_INPUT: {
            target: 'validatingOTP',
            actions: [
              assign({
                otp: (_, event) => event.data,
                type: ''
              })
            ]
          }
        }
      },
      validatingOTP: {
        invoke: {
          src: 'validateOTP',
          onDone: {
            target: 'fetchingUserData',
          },
          onError: {
            target: 'error',
            actions: [
              assign({
                error: (_, event) => event.data.message,
                type: ''
              })
            ]
          }
        }
      },
      fetchingUserData: {
        invoke: {
          src: 'fetchUserData',
          onDone: {
            target: 'endFlow',
            actions: [
              assign({
                response: (_, event) => event.data,
                type: ''
              })
            ]
          },
          onError: {
            target: 'error',
            actions: [
              assign({
                error: (_, event) => event.data.message,
                type: ''
              })
            ]
          }
        }
      },
      error: {
        invoke: {
          src: 'logError',
          onDone: 'endFlow',
        }
      },
      endFlow: {
        type: 'final'
      }
    }
  },
  {
    actions: promptActions,
    services: promptServices,
    guards: promptGuards
  }
);


export const inputMessageProcessor = createMachine<any>({
    id: 'inputMessageProcessor',
    predictableActionArguments: true,
    initial: 'idle',
    context: {
      prompt: null,
      workflow: [],
      currentState: 'idle'
    },
    states: {
      idle: {
        on: {
          START_PROCESSING: 'input',
        },
      },
      input: {
        entry: ['setStartTimeForCompleteFlow','setStartTime'],
        invoke: {
          src:'getInput',
          onDone: [
            {
              cond: "ifText",
              target:"detectLanguage",
              actions:[
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'getInput',
                  propertiesToBeUpdate: null
                }),
                "updateContext"
              ]
            },
            {
              cond: "ifAudio",
              target: "convertSpeechToText",
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'getInput',
                  propertiesToBeUpdate: null
                }),
                "updateContext"
              ]
            }
          ],
          onError: "handleError"
        }
      },
      convertSpeechToText: {
        entry: ['setStartTime'],
        invoke: {
          src: "convertSpeechToText",
          onDone: [
            {
              cond: "ifError",
              target: "handleError"
            },{
              target: "translateInput",
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'convertSpeechToText',
                  propertiesToBeUpdate: [{key:"prompt.input.body",value:"text"}]
                }),
              "updateContext"
              ]
            }
          ],
          onError: "handleError"
        },
      },
      detectLanguage: {
        entry: ['setStartTime'],
        invoke: {
          src: 'detectLanguage',
          onDone: [
            {
              target: 'translateInput',
              cond: 'unableToDetectLanguage',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'unableToDetectLanguage',
                  propertiesToBeUpdate: null
                }),
                'updateContext'
              ]
            },
            {
              target: 'translateInput',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'detectLanguage',
                  propertiesToBeUpdate: [{key:"prompt.input.inputLanguage",value:"language"}]
                }),
                'updateContext'
              ]
            }
          ],
          onError: 'handleError',
        }
      },
      translateInput: {
        entry: ['setStartTime'],
        invoke: {
          src: 'translateInput',
          onDone: [
            {
              cond: 'unableToTranslate',
              target: 'handleError',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'unableToTranslateInput',
                  propertiesToBeUpdate: null
                }),
                'updateContext',
              ]
            },
            {
              target: 'done',
              actions: [
                assign({
                  prompt:(context,_)=>context.prompt,
                  workflow:(context,_)=>context.workflow,
                  currentStateStartTime:(context,_)=>context.currentStateStartTime,
                  currentState: 'translateInput',
                  propertiesToBeUpdate: [{key:"prompt.inputTextInEnglish",value:"translated"}]
                }),
                'updateContext'
              ]
            }
          ],
          onError: 'handleError',
        },
      },
      handleError: {
        invoke: {
          src: 'logError',
          onDone: {
            target: 'done',
            actions: ['updateContextWithError']
          }
        }
      },
      done: {
        type: 'final',
        invoke: {
          src: 'done'
        }
      }
    },
},
{
  services: promptServices,
  actions: promptActions,
  guards: promptGuards
}
);