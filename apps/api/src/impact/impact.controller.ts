import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiCookieAuth, ApiOperation } from "@nestjs/swagger";
import { ImpactService } from "./impact.service";
import {
  CreateImpactLogDto,
  HistoryQueryDto,
  IssueCertificateDto,
} from "./dto/impact.dto";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { AccessClaims } from "../auth/token.service";

@ApiTags("impact")
@ApiCookieAuth("me_access")
@Controller("impact")
export class ImpactController {
  constructor(private readonly impact: ImpactService) {}

  /* ─── Personal ─────────────────────────────────────────────── */

  @Get("me")
  @ApiOperation({ summary: "My impact metrics" })
  async myMetrics(@CurrentUser() claims: AccessClaims) {
    const metrics = await this.impact.myMetrics(claims.sub);
    return { metrics };
  }

  @Get("history")
  async history(
    @CurrentUser() claims: AccessClaims,
    @Query() q: HistoryQueryDto,
  ) {
    const items = await this.impact.history(claims.sub, q.months ?? 6);
    return { items };
  }

  @Get("badges")
  async badges(@CurrentUser() claims: AccessClaims) {
    const items = await this.impact.badgesForUser(claims.sub);
    return { items };
  }

  /* ─── Log ──────────────────────────────────────────────────── */

  @Post("log")
  @RequirePermissions("impact:log")
  async log(@Body() dto: CreateImpactLogDto, @CurrentUser() claims: AccessClaims) {
    return this.impact.log(claims.sub, claims.sub, dto);
  }

  /* ─── Club (public counters) ───────────────────────────────── */

  @Public()
  @Get("club")
  async club() {
    const metrics = await this.impact.clubMetrics();
    return { metrics };
  }

  /* ─── Certificates ─────────────────────────────────────────── */

  @Get("certificates")
  async certificates(@CurrentUser() claims: AccessClaims) {
    const items = await this.impact.listCertificates(claims.sub);
    return { items };
  }

  @Get("certificates/:id")
  async certificateDetail(
    @Param("id") id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    const certificate = await this.impact.certificateDetail(claims.sub, id);
    return { certificate };
  }

  @Post("certificates")
  @RequirePermissions("impact:certificate:issue")
  async issueCertificate(
    @Body() dto: IssueCertificateDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    // Self-issue by default; admins can issue for others in a later batch
    const certificate = await this.impact.issueCertificate(claims.sub, claims.sub, dto);
    return { certificate };
  }
}
