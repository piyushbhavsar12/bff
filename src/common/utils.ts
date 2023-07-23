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
