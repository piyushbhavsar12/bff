import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { PrismaService } from 'src/global-services/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prismaService: PrismaService){}

  async initializeAsync(){
    const metricsToUpsert: any = [
      { name: 'bhashiniCounter' },
      { name: 'bhashiniSuccessCounter' },
      { name: 'bhashiniFailureCounter' },
      { name: 'promptCount' }
    ];
    for (const metric of metricsToUpsert){
      const existingMetric: any = await this.prismaService.metrics.findUnique({
        where: { name: metric.name },
      });
      if(existingMetric){
        switch(existingMetric.name){
          case 'bhashiniCounter':
            this.bhashiniCounter.inc(parseInt(existingMetric.value));
            break;
          case 'bhashiniSuccessCounter':
            this.bhashiniSuccessCounter.inc(parseInt(existingMetric.value));
            break;
          case 'bhashiniFailureCounter':
            this.bhashiniFailureCounter.inc(parseInt(existingMetric.value));
            break;
          case 'promptCount':
            this.promptCount.inc(parseInt(existingMetric.value));
            break;
          default:
            break;
        }
      }
    }
  }

  public bhashiniCounter: Counter<string> = new Counter({
    name: 'bhashini_api_count',
    help: 'Counts the API requests in Bhashini service',
  });
  public bhashiniSuccessCounter: Counter<string> = new Counter({
    name: 'bhashini_api_success_count',
    help: 'Counts the successful API requests in Bhashini service',
  });
  public bhashiniFailureCounter: Counter<string> = new Counter({
    name: 'bhashini_api_failure_count',
    help: 'Counts the failed API requests in Bhashini service',
  });

  public promptCount: Counter<string> = new Counter({
    name: 'prompt_api_count',
    help: 'Counts the API requests of /prompt API',
  });

  public async getBhashiniCounter() {
    let count = await this.bhashiniCounter.get();
    return count.values[0].value;
  }

  public async getBhashiniSuccessCounter() {
    let count = await this.bhashiniSuccessCounter.get();
    return count.values[0].value;
  }

  public async getBhashiniFailureCounter() {
    let count = await this.bhashiniFailureCounter.get();
    return count.values[0].value;
  }

  public async getPromptCount() {
    let count = await this.promptCount.get();
    return count.values[0].value;
  }

  public incrementBhashiniCounter(): void {
    this.bhashiniCounter.inc();
  }

  public incrementBhashiniSuccessCounter(): void {
    this.bhashiniSuccessCounter.inc();
  }

  public incrementBhashiniFailureCounter(): void {
    this.bhashiniFailureCounter.inc();
  }

  public incrementPromptCount(): void {
    this.promptCount.inc();
  }

  public async onExit(): Promise<void> {
    const metricsToUpsert: any = [
      { name: 'bhashiniCounter', value: `${await this.getBhashiniCounter()}`},
      { name: 'bhashiniSuccessCounter', value: `${await this.getBhashiniSuccessCounter()}`},
      { name: 'bhashiniFailureCounter', value: `${await this.getBhashiniFailureCounter()}`},
      { name: 'promptCount', value: `${await this.getPromptCount()}`}
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
