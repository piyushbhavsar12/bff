import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class RateLimiterGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log("canActivate")
    console.log(request.context.config.url)

    // Check if the request path is "/metrics"
    if (request.context.config.url === '/metrics') {
      return true; // Bypass rate limiting for "/metrics"
    }

    // For other routes, apply rate limiting
    return super.canActivate(context);
  }

  async getKey(request: Request): Promise<string> {
    // In this example, we're using the IP address as the key for rate limiting.
    return request.ip;
  }
}

