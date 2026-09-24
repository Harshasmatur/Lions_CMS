import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@lionscollege.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("Admin credentials updated:");
  console.log(`  email:    ${admin.email}`);
  console.log(`  password: ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });