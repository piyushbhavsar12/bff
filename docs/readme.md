# Agrimitra API Docs

## POSTMAN COLLECTION: Import [this](https://api.postman.com/collections/12306310-e1373175-5bcf-44d5-893a-be39214e5ae8?access_key=PMAT-01H5YF1B05QKJP0ERE9QPYMCMJ) link in Postman to see the entire collection.

## PM KISAN API'S:
- BASE URL: https://exlink.pmkisan.gov.in/services/ChatBotServiceWithoutEncryption.asmx
	- Send OTP :
		- ENDPOINT: /chatbototp
		- METHOD: POST
	- Verify OTP:
		- ENDPOINT: /ChatbotOTPVerified
		- METHOD: POST
	- Get User Details:
		- ENDPOINT: /ChatbotUserDetails
		- METHOD: POST
	- Get Beneficiary Status:
		- ENDPOINT: /ChatbotBeneficiaryStatus
		- METHOD: POST
		
## Bhashini API's:
- Automatic Speech Recognition (ASR)
	- Hindi:
		- ENDPOINT: https://meity-auth.ulcacontrib.org/ulca/apis/asr/v1/model/compute
		- METHOD: POST
- Text Translation:
	- BaseURL: https://api.dhruva.ai4bharat.org
		- ENDPOINT:  /services/inference/translation?serviceId=ai4bharat/indictrans-v2-all-gpu--t4
		- METHOD: POST
- Language detection: 
  - ENDPONT: https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute
  - METHOD: POST
 
### Text classifier:
- Base URL: https://api-inference.huggingface.co
	- ENDPOINT: /models/GautamR/model_grievance_class
	- METHOD: POST
	- RESPONSE (MAPPING): (pick the first element in the array)
		- LABEL_0 -> aadhaar related question
		- LABEL_1 -> payment related question
		- LABEL_2 -> others