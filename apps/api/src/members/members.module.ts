import { Module } from "@nestjs/common";
import {
  MembersPublicController,
  MembersController,
  MembersAdminController,
} from "./members.controller";
import { MembersService } from "./members.service";

@Module({
  controllers: [MembersPublicController, MembersController, MembersAdminController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
