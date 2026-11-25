import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { AnnouncementsService } from "./announcements.service";
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "./dto/announcements.dto";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessClaims } from "../auth/token.service";

/** Admin management of site-wide notices. */
@ApiTags("announcements")
@ApiCookieAuth("me_access")
@Controller("announcements")
@RequirePermissions("announcements:manage")
export class AnnouncementsController {
  constructor(private readonly items: AnnouncementsService) {}

  @Get()
  async list() {
    return { items: await this.items.list() };
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAnnouncementDto, @CurrentUser() claims: AccessClaims) {
    return { announcement: await this.items.create(dto, claims.sub) };
  }

  @Patch(":id")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { announcement: await this.items.update(id, dto, claims.sub) };
  }

  @Delete(":id")
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.items.remove(id, claims.sub);
  }
}
