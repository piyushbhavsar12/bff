import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class RateLimiterGuard extends ThrottlerGuard {
  async getKey(request: Request): Promise<string> {
    // In this example, we're using the IP address as the key for rate limiting.
    return request.ip;
  }
}