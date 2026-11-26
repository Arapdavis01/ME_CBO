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
import { InventoryService } from "./inventory.service";
import {
  CreateItemDto,
  DecisionDto,
  RequestLoanDto,
  UpdateItemDto,
} from "./dto/inventory.dto";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessClaims } from "../auth/token.service";

@ApiTags("inventory")
@ApiCookieAuth("me_access")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  /* ─── Equipment ─────────────────────────────────────────── */

  @Get("items")
  @RequirePermissions("inventory:read")
  async items() {
    return { items: await this.inventory.listItems() };
  }

  @Post("items")
  @HttpCode(201)
  @RequirePermissions("inventory:manage")
  async createItem(@Body() dto: CreateItemDto, @CurrentUser() claims: AccessClaims) {
    return { item: await this.inventory.createItem(dto, claims.sub) };
  }

  @Patch("items/:id")
  @RequirePermissions("inventory:manage")
  async updateItem(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { item: await this.inventory.updateItem(id, dto, claims.sub) };
  }

  @Delete("items/:id")
  @RequirePermissions("inventory:manage")
  async removeItem(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.inventory.removeItem(id, claims.sub);
  }

  /* ─── Check-out requests ────────────────────────────────── */

  @Post("items/:id/request")
  @HttpCode(201)
  @RequirePermissions("inventory:checkout")
  async request(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: RequestLoanDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { loan: await this.inventory.requestLoan(id, dto, claims.sub) };
  }

  @Get("loans/mine")
  @RequirePermissions("inventory:read")
  async mine(@CurrentUser() claims: AccessClaims) {
    return { items: await this.inventory.myLoans(claims.sub) };
  }

  @Get("loans")
  @RequirePermissions("inventory:approve")
  async openLoans() {
    return { items: await this.inventory.openLoans() };
  }

  @Patch("loans/:id/decision")
  @RequirePermissions("inventory:approve")
  async decide(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: DecisionDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { loan: await this.inventory.decide(id, dto.decision, claims.sub) };
  }

  @Post("loans/:id/return")
  @HttpCode(200)
  @RequirePermissions("inventory:approve")
  async markReturned(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { loan: await this.inventory.markReturned(id, claims.sub) };
  }
}
