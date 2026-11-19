import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomUUID } from "node:crypto";
import type { Role } from "@prisma/client";

export type AccessClaims = {
  sub: string;
  role: Role;
  mfa: boolean;
  typ: "access";
};

export type RefreshClaims = {
  sub: string;
  jti: string;   // refresh token row id
  fam: string;   // family id
  typ: "refresh";
};

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(private readonly jwt: JwtService) {
    this.accessSecret = this.must("JWT_ACCESS_SECRET");
    this.refreshSecret = this.must("JWT_REFRESH_SECRET");
    this.accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900);
    this.refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 2_592_000);
    this.issuer = process.env.JWT_ISSUER ?? "me-cbo";
    this.audience = process.env.JWT_AUDIENCE ?? "me-cbo-web";
  }

  private must(key: string): string {
    const v = process.env[key];
    if (!v || v.length < 32) {
      throw new Error(`${key} must be set to at least 32 characters`);
    }
    return v;
  }

  get accessTtlSeconds(): number { return this.accessTtl; }
  get refreshTtlSeconds(): number { return this.refreshTtl; }

  async signAccess(payload: Omit<AccessClaims, "typ">): Promise<string> {
    return this.jwt.signAsync(
      { ...payload, typ: "access" } satisfies AccessClaims,
      {
        secret: this.accessSecret,
        expiresIn: this.accessTtl,
        issuer: this.issuer,
        audience: this.audience,
      },
    );
  }

  async signRefresh(payload: Omit<RefreshClaims, "typ">): Promise<string> {
    return this.jwt.signAsync(
      { ...payload, typ: "refresh" } satisfies RefreshClaims,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshTtl,
        issuer: this.issuer,
        audience: this.audience,
      },
    );
  }

  async verifyAccess(token: string): Promise<AccessClaims> {
    const claims = await this.jwt.verifyAsync<AccessClaims>(token, {
      secret: this.accessSecret,
      issuer: this.issuer,
      audience: this.audience,
    });
    if (claims.typ !== "access") throw new Error("Wrong token type");
    return claims;
  }

  async verifyRefresh(token: string): Promise<RefreshClaims> {
    const claims = await this.jwt.verifyAsync<RefreshClaims>(token, {
      secret: this.refreshSecret,
      issuer: this.issuer,
      audience: this.audience,
    });
    if (claims.typ !== "refresh") throw new Error("Wrong token type");
    return claims;
  }

  newFamilyId(): string { return randomUUID(); }

  hashToken(raw: string): string {
    return createHash("sha256").update(raw).digest("hex");
  }
}
