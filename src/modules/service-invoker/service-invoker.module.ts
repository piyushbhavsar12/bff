import { Module } from "@nestjs/common";
import { GQLResolverService } from "./utils/gql/gql.resolver";
import { GetRequestResolverService } from "./utils/get/get.resolver";
import { PostRequestResolverService } from "./utils/post/post.resolver";
import { ConfigService } from "@nestjs/config";
import { TelemetryService } from "src/global-services/telemetry.service";
import { ServiceInvokerService } from "./service-invoker.service";

@Module({
  providers: [
    ServiceInvokerService,
    GQLResolverService,
    ConfigService,
    TelemetryService,
    GetRequestResolverService,
    PostRequestResolverService,
  ],
})
export class ServiceInvokerModule {}
