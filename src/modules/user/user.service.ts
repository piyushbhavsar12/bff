import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CustomLogger } from "../../common/logger";
import axios from "axios";
import { decryptRequest, encryptRequest } from "../../common/utils";


@Injectable()
export class UserService {
  private logger: CustomLogger;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.logger = new CustomLogger("UserService");
  }

  async sendOTP(
    mobileNumber: string,
    type: string = 'Mobile'
  ): Promise<any> {
    try {
      let encryptedData = await encryptRequest(`{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`)
      let data = JSON.stringify({
        "EncryptedRequest": `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.configService.get("PM_KISAN_BASE_URL")}/chatbototp`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

      let response: any = await axios.request(config)
      console.log("sendOTP",response.status)
      if (response.status >= 200 && response.status < 300) {
        response = await response.data
        let decryptedData: any = await decryptRequest(response.d.output,encryptedData.d.token)
        response.d.output = JSON.parse(decryptedData.d.decryptedvalue)
        response["status"] = response.d.output.Rsponce != "False" ? "OK" : "NOT_OK"
        return response
      } else {
        return {
          d: {
            output: {
              status: 'False',
              Message: 'Try again'
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
      return {
        d: {
          output: {
            status: 'False',
            Message: 'Try again'
          }
        }
      }
    }
  }

  async verifyOTP(
    mobileNumber: string,
    otp: string,
    type: string = 'Mobile'
  ): Promise<any> {

    try {
      let encryptedData = await encryptRequest(`{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"OTP\":\"${otp}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`)
      let data = JSON.stringify({
        "EncryptedRequest": `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.configService.get("PM_KISAN_BASE_URL")}/ChatbotOTPVerified`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

      let response: any = await axios.request(config)
      console.log("verifyOTP",response.status)
      if (response.status >= 200 && response.status < 300) {
        response = await response.data
        let decryptedData: any = await decryptRequest(response.d.output,encryptedData.d.token)
        console.log(decryptedData)
        response.d.output = JSON.parse(decryptedData.d.decryptedvalue)
        response["status"] = response.d.output.Rsponce != "False" ? "OK" : "NOT_OK"
        return response
      } else {
        return {
          d: {
            output: {
              status: 'False',
              Message: 'Try again'
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
      return {
        d: {
          output: {
            status: 'False',
            Message: 'Try again'
          }
        }
      }
    }
  }

  async getUserData(
    mobileNumber: string,
    type: string = 'Mobile'
  ): Promise<any> {
    let res: any;
    try {
      let encryptedData = await encryptRequest(`{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`)
      let data = JSON.stringify({
        "EncryptedRequest": `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.configService.get("PM_KISAN_BASE_URL")}/ChatbotUserDetails`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      res = await axios.request(config)
      console.log("getUserData",res.status)
      if (res.status >= 200 && res.status < 300) {
        res = await res.data
        let decryptedData: any = await decryptRequest(res.d.output,encryptedData.d.token)
        res.d.output = JSON.parse(decryptedData.d.decryptedvalue)
        res["status"] = res.d.output.Rsponce != "False" ? "OK" : "NOT_OK" 
      } else {
        res = {
          d: {
            output: {
              status: 'False',
              Message: 'Unable to get user details'
            }
          }
        }
      }
    } catch (error) {
      return {
        d: {
          output: {
            status: 'False',
            Message: 'Unable to get user details'
          }
        }
      }
    }
    return res
  }
}
