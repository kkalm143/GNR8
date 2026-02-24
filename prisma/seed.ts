import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@gnr8.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  let existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        passwordHash,
        role: Role.admin,
      },
    });
    console.log("Created admin user:", adminEmail);
  } else {
    console.log("Admin user already exists:", adminEmail);
  }

  const clientEmail = process.env.SEED_CLIENT_EMAIL ?? "nicole@gnr8.com";
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? "nicole123";
  existing = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!existing) {
    const passwordHash = await hash(clientPassword, 10);
    await prisma.user.create({
      data: {
        email: clientEmail,
        name: "Nicole",
        passwordHash,
        role: Role.client,
      },
    });
    console.log("Created test client:", clientEmail, "(password:", clientPassword + ")");
  } else {
    console.log("Test client already exists:", clientEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
