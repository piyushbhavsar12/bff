// @ts-nocheck
import { actions, assign, createMachine } from 'xstate';
import { promptServices } from './prompt.service';
import { PromptDto } from '../../app.controller';
import { Language } from '../../language';
import { promptActions } from './prompt.actions';
import { promptGuards } from './prompt.gaurds';

export const botFlowMachine1 = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCMD2AXAYgG1QdwDoZ0BVWMAJwEUBXOdAS1QDsBiEgZQFEAlAfQCSAOQAKJACoBtAAwBdRKAAOqWA0YsFIAB6IAjAA4AzAQAsukwDZDAVhMAma3f26ANCACeiALR2DBXQCc0sHWAboWugDsutIWAL5xbmhYuIQAjnSw6swAwtgAhrCqAGYMlKwQLGAEDMwAbqgA1tXJOPgEGfRMuQVFDKWUCLUNAMb52TKyk5rKqtmaOgi61rqmJtb61tbS+hYm0tFunghmBNJ2VvoHAfrRJobmCUkYbemZ2XmFJWUUrJQUqAoBEUBXQxUBAFsCK1Uh13t1Pn0BhQhvVUGMJnJpkgQLM1N0Ft5ItYCE57BtDBZNtYLNYjt59PoCLtrJFdmELoZDHZIk8QDD2oVGrUoABBfIQAAW+XyFCENAhyHKnF4glEEmxShU+I0OMWUSZ4UsFgcPOCAXW9IQdhMkVJkQdhluFxWtmsfIFhDq+WwDAg4xF4qlMrlCqVv0qzGqwyaLResO9vv9jGYYol0tl8sVgxjGO6k01uO18z13kcFgIAQsARWkUpGyc+itjmkBGs3K5gQdkRr+g98faib9AdTQYzoezEaqNTRzWhA69PuHKbTwczYZzaLzLALunkOLxJdA+p2qx25cZ5gCDmbdlb7bsnYC3d7-ZSg6XycD6ZDWfDFWnGM509Aghy-Ucf3XSdUVGAMdyxOx9y1OYCVLBAaQCStpF0QxIhtW1OxMW97w7B5nwdV9En5BdQM-EdV3HP9ykjaNZzjd9FyTeix1-DcUVzODmALQwkKLFDdWPRAwlMXCbTsfDNktDxEBbNtSK7CiNjfV5aK4lceKg-9-kBYFQXBCgoRAsDuMgidwxg9FBILOQZmLVDJIQHxpBJQwax2fQa0MWILB2K1fLsNtIhNFZOWrbD3SokChRFAB5cQRHYbh+GEMQpBcg83Ik7Q9CMUxzBpHYnF0AxQuUhArmMJ0NnbbzOwsXlEpo6yVzSjKWJnBpgK6uievShztyErF8uQnVmEJE4HUrZ8LV8ewHBwq1qpsNSTHuRxNP0ExtITEbUvSgCowG2N5w43TlzOkRxqcrE91c8S5rQ6qIp5fZuWwmJIh2CxNuWJkVmkKsAhrKlGWOj89Iev4KABIEQXGczLOGhHU16p7MSmaaxNm+avHCJk72JJ0q0iXblhB7b212mweR7DYjs627ijAdARklEUyEoAARcZ8gu1jBvYnSuZ5vnUwFihhfQfI8fzKbRMPdziqWELTA2NkWw2KlpEMTbLGMVkeQMB0bQpOHCGl3n+fIBWRaRlHTPRyEbql7nHbl53FeVgT8cLDWisWUmosrfZiUh58IjsTaOwIWOQqCdtNgCO2CGMqdLqAyXYVzlX4IJ9XCo+jzSdZAhCKBu8HlpOk6uWaSNmWW1duiXCEio5hUAgOBNE9N7ibQrxWRMStq1ret9EbK0vCdCstlZXQLnuExr1sbPiHl2guiKsPK61o1TAdcILSCAGLkXuwobOLY8MfGtAaMeIOZ0zosgRXpvkoUeR5T64UrEFBwZsqyxUXkEZkAVfB4QtDYB02dkoQTXHZABBV3rzXMBFK4YR448j2GyTa7Z-BmBrL4K41VwjZ26t+dBTEKCAM1vqPwJhGSbHng8YKPIwrVjONeAi7UQoxGfCg2AwocbpRYeHPQ15a7tR7NyHkVZHCJzqoDYwsQjAWkcFvYIhg6GnWkSIWRJ99TbFMBvKIyx6xBGBnVZ8xhnC3ACpnahdhs4O1llAeWgdzE4MsNHB42xcJVmwgEJOvgU6UhwsSdq88jDZ1zoE8eURWyHUBpvSwDYmwt0sKsWwQi8K7HsMSFJzAICvDSR5AwRSoi4XuNFf6m1aStgiEFTha1QgJQSEAA */
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
      type: '',
      inputType:'',
      inputLanguage: ''
    },
    states: {
      getUserQuestion: {
        on: {
          USER_INPUT: {
            target: 'questionClassifier',
            actions: [
              assign({
                query: (_,event) => event.data
              })
            ]
          }
        }
      },
      questionClassifier: {
        invoke: {
          src: "questionClassifier",
          onDone: [
            {
              target: 'askingAadhaarNumber',
              actions: [
                assign({
                  response: () => 'Please enter your Mobile/Aadhaar/Benificiary Id:',
                  queryType: (_,event) => event.data,
                  type: 'pause'
                })
              ]
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
              cond: "ifNotValidAadhaar",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: () => 'Please enter a valid Mobile/Aadhaar/Benificiary Id:',
                  userAadhaarNumber: "",
                  type: 'pause'
                })
              ]
            },
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
              cond: "ifNoRecordsFound",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: (context) => `No records were found for ${context.userAadhaarNumber}, Please enter valid Mobile/Aadhaar/Benificiary Id again:`,
                  userAadhaarNumber: "",
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifTryAgain",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: () => `Please try again by entering your valid Mobile/Aadhaar/Benificiary Id:`,
                  userAadhaarNumber: "",
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifOTPSend",
              target: "askingOTP",
              actions: [
                assign({
                  response: () => 'Please enter the OTP sent to your registered mobile number:',
                  type: 'pause'
                })
              ]
            },
            {
              target: "error",
              actions: [
                assign({
                  error: (_, event) => event.data,
                  type: ''
                })
              ]
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
          onDone: [
            {
              cond: "ifInvalidOTP",
              target: "askingOTP",
              actions: [
                assign({
                  response: () => 'Invalid OTP\nPlease enter the correct OTP:',
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifTryAgain",
              target: "askingOTP",
              actions: [
                assign({
                  response: () => 'Please try again, by entering the OTP:',
                  type: 'pause'
                })
              ]
            },
            {
              target: 'fetchingUserData',
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


export const botFlowMachine2 = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCMD2AXAYgG1QdwDoZ0BVWMAJwEUBXOdAS1QDsBiEgZQFEAlAfQCSAOQAKJACoBtAAwBdRKAAOqWA0YsFIAB6IAjAA4AzAQAsukwDZDAVhMAma3f26ANCACeiALR2DBXQCc0sHWAboWugDsutIWAL5xbmhYuIQAxgAWYGkA1uLuimC6rBAsYAQMzABuqDnlyTj4BJnZeQVFCJU1aQCG6swysoOayqr9mjoIPibGAdaG+gF2hhbW+k6R+m6eCOHWugTSzraRJibRhpEJSRiN6Vm5+YXFpczlXbX1t6nND23PnWqqF6-UGkl08iQIFGaiYzAm3jsMwIcwWSxWaw2Ww8eki1gsBFWAQskSR510l2uIAaPxaj3axUoFFQFAIimwfQAZiyALYEGlNOn-DofEFwsFyEYqWEaKGTaazeaLZardb6TbbPT6Cx2AjLSKRAKncmUxLU76ClichgUHkCZiKGjoYqcXiCUQSYZQmHjOWIyLGAzSEy2bWY-TYnaBEkEY5LMkXK5mgWEACOdFg-QAwhzYKprZQSmUKkC6vyLWmM9nc-mGJRAd0+uK5F6lNLfaBJrp9qYQ-prNYjhYTNJopqEGZDnYrPpRwF1eZDOYqSmCOn6HCcz08wwCxRWEyWWyOehubbyykmuvM5ua7u6xQG8CmywJZC22M4Qipni9fp7GsKz9vi1jjl4EaxqsmwWGE06GIYdhJjcl6ENuOSVFAACCPQQBkPQ9BQQg0DyyCFq6-DCGIUiSt67Zfn6uybP4w4WDqjiRMEAQhuOSKRHqBoBuq077LY1grhWvytE8YB2EWbwljUZarkK0l2E+Yqvi2NEfjK8IMQqKJKuiqpYjxo4EoYXHBsaibiShkn0oUsmvO8pZfPZKntGpoovgMLYQlKn6yp2iLIqiyoYmqGo4ggvjOCipJRAmFJIeaHl-KpB4UMyrLslyvIXncDnCt5QIaX5QzadCdHBdooWKmiKrhtFOx2BsBADtIdhGmctnJhJaRWjadoOk6snke6VGttVQV6SFUyIQc4QmOs84mRGPGWYGTj2MlprIUVVQ9NgDAQE2zBYTheEEURJGFi5CmfIVPxHSdZ2MBd2G4fhhHEaRj4+aCWnvjNunfl4jgEsScxRJFTiRogjjSB1CHwYEAlzPodmHcdp3nZd303X993Fh8SkSa9eMfQT12-XdANlb5YIBbRs3fjE8VHJDEbmEsoExUjKPLEuRoGpj2Mvbj70YV9tO3f9cmuYp7k429+Oyz98v1oDzZDHYIM+vR834gEKLSClCZoyY46C-Mwvo2LawS00lPS59V2a8T+4PWTKuS2r1Ma0T9PqUzLaGAbNVzXVCBhKYlxIm1Zz9txAt2Mjdto6LhpO-19mu+rHvBwrPtuc9LtS4XhN0-9odA0MJiR2zDEmMS-Hm0cywxKxhjjucuqZyLGO5wd-tUzLRc14Wh65SeZ58quBeB5PWsM429fTYbtXyun1gEJZg4RqisQWEc46WQPkRsbocEwebYl50VaEADLbug2GTwAIgwUBqLA7DcAoh6aiTcwb6XTnxJcCESRw3VAjWKg4DgcVWOcXqKVnb3Cku0EwitHrk3SlgwoJg66603lHcGSIGoRXWi1RA04Yh-ksKSNB+00pFU8kQ3Bvty6YMcmAYhOtNJDBZjpDsMcDLhWMs1eBi097akQj1E0qVlIZWwVlHKx58rnhUYQ-hJChFkObvNCRRkmpRRkesA4ZxpDxhYcogaQ1bT2kdOgHBE1KKeiqlvaOO8OIEGiDDAM60ZFLD4ubIIqClEYIIGhDCAB5cQIgAFug8SAwKYD5oGGMGYEMp81S6CDPA2cxgFhrHmNIeYS4STRI4WAQwXCy46L4YYfRFVDEZPEZQwyjVYG0IQIYaQNgOpGiSnYmpqjCj1NLsrHhxVpItMEW0kRoMxE7zCqY3p8ClyTiiI4RRfVR6CgmXU9RR48qngKk04UCzGYby8eQ8B6yek0K2UiAkeJDC7TGY-WkjiRouPqe44B7TVn+mRpsec3Uwxqi2TYXUaMTjfMOYQJe8TEkNJmYvSu1MEkiFaW+dJoKJwGhREaLivhdr7F7jFApQz5hnDhY7f80TUUXVxRip6WKA5orxYs5moCiUFN1IhEcCFzYxA4tqccBS1gdRiNDOYFgIxYx+RXblbL0Uz00Rc7RFNsU8vxcDQlRtxHhH0HqUcRkSRnG7NKike96UzHYjnZlqrCCcjAOgTIGEyCUE-n0HoHL8FFQ9V6jIPryAUH9egHohrKoCpNV2U+pg1ibCRmsJVgzpWWGMNYUk0R1TMMAtE0N3qLq+qjQG05s8tELwkqW8N5bI3RtjXyo1rMOnyiiFDEceIFVXxvtK1G-jQinyCEqUI0SZ5Br9k0GecaQWJu8N2SB2yhzpyqQOaVoQDhrG7JEvqZpmCoAgHATQKZjXb28HmkwKIYL7CCeGeBXgFgEgHHmxC6wr5KtWNE4gFbaAblqt49mw5TAGnCFxIIErpxgW6qbCpH7lhzElSscZujdCXp8de6cd7AmwPgVESwhIKRHAjJSpYNS-nOKdJhjtRKIa4ehg+gj0qljmtpWR-8bVJ1urXFWW825ayUCw+zS4KIBkOBzcSW+YEgixmVElLiNgDTRNie7auq9RMMXMLqWcYQjQ6ivucQj8x-BmDmHFcV4R0N8LsNp4xkM8MseCWZHUJGBnKoo1R5g1onGjXQPZ+jS6phOeY7DVzMUk63s415njAQWX6o03LL2DmY4FPNStCMmIlwn0QufGChwljnBWFfDuRo1OwByK-TMH9q7f1-ugeAwWr2haY-eiLT7NpMQiJ58j8XbPChMGl+UYWOuPphTxKl-hSNxYcAlvjg1fPDRo64kbOGobjdY1FmCt7etce83x9TUBcXrd2EsfeJJDQIQUasNq44OLGFiEYLijhW7BEMIN+ZZ3GObfw5F1qq0Zt9e4-Nnzfn-lOkMD9sb-2usxQGQw-bc3ePIoIKyk7iSzvdmRvYYcURuwYiCBYccRpjDODgfOUIs4b4ls9WWqAFaW3Y+I8pnHlxiThKHb4fxKwUr4k2E4T7fGZ4-aiMjf8HEZhnHWtmiIHVW68ScMORCD80dgGYBAO42P4osdOCsBw4rpWrGRsj-r82H4JCAA */
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
      type: '',
      inputType:'',
      inputLanguage: '',
      lastAadhaarDigits:''
    },
    states: {
      getUserQuestion: {
        on: {
          USER_INPUT: {
            target: 'checkType1',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      checkType1: {
        invoke: {
          src: "getInput",
          onDone: [
            {
              cond:"ifAudio",
              target: "confirmInput1",
              actions: [
                assign({
                  type: "pause"
                })
              ]
            },
            {
              target:"questionClassifier",
              actions:[
                assign({
                  query: (_,event) => event.data.query,
                  response: 'Please enter your Mobile/Aadhaar/Benificiary Id:'
                })
              ]
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
      confirmInput1:{
        on: {
          USER_INPUT: {
            target: 'checkType1',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      questionClassifier: {
        invoke: {
          src: "questionClassifier",
          onDone: [
            {
              target: 'askingAadhaarNumber',
              actions: [
                assign({
                  response: () => {console.log("assigning response = Please enter your Mobile/Aadhaar/Benificiary Id:"); return 'Please enter your Mobile/Aadhaar/Benificiary Id:'},
                  queryType: (_,event) => {console.log(`assigning queryType = ${event.data}`); return event.data},
                  type: 'pause'
                })
              ]
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
      askingAadhaarNumber: {
        on: {
          USER_INPUT: {
            target: 'checkType2',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      checkType2: {
        invoke: {
          src: "getInput",
          onDone: [
            {
              cond:"ifAudio",
              target: "confirmInput2",
              actions: [
                assign({
                  type: "pause"
                })
              ]
            },
            {
              target:"validatingAadhaarNumber",
              actions:[
                assign({
                  query: (_,event) => event.data.query,
                  userAadhaarNumber: (context, event) => {console.log("setting user aadhaar"); return `${event.data.query}`},
                  type:''
                })
              ]
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
      confirmInput2:{
        on: {
          USER_INPUT: {
            target: 'checkType2',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
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
              cond: "ifNotValidAadhaar",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: () => 'Please enter a valid Mobile/Aadhaar/Benificiary Id:',
                  userAadhaarNumber: "",
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifMultipleAadhaar",
              target: "askLastAaadhaarDigits",
              actions: [
                assign({
                  response: () => 'Please enter last four digits of your aadhaar',
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifNoRecordsFound",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: (context) => `No records were found for ${context.userAadhaarNumber}, Please enter valid Mobile/Aadhaar/Benificiary Id again:`,
                  userAadhaarNumber: "",
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifTryAgain",
              target: "askingAadhaarNumber",
              actions: [
                assign({
                  response: () => `Please try again by entering your valid Mobile/Aadhaar/Benificiary Id:`,
                  userAadhaarNumber: "",
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifOTPSend",
              target: "askingOTP",
              actions: [
                assign({
                  response: () => 'Please enter the OTP sent to your registered mobile number:',
                  type: 'pause'
                })
              ]
            },
            {
              target: "error",
              actions: [
                assign({
                  error: (_, event) => event.data,
                  type: ''
                })
              ]
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
      askLastAaadhaarDigits:{
        on: {
          USER_INPUT: {
            target: 'checkType4',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      checkType4: {
        invoke: {
          src: "getInput",
          onDone: [
            {
              cond:"ifAudio",
              target: "confirmInput4",
              actions: [
                assign({
                  type: "pause"
                })
              ]
            },
            {
              target:"validatingAadhaarNumber",
              actions:[
                assign({
                  query: (_,event) => event.data.query,
                  lastAadhaarDigits: (context, event) => {console.log("setting user aadhaar"); return `${event.data.query}`},
                  type:''
                })
              ]
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
      confirmInput4:{
        on: {
          USER_INPUT: {
            target: 'checkType4',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      askingOTP: {
        on: {
          USER_INPUT: {
            target: 'checkType3',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      checkType3: {
        invoke: {
          src: "getInput",
          onDone: [
            {
              cond:"ifAudio",
              target: "confirmInput3",
              actions: [
                assign({
                  type: "pause"
                })
              ]
            },
            {
              cond:"resendOTP",
              target:"validatingAadhaarNumber",
              actions: [
                assign({
                  response: "Please enter the latest OTP sent to your registered mobile number:"
                })
              ]
            },
            {
              target:"validatingOTP",
              actions:[
                assign({
                  query: (_,event) => event.data.query,
                  otp: (context, event) => {console.log("setting user otp"); return `${event.data.query}`},
                  type:''
                })
              ]
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
      confirmInput3:{
        on: {
          USER_INPUT: {
            target: 'checkType3',
            actions: [
              assign({
                query: (_,event) => event.data,
                response: (_,event) => event.data
              })
            ]
          }
        }
      },
      validatingOTP: {
        invoke: {
          src: 'validateOTP',
          onDone: [
            {
              cond: "ifInvalidOTP",
              target: "askingOTP",
              actions: [
                assign({
                  response: () => 'Invalid OTP\nPlease enter the correct OTP:',
                  type: 'pause'
                })
              ]
            },
            {
              cond: "ifTryAgain",
              target: "askingOTP",
              actions: [
                assign({
                  response: () => 'Please try again, by entering the OTP:',
                  type: 'pause'
                })
              ]
            },
            {
              target: 'fetchingUserData',
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
    /** @xstate-layout N4IgpgJg5mDOIC5QEsB2AHArgFwLJ1gEMYAFAJwHsBjAisgOmQgBswBiAZQBUBBAJS4B9EnwDyAYQCiHDgEkAcgHEA2gAYAuolDoKsZNmQVUWkAA9EqgDQgAnhYC+962ix4CxMOWq0GLnGwgjMEZUADcKAGtgvzdYIlJKGji6ENcENHCqQgMjNXU8kx09HOMkMwtrOwRVR2cMHHw4jy8k2BSYgKCQ8KjUhvcE72Tfeux0sOpsw1Q85QBGTTKi-WmTc2rKhycQGMb4z0SfPuw2MDJKBnRmbIAzOgBbY73mw+Hj8cyp3I0Cpd0VoxrCq2LZ1VzPQatFJUIyhM7YDjoMBgKgACy4FC4YFMJ0CqGiE16uwGByGbQYMLC8MRyLRGKxOI+kxKsw0hX+JSBGxB1VqO1GENJUIpsOpSJR6Mx2NxXQykQJ4JJLSOlLhZAR4rpUsZcqyLJ+C3ZxVWZXWVh5NW2xKakJVovVNIl9Olp3OKSutweTyVr3J9FVYtpkoZY11XxmPzZf2NgNNwKqlrB-RtQqOEDA2BR2AAMoRUFBMB5OvjuvLvSnlW905mqDm8wWPEy9dNWYttByTaAzZteVaBT6ySlq1nc-nCzBiwSegrk-tK37h7XRw2YE3w7NDdGAaUu-HQfzFRXfUOMyP6+P2GcLvQPdg7mRHta58eGIu62PG2H9fko+2Yzvym5BM+SfF5BwYbAyDzWBrkzWRRknUsiX7I9wPoSDoNgsB4LSL8W0jNsQGWTk4yA-dQNtN4MNQGDsmwhC8SnMsKNTKioJorCcJwNdv3mQjiM7QDzWAvtD2fNDqNouCEKvd1YPvR8UPE4V0PYqT6NwiZm2+H9+I7WNdzI3sk1iZSjlRPMWDASQ3TIRC5WQsSwJUizUCsmyLh4-DdKNbcuWErZtlQCh03gMoWPnOhfJIwyAFoABYAA4e1ixKAHZ6AAVlUHLVDmAA2eLVAAZgATnygqQKU5yjiYVhosE7seXi4qACYqqcyi-RiBqDKEntMvy-L6Hi0qxvS-LVFK+LRvyjrZxqt4AwdTVg2lXqAPWIrWvoVr8rStK5kSmbsrmOYZp7NL0voNL8tKzLMvi1rWrSsrMsS+bTMWhdTyXc8PA2-yezmHKMtG8b4qus6StKz7BUiiC1M40ZAdIgKEDmVrzvoMaxrSma0rytq4YHFzLNYDyoq3GL+p5c7npG3HCrmTLSsq0SFq6ocglRwz0YKkqcdx978sS478faxx7CAA */
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