import fetch from "isomorphic-fetch";
import { Injectable } from "@nestjs/common";
import Ajv from "ajv";
import { ConfigService } from "@nestjs/config";
import { TelemetryService } from "../../../../global-services/telemetry.service";
import {
  ErrorType,
  GetRequestConfig,
  GetRequestResolverError,
} from "./../../types";
import { CustomLogger } from "src/common/logger";

@Injectable()
export class GetRequestResolverService {
  logger: CustomLogger;
  constructor(
    private configService: ConfigService,
    private telemetryService: TelemetryService
  ) {
    this.logger = new CustomLogger("HTTP-GET-ResolverService");
  }

  async verify(getRequestConfig: GetRequestConfig, user: string) {
    const secretPath = `${user}/${getRequestConfig.credentials.variable}`;
    // const variables = getRequestConfig.verificationParams;

    const usersOrError: any[] | GetRequestResolverError = await this.getUsers(
      getRequestConfig.url,
      getRequestConfig.errorNotificationWebhook
    );
    if (usersOrError instanceof Array) {
      const totalUsers = usersOrError.length;
      const sampleUser = usersOrError[0];

      //TODO: Additional Checks
      return {
        total: totalUsers,
        schemaValidated: true,
        sampleUser,
      };
    } else {
      return {
        total: 0,
        schemaValidated: false,
        error: usersOrError,
      };
    }
  }

  async resolve(
    getRequestConfig: GetRequestConfig,
    user: string | null
  ): Promise<any[]> {
    const secretPath = `${user}/${getRequestConfig.credentials.variable}`;
    const errorNotificationWebhook = getRequestConfig.errorNotificationWebhook;
    return [];
  }

  async getUsers(
    url: string,
    headers?: any,
    errorNotificationWebhook?: string
  ): Promise<any[] | GetRequestResolverError> {
    let isValidUserResponse = true;
    let currentUser: any;
    return fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((resp) => resp.json())
      .then(async (resp) => {
        return resp.data?.users === undefined ? resp.data : resp.data.users;
        for (const user of resp.data.users) {
          currentUser = user;
          return resp.data.users === undefined ? resp.data : resp.data.users;
          // if (!this.validate(user)) {
          //   isValidUserResponse = false;
          //   //Notify Federated Service that user is invalid
          //   if (errorNotificationWebhook != null) {
          //     await this.notifyOnError(
          //       errorNotificationWebhook,
          //       user,
          //       this.validate.errors,
          //     );
          //     break;
          //   }
          // }
        }
        if (isValidUserResponse) {
          return resp.data.users;
        } else {
          return {
            errorType: ErrorType.UserSchemaMismatch,
            user: currentUser,
          };
        }
      });
  }

  public notifyOnError(
    errorNotificationWebhook: string,
    error: any
  ): Promise<any> {
    return fetch(errorNotificationWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {},
    })
      .then((response) => {
        return response.json();
      })
      .catch(async (e) => {
        await this.telemetryService.client.capture({
          distinctId: "NestJS-Local",
          event: "Failed to make GET request to federated service",
          properties: {
            error,
            errorNotificationWebhook,
          },
        });
        return {
          error: e,
        };
      });
  }
}
