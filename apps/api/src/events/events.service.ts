import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { AuditService } from "../audit/audit.service";
import type { Event, Prisma } from "@prisma/client";
import type {
  CreateEventDto,
  UpdateEventDto,
  ListEventsDto,
  CreateProofDto,
  EventResponse,
} from "./dto/event.dto";
import { randomBytes } from "node:crypto";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  /* ─────────────────────────────────────────────────────────── */
  /*  List                                                      */
  /* ─────────────────────────────────────────────────────────── */
  async list(dto: ListEventsDto, userId: string | null): Promise<EventResponse[]> {
    const where: Prisma.EventWhereInput = {
      ...(dto.category ? { category: dto.category } : {}),
      ...(dto.status ? { status: dto.status } : { status: { not: "DRAFT" } }),
    };

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: {
        rsvps: userId ? { where: { userId } } : false,
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
      take: 200,
    });

    return events.map((e) => this.toResponse(e, e.rsvps?.[0]?.status ?? null));
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Detail                                                    */
  /* ─────────────────────────────────────────────────────────── */
  async detail(id: string, userId: string | null): Promise<EventResponse> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        rsvps: userId ? { where: { userId } } : false,
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
    });
    if (!event) throw new NotFoundException("Event not found");
    if (event.status === "DRAFT" && !userId) throw new NotFoundException("Event not found");
    return this.toResponse(event, event.rsvps?.[0]?.status ?? null);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Create                                                    */
  /* ─────────────────────────────────────────────────────────── */
  async create(dto: CreateEventDto, actorId: string): Promise<EventResponse> {
    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException("endsAt must be after startsAt");
    }

    const checkInCode = await this.generateUniqueCheckInCode();
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        lat: dto.lat,
        lng: dto.lng,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        category: dto.category,
        capacity: dto.capacity,
        coverImageUrl: dto.coverImageUrl ?? null,
        checkInCode,
        createdById: actorId,
        status: "DRAFT",
      },
    });

    void this.audit.record({
      actorId,
      action: "events.create",
      target: event.id,
      metadata: { title: event.title },
    });

    return this.toResponse(event, null);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Update                                                    */
  /* ─────────────────────────────────────────────────────────── */
  async update(
    id: string,
    dto: UpdateEventDto,
    actor: { id: string; role: string },
  ): Promise<EventResponse> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Event not found");

    const isAdmin = ["SUPER_ADMIN", "OPERATIONS_ADMIN"].includes(actor.role);
    if (!isAdmin && existing.createdById !== actor.id) {
      throw new ForbiddenException("You can only edit events you created");
    }

    const starts = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt;
    const ends = dto.endsAt ? new Date(dto.endsAt) : existing.endsAt;
    if (ends <= starts) throw new BadRequestException("endsAt must be after startsAt");

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.startsAt !== undefined && { startsAt: starts }),
        ...(dto.endsAt !== undefined && { endsAt: ends }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    void this.audit.record({
      actorId: actor.id,
      action: "events.update",
      target: id,
      metadata: { fields: Object.keys(dto) },
    });

    return this.toResponse(updated, null);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  RSVP                                                      */
  /* ─────────────────────────────────────────────────────────── */
  async rsvp(eventId: string, userId: string): Promise<EventResponse> {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { rsvps: { where: { status: "GOING" } } } } },
      });
      if (!event) throw new NotFoundException("Event not found");
      if (event.status !== "PUBLISHED" && event.status !== "ONGOING") {
        throw new BadRequestException("Event is not open for RSVP");
      }

      const going = event._count.rsvps;
      const status = going < event.capacity ? "GOING" : "WAITLIST";

      await tx.rsvp.upsert({
        where: { eventId_userId: { eventId, userId } },
        create: { eventId, userId, status },
        update: { status },
      });

      return this.detailWithinTx(tx, eventId, userId);
    });
  }

  async cancelRsvp(eventId: string, userId: string): Promise<EventResponse> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.rsvp.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!existing) throw new NotFoundException("No RSVP found");

      const wasGoing = existing.status === "GOING";
      await tx.rsvp.update({
        where: { eventId_userId: { eventId, userId } },
        data: { status: "CANCELLED" },
      });

      if (wasGoing) {
        const next = await tx.rsvp.findFirst({
          where: { eventId, status: "WAITLIST" },
          orderBy: { createdAt: "asc" },
        });
        if (next) {
          await tx.rsvp.update({
            where: { id: next.id },
            data: { status: "GOING" },
          });
        }
      }

      return this.detailWithinTx(tx, eventId, userId);
    });
  }

  private async detailWithinTx(
    tx: Prisma.TransactionClient,
    eventId: string,
    userId: string,
  ): Promise<EventResponse> {
    const event = await tx.event.findUniqueOrThrow({
      where: { id: eventId },
      include: {
        rsvps: { where: { userId } },
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
    });
    return this.toResponse(event, event.rsvps?.[0]?.status ?? null);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Check-in                                                  */
  /* ─────────────────────────────────────────────────────────── */
  async checkIn(
    eventId: string,
    token: string,
    userId: string,
  ): Promise<{ alreadyCheckedIn: boolean }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, checkInCode: true, status: true },
    });
    if (!event) throw new NotFoundException("Event not found");
    if (event.status === "CANCELLED") throw new BadRequestException("Event cancelled");
    if (token.trim().toUpperCase() !== event.checkInCode.toUpperCase()) {
      throw new BadRequestException("Invalid check-in code");
    }

    const existing = await this.prisma.checkIn.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) return { alreadyCheckedIn: true };

    await this.prisma.checkIn.create({
      data: { eventId, userId, method: "code" },
    });
    void this.audit.record({
      actorId: userId,
      action: "events.checkin",
      target: eventId,
    });
    return { alreadyCheckedIn: false };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Proof of work (offline-safe, idempotent)                  */
  /* ─────────────────────────────────────────────────────────── */
  async uploadProof(
    eventId: string,
    userId: string,
    dto: CreateProofDto,
  ): Promise<{ proofId: string; alreadyExisted: boolean }> {
    const existing = await this.prisma.proofOfWork.findUnique({
      where: { clientId: dto.clientId },
    });
    if (existing) {
      return { proofId: existing.id, alreadyExisted: true };
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });
    if (!event) throw new NotFoundException("Event not found");

    const { buffer, mimeType } = await this.decodeImage(dto.photoDataUrl);

    const upload = await this.storage.upload({
      buffer,
      mimeType,
      filename: `proof-${dto.clientId}.${mimeType.split("/")[1] ?? "jpg"}`,
      folder: `events/${eventId}/proofs`,
    });

    const proof = await this.prisma.proofOfWork.create({
      data: {
        clientId: dto.clientId,
        eventId,
        userId,
        photoUrl: upload.url,
        photoKey: upload.key,
        lat: dto.lat,
        lng: dto.lng,
        notes: dto.notes ?? null,
        capturedAt: new Date(dto.capturedAt),
      },
    });

    void this.audit.record({
      actorId: userId,
      action: "events.proof.upload",
      target: proof.id,
      metadata: { eventId, size: upload.size },
    });

    return { proofId: proof.id, alreadyExisted: false };
  }

  async listPendingProofs(eventId: string) {
    return this.prisma.proofOfWork.findMany({
      where: { eventId, status: "PENDING" },
      orderBy: { capturedAt: "asc" },
      select: {
        id: true, photoUrl: true, lat: true, lng: true,
        notes: true, capturedAt: true, userId: true, clientId: true,
      },
    });
  }

  async reviewProof(
    proofId: string,
    actorId: string,
    decision: "VERIFIED" | "REJECTED",
  ) {
    const proof = await this.prisma.proofOfWork.update({
      where: { id: proofId },
      data: { status: decision, reviewedById: actorId, reviewedAt: new Date() },
    });
    void this.audit.record({
      actorId,
      action: `events.proof.${decision.toLowerCase()}`,
      target: proofId,
    });
    return { ok: true };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Helpers                                                   */
  /* ─────────────────────────────────────────────────────────── */
  private toResponse(
    e: Event & { _count?: { rsvps: number } },
    myRsvp: "GOING" | "WAITLIST" | "CANCELLED" | null,
  ): EventResponse {
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      site: { lat: e.lat, lng: e.lng },
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
      status: e.status,
      category: e.category,
      capacity: e.capacity,
      attending: e._count?.rsvps ?? 0,
      myRsvp:
        myRsvp === "GOING"
          ? "GOING"
          : myRsvp === "WAITLIST"
            ? "WAITLIST"
            : "NONE",
      coverImageUrl: e.coverImageUrl,
    };
  }

  private async generateUniqueCheckInCode(): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
      const code = `MECBO-${year}-${suffix}`;
      const clash = await this.prisma.event.findUnique({ where: { checkInCode: code } });
      if (!clash) return code;
    }
    throw new Error("Could not generate unique check-in code");
  }

  private async decodeImage(dataUrl: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new BadRequestException("Could not fetch image");
      const mimeType = res.headers.get("content-type") ?? "image/jpeg";
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 8 * 1024 * 1024) throw new BadRequestException("Image too large (max 8 MB)");
      return { buffer: buf, mimeType };
    }

    const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
    if (!match || !match[1] || !match[2]) {
      throw new BadRequestException("Invalid image data URL");
    }
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 8 * 1024 * 1024) throw new BadRequestException("Image too large (max 8 MB)");
    return { buffer, mimeType: match[1] };
  }
}
