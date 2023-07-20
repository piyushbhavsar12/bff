import { AI_TOOLS_DELAY_ALERT, AI_TOOLS_ERROR } from "./constants";
import { sendDiscordAlert, sendEmail } from "../modules/alerts/alerts.service";

export const fetchWithAlert = async (
    url: string, 
    options?: RequestInit, 
    alertResponseTime: number = parseInt(process.env.DEFAULT_ALERT_RESPONSE_TIME) || 15000 
): Promise<any> => {
    try {
        const start = Date.now();
        const response = await fetch(url, options);
        if(response.status && !response.ok){
            throw new Error(`Network response was not ok. status ${response.status}`);
        }
        const end = Date.now();
        const responseTime = end - start;
        if (responseTime > alertResponseTime) {
            // sendEmail(
            //     JSON.parse(process.env.SENDGRID_ALERT_RECEIVERS),
            //     "Delay in Ai-tools response",
            //     AI_TOOLS_DELAY_ALERT(
            //         responseTime,
            //         url,
            //         options
            //     )
            // )
            sendDiscordAlert(
                "Delay in Ai-tools response",
                AI_TOOLS_DELAY_ALERT(
                    responseTime,
                    url,
                    options
                ),
                16711680
            )
        }
        return response;
    } catch(error){
        // sendEmail(
        //     JSON.parse(process.env.SENDGRID_ALERT_RECEIVERS),
        //     "Ai-tools request failure",
        //     AI_TOOLS_ERROR(
        //         url,
        //         options,
        //         error
        //     )
        // )
        sendDiscordAlert(
            "Ai-tools request failure",
            AI_TOOLS_ERROR(
                url,
                options,
                error
            ),
            16711680
        )
    }
}

export const wordToNumber = (word) => {
    word = word?.replace('.','')
    const numberWords = {
      zero: 0,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
      hundred: 100,
      thousand: 1000,
      million: 1000000,
      billion: 1000000000,
      trillion: 1000000000000,
    };

    const words = word.toLowerCase().split(/[ ,]+/);
    let currentNumber = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // skip these words
      if (word === 'and' || word === 'or') continue;

      if (numberWords[word] || numberWords[word] === 0) {
        currentNumber += numberWords[word];
      } else if (word === 'and') {
        continue;
      } else if (word.includes('-')) {
        const hyphenWords = word.split('-');
        const first = hyphenWords[0];
        const second = hyphenWords[1];
        currentNumber += numberWords[first] + numberWords[second];
      }else{
        currentNumber+=word
      }
    }

    return currentNumber.replace('NaN','');
  }