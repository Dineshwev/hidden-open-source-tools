import { getAdmin } from "../backend_lib/supabase-server.ts";
import { AppError } from "../utils/appError.js";

function normalizeFileRecord(file) {
  return {
    ...file,
    category: file?.categories || file?.category || null,
    uploader: file?.users || file?.uploader || null
  };
}

export async function getPendingUploads() {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("files")
    .select("*, categories(*), users!files_uploader_id_fkey(id, username, email)")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError(error.message || "Failed to fetch pending uploads", 500);
  }

  return (data || []).map(normalizeFileRecord);
}

export async function getModerationHistory(status) {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("files")
    .select("*, categories(*), users!files_uploader_id_fkey(id, username, email)")
    .eq("status", status)
    .order("reviewed_at", { ascending: false });

  if (error) {
    throw new AppError(error.message || "Failed to fetch moderation history", 500);
  }

  return (data || []).map(normalizeFileRecord);
}

export async function moderateUpload({ adminId, fileId, status }) {
  const admin = getAdmin();
  const { data: file, error: fileError } = await admin
    .from("files")
    .select("*")
    .eq("id", fileId)
    .maybeSingle();

  if (fileError) {
    throw new AppError(fileError.message || "Failed to fetch file", 500);
  }

  if (!file) {
    throw new AppError("File not found", 404);
  }

  const reviewedAt = new Date().toISOString();

  const { data: updatedFile, error: updateFileError } = await admin
    .from("files")
    .update({
      status,
      reviewed_at: reviewedAt
    })
    .eq("id", fileId)
    .select("*")
    .single();

  if (updateFileError) {
    throw new AppError(updateFileError.message || "Failed to update file moderation", 500);
  }

  const { error: updateUploadsError } = await admin
    .from("uploads")
    .update({ status })
    .eq("file_id", fileId);

  if (updateUploadsError) {
    throw new AppError(updateUploadsError.message || "Failed to update upload moderation", 500);
  }

  const { error: logError } = await admin.from("admin_logs").insert({
    admin_id: adminId,
    action: status === "APPROVED" ? "approve_upload" : "reject_upload",
    entity_type: "file",
    entity_id: fileId,
    metadata: {
      previousStatus: file.status,
      nextStatus: status
    }
  });

  if (logError) {
    throw new AppError(logError.message || "Failed to write admin log", 500);
  }

  return updatedFile;
}

export async function getAnalyticsSnapshot() {
  const admin = getAdmin();
  const [
    usersResult,
    approvedFilesResult,
    pendingFilesResult,
    downloadsResult,
    topContributorsResult
  ] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("files").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
    admin.from("files").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    admin.from("downloads").select("id", { count: "exact", head: true }),
    admin
      .from("users")
      .select("id, username, contributor_points, streak_days")
      .order("contributor_points", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(5)
  ]);

  for (const result of [usersResult, approvedFilesResult, pendingFilesResult, downloadsResult, topContributorsResult]) {
    if (result.error) {
      throw new AppError(result.error.message || "Failed to fetch analytics snapshot", 500);
    }
  }

  return {
    metrics: {
      users: usersResult.count || 0,
      approvedFiles: approvedFilesResult.count || 0,
      pendingFiles: pendingFilesResult.count || 0,
      downloads: downloadsResult.count || 0
    },
    topContributors: (topContributorsResult.data || []).map((user) => ({
      id: user.id,
      username: user.username,
      contributorPoints: user.contributor_points,
      streakDays: user.streak_days
    }))
  };
}
