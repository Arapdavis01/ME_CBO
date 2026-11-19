import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiCookieAuth } from "@nestjs/swagger";
import { EventsService } from "./events.service";
import {
  CreateEventDto,
  UpdateEventDto,
  ListEventsDto,
  CheckInDto,
  CreateProofDto,
  ReviewProofDto,
} from "./dto/event.dto";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { AccessClaims } from "../auth/token.service";

@ApiTags("events")
@ApiCookieAuth("me_access")
@Controller("events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /* ─────────────────────────────────────────────────────────── */
  /*  Public list                                               */
  /* ─────────────────────────────────────────────────────────── */
  @Public()
  @Get()
  @ApiOperation({ summary: "List events (public — omits drafts)" })
  async list(@Query() dto: ListEventsDto) {
    const items = await this.events.list(dto, null);
    return { items };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Detail                                                    */
  /* ─────────────────────────────────────────────────────────── */
  @Public()
  @Get(":id")
  async detail(
    @Param("id") id: string,
    @CurrentUser() claims: AccessClaims | undefined,
  ) {
    const event = await this.events.detail(id, claims?.sub ?? null);
    return { event };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Create / update                                           */
  /* ─────────────────────────────────────────────────────────── */
  @Post()
  @RequirePermissions("events:create")
  async create(@Body() dto: CreateEventDto, @CurrentUser() claims: AccessClaims) {
    const event = await this.events.create(dto, claims.sub);
    return { event };
  }

  @Patch(":id")
  @RequirePermissions("events:update")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    const event = await this.events.update(id, dto, {
      id: claims.sub,
      role: claims.role,
    });
    return { event };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  RSVP                                                      */
  /* ─────────────────────────────────────────────────────────── */
  @Post(":id/rsvp")
  async rsvp(@Param("id") id: string, @CurrentUser() claims: AccessClaims) {
    const event = await this.events.rsvp(id, claims.sub);
    return { event };
  }

  @Post(":id/rsvp/cancel")
  async cancelRsvp(@Param("id") id: string, @CurrentUser() claims: AccessClaims) {
    const event = await this.events.cancelRsvp(id, claims.sub);
    return { event };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Check-in                                                  */
  /* ─────────────────────────────────────────────────────────── */
  @Post(":id/checkin")
  @RequirePermissions("events:checkin")
  async checkIn(
    @Param("id") id: string,
    @Body() dto: CheckInDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.events.checkIn(id, dto.token, claims.sub);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Proof of work                                             */
  /* ─────────────────────────────────────────────────────────── */
  @Post(":id/proofs")
  async uploadProof(
    @Param("id") id: string,
    @Body() dto: CreateProofDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.events.uploadProof(id, claims.sub, dto);
  }

  @Get(":id/proofs/pending")
  @RequirePermissions("events:proof:verify")
  async pendingProofs(@Param("id") id: string) {
    const items = await this.events.listPendingProofs(id);
    return { items };
  }
}

/* ─── Proof review lives on its own controller ──────────────── */

@ApiTags("events")
@ApiCookieAuth("me_access")
@Controller("events/proofs")
export class ProofReviewController {
  constructor(private readonly events: EventsService) {}

  @Patch(":proofId/review")
  @RequirePermissions("events:proof:verify")
  async review(
    @Param("proofId") proofId: string,
    @Body() dto: ReviewProofDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.events.reviewProof(proofId, claims.sub, dto.decision);
  }
}
