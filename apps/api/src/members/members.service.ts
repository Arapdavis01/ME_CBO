import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EmailService } from "../email/email.service";
import { PasswordService } from "../auth/password.service";
import { createHash, randomBytes } from "node:crypto";
import type { Prisma, Role } from "@prisma/client";
import type {
  SubmitApplicationDto,
  RejectApplicationDto,
  DirectoryQueryDto,
  UpdateProfileDto,
  ApplicationResponse,
  MemberResponse,
  MemberDetailResponse,
} from "./dto/members.dto";

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly email: EmailService,
    private readonly passwords: PasswordService,
  ) {}

  /* ─────────────────────────────────────────────────────────── */
  /*  Public: submit an application                             */
  /* ─────────────────────────────────────────────────────────── */
  async submitApplication(dto: SubmitApplicationDto): Promise<{ id: string }> {
    const email = dto.email.toLowerCase();

    const existingApp = await this.prisma.membershipApplication.findFirst({
      where: { email, status: "PENDING" },
    });
    if (existingApp) {
      throw new BadRequestException("An application from this email is already pending review");
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException("A member with this email already exists");
    }

    const app = await this.prisma.membershipApplication.create({
      data: {
        fullName: dto.fullName,
        email,
        phone: dto.phone,
        motivation: dto.motivation,
        skills: dto.skills ?? [],
      },
    });

    void this.audit.record({
      action: "members.application.submit",
      target: app.id,
      metadata: { email },
    });

    return { id: app.id };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Admin: list applications                                  */
  /* ─────────────────────────────────────────────────────────── */
  async listApplications(status?: "PENDING" | "APPROVED" | "REJECTED"): Promise<ApplicationResponse[]> {
    const apps = await this.prisma.membershipApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { submittedAt: "desc" },
    });
    return apps.map(this.toApplicationResponse);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Admin: approve                                            */
  /* ─────────────────────────────────────────────────────────── */
  async approveApplication(appId: string, actorId: string): Promise<ApplicationResponse> {
    const app = await this.prisma.membershipApplication.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException("Application not found");
    if (app.status !== "PENDING") throw new BadRequestException(`Application already ${app.status.toLowerCase()}`);

    // Create the user with a random temporary password (they'll reset it via email)
    const tempPassword = randomBytes(16).toString("hex");
    const passwordHash = await this.passwords.hash(tempPassword);

    const user = await this.prisma.user.create({
      data: {
        email: app.email,
        fullName: app.fullName,
        phone: app.phone,
        passwordHash,
        role: "MEMBER",
        status: "PENDING", // becomes ACTIVE after email verification
        skills: app.skills,
        motivation: app.motivation,
      },
    });

    const updated = await this.prisma.membershipApplication.update({
      where: { id: appId },
      data: {
        status: "APPROVED",
        reviewedById: actorId,
        reviewedAt: new Date(),
        userId: user.id,
      },
    });

    // Create email-verification token + send email
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const siteUrl = process.env.APP_ORIGIN ?? "http://localhost:3000";
    const verifyUrl = `${siteUrl}/verify-email?token=${token}`;
    void this.email
      .sendVerification(user.email, user.fullName, verifyUrl)
      .catch((err) => this.logger.error(`Verification email failed: ${(err as Error).message}`));

    void this.audit.record({
      actorId,
      action: "members.application.approve",
      target: appId,
      metadata: { userId: user.id },
    });

    return this.toApplicationResponse(updated);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Admin: reject                                             */
  /* ─────────────────────────────────────────────────────────── */
  async rejectApplication(
    appId: string,
    actorId: string,
    dto: RejectApplicationDto,
  ): Promise<ApplicationResponse> {
    const app = await this.prisma.membershipApplication.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException("Application not found");
    if (app.status !== "PENDING") throw new BadRequestException(`Application already ${app.status.toLowerCase()}`);

    const updated = await this.prisma.membershipApplication.update({
      where: { id: appId },
      data: {
        status: "REJECTED",
        reviewedById: actorId,
        reviewedAt: new Date(),
        reviewNote: dto.note,
      },
    });

    void this.audit.record({
      actorId,
      action: "members.application.reject",
      target: appId,
      metadata: { note: dto.note },
    });

    return this.toApplicationResponse(updated);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Verify email → activates the account                      */
  /* ─────────────────────────────────────────────────────────── */
  async verifyEmail(token: string): Promise<{ ok: true }> {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const row = await this.prisma.emailVerification.findUnique({ where: { tokenHash } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { status: "ACTIVE", emailVerified: new Date() },
      }),
      this.prisma.emailVerification.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    void this.audit.record({
      actorId: row.userId,
      action: "auth.email.verified",
    });

    return { ok: true };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Directory (any authenticated member)                      */
  /* ─────────────────────────────────────────────────────────── */
  async directory(dto: DirectoryQueryDto): Promise<MemberResponse[]> {
    const where: Prisma.UserWhereInput = {
      status: "ACTIVE",
      ...(dto.role ? { role: dto.role as Role } : {}),
      ...(dto.skill ? { skills: { has: dto.skill } } : {}),
      ...(dto.q
        ? {
            OR: [
              { fullName: { contains: dto.q, mode: "insensitive" } },
              { email: { contains: dto.q, mode: "insensitive" } },
              { location: { contains: dto.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { fullName: "asc" },
      take: 200,
      select: {
        id: true, fullName: true, email: true, phone: true,
        role: true, status: true, createdAt: true,
        skills: true, location: true, avatarUrl: true,
      },
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      joinedAt: u.createdAt.toISOString(),
      skills: u.skills,
      location: u.location,
      avatarUrl: u.avatarUrl,
    }));
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Member detail + personal metrics                          */
  /* ─────────────────────────────────────────────────────────── */
  async memberDetail(userId: string): Promise<MemberDetailResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Member not found");

    const rows = await this.prisma.impactLog.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { value: true },
    });
    const m = { TREES_PLANTED: 0, WASTE_COLLECTED: 0, HOURS_VOLUNTEERED: 0, EVENT_ATTENDED: 0, CARBON_OFFSET: 0 };
    for (const r of rows) m[r.type] = r._sum.value ?? 0;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      joinedAt: user.createdAt.toISOString(),
      skills: user.skills,
      location: user.location,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      metrics: {
        treesPlanted: m.TREES_PLANTED,
        wasteCollectedKg: m.WASTE_COLLECTED,
        volunteerHours: m.HOURS_VOLUNTEERED,
        eventsAttended: m.EVENT_ATTENDED,
      },
    };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Self profile update                                       */
  /* ─────────────────────────────────────────────────────────── */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<MemberResponse> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.skills !== undefined && { skills: { set: dto.skills } }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
    });

    void this.audit.record({
      actorId: userId,
      action: "members.profile.update",
      target: userId,
      metadata: { fields: Object.keys(dto) },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      joinedAt: user.createdAt.toISOString(),
      skills: user.skills,
      location: user.location,
      avatarUrl: user.avatarUrl,
    };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Helpers                                                   */
  /* ─────────────────────────────────────────────────────────── */
  private toApplicationResponse(a: {
    id: string; fullName: string; email: string; phone: string;
    motivation: string; skills: string[]; submittedAt: Date;
    status: "PENDING" | "APPROVED" | "REJECTED"; reviewNote: string | null;
  }): ApplicationResponse {
    return {
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      phone: a.phone,
      motivation: a.motivation,
      skills: a.skills,
      submittedAt: a.submittedAt.toISOString(),
      status: a.status,
      reviewNote: a.reviewNote,
    };
  }
}
