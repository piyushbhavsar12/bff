import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from 'src/common/logger';

@Controller('user')
export class UserController {
  private logger: CustomLogger;
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    this.logger = new CustomLogger("UserService");
  }

  @Get("/sendotp/:identifier")
  async getOtp(@Param("identifier") identifier: string) {
    if(/^[6-9]\d{9}$/.test(identifier)) {
      return this.userService.sendOTP(identifier,"Mobile")
    } else if(identifier.length==14 && /^[6-9]\d{9}$/.test(identifier.substring(0,10))){
      return this.userService.sendOTP(identifier,"MobileAadhar")
    } else if(identifier.length==12 && /^\d+$/.test(identifier)){
      return this.userService.sendOTP(identifier,"Aadhar")
    } else if(identifier.length == 11) { 
      return this.userService.sendOTP(identifier,"Ben_id")
    } else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }

  @Post("/verifyotp")
  async verifyOtp(@Body() body: any ) {
    if(/^[6-9]\d{9}$/.test(body.identifier)) {
      return this.userService.verifyOTP(body.identifier,body.otp,"Mobile")
    } else if(body.identifier.length==14 && /^[6-9]\d{9}$/.test(body.identifier.substring(0,10))){
      return this.userService.verifyOTP(body.identifier,body.otp,"MobileAadhar")
    } else if(body.identifier.length==12 && /^\d+$/.test(body.identifier)){
      return this.userService.verifyOTP(body.identifier,body.otp,"Aadhar")
    } else if(body.identifier.length == 11) { 
      return this.userService.verifyOTP(body.identifier,body.otp,"Ben_id")
    }else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }

  @Get("/getUserData/:identifier")
  async getUserData(@Param("identifier") identifier: string) {
    if(/^[6-9]\d{9}$/.test(identifier)) {
      return this.userService.getUserData(identifier,"Mobile")
    } else if(identifier.length==14 && /^[6-9]\d{9}$/.test(identifier.substring(0,10))){
      return this.userService.getUserData(identifier,"MobileAadhar")
    } else if(identifier.length==12 && /^\d+$/.test(identifier)){
      return this.userService.getUserData(identifier,"Aadhar")
    } else if(identifier.length == 11) { 
      return this.userService.getUserData(identifier,"Ben_id")
    }else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }

  @Post('/generateUserId/:identifier')
  async generateUserId(@Param("identifier") identifier: string) {
    const stringToUuid = (str: any) => {
      str = str.replace('-', '');
      return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(
        /[x]/g,
        function (c, p) {
          return str[p % str.length];
        }
      );
    };
    return stringToUuid(identifier)
  }
}