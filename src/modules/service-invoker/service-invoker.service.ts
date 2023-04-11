import { Injectable, Logger } from "@nestjs/common";
import { GqlConfig } from "./types";
import { GQLResolverService } from "./utils/gql/gql.resolver";
import { GetRequestResolverService } from "./utils/get/get.resolver";

@Injectable()
export class ServiceInvokerService {
  logger: Logger;
  constructor(
    private readonly gqlResolver: GQLResolverService,
    private readonly getRequestResolver: GetRequestResolverService
  ) {
    this.logger = new Logger("ServiceService");
  }

  resolve(service: any, owner: string | null) {
  //   if (service.type === "gql") {
  //     return this.gqlResolver.resolve(
  //       ServiceQueryType.all,
  //       service.config as GqlConfig,
  //       owner
  //     );
  //   } else if (service.type === "get") {
  //     return this.getRequestResolver.resolve(
  //       ServiceQueryType.all,
  //       service.config as GqlConfig,
  //       owner
  //     );
  //   } else {
  //     this.logger.error(`Unknown service type: ${service.type}`);
  //   }
  // }
}
}
