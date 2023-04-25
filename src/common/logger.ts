import { Logger } from "@nestjs/common";

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

  log(message: any, context?: string) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.log(message, context, timestamp);
  }

  error(message: any, trace?: string, context?: string) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.error(message, trace, context, timestamp);
  }

  warn(message: any, context?: string) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.warn(message, context, timestamp);
  }

  debug(message: any, context?: string) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.debug(message, context, timestamp);
  }

  verbose(message: any, context?: string) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    super.verbose(message, context, timestamp);
  }
}
