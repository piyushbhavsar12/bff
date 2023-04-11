import fetch from "isomorphic-fetch";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  QueryOptions,
  gql,
  ApolloQueryResult,
} from "@apollo/client/core";

import { Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelemetryService } from "src/global-services/telemetry.service";
import { ErrorType, GqlConfig, GqlResolverError } from "./../../types";

@Injectable()
export class GQLResolverService {
  constructor(
    private configService: ConfigService,
    private telemetryService: TelemetryService
  ) {}

  async verify(
    gqlConfig: GqlConfig,
    user: string
  ) {
    //secretPath = <user>/<variable>
    const secretPath = `${user}/${gqlConfig.credentials.variable}`;
    const headers = null;
    const client = this.getClient(gqlConfig.url, headers);
    const variables = gqlConfig.verificationParams;

    const usersOrError: any[] | GqlResolverError = await this.getUsers(
      client,
      gqlConfig.query,
      variables
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
    gqlConfig: GqlConfig,
    user: string | null
  ): Promise<any[]> {
    const secretPath = `${user}/${gqlConfig.credentials.variable}`;
    const client = this.getClient(gqlConfig.url, null);
    const variables = gqlConfig.verificationParams;
    gqlConfig.query = gqlConfig.gql as string; //Backwards compatibility
    const usersOrError: any[] | GqlResolverError = await this.getUsers(
      client,
      gqlConfig.query,
      variables
    );
    return [];
  }

  async getUsers(
    client: ApolloClient<any>,
    query: string,
    variables?: any,
    errorNotificationWebhook?: string
  ): Promise<any[] | GqlResolverError> {
    let isValidUserResponse = true;
    let currentUser: any;
    return this.query(client, query, variables).then(async (resp) => {
      console.log(resp.data.users);
      for (const user of resp.data.users) {
        currentUser = user;
        return resp.data.users;
        // if (!this.validate(user)) {
        //   isValidUserResponse = false;
        //   //Notify Federated Service that user is invalid
        //   if (errorNotificationWebhook) {
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
          event: "Failed to notify federated service",
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

  async query(
    client: ApolloClient<any>,
    query: string,
    variables?: any
  ): Promise<ApolloQueryResult<any>> {
    if (variables) {
      return client.query({
        query: gql(query),
        variables,
      });
    } else {
      return client.query({
        query: gql(query),
      });
    }
  }

  getClient = (
    uri: string,
    headers: { [key: string]: string }
  ): ApolloClient<any> => {
    return new ApolloClient({
      link: new HttpLink({
        uri: uri,
        headers: headers,
        fetch: fetch,
      }),
      cache: new InMemoryCache(),
    });
  };
}
