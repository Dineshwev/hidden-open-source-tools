import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const categories = [
  "Coding resources",
  "Design assets",
  "Templates",
  "AI prompts",
  "Student notes",
  "3D models",
  "Wallpapers",
  "Tools"
];

async function main() {
  await prisma.category.createMany({
    data: categories.map((name) => ({
      name,
      slug: slugify(name, { lower: true, strict: true })
    })),
    skipDuplicates: true
  });

  await prisma.user.upsert({
    where: { email: "admin@portfolio-universe.dev" },
    update: {},
    create: {
      username: "admin",
      email: "admin@portfolio-universe.dev",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: UserRole.ADMIN
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
