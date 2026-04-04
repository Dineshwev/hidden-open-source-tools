import { z } from "zod";

export const assetSubmissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title cannot exceed 120 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1200, "Description cannot exceed 1200 characters"),
  fileUrl: z.string().url("File URL must be a valid URL"),
  creatorReputationScore: z.number().min(0, "Reputation score must be at least 0").max(100, "Reputation score cannot exceed 100"),
  sha256Hash: z.string().optional().refine((val) => !val || /^[a-f0-9]{64}$/i.test(val), {
    message: "SHA-256 hash must be a valid 64-character hexadecimal string"
  })
});

export function validateAssetSubmission(data) {
  return assetSubmissionSchema.parse(data);
}

export function validateAssetSubmissionSafe(data) {
  const result = assetSubmissionSchema.safeParse(data);
  return {
    success: result.success,
    data: result.data,
    errors: result.success ? null : result.error.errors
  };
}