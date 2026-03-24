import { z } from "zod";

export const uploadSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(1200),
  categoryId: z.string().uuid(),
  license: z.string().min(2).max(80),
  previewImageUrl: z.string().url().optional().or(z.literal("")),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY"]).default("COMMON"),
  tags: z.string().min(1)
});
