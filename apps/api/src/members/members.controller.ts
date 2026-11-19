import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiCookieAuth, ApiOperation } from "@nestjs/swagger";
import { MembersService } from "./members.service";
import {
  SubmitApplicationDto,
  RejectApplicationDto,
  DirectoryQueryDto,
  UpdateProfileDto,
} from "./dto/members.dto";
import { Public } from "../auth/decorators/public.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessClaims } from "../auth/token.service";

/* ─── Public routes ────────────────────────────────────────── */

@ApiTags("members")
@Controller("members")
export class MembersPublicController {
  constructor(private readonly members: MembersService) {}

  @Public()
  @Post("applications")
  @ApiOperation({ summary: "Submit a membership application" })
  async submit(@Body() dto: SubmitApplicationDto) {
    return this.members.submitApplication(dto);
  }

  @Public()
  @Post("verify-email")
  @ApiOperation({ summary: "Verify email via token" })
  async verify(@Body() body: { token: string }) {
    return this.members.verifyEmail(body.token);
  }
}

/* ─── Authenticated routes ─────────────────────────────────── */

@ApiTags("members")
@ApiCookieAuth("me_access")
@Controller("members")
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  @ApiOperation({ summary: "Directory — search + filters" })
  async list(@Query() q: DirectoryQueryDto) {
    const items = await this.members.directory(q);
    return { items };
  }

  @Get("me")
  @ApiOperation({ summary: "My member profile with impact metrics" })
  async me(@CurrentUser() claims: AccessClaims) {
    const member = await this.members.memberDetail(claims.sub);
    return { member };
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const member = await this.members.memberDetail(id);
    return { member };
  }

  @Patch("me")
  async updateMe(@CurrentUser() claims: AccessClaims, @Body() dto: UpdateProfileDto) {
    const member = await this.members.updateProfile(claims.sub, dto);
    return { member };
  }
}

/* ─── Admin routes ─────────────────────────────────────────── */

@ApiTags("members")
@ApiCookieAuth("me_access")
@Controller("members/applications")
export class MembersAdminController {
  constructor(private readonly members: MembersService) {}

  @Get()
  @RequirePermissions("members:approve")
  async list(@Query("status") status?: "PENDING" | "APPROVED" | "REJECTED") {
    const items = await this.members.listApplications(status);
    return { items };
  }

  @Post(":id/approve")
  @RequirePermissions("members:approve")
  async approve(@Param("id") id: string, @CurrentUser() claims: AccessClaims) {
    const application = await this.members.approveApplication(id, claims.sub);
    return { application };
  }

  @Post(":id/reject")
  @RequirePermissions("members:approve")
  async reject(
    @Param("id") id: string,
    @Body() dto: RejectApplicationDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    const application = await this.members.rejectApplication(id, claims.sub, dto);
    return { application };
  }
}
