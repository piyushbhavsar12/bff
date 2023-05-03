import { AI_TOOLS_DELAY_ALERT } from "./constants";
import { sendEmail } from "./email.service";

export const fetchWithAlert = async (
    url: string, 
    options?: RequestInit, 
    alertResponseTime: number = parseInt(process.env.DEFAULT_ALERT_RESPONSE_TIME) || 15000 
): Promise<any> => {
    const start = Date.now();
    const response = await fetch(url, options);
    const end = Date.now();
    const responseTime = end - start;
    if (responseTime > alertResponseTime) {
      sendEmail(
        JSON.parse(process.env.SENDGRID_ALERT_RECEIVERS),
        "Delay in Ai-tools response",
        AI_TOOLS_DELAY_ALERT(
            responseTime,
            url,
            options
        )
      )
    }
    return response;
}