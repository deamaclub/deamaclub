import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "News", slug: "news", order: 1 },
  { name: "Fights", slug: "fights", order: 2 },
  { name: "Hip Hop", slug: "hip-hop", order: 3 },
  { name: "Sports", slug: "sports", order: 4 },
  { name: "Wild", slug: "wild", order: 5 },
  { name: "Celebrity", slug: "celebrity", order: 6 },
];

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order },
      create: c,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@deamaclub.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme-now-please";
  const adminUsername = (
    process.env.ADMIN_USERNAME || adminEmail.split("@")[0]
  ).toLowerCase();
  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: adminUsername,
      name: "Admin",
      password: hash,
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail}`);
  console.log(
    "NOTE: change ADMIN_PASSWORD env var before running this in production."
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
