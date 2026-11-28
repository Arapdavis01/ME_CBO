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
  Query,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { SwapService } from "./swap.service";
import {
  CreateListingDto,
  ListSwapDto,
  SwapRequestDto,
  UpdateListingDto,
} from "./dto/swap.dto";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessClaims } from "../auth/token.service";

@ApiTags("swap")
@ApiCookieAuth("me_access")
@Controller("swap")
export class SwapController {
  constructor(private readonly swap: SwapService) {}

  @Get()
  @RequirePermissions("swap:read")
  async list(@Query() q: ListSwapDto, @CurrentUser() claims: AccessClaims) {
    return { items: await this.swap.list(q, claims.sub) };
  }

  @Post()
  @HttpCode(201)
  @RequirePermissions("swap:create")
  async create(@Body() dto: CreateListingDto, @CurrentUser() claims: AccessClaims) {
    return { listing: await this.swap.create(dto, claims.sub) };
  }

  @Patch(":id")
  @RequirePermissions("swap:create")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { listing: await this.swap.update(id, dto, claims) };
  }

  @Delete(":id")
  @RequirePermissions("swap:create")
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.swap.remove(id, claims);
  }

  @Post(":id/requests")
  @HttpCode(201)
  @RequirePermissions("swap:create")
  async request(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: SwapRequestDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.swap.request(id, dto, claims.sub);
  }

  @Get(":id/requests")
  @RequirePermissions("swap:read")
  async requests(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { items: await this.swap.requestsFor(id, claims) };
  }
}
