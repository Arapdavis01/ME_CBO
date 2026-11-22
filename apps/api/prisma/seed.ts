import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

/**
 * Creates the first SUPER_ADMIN.
 *
 * Required environment variables (never commit real values):
 *   SEED_ADMIN_EMAIL      e.g. chair@mecbo.org
 *   SEED_ADMIN_PASSWORD   at least 12 characters
 * Optional:
 *   SEED_ADMIN_NAME       default "ME_CBO Chairperson"
 *   SEED_RESET_PASSWORD   "true" to overwrite the password of an existing account
 *
 * The admin must enrol in two-factor authentication on first login.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME?.trim() || "ME_CBO Chairperson";
  const resetPassword = process.env.SEED_RESET_PASSWORD === "true";

  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before seeding.");
  }
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email },
    update: resetPassword ? { passwordHash } : {},
    create: {
      email,
      fullName,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    `✅ Super admin ready: ${email}${resetPassword ? " (password reset)" : ""}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
