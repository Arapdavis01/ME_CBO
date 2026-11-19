import { Module } from "@nestjs/common";
import { EventsController, ProofReviewController } from "./events.controller";
import { EventsService } from "./events.service";

@Module({
  controllers: [EventsController, ProofReviewController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
