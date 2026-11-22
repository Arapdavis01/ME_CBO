import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";

/** At most this many Argon2 operations run at once (each uses ~64 MB of memory). */
const MAX_CONCURRENT = 2;

@Injectable()
export class PasswordService {
  private readonly opts: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  };

  private active = 0;
  private readonly waiters: Array<() => void> = [];

  /** Hash of a random value, used to keep login timing the same for unknown emails. */
  private readonly dummyHash: Promise<string>;

  constructor() {
    this.dummyHash = argon2.hash(randomBytes(16).toString("hex"), this.opts);
  }

  private async acquire(): Promise<void> {
    if (this.active < MAX_CONCURRENT) {
      this.active++;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  private release(): void {
    const next = this.waiters.shift();
    if (next) next(); // hand the slot straight to the next waiter
    else this.active--;
  }

  private async limited<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  async hash(plain: string): Promise<string> {
    return this.limited(() => argon2.hash(plain, this.opts));
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return this.limited(async () => {
      try {
        return await argon2.verify(hash, plain);
      } catch {
        return false;
      }
    });
  }

  /** Call when the email does not exist, so the response is as slow as a real check. */
  async verifyDummy(plain: string): Promise<void> {
    await this.verify(await this.dummyHash, plain);
  }

  /** True if a stored hash uses weaker settings than the current ones. */
  needsRehash(hash: string): boolean {
    try {
      return argon2.needsRehash(hash, this.opts);
    } catch {
      return false;
    }
  }
}
