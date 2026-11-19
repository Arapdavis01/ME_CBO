import { PrismaClient, ImpactType } from "@prisma/client";

const prisma = new PrismaClient();

const badges = [
  { slug: "first-sprout", name: "First Sprout", description: "Logged your first tree", icon: "sprout", targetType: "TREES_PLANTED" as ImpactType, targetValue: 1 },
  { slug: "green-thumb", name: "Green Thumb", description: "Planted 10 trees", icon: "leaf", targetType: "TREES_PLANTED" as ImpactType, targetValue: 10 },
  { slug: "tree-master", name: "Tree Master", description: "Planted 100 trees", icon: "tree", targetType: "TREES_PLANTED" as ImpactType, targetValue: 100 },
  { slug: "forest-guardian", name: "Forest Guardian", description: "Planted 500 trees", icon: "tree", targetType: "TREES_PLANTED" as ImpactType, targetValue: 500 },
  { slug: "first-haul", name: "First Haul", description: "Collected your first 5 kg of waste", icon: "recycle", targetType: "WASTE_COLLECTED" as ImpactType, targetValue: 5 },
  { slug: "waste-warrior", name: "Waste Warrior", description: "Collected 50 kg of waste", icon: "recycle", targetType: "WASTE_COLLECTED" as ImpactType, targetValue: 50 },
  { slug: "zero-hero", name: "Zero Hero", description: "Collected 200 kg of waste", icon: "recycle", targetType: "WASTE_COLLECTED" as ImpactType, targetValue: 200 },
  { slug: "first-hour", name: "First Hour", description: "Volunteered 1 hour", icon: "droplet", targetType: "HOURS_VOLUNTEERED" as ImpactType, targetValue: 1 },
  { slug: "steady-hands", name: "Steady Hands", description: "Volunteered 10 hours", icon: "droplet", targetType: "HOURS_VOLUNTEERED" as ImpactType, targetValue: 10 },
  { slug: "community-pillar", name: "Community Pillar", description: "Volunteered 50 hours", icon: "sun", targetType: "HOURS_VOLUNTEERED" as ImpactType, targetValue: 50 },
  { slug: "all-star", name: "All-Star", description: "Attended 10 events", icon: "star", targetType: "EVENT_ATTENDED" as ImpactType, targetValue: 10 },
];

async function main() {
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description, icon: b.icon, targetType: b.targetType, targetValue: b.targetValue },
      create: b,
    });
  }
  // eslint-disable-next-line no-console
  console.log(`✅ Seeded ${badges.length} badge definitions`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
