const fetch = require('node-fetch'); 
const { Headers } = fetch;

export function isMostlyEnglish(text: string): boolean {
  const englishCharacterCount = (text.match(/[a-zA-Z0-9\s.,!?'"`~@#$%^&*()-_=+[\]{};:\\|<>/?]/g) || []).length;
  const totalCharacters = text.length;
  const englishCharacterPercentage = (englishCharacterCount / totalCharacters) * 100;
  return englishCharacterPercentage >= 90;
}

export const wordToNumber = (input) => {
    // Map of words to numbers
    const wordToNum = {
        'zero': 0,
        'one': 1,
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5,
        'six': 6,
        'seven': 7,
        'eight': 8,
        'nine': 9
    };

    // Remove punctuation, extra spaces, and common noise words
    input = input.replace(/[.,:;?!-]/g, '').replace(/\s+/g, ' ').trim().replace(/(and|is|the|this|with|for|it|its|ok|sure|yes|please|use|enter|login|received|needed|code|verify|access|confirm|your|needed|remember|need|forget)/gi, '');

    // Convert "double", "triple" (and their misspellings) followed by a word or a number
    const repetitionReplacement = (match, count, word) => {
        let repeatCount = 1;
        if (count.toLowerCase().startsWith('dou')) repeatCount = 2;
        if (count.toLowerCase().startsWith('tri') || 
            count.toLowerCase().startsWith('ter') || 
            count.toLowerCase() === 'thriple') {
            repeatCount = 3;
        }
        
        if (wordToNum[word.toLowerCase()] !== undefined) {
            return wordToNum[word.toLowerCase()].toString().repeat(repeatCount);
        }
        if (!isNaN(parseInt(word))) {
            return word.repeat(repeatCount);
        }
        return match;  // if it's neither a word nor a number, return the match as is
    };
    input = input.replace(/(double|triple|trible|trouble|terrible|terribel|terribal|thriple|single)\s+(\w+)/gi, repetitionReplacement);

    // Convert words directly followed by digits (like "One234")
    for (let word in wordToNum) {
        const regex = new RegExp(word + "(\\d+)", "gi");
        input = input.replace(regex, (_, digits) => wordToNum[word] + digits);
    }

    // Convert standalone words to numbers
    let numStr = input.split(' ').map(word => {
        if (wordToNum[word.toLowerCase()] !== undefined) {
            return wordToNum[word.toLowerCase()];
        }
        return word;
    }).join('');

    // Remove any non-numeric characters
    numStr = numStr.replace(/[^\d]/g, '');

    return numStr;
  }

  export const encryptRequest = async (text:string) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "EncryptedRequest": text
      });

      var requestOptions: any = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      let response:any = await fetch(`${process.env.PM_KISAN_ENC_DEC_API}/EncryptedRequest`, requestOptions)
      response = await response.json()
      return response
    }catch(error){
      return {
        error: "Error while encrypting the message."
      }
    }
  }

  export const decryptRequest = async (text:string,token:string) => {
    try{
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      var raw = JSON.stringify({
        "DecryptedRequest": `${text}@${token}`
      });
      console.log(raw)

      var requestOptions: any = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      let response = await fetch(`${process.env.PM_KISAN_ENC_DEC_API}/DecryptedRequest`, requestOptions)
      response = await response.json()
      return response
    }catch(error){
      return {
        error: "Error while decrypting the message."
      }
    }
  }

  export const formatStringsToTable = (tableData: Array<string>) => {
    let formattedString = `<table class="aadhar-table"><tbody>`
    tableData.forEach((text)=>{
      let td = text.split('-')
      console.log(td)
      formattedString+= `<tr><td>${td[0].trim()} :</td><td>${td[1].trim()}</td></tr>`
    })
    formattedString+=`</tbody></table>`
    return formattedString;
  }