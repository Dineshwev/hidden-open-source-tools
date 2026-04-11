import slugify from "slugify";
import { getAdmin } from "../backend_lib/supabase-server.ts";
import { AppError } from "../utils/appError.js";

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
  const admin = getAdmin();

  const { count, error: countError } = await admin
    .from("categories")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new AppError(countError.message || "Failed to count categories", 500);
  }

  if (!count) {
    const { error: seedError } = await admin.from("categories").insert(
      starterCategories.map((name) => ({
        name,
        slug: slugify(name, { lower: true, strict: true })
      }))
    );

    if (seedError) {
      throw new AppError(seedError.message || "Failed to seed categories", 500);
    }
  }

  const { data, error } = await admin
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new AppError(error.message || "Failed to fetch categories", 500);
  }

  return data || [];
}
