import fetch from "isomorphic-fetch";
import { Injectable } from "@nestjs/common";
import Ajv from "ajv";
import { ConfigService } from "@nestjs/config";
import { TelemetryService } from "../../../../global-services/telemetry.service";
import {
  ErrorType,
  PostRequestConfig,
  PostRequestResolverError,
} from "./../../types";

@Injectable()
export class PostRequestResolverService {
  constructor(
    private configService: ConfigService,
    private telemetryService: TelemetryService
  ) {}

  async verify(postRequestConfig: PostRequestConfig, user: string) {
    const secretPath = `${user}/${postRequestConfig.credentials.variable}`;
    const usersOrError: any[] | PostRequestResolverError = await this.getUsers(
      postRequestConfig.url,
      postRequestConfig.requestBody,
      postRequestConfig.errorNotificationWebhook
    );
    if (usersOrError instanceof Array) {
      const totalUsers = usersOrError.length;
      const sampleUser = usersOrError[0];

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
    postRequestConfig: PostRequestConfig,
    user: string
  ): Promise<any[]> {
    const secretPath = `${user}/${postRequestConfig.credentials.variable}`;
    // const variables = postRequestConfig.verificationParams;
    const errorNotificationWebhook = postRequestConfig.errorNotificationWebhook;
    const usersOrError: any[] | PostRequestResolverError = await this.getUsers(
      postRequestConfig.url,
      errorNotificationWebhook
    );
    if (usersOrError instanceof Array) {
      //TODO: Additional Checks
      return usersOrError;
    } else {
      return [];
    }
  }

  async getUsers(
    url: string,
    headers?: any,
    requestBody?: any,
    errorNotificationWebhook?: string
  ): Promise<any[] | PostRequestResolverError> {
    let isValidUserResponse = true;
    let currentUser: any;
    return fetch(url, {
      method: "POST",
      body: requestBody == null ? undefined : JSON.stringify(requestBody),
      headers: headers,
    }).then(async (resp) => {
      for (const user of resp.data.users) {
        currentUser = user;
      }
      if (isValidUserResponse) {
        return resp.data.users;
      } else {
        return {
          error: null,
          errorType: ErrorType.UserSchemaMismatch,
          user: currentUser,
        };
      }
    });
  }

  public notifyOnError(
    errorNotificationWebhook: string,
    user: any,
    error: any
  ): Promise<any> {
    return fetch(errorNotificationWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        error,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .catch(async (e) => {
        await this.telemetryService.client.capture({
          distinctId: "NestJS-Local",
          event: "Failed to make POST request to federated service",
          properties: {
            error,
            user,
            errorNotificationWebhook,
          },
        });
        return {
          error: e,
        };
      });
  }
}
