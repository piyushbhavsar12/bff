
import { Controller, Post, Body } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('custom/metrics')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Post('/increment')
  async incrementmetics(@Body() metric: String): Promise<any> {
    console.log(metric)
    let count;
    if(metric){
        switch(metric){
            case 'bhashiniCount':
                this.monitoringService.incrementBhashiniCount();
                count = await this.monitoringService.getBhashiniCount();
                break;
            case 'bhashiniSuccessCount':
                this.monitoringService.incrementBhashiniSuccessCount();
                count = await this.monitoringService.getBhashiniSuccessCount();
                break;
            case 'bhashiniFailureCount':
                this.monitoringService.incrementBhashiniFailureCount();
                count = await this.monitoringService.getBhashiniFailureCount();
                break;
            case 'totalSessions':
                this.monitoringService.incrementTotalSessionsCount();
                count = await this.monitoringService.getTotalSessionsCount();
                break;
            case 'totalSuccessfullSessions':
                this.monitoringService.incrementTotalSuccessfullSessionsCount();
                count = await this.monitoringService.getTotalSuccessfullSessionsCount();
                break;
            case 'totalFailureSessions' :
                this.monitoringService.incrementTotalFailureSessionsCount();
                count = await this.monitoringService.getTotalFailureSessionsCount();
                break;
            case 'totalIncompleteSessions' :
                this.monitoringService.incrementTotalIncompleteSessionsCount();
                count = await this.monitoringService.getTotalIncompleteSessionsCount();
                break;
            case 'totalSessionsInHindi':
                this.monitoringService.incrementTotalSessionsInHindiCount();
                count = await this.monitoringService.getTotalSessionsInHindiCount();
                break;
            case 'totalSessionsInTamil':
                this.monitoringService.incrementTotalSessionsInTamilCount();
                count = await this.monitoringService.getTotalSessionsInTamilCount();
                break;
            case 'totalSessionsInOdia':
                this.monitoringService.incrementTotalSessionsInOdiaCount();
                count = await this.monitoringService.getTotalSessionsInOdiaCount();
                break;
            case 'totalSessionsInTelugu':
                this.monitoringService.incrementTotalSessionsInTeluguCount();
                count = await this.monitoringService.getTotalSessionsInTeluguCount();
                break;
            case 'totalSessionsInMarathi':
                this.monitoringService.incrementTotalSessionsInMarathiCount();
                count = await this.monitoringService.getTotalSessionsInMarathiCount();
                break;
            case 'totalSessionsInBangla':
                this.monitoringService.incrementTotalSessionsInBanglaCount();
                count = await this.monitoringService.getTotalSessionsInBanglaCount();
                break;
            case 'totalSessionsInEnglish':
                this.monitoringService.incrementTotalSessionsInEnglishCount();
                count = await this.monitoringService.getTotalSessionsInEnglishCount();
                break;
            case "aadhaarCount":
                this.monitoringService.incrementAadhaarCount();
                count = await this.monitoringService.getAadhaarCount();
                break;
            case "registrationIdCount":
                this.monitoringService.incrementRegistrationIdCount();
                count = await this.monitoringService.getRegistrationIdCount();
                break;
            case "mobileNumberCount":
                this.monitoringService.incrementMobileNumberCount();
                count = await this.monitoringService.getMobileNumberCount();
                break;
            case "positveFeedbackCount":
                this.monitoringService.incrementPositveFeedbackCount();
                count = await this.monitoringService.getPositveFeedbackCount();
                break;
            case "negativeFeedbackCount":
                this.monitoringService.incrementNegativeFeedbackCount();
                count = await this.monitoringService.getNegativeFeedbackCount();
                break;
            case "micUsedCount":
                this.monitoringService.incrementMicUsedCount();
                count = await this.monitoringService.getMicUsedCount();
                break;
            case "directMessageTypedCount":
                this.monitoringService.incrementDirectMessageTypedCount();
                count = await this.monitoringService.getDirectMessageTypedCount();
                break;
            case "sampleQueryUsedCount":
                this.monitoringService.incrementSampleQueryUsedCount();
                count = await this.monitoringService.getSampleQueryUsedCount();
                break;
            case "internalServerError":
                this.monitoringService.incrementInternalServerErrorCount();
                count = await this.monitoringService.getInternalServerErrorCount();
                break;
            case "badGateway":
                this.monitoringService.incrementBadGatewayCount();
                count = await this.monitoringService.getBadGatewayCount();
                break;
            default:
                count = `'${metric}' metric does not exist`
                break;
        }
    }
    return count;
  }
}






