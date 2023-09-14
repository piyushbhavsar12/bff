import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { PrismaService } from '../../global-services/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prismaService: PrismaService){}

  async initializeAsync(){
    const metricsToUpsert: any = [
      { name: 'bhashiniCount' },
      { name: 'bhashiniSuccessCount' },
      { name: 'bhashiniFailureCount' },
      { name: 'totalSessions' },
      { name: 'totalSuccessfullSessions' },
      { name: 'totalFailureSessions' },
      { name: 'totalIncompleteSessions' },
      { name: 'totalSessionsInHindi' },
      { name: 'totalSessionsInTamil' },
      { name: 'totalSessionsInOdia' },
      { name: 'totalSessionsInTelugu' },
      { name: 'totalSessionsInMarathi' },
      { name: 'totalSessionsInBangla' },
      { name: 'totalSessionsInEnglish' },
      { name: "aadhaarCount" },
      { name: "registrationIdCount" },
      { name: "mobileNumberCount" },
      { name: "positveFeedbackCount" },
      { name: "negativeFeedbackCount" },
      { name: "micUsedCount" },
      { name: "directMessageTypedCount" },
      { name: "sampleQueryUsedCount" },
      { name: "internalServerErrorCount" },
      { name: "badGatewayCount" }
    ];
    for (const metric of metricsToUpsert){
      const existingMetric: any = await this.prismaService.metrics.findUnique({
        where: { name: metric.name },
      });
      if(existingMetric){
        switch(existingMetric.name){
          case 'bhashiniCount':
            this.bhashiniCounter.inc(parseInt(existingMetric.value));
            break;
          case 'bhashiniSuccessCount':
            this.bhashiniSuccessCounter.inc(parseInt(existingMetric.value));
            break;
          case 'bhashiniFailureCount':
            this.bhashiniFailureCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessions':
            this.totalSessionsCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSuccessfullSessions':
            this.totalSuccessfullSessionsCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalFailureSessions' :
            this.totalFailureSessionsCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalIncompleteSessions':
            this.totalIncompleteSessionsCounter.inc(parseInt(existingMetric.value));
            break
          case 'totalSessionsInHindi':
            this.totalSessionsInHindiCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessionsInTamil':
            this.totalSessionsInTamilCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessionsInOdia':
            this.totalSessionsInOdiaCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessionsInTelugu':
            this.totalSessionsInTeluguCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessionsInMarathi':
            this.totalSessionsInMarathiCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessionsInBangla':
            this.totalSessionsInBanglaCounter.inc(parseInt(existingMetric.value));
            break;
          case 'totalSessionsInEnglish':
            this.totalSessionsInEnglishCounter.inc(parseInt(existingMetric.value));
            break;
          case "aadhaarCount":
            this.aadhaarCounter.inc(parseInt(existingMetric.value));
            break;
          case "registrationIdCount":
            this.registrationIdCounter.inc(parseInt(existingMetric.value));
            break;
          case "mobileNumberCount":
            this.mobileNumberCounter.inc(parseInt(existingMetric.value));
            break;
          case "positveFeedbackCount":
            this.positveFeedbackCounter.inc(parseInt(existingMetric.value));
            break;
          case "negativeFeedbackCount":
            this.negativeFeedbackCounter.inc(parseInt(existingMetric.value));
            break;
          case "micUsedCount":
            this.micUsedCounter.inc(parseInt(existingMetric.value));
            break;
          case "directMessageTypedCount":
            this.directMessageTypedCounter.inc(parseInt(existingMetric.value));
            break;
          case "sampleQueryUsedCount":
            this.sampleQueryUsedCounter.inc(parseInt(existingMetric.value));
            break;
          case "internalServerErrorCount":
            this.internalServerErrorCounter.inc(parseInt(existingMetric.value));
            break;
          case "badGatewayCount":
            this.badGatewayCounter.inc(parseInt(existingMetric.value));
            break;
          default:
            break;
        }
      }
    }
  }

  private bhashiniCounter: Counter<string> = new Counter({
    name: 'bhashini_api_count',
    help: 'Counts the API requests in Bhashini service',
  });
  private bhashiniSuccessCounter: Counter<string> = new Counter({
    name: 'bhashini_api_success_count',
    help: 'Counts the successful API requests in Bhashini service',
  });
  private bhashiniFailureCounter: Counter<string> = new Counter({
    name: 'bhashini_api_failure_count',
    help: 'Counts the failed API requests in Bhashini service',
  });

  private totalSessionsCounter: Counter<string> = new Counter({
    name: 'total_sessions_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSuccessfullSessionsCounter: Counter<string> = new Counter({
    name: 'total_successfull_sessions_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalFailureSessionsCounter: Counter<string> = new Counter({
    name: 'total_failure_sessionsCounter',
    help: 'Counts the API requests of /prompt API',
  });

  private totalIncompleteSessionsCounter: Counter<string> = new Counter({
    name: 'total_incomplete_sessions_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSessionsInHindiCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_hindi_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSessionsInTamilCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_tamil_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSessionsInOdiaCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_odia_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSessionsInTeluguCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_telugu_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSessionsInMarathiCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_marathi_count',
    help: 'Counts the API requests of /prompt API',
  });

  private totalSessionsInBanglaCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_bangla_count',
    help: 'Counts the API requests of /prompt API',
  });
  
  private totalSessionsInEnglishCounter: Counter<string> = new Counter({
    name: 'total_sessions_in_english_count',
    help: 'Counts the API requests of /prompt API',
  });

  private aadhaarCounter: Counter<string> = new Counter({
    name: 'aadhaar_count',
    help: 'Counts the API requests of /prompt API',
  });

  private registrationIdCounter: Counter<string> = new Counter({
    name: 'registration_id_count',
    help: 'Counts the API requests of /prompt API',
  });

  private mobileNumberCounter: Counter<string> = new Counter({
    name: 'mobile_number_count',
    help: 'Counts the API requests of /prompt API',
  });

  private positveFeedbackCounter: Counter<string> = new Counter({
    name: 'positve_feedback_count',
    help: 'Counts the API requests of /prompt API',
  });

  private negativeFeedbackCounter: Counter<string> = new Counter({
    name: 'negative_feedback_count',
    help: 'Counts the API requests of /prompt API',
  });

  private micUsedCounter: Counter<string> = new Counter({
    name: 'mic_used_count',
    help: 'Counts the API requests of /prompt API',
  });

  private directMessageTypedCounter: Counter<string> = new Counter({
    name: 'direct_message_typed_count',
    help: 'Counts the API requests of /prompt API',
  });

  private sampleQueryUsedCounter: Counter<string> = new Counter({
    name: 'sample_query_used_count',
    help: 'Counts number of times user used sample query',
  });

  private internalServerErrorCounter: Counter<string> = new Counter({
    name: 'internal_server_error_count',
    help: 'Counts the internal server errors',
  });

  private badGatewayCounter: Counter<string> = new Counter({
    name: 'bad_gateway_count',
    help: 'Counts the bat gateway errors',
  });

  public async getBhashiniCount() {
    let count = await this.bhashiniCounter.get();
    return count.values[0].value;
  }

  public async getBhashiniSuccessCount() {
    let count = await this.bhashiniSuccessCounter.get();
    return count.values[0].value;
  }

  public async getBhashiniFailureCount() {
    let count = await this.bhashiniFailureCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsCount() {
    let count = await this.totalSessionsCounter.get();
    return count.values[0].value;
  }
  
  public async getTotalSuccessfullSessionsCount() {
    let count = await this.totalSuccessfullSessionsCounter.get();
    return count.values[0].value;
  }

  public async getTotalFailureSessionsCount() {
    let count = await this.totalFailureSessionsCounter.get();
    return count.values[0].value;
  }

  public async getTotalIncompleteSessionsCount() {
    let count = await this.totalIncompleteSessionsCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInHindiCount() {
    let count = await this.totalSessionsInHindiCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInTamilCount() {
    let count = await this.totalSessionsInTamilCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInOdiaCount() {
    let count = await this.totalSessionsInOdiaCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInTeluguCount() {
    let count = await this.totalSessionsInTeluguCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInMarathiCount() {
    let count = await this.totalSessionsInMarathiCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInBanglaCount() {
    let count = await this.totalSessionsInBanglaCounter.get();
    return count.values[0].value;
  }

  public async getTotalSessionsInEnglishCount() {
    let count = await this.totalSessionsInEnglishCounter.get();
    return count.values[0].value;
  }

  public async getAadhaarCount() {
    let count = await this.aadhaarCounter.get();
    return count.values[0].value;
  }

  public async getRegistrationIdCount() {
    let count = await this.registrationIdCounter.get();
    return count.values[0].value;
  }
  
  public async getMobileNumberCount() {
    let count = await this.mobileNumberCounter.get();
    return count.values[0].value;
  }

  public async getPositveFeedbackCount() {
    let count = await this.positveFeedbackCounter.get();
    return count.values[0].value;
  }

  public async getNegativeFeedbackCount() {
    let count = await this.negativeFeedbackCounter.get();
    return count.values[0].value;
  }

  public async getMicUsedCount() {
    let count = await this.micUsedCounter.get();
    return count.values[0].value;
  }

  public async getDirectMessageTypedCount() {
    let count = await this.directMessageTypedCounter.get();
    return count.values[0].value;
  }

  public async getSampleQueryUsedCount() {
    let count = await this.sampleQueryUsedCounter.get();
    return count.values[0].value;
  }

  public async getInternalServerErrorCount() {
    let count = await this.internalServerErrorCounter.get();
    return count.values[0].value;
  }

  public async getBadGatewayCount() {
    let count = await this.badGatewayCounter.get();
    return count.values[0].value;
  }
  

  public incrementBhashiniCount(): void {
    this.bhashiniCounter.inc();
  }

  public incrementBhashiniSuccessCount(): void {
    this.bhashiniSuccessCounter.inc();
  }

  public incrementBhashiniFailureCount(): void {
    this.bhashiniFailureCounter.inc();
  }

  public incrementTotalSessionsCount() {
    this.totalSessionsCounter.inc();
  }

  public incrementTotalSuccessfullSessionsCount() {
    this.totalSuccessfullSessionsCounter.inc();
  }

  public incrementTotalFailureSessionsCount() {
    this.totalFailureSessionsCounter.inc();
  }

  public incrementTotalIncompleteSessionsCount() {
    this.totalIncompleteSessionsCounter.inc();
  }

  public incrementTotalSessionsInHindiCount() {
    this.totalSessionsInHindiCounter.inc();
  }

  public incrementTotalSessionsInTamilCount() {
    this.totalSessionsInTamilCounter.inc();
  }

  public incrementTotalSessionsInOdiaCount() {
    this.totalSessionsInOdiaCounter.inc();
  }

  public incrementTotalSessionsInTeluguCount() {
    this.totalSessionsInTeluguCounter.inc();
  }

  public incrementTotalSessionsInMarathiCount() {
    this.totalSessionsInMarathiCounter.inc();
  }

  public incrementTotalSessionsInBanglaCount() {
    this.totalSessionsInBanglaCounter.inc();
  }

  public incrementTotalSessionsInEnglishCount() {
    this.totalSessionsInEnglishCounter.inc();
  }

  public incrementAadhaarCount() {
    this.aadhaarCounter.inc();
  }

  public incrementRegistrationIdCount() {
    this.registrationIdCounter.inc();
  }
  
  public incrementMobileNumberCount() {
    this.mobileNumberCounter.inc();
  }

  public incrementPositveFeedbackCount() {
    this.positveFeedbackCounter.inc();
  }

  public incrementNegativeFeedbackCount() {
    this.negativeFeedbackCounter.inc();
  }

  public incrementMicUsedCount() {
    this.micUsedCounter.inc();
  }

  public incrementDirectMessageTypedCount() {
    this.directMessageTypedCounter.inc();
  }

  public incrementSampleQueryUsedCount() {
    this.sampleQueryUsedCounter.inc();
  }

  public incrementInternalServerErrorCount() {
    this.internalServerErrorCounter.inc();
  }

  public incrementBadGatewayCount() {
    this.badGatewayCounter.inc();
  }

  public async onExit(): Promise<void> {
    const metricsToUpsert: any = [
      { name: 'bhashiniCount', value: `${await this.getBhashiniCount()}`},
      { name: 'bhashiniSuccessCount', value: `${await this.getBhashiniSuccessCount()}`},
      { name: 'bhashiniFailureCount', value: `${await this.getBhashiniFailureCount()}`},
      { name: 'totalSessions', value: `${await this.getTotalSessionsCount()}` },
      { name: 'totalSuccessfullSession', value: `${await this.getTotalSuccessfullSessionsCount()}` },
      { name: 'totalFailureSessions', value: `${await this.getTotalFailureSessionsCount()}` },
      { name: 'totalIncompleteSessions', value: `${await this.getTotalIncompleteSessionsCount()}` },
      { name: 'totalSessionsInHindi', value: `${await this.getTotalSessionsInHindiCount()}` },
      { name: 'totalSessionsInTamil', value: `${await this.getTotalSessionsInTamilCount()}` },
      { name: 'totalSessionsInOdia', value: `${await this.getTotalSessionsInOdiaCount()}` },
      { name: 'totalSessionsInTelugu', value: `${await this.getTotalSessionsInTeluguCount()}` },
      { name: 'totalSessionsInMarathi', value: `${await this.getTotalSessionsInMarathiCount()}` },
      { name: 'totalSessionsInBangla', value: `${await this.getTotalSessionsInBanglaCount()}` },
      { name: 'totalSessionsInEnglish', value: `${await this.getTotalSessionsInEnglishCount()}` },
      { name: "aadhaarCount", value: `${await this.getAadhaarCount()}` },
      { name: "registrationIdCount", value: `${await this.getRegistrationIdCount()}` },
      { name: "mobileNumberCount", value: `${await this.getMobileNumberCount()}` },
      { name: "positveFeedbackCount", value: `${await this.getPositveFeedbackCount()}` },
      { name: "negativeFeedbackCount", value: `${await this.getNegativeFeedbackCount()}` },
      { name: "micUsedCount", value: `${await this.getMicUsedCount()}` },
      { name: "directMessageTypedCount", value: `${await this.getDirectMessageTypedCount()}` },
      { name: "sampleQueryUsedCount", value: `${await this.getSampleQueryUsedCount()}` },
      { name: "internalServerErrorCount", value: `${await this.getInternalServerErrorCount()}` },
      { name: "badGatewayCount", value: `${await this.getBadGatewayCount()}` }
    ];
    const upsertedMetrics = [];
    try{
      for (const metric of metricsToUpsert) {
        const existingMetric: any = await this.prismaService.metrics.findUnique({
          where: { name: metric.name },
        });
  
        if (existingMetric) {
          const updatedMetric = await this.prismaService.metrics.update({
            where: { id: existingMetric.id },
            data: { value: metric.value },
          });
          upsertedMetrics.push(updatedMetric);
        } else {
          const createdMetric = await this.prismaService.metrics.create({
            data: metric,
          });
          upsertedMetrics.push(createdMetric);
        }
      }
    } catch(err){
      console.log(err)
    }
  }

}
