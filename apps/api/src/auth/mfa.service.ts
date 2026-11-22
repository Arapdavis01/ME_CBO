import { Injectable, Logger } from "@nestjs/common";
import { authenticator } from "otplib";
import * as qrcode from "qrcode";
import * as argon2 from "argon2";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

const ENC_PREFIX = "enc:v1:";

/** Backup codes are high-entropy, so lighter hashing is enough and keeps login fast. */
const BACKUP_HASH_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 2 ** 14,
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly issuer = process.env.TOTP_ISSUER ?? "ME_CBO";
  private readonly key: Buffer | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    authenticator.options = { window: 1, step: 30 }; // ±30s tolerance

    // Optional at-rest encryption of TOTP secrets.
    // Generate a key:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    const raw = process.env.MFA_ENCRYPTION_KEY;
    if (raw) {
      const buf = Buffer.from(raw, "base64");
      if (buf.length !== 32) {
        throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
      }
      this.key = buf;
    } else {
      this.key = null;
      this.logger.warn(
        "MFA_ENCRYPTION_KEY is not set: TOTP secrets are stored unencrypted.",
      );
    }
  }

  /* ---------- secret encryption (AES-256-GCM) ---------- */

  encryptSecret(plain: string): string {
    if (!this.key) return plain;
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${ENC_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${data.toString("base64")}`;
  }

  /** Reads both encrypted and legacy plain-text values. */
  decryptSecret(stored: string): string {
    if (!stored.startsWith(ENC_PREFIX)) return stored;
    if (!this.key) {
      throw new Error("MFA_ENCRYPTION_KEY is required to read encrypted MFA secrets");
    }
    const [ivB64, tagB64, dataB64] = stored.slice(ENC_PREFIX.length).split(":");
    if (!ivB64 || !tagB64 || !dataB64) throw new Error("Malformed MFA secret");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      Buffer.from(ivB64, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  }

  /* ---------- TOTP ---------- */

  async generateTotpSecret(email: string): Promise<{
    secret: string;
    qrDataUrl: string;
  }> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, this.issuer, secret);
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
    return { secret, qrDataUrl };
  }

  /**
   * Verifies a 6-digit code. Each code can be used only once (replay protection).
   * `storedSecret` is the value from the database (encrypted or legacy plain text).
   */
  async verifyTotp(
    userId: string,
    storedSecret: string,
    code: string,
  ): Promise<boolean> {
    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) return false;

    let ok = false;
    try {
      ok = authenticator.verify({
        token: clean,
        secret: this.decryptSecret(storedSecret),
      });
    } catch (err) {
      this.logger.error(`TOTP verify failed: ${(err as Error).message}`);
      return false;
    }
    if (!ok) return false;

    try {
      const fresh = await this.redis.setNx(`mfa-used:${userId}:${clean}`, 90, "1");
      if (!fresh) return false; // same code already used
    } catch {
      this.logger.warn("Redis unavailable: TOTP replay protection skipped");
    }
    return true;
  }

  /* ---------- backup codes ---------- */

  generateBackupCodes(count = 10): string[] {
    return Array.from({ length: count }, () =>
      randomBytes(5).toString("hex").toUpperCase(),
    );
  }

  async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((c) => argon2.hash(c, BACKUP_HASH_OPTS)));
  }

  /** Accepts "a1b2c-3d4e5", "A1B2C 3D4E5" etc. Each code works once. */
  async consumeBackupCode(
    userId: string,
    submitted: string,
    storedHashes: string[],
  ): Promise<boolean> {
    const normalized = submitted.replace(/[\s-]/g, "").toUpperCase();
    if (!/^[A-F0-9]{10}$/.test(normalized)) return false;

    for (let i = 0; i < storedHashes.length; i++) {
      let ok = false;
      try {
        ok = await argon2.verify(storedHashes[i]!, normalized);
      } catch {
        ok = false;
      }
      if (!ok) continue;

      // Only succeeds if nobody changed the list meanwhile (no double spend).
      const remaining = storedHashes.filter((_, idx) => idx !== i);
      const res = await this.prisma.user.updateMany({
        where: { id: userId, mfaBackupCodes: { equals: storedHashes } },
        data: { mfaBackupCodes: { set: remaining } },
      });
      return res.count === 1;
    }
    return false;
  }
}
