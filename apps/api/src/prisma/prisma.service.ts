import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Note on connections: DATABASE_URL uses Supabase's pooler with
 * connection_limit=3. If you see timeouts under load, raise it to 5-8.
 * Interactive transactions (refresh-token rotation) hold a connection
 * for their whole duration.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Cheap database check for the /health/ready endpoint. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      this.logger.error(`Database health check failed: ${(err as Error).message}`);
      return false;
    }
  }
}
