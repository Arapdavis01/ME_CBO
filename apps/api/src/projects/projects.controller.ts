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
import { ProjectsService } from "./projects.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto/projects.dto";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessClaims } from "../auth/token.service";

/** Admin management of projects. Everything here needs "projects:manage". */
@ApiTags("projects")
@ApiCookieAuth("me_access")
@Controller("projects")
@RequirePermissions("projects:manage")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list() {
    return { items: await this.projects.list() };
  }

  @Get(":id")
  async get(@Param("id", new ParseUUIDPipe()) id: string) {
    return { project: await this.projects.get(id) };
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateProjectDto, @CurrentUser() claims: AccessClaims) {
    return { project: await this.projects.create(dto, claims.sub) };
  }

  @Patch(":id")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() claims: AccessClaims,
  ) {
    return { project: await this.projects.update(id, dto, claims.sub) };
  }

  @Delete(":id")
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() claims: AccessClaims,
  ) {
    return this.projects.remove(id, claims.sub);
  }
}
