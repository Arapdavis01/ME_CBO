import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EmailModule } from "../email/email.module";
import {
  MembersPublicController,
  MembersController,
  MembersAdminController,
} from "./members.controller";
import { MembersService } from "./members.service";

/**
 * Members module.
 *
 * Dependencies of MembersService:
 *  - PrismaService  -> assumed global (PrismaModule)
 *  - AuditService   -> global (AuditModule is @Global)
 *  - PasswordService-> exported by AuthModule (imported below)
 *  - EmailService   -> exported by EmailModule (imported below)
 *
 * Controller order matters: NestJS registers routes in this order.
 * MembersAdminController ("members/applications") must come BEFORE
 * MembersController, because MembersController has @Get(":id") which would
 * otherwise swallow GET /members/applications as id="applications".
 */
@Module({
  imports: [AuthModule, EmailModule],
  controllers: [
    MembersPublicController,
    MembersAdminController,
    MembersController,
  ],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
