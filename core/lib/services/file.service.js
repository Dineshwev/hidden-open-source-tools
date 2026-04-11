import path from "path";
import slugify from "slugify";
import { getAdmin } from "../backend_lib/supabase-server.ts";
import { AppError } from "../utils/appError.js";
import { hashFile } from "../utils/fileHasher.js";
import { simulateMalwareScan } from "../utils/fileScanner.js";
import { sanitizeText } from "../utils/sanitize.js";
import { uploadSchema } from "../validators/fileValidators.js";

function normalizeFileRecord(file) {
  return {
    ...file,
    category: file?.categories || file?.category || { name: "Other" },
    uploader: file?.users || file?.uploader || { username: "Anonymous" }
  };
}

export async function getApprovedFiles() {
  try {
    const admin = getAdmin();
    const { data, error } = await admin
      .from("files")
      .select("*, categories(*), users!files_uploader_id_fkey(username)")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeFileRecord);
  } catch (err) {
    console.error("[FILE SERVICE] getApprovedFiles failed:", err);
    return [];
  }
}

export async function getTrendingFiles() {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("files")
    .select("*, categories(*), users!files_uploader_id_fkey(username, contributor_points)")
    .eq("status", "APPROVED")
    .order("download_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new AppError(error.message || "Failed to fetch trending files", 500);
  }

  return (data || []).map(normalizeFileRecord);
}

export async function getUserSubmissions(userId) {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("uploads")
    .select("*, files(*, categories(*))")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new AppError(error.message || "Failed to fetch user submissions", 500);
  }

  return data || [];
}

export async function createUpload({ userId, body, file }) {
  if (!file) {
    throw new AppError("Please attach a file", 400);
  }

  const parsed = uploadSchema.parse(body);
  const checksum = await hashFile(file.path);
  const admin = getAdmin();

  const { data: duplicate, error: duplicateError } = await admin
    .from("files")
    .select("id")
    .eq("checksum", checksum)
    .maybeSingle();

  if (duplicateError) {
    throw new AppError(duplicateError.message || "Failed to check duplicate file", 500);
  }

  if (duplicate) {
    throw new AppError("This file was already uploaded", 409);
  }

  const scanResult = await simulateMalwareScan(file);

  if (!scanResult.safe) {
    throw new AppError("File failed malware simulation checks", 400);
  }

  const title = sanitizeText(parsed.title);
  const filePayload = {
    uploader_id: userId,
    category_id: parsed.categoryId,
    title,
    slug: `${slugify(title, { lower: true, strict: true })}-${Date.now()}`,
    description: sanitizeText(parsed.description),
    tags: parsed.tags.split(",").map((tag) => sanitizeText(tag)).filter(Boolean),
    license: sanitizeText(parsed.license),
    preview_image_url: parsed.previewImageUrl || null,
    storage_path: normalizeAssetPath(file.filename),
    original_file_name: file.originalname,
    mime_type: file.mimetype,
    checksum,
    file_size: file.size,
    rarity: parsed.rarity
  };

  const { data: fileRecord, error: fileError } = await admin
    .from("files")
    .insert(filePayload)
    .select("*")
    .single();

  if (fileError) {
    throw new AppError(fileError.message || "Failed to create file record", 500);
  }

  const { error: uploadError } = await admin.from("uploads").insert({
    user_id: userId,
    file_id: fileRecord.id,
    status: "PENDING"
  });

  if (uploadError) {
    throw new AppError(uploadError.message || "Failed to create upload record", 500);
  }

  const { data: user, error: userError } = await admin
    .from("users")
    .select("contributor_points")
    .eq("id", userId)
    .single();

  if (userError) {
    throw new AppError(userError.message || "Failed to fetch contributor points", 500);
  }

  const { error: userUpdateError } = await admin
    .from("users")
    .update({
      contributor_points: Number(user?.contributor_points || 0) + 5
    })
    .eq("id", userId);

  if (userUpdateError) {
    throw new AppError(userUpdateError.message || "Failed to update contributor points", 500);
  }

  return fileRecord;
}

export async function createServerlessUpload({ userId, body, fileMeta }) {
  const parsed = uploadSchema.parse(body);
  const admin = getAdmin();

  const { data: duplicate, error: duplicateError } = await admin
    .from("files")
    .select("id")
    .eq("checksum", fileMeta.checksum)
    .maybeSingle();

  if (duplicateError) {
    throw new AppError(duplicateError.message || "Failed to check duplicate file", 500);
  }

  if (duplicate) {
    throw new AppError("This file was already uploaded", 409);
  }

  const title = sanitizeText(parsed.title);
  const filePayload = {
    uploader_id: userId,
    category_id: parsed.categoryId,
    title,
    slug: `${slugify(title, { lower: true, strict: true })}-${Date.now()}`,
    description: sanitizeText(parsed.description),
    tags: parsed.tags.split(",").map((tag) => sanitizeText(tag)).filter(Boolean),
    license: sanitizeText(parsed.license),
    preview_image_url: parsed.previewImageUrl || null,
    storage_path: fileMeta.storagePath,
    original_file_name: fileMeta.originalname,
    mime_type: fileMeta.mimetype,
    checksum: fileMeta.checksum,
    file_size: fileMeta.size,
    rarity: parsed.rarity
  };

  const { data: fileRecord, error: fileError } = await admin
    .from("files")
    .insert(filePayload)
    .select("*")
    .single();

  if (fileError) {
    throw new AppError(fileError.message || "Failed to create file record", 500);
  }

  const { error: uploadError } = await admin.from("uploads").insert({
    user_id: userId,
    file_id: fileRecord.id,
    status: "PENDING"
  });

  if (uploadError) {
    throw new AppError(uploadError.message || "Failed to create upload record", 500);
  }

  const { data: user, error: userError } = await admin
    .from("users")
    .select("contributor_points")
    .eq("id", userId)
    .single();

  if (userError) {
    throw new AppError(userError.message || "Failed to fetch contributor points", 500);
  }

  const { error: userUpdateError } = await admin
    .from("users")
    .update({
      contributor_points: Number(user?.contributor_points || 0) + 5
    })
    .eq("id", userId);

  if (userUpdateError) {
    throw new AppError(userUpdateError.message || "Failed to update contributor points", 500);
  }

  return fileRecord;
}

function normalizeAssetPath(fileName) {
  return path.posix.join("/assets/uploads", fileName.replace(/\\/g, "/"));
}
