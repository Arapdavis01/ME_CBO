import { Injectable, Logger } from "@nestjs/common";
import { authenticator } from "otplib";
import * as qrcode from "qrcode";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly issuer = process.env.TOTP_ISSUER ?? "ME_CBO";

  constructor(private readonly prisma: PrismaService) {
    authenticator.options = { window: 1, step: 30 }; // ±30s tolerance
  }

  async generateTotpSecret(email: string): Promise<{
    secret: string;
    otpauthUrl: string;
    qrDataUrl: string;
  }> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, this.issuer, secret);
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrDataUrl };
  }

  verifyTotp(secret: string, code: string): boolean {
    try {
      return authenticator.verify({ token: code, secret });
    } catch {
      return false;
    }
  }

  generateBackupCodes(count = 10): string[] {
    return Array.from({ length: count }, () =>
      randomBytes(5).toString("hex").toUpperCase(),
    );
  }

  async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((c) => argon2.hash(c, { type: argon2.argon2id })));
  }

  async consumeBackupCode(
    userId: string,
    submitted: string,
    storedHashes: string[],
  ): Promise<boolean> {
    for (let i = 0; i < storedHashes.length; i++) {
      const ok = await argon2.verify(storedHashes[i]!, submitted);
      if (ok) {
        const remaining = storedHashes.filter((_, idx) => idx !== i);
        await this.prisma.user.update({
          where: { id: userId },
          data: { mfaBackupCodes: { set: remaining } },
        });
        return true;
      }
    }
    return false;
  }
}
