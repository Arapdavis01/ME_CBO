import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const hash = await argon2.hash("ChangeMeNow!1234", { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email: "chair@mecbo.org" },
    update: {},
    create: {
      email: "chair@mecbo.org",
      fullName: "ME_CBO Chairperson",
      passwordHash: hash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  // eslint-disable-next-line no-console
  console.log("✅ Seeded super admin: chair@mecbo.org / ChangeMeNow!1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
