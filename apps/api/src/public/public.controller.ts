import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { PublicService } from "./public.service";

/** Anyone can read these. They only ever return published, public-safe data. */
const CACHE = "public, max-age=30, s-maxage=60, stale-while-revalidate=300";

@ApiExcludeController()
@Public()
@Throttle({ default: { limit: 60, ttl: 60_000 } })
@Controller("public")
export class PublicController {
  constructor(private readonly content: PublicService) {}

  @Get("announcement")
  @Header("Cache-Control", "public, max-age=10, s-maxage=10")
  async announcement() {
    return { announcement: await this.content.announcement() };
  }

  @Get("events")
  @Header("Cache-Control", CACHE)
  events() {
    return this.content.events();
  }

  @Get("events/:id")
  @Header("Cache-Control", CACHE)
  async event(@Param("id", new ParseUUIDPipe()) id: string) {
    const event = await this.content.event(id);
    if (!event) throw new NotFoundException("Event not found");
    return { event };
  }

  @Get("projects")
  @Header("Cache-Control", CACHE)
  async projects() {
    return { items: await this.content.projects() };
  }

  @Get("projects/:slug")
  @Header("Cache-Control", CACHE)
  async project(@Param("slug") slug: string) {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) throw new NotFoundException("Project not found");
    const project = await this.content.project(slug);
    if (!project) throw new NotFoundException("Project not found");
    return { project };
  }
}
