# Agrimitra API Docs

## POSTMAN COLLECTION: https://interstellar-resonance-753199.postman.co/workspace/My-Workspace~3bc9504d-c440-4f38-89a2-5bdb0d3bbcb9/collection/12306310-e1373175-5bcf-44d5-893a-be39214e5ae8?action=share&creator=12306310

## PM KISAN API'S:
- BASE URL: https://exlink.pmkisan.gov.in/services/ChatBotServiceWithoutEncryption.asmx
	- Send OTP :
		> ENDPOINT: /chatbototp
		METHOD: POST
	- Verify OTP:
		> ENDPOINT: /ChatbotOTPVerified
		METHOD: POST
	- Get User Details:
		> ENDPOINT: /ChatbotUserDetails
		METHOD: POST
	- Get Beneficiary Status:
		> ENDPOINT: /ChatbotBeneficiaryStatus
		METHOD: POST
		
## Bhashini API's:
- Automatic Speech Recognition (ASR)
	- Hindi:
		> ENDPOINT: https://meity-auth.ulcacontrib.org/ulca/apis/asr/v1/model/compute
		METHOD: POST
- Text Translation:
	- BaseURL: https://api.dhruva.ai4bharat.org
		> ENDPOINT:  /services/inference/translation?serviceId=ai4bharat/indictrans-v2-all-gpu--t4
		METHOD: POST
- Language detection: 
  > ENDPONT: https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute
  > METHOD: POST
 
### Text classifier:
- Base URL: https://api-inference.huggingface.co
	> ENDPOINT: /models/GautamR/model_grievance_class
	METHOD: POST