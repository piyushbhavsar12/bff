import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
import { sendDiscordAlert, sendEmail } from './alerts.service';
import { INVALID_REQUEST_ERROR } from '../../common/constants';
  
  @Injectable()
  export class AlertInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError((error) => {
          const request = context.switchToHttp().getRequest();
          const emailReceivers = JSON.parse(process.env.SENDGRID_ALERT_RECEIVERS);
          // Send email notification
          sendEmail(
            emailReceivers,
            'Request failure',
            INVALID_REQUEST_ERROR(request,error),
          );
          sendDiscordAlert(
            'Request failure',
            INVALID_REQUEST_ERROR(request,error),
            16711680
          )
          // Log error
          console.error(`Error occurred while processing request: ${error.stack}`);
          // Rethrow error
          return throwError(error);
        }),
      );
    }
  }