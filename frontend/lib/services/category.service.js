import slugify from "slugify";
import { prisma } from "../backend_lib/prisma.js";

const starterCategories = [
  "Coding resources",
  "Design assets",
  "Templates",
  "AI prompts",
  "Student notes",
  "3D models",
  "Wallpapers",
  "Tools"
];

export async function getCategories() {
  const count = await prisma.category.count();

  if (!count) {
    await prisma.category.createMany({
      data: starterCategories.map((name) => ({
        name,
        slug: slugify(name, { lower: true, strict: true })
      }))
    });
  }

  return prisma.category.findMany({
    orderBy: { name: "asc" }
  });
}
