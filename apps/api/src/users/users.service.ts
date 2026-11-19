import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      select: {
        id: true, fullName: true, email: true, role: true,
        status: true, mfaEnabled: true,
        lastLoginAt: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async setRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, fullName: true, email: true, role: true },
    });
  }

  async suspend(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: "SUSPENDED" },
      select: { id: true, status: true },
    });
  }

  async reactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: "ACTIVE" },
      select: { id: true, status: true },
    });
  }
}
