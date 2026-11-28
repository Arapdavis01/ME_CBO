import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma, SwapListing } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type {
  CreateListingDto,
  ListSwapDto,
  SwapRequestDto,
  UpdateListingDto,
} from "./dto/swap.dto";

type Actor = { sub: string; role: string };

export type ListingResponse = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  wanted: string | null;
  location: string | null;
  imageUrl: string | null;
  status: SwapListing["status"];
  ownerName: string;
  mine: boolean;
  /** Only filled for the owner. */
  requestCount: number;
  /** True when the signed-in member has already asked for this item. */
  requested: boolean;
  createdAt: string;
};

const isModerator = (role: string) =>
  role === "SUPER_ADMIN" || role === "OPERATIONS_ADMIN";

@Injectable()
export class SwapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async names(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullName: true },
    });
    return new Map(users.map((u) => [u.id, u.fullName]));
  }

  private toResponse(
    l: SwapListing,
    viewerId: string,
    names: Map<string, string>,
    counts: Map<string, number>,
    requested: Set<string>,
  ): ListingResponse {
    const mine = l.ownerId === viewerId;
    return {
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      wanted: l.wanted,
      location: l.location,
      imageUrl: l.imageUrl,
      status: l.status,
      ownerName: names.get(l.ownerId) ?? "A member",
      mine,
      requestCount: mine ? (counts.get(l.id) ?? 0) : 0,
      requested: requested.has(l.id),
      createdAt: l.createdAt.toISOString(),
    };
  }

  private async decorate(listings: SwapListing[], viewerId: string) {
    const ids = listings.map((l) => l.id);
    const [names, counts, mineReq] = await Promise.all([
      this.names([...new Set(listings.map((l) => l.ownerId))]),
      ids.length
        ? this.prisma.swapRequest.groupBy({
            by: ["listingId"],
            where: { listingId: { in: ids } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      ids.length
        ? this.prisma.swapRequest.findMany({
            where: { listingId: { in: ids }, requesterId: viewerId },
            select: { listingId: true },
          })
        : Promise.resolve([]),
    ]);
    const countMap = new Map(counts.map((c) => [c.listingId, c._count._all]));
    const requested = new Set(mineReq.map((r) => r.listingId));
    return listings.map((l) => this.toResponse(l, viewerId, names, countMap, requested));
  }

  async list(dto: ListSwapDto, viewerId: string): Promise<ListingResponse[]> {
    const where: Prisma.SwapListingWhereInput = {
      status: "OPEN",
      ...(dto.category ? { category: dto.category } : {}),
      ...(dto.q
        ? {
            OR: [
              { title: { contains: dto.q, mode: "insensitive" } },
              { description: { contains: dto.q, mode: "insensitive" } },
              { wanted: { contains: dto.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const rows = await this.prisma.swapListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return this.decorate(rows, viewerId);
  }

  async create(dto: CreateListingDto, ownerId: string): Promise<ListingResponse> {
    const row = await this.prisma.swapListing.create({
      data: {
        ownerId,
        title: dto.title,
        category: dto.category,
        description: dto.description ?? null,
        wanted: dto.wanted ?? null,
        location: dto.location ?? null,
        imageUrl: dto.imageUrl ?? null,
      },
    });
    void this.audit.record({
      actorId: ownerId,
      action: "swap.create",
      target: row.id,
      metadata: { title: row.title },
    });
    return (await this.decorate([row], ownerId))[0]!;
  }

  private async ownedOrModerated(id: string, actor: Actor): Promise<SwapListing> {
    const row = await this.prisma.swapListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Listing not found");
    if (row.ownerId !== actor.sub && !isModerator(actor.role)) {
      throw new ForbiddenException("Only the owner can change this listing");
    }
    return row;
  }

  async update(id: string, dto: UpdateListingDto, actor: Actor): Promise<ListingResponse> {
    await this.ownedOrModerated(id, actor);
    const row = await this.prisma.swapListing.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description || null }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.wanted !== undefined && { wanted: dto.wanted || null }),
        ...(dto.location !== undefined && { location: dto.location || null }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
    void this.audit.record({
      actorId: actor.sub,
      action: "swap.update",
      target: id,
      metadata: { fields: Object.keys(dto) },
    });
    return (await this.decorate([row], actor.sub))[0]!;
  }

  async remove(id: string, actor: Actor): Promise<{ ok: true }> {
    await this.ownedOrModerated(id, actor);
    await this.prisma.swapListing.update({ where: { id }, data: { status: "CANCELLED" } });
    void this.audit.record({ actorId: actor.sub, action: "swap.remove", target: id });
    return { ok: true };
  }

  async request(id: string, dto: SwapRequestDto, requesterId: string): Promise<{ ok: true }> {
    const listing = await this.prisma.swapListing.findUnique({ where: { id } });
    if (!listing || listing.status !== "OPEN") {
      throw new NotFoundException("This item is no longer available");
    }
    if (listing.ownerId === requesterId) {
      throw new BadRequestException("This is your own listing");
    }
    await this.prisma.swapRequest.upsert({
      where: { listingId_requesterId: { listingId: id, requesterId } },
      create: { listingId: id, requesterId, message: dto.message ?? null },
      update: { message: dto.message ?? null },
    });
    void this.audit.record({
      actorId: requesterId,
      action: "swap.request",
      target: id,
    });
    return { ok: true };
  }

  /** The owner (or a moderator) sees who asked, with the phone number they registered. */
  async requestsFor(id: string, actor: Actor) {
    await this.ownedOrModerated(id, actor);
    const rows = await this.prisma.swapRequest.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "asc" },
    });
    const users = rows.length
      ? await this.prisma.user.findMany({
          where: { id: { in: rows.map((r) => r.requesterId) } },
          select: { id: true, fullName: true, phone: true },
        })
      : [];
    const byId = new Map(users.map((u) => [u.id, u]));
    return rows.map((r) => ({
      id: r.id,
      requesterName: byId.get(r.requesterId)?.fullName ?? "A member",
      phone: byId.get(r.requesterId)?.phone ?? null,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
