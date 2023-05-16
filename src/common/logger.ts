import { Logger, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonTransport as AxiomTransport } from '@axiomhq/axiom-node';

@Injectable()
export class CustomLogger extends Logger {
  private static formatTimestamp(date: Date): string {
    const hours = date.getHours();
    const hours12 = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
    const amPm = hours >= 12 ? "PM" : "AM";

    return `${hours12}:${minutes}:${seconds}.${milliseconds} ${amPm}`;
  }

  private readonly axiomLogger: winston.Logger;
  private readonly serviceName: string;

  constructor(serviceName) {
    super();
    const { combine, errors, json } = winston.format;
    const axiomTransport = new AxiomTransport();
    this.axiomLogger = winston.createLogger({
      level: 'silly',
      format: combine(errors({ stack: true }), json()),
      transports: [axiomTransport],
      exceptionHandlers: [axiomTransport],
      rejectionHandlers: [axiomTransport]
    });
    this.serviceName = serviceName;
  }

  log(...params: any[]) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.log(params.join(" "), this.serviceName, timestamp);
    if(process.env.ENVIRONMENT == 'Staging' || process.env.ENVIRONMENT == 'Production')
    this.axiomLogger.log({
      level: "info",
      message: params.join(" "),
      service: this.serviceName,
      timestamp
    })
  }

  error(...params: any[]) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.error(params.join(" "), this.serviceName, timestamp);
    if(process.env.ENVIRONMENT == 'Staging' || process.env.ENVIRONMENT == 'Production')
    this.axiomLogger.log({
      level: "error",
      message: params.join(" "),
      service: this.serviceName,
      timestamp
    })
  }

  warn(...params: any[]) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.warn(params.join(" "), this.serviceName, timestamp);
    if(process.env.ENVIRONMENT == 'Staging' || process.env.ENVIRONMENT == 'Production')
    this.axiomLogger.log({
      level: "warn",
      message: params.join(" "),
      service: this.serviceName,
      timestamp
    })
  }

  debug(...params: any[]) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.debug(params.join(" "), this.serviceName, timestamp);
    if(process.env.ENVIRONMENT == 'Staging' || process.env.ENVIRONMENT == 'Production')
    this.axiomLogger.log({
      level: "debug",
      message: params.join(" "),
      service: this.serviceName,
      timestamp
    })
  }

  verbose(...params: any[]) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.verbose(params.join(" "), this.serviceName, timestamp);
    if(process.env.ENVIRONMENT == 'Staging' || process.env.ENVIRONMENT == 'Production')
    this.axiomLogger.log({
      level: "verbose",
      message: params.join(" "),
      service: this.serviceName,
      timestamp
    })
  }
}