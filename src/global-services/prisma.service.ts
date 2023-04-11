import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";

import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger("DBService");
  async onModuleInit() {
    this.logger.verbose("Initialized and Connected 🎉");
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
      this.logger.warn("DB: Graceful Shutdown 🎉");
    });
  }
}
