import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { InventoryItem, InventoryLoan } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type {
  CreateItemDto,
  RequestLoanDto,
  UpdateItemDto,
} from "./dto/inventory.dto";

export type ItemResponse = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
  quantityTotal: number;
  quantityAvailable: number;
};

export type LoanResponse = {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  requesterName: string;
  quantity: number;
  status: InventoryLoan["status"];
  purpose: string | null;
  neededBy: string | null;
  createdAt: string;
  decidedAt: string | null;
  returnedAt: string | null;
};

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Quantity currently out on approved, not-yet-returned loans, per item. */
  private async outByItem(itemIds?: string[]): Promise<Map<string, number>> {
    const rows = await this.prisma.inventoryLoan.groupBy({
      by: ["itemId"],
      where: {
        status: "APPROVED",
        ...(itemIds ? { itemId: { in: itemIds } } : {}),
      },
      _sum: { quantity: true },
    });
    return new Map(rows.map((r) => [r.itemId, r._sum.quantity ?? 0]));
  }

  private toItem(i: InventoryItem, out: number): ItemResponse {
    return {
      id: i.id,
      name: i.name,
      category: i.category,
      description: i.description,
      location: i.location,
      quantityTotal: i.quantityTotal,
      quantityAvailable: Math.max(0, i.quantityTotal - out),
    };
  }

  async listItems(): Promise<ItemResponse[]> {
    const items = await this.prisma.inventoryItem.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 500,
    });
    const out = await this.outByItem(items.map((i) => i.id));
    return items.map((i) => this.toItem(i, out.get(i.id) ?? 0));
  }

  async createItem(dto: CreateItemDto, actorId: string): Promise<ItemResponse> {
    const item = await this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        category: dto.category || "General",
        description: dto.description ?? null,
        location: dto.location ?? null,
        quantityTotal: dto.quantityTotal,
      },
    });
    void this.audit.record({
      actorId,
      action: "inventory.item.create",
      target: item.id,
      metadata: { name: item.name },
    });
    return this.toItem(item, 0);
  }

  async updateItem(id: string, dto: UpdateItemDto, actorId: string): Promise<ItemResponse> {
    const existing = await this.prisma.inventoryItem.findFirst({ where: { id, active: true } });
    if (!existing) throw new NotFoundException("Item not found");

    const out = (await this.outByItem([id])).get(id) ?? 0;
    if (dto.quantityTotal !== undefined && dto.quantityTotal < out) {
      throw new BadRequestException(
        `${out} are currently checked out, so the total cannot be below ${out}.`,
      );
    }

    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category || "General" }),
        ...(dto.description !== undefined && { description: dto.description || null }),
        ...(dto.location !== undefined && { location: dto.location || null }),
        ...(dto.quantityTotal !== undefined && { quantityTotal: dto.quantityTotal }),
      },
    });
    void this.audit.record({
      actorId,
      action: "inventory.item.update",
      target: id,
      metadata: { fields: Object.keys(dto) },
    });
    return this.toItem(item, out);
  }

  /** Soft delete, so past loan history keeps its item name. */
  async removeItem(id: string, actorId: string): Promise<{ ok: true }> {
    const out = (await this.outByItem([id])).get(id) ?? 0;
    if (out > 0) {
      throw new BadRequestException("This item is checked out. Mark it returned first.");
    }
    const res = await this.prisma.inventoryItem.updateMany({
      where: { id, active: true },
      data: { active: false },
    });
    if (res.count === 0) throw new NotFoundException("Item not found");
    void this.audit.record({ actorId, action: "inventory.item.remove", target: id });
    return { ok: true };
  }

  /* ─── Loans ─────────────────────────────────────────────── */

  async requestLoan(itemId: string, dto: RequestLoanDto, userId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, active: true },
    });
    if (!item) throw new NotFoundException("Item not found");

    const out = (await this.outByItem([itemId])).get(itemId) ?? 0;
    if (dto.quantity > item.quantityTotal - out) {
      throw new BadRequestException(
        `Only ${Math.max(0, item.quantityTotal - out)} available right now.`,
      );
    }

    const loan = await this.prisma.inventoryLoan.create({
      data: {
        itemId,
        userId,
        quantity: dto.quantity,
        purpose: dto.purpose ?? null,
        neededBy: dto.neededBy ? new Date(dto.neededBy) : null,
      },
    });
    void this.audit.record({
      actorId: userId,
      action: "inventory.loan.request",
      target: loan.id,
      metadata: { itemId, quantity: dto.quantity },
    });
    return loan;
  }

  private async decorate(loans: (InventoryLoan & { item: InventoryItem })[]): Promise<LoanResponse[]> {
    const userIds = [...new Set(loans.map((l) => l.userId))];
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true },
        })
      : [];
    const names = new Map(users.map((u) => [u.id, u.fullName]));
    return loans.map((l) => ({
      id: l.id,
      itemId: l.itemId,
      itemName: l.item.name,
      userId: l.userId,
      requesterName: names.get(l.userId) ?? "Unknown member",
      quantity: l.quantity,
      status: l.status,
      purpose: l.purpose,
      neededBy: l.neededBy?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
      decidedAt: l.decidedAt?.toISOString() ?? null,
      returnedAt: l.returnedAt?.toISOString() ?? null,
    }));
  }

  async myLoans(userId: string): Promise<LoanResponse[]> {
    const loans = await this.prisma.inventoryLoan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { item: true },
    });
    return this.decorate(loans);
  }

  /** Requests waiting for a decision, plus items currently out. */
  async openLoans(): Promise<LoanResponse[]> {
    const loans = await this.prisma.inventoryLoan.findMany({
      where: { status: { in: ["REQUESTED", "APPROVED"] } },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: { item: true },
    });
    return this.decorate(loans);
  }

  async decide(id: string, decision: "APPROVED" | "REJECTED", actorId: string) {
    const loan = await this.prisma.$transaction(async (tx) => {
      const current = await tx.inventoryLoan.findUnique({
        where: { id },
        include: { item: true },
      });
      if (!current) throw new NotFoundException("Request not found");
      if (current.status !== "REQUESTED") {
        throw new BadRequestException("This request has already been handled.");
      }

      if (decision === "APPROVED") {
        const agg = await tx.inventoryLoan.aggregate({
          where: { itemId: current.itemId, status: "APPROVED" },
          _sum: { quantity: true },
        });
        const out = agg._sum.quantity ?? 0;
        if (current.quantity > current.item.quantityTotal - out) {
          throw new BadRequestException("Not enough stock left to approve this request.");
        }
      }

      return tx.inventoryLoan.update({
        where: { id },
        data: { status: decision, decidedById: actorId, decidedAt: new Date() },
      });
    });

    void this.audit.record({
      actorId,
      action: `inventory.loan.${decision.toLowerCase()}`,
      target: id,
    });
    return loan;
  }

  async markReturned(id: string, actorId: string) {
    const current = await this.prisma.inventoryLoan.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Loan not found");
    if (current.status !== "APPROVED") {
      throw new BadRequestException("Only checked-out items can be marked returned.");
    }
    const loan = await this.prisma.inventoryLoan.update({
      where: { id },
      data: { status: "RETURNED", returnedAt: new Date() },
    });
    void this.audit.record({ actorId, action: "inventory.loan.return", target: id });
    return loan;
  }
}
