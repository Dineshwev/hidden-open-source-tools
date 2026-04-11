import { getAdmin } from "../backend_lib/supabase-server.ts";
import { AppError } from "../utils/appError.js";
import { pickWeightedFile } from "../utils/mysteryWeights.js";

function toInList(ids) {
  return `(${ids.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(",")})`;
}

function normalizeApprovedStatus(value) {
  return String(value || "").trim().toUpperCase() === "APPROVED";
}

function normalizeFileRecord(file) {
  return {
    ...file,
    rarity: file?.rarity || "COMMON",
    tags: Array.isArray(file?.tags) ? file.tags : [],
    license: file?.license || "Source site terms",
    category: file?.categories || file?.category || null,
    uploader: file?.users || file?.uploader || null
  };
}

function isAnonymousUser(userId) {
  return !userId || userId === "anonymous_box_user" || String(userId).startsWith("guest:");
}

async function incrementUserStreak(userId) {
  const admin = getAdmin();
  const { data: user, error: userError } = await admin
    .from("users")
    .select("streak_days")
    .eq("id", userId)
    .single();

  if (userError) {
    throw new AppError(userError.message || "Failed to fetch user streak", 500);
  }

  const nextStreak = Number(user?.streak_days || 0) + 1;
  const { error: updateError } = await admin
    .from("users")
    .update({ streak_days: nextStreak })
    .eq("id", userId);

  if (updateError) {
    throw new AppError(updateError.message || "Failed to update user streak", 500);
  }
}

async function incrementFileDownloadCount(fileId) {
  const admin = getAdmin();
  const { data: file, error: fileError } = await admin
    .from("files")
    .select("download_count")
    .eq("id", fileId)
    .single();

  if (fileError) {
    throw new AppError(fileError.message || "Failed to fetch file download count", 500);
  }

  const nextCount = Number(file?.download_count || 0) + 1;
  const { error: updateError } = await admin
    .from("files")
    .update({ download_count: nextCount })
    .eq("id", fileId);

  if (updateError) {
    throw new AppError(updateError.message || "Failed to update file download count", 500);
  }
}

export async function unlockMysteryFile(userId) {
  try {
    const admin = getAdmin();
    const anonymousUser = isAnonymousUser(userId);
    let seenIds = [];

    if (!anonymousUser) {
      const { data: previousDownloads, error: previousDownloadsError } = await admin
        .from("downloads")
        .select("file_id")
        .eq("user_id", userId);

      if (previousDownloadsError) {
        throw new AppError(previousDownloadsError.message || "Failed to fetch previous downloads", 500);
      }

      seenIds = (previousDownloads || []).map((download) => download.file_id).filter(Boolean);
    }

    let candidateQuery = admin
      .from("files")
      .select("*, categories(*), users!files_uploader_id_fkey(*)")
      .eq("status", "APPROVED");

    if (seenIds.length > 0) {
      candidateQuery = candidateQuery.not("id", "in", toInList(seenIds));
    }

    let { data: candidateFiles, error: candidateFilesError } = await candidateQuery;

    if (candidateFilesError) {
      throw new AppError(candidateFilesError.message || "Failed to fetch candidate files", 500);
    }

    candidateFiles = (candidateFiles || []).map(normalizeFileRecord);

    if (!candidateFiles.length) {
      const { data: recycledFiles, error: recycledFilesError } = await admin
        .from("files")
        .select("*, categories(*), users!files_uploader_id_fkey(*)")
        .eq("status", "APPROVED");

      if (recycledFilesError) {
        throw new AppError(recycledFilesError.message || "Failed to fetch approved files", 500);
      }

      candidateFiles = (recycledFiles || []).map(normalizeFileRecord);
    }

    if (!candidateFiles.length) {
      const { data: openSourceCandidates, error: openSourceError } = await admin
        .from("open_source_tools")
        .select("id, name, description, url, category, source_list, status, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(200);

      if (openSourceError) {
        throw new AppError(openSourceError.message || "Failed to fetch open source tools", 500);
      }

      if (openSourceCandidates?.length) {
        const selected =
          openSourceCandidates[Math.floor(Math.random() * openSourceCandidates.length)];

        if (!anonymousUser) {
          await incrementUserStreak(userId);
        }

        return {
          id: selected.id,
          title: selected.name || "Untitled",
          description: selected.description || "Curated resource from open source tools.",
          rarity: "COMMON",
          category: selected.category || "other",
          uploader: selected.source_list || "open-source",
          downloadUrl: selected.url,
          tags: [],
          license: "Source site terms",
          mimeType: "Link"
        };
      }

      const { data: scrapedCandidates, error: scrapedError } = await admin
        .from("scraped_tools")
        .select("id, title, description, webpage_url, category, source_site, status, scraped_at")
        .eq("status", "approved")
        .order("scraped_at", { ascending: false })
        .limit(200);

      if (scrapedError) {
        throw new AppError(scrapedError.message || "Failed to fetch scraped tools", 500);
      }

      if (scrapedCandidates?.length) {
        const selected =
          scrapedCandidates[Math.floor(Math.random() * scrapedCandidates.length)];

        if (!anonymousUser) {
          await incrementUserStreak(userId);
        }

        return {
          id: selected.id,
          title: selected.title,
          description: selected.description || "Curated resource from scraped tools.",
          rarity: "COMMON",
          category: selected.category || "other",
          uploader: selected.source_site || "scraper",
          downloadUrl: selected.webpage_url,
          tags: [],
          license: "Source site terms",
          mimeType: "Link"
        };
      }

      throw new AppError("No approved files are available yet", 404);
    }

    const approvedCandidateFiles = candidateFiles.filter((file) =>
      normalizeApprovedStatus(file.status)
    );
    const selected = pickWeightedFile(approvedCandidateFiles.length ? approvedCandidateFiles : candidateFiles);

    if (!anonymousUser) {
      const { error: downloadInsertError } = await admin.from("downloads").insert({
        user_id: userId,
        file_id: selected.id,
        unlock_method: "rewarded_ad"
      });

      if (downloadInsertError) {
        throw new AppError(downloadInsertError.message || "Failed to create download record", 500);
      }

      await incrementFileDownloadCount(selected.id);
      await incrementUserStreak(userId);
    }

    let downloadUrl = selected.storage_path;
    if (downloadUrl && !downloadUrl.startsWith("http")) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        downloadUrl = `${supabaseUrl}/storage/v1/object/public/mystery-bucket/${selected.storage_path}`;
      }
    }

    return {
      id: selected.id,
      title: selected.title,
      description: selected.description,
      rarity: selected.rarity,
      category: selected.category?.name || "Uncategorized",
      uploader: selected.uploader?.username || "Anonymous",
      downloadUrl,
      tags: selected.tags,
      license: selected.license
    };
  } catch (error) {
    console.error("[CRITICAL] unlockMysteryFile Failure:", error);
    throw error;
  }
}

export async function getDownloadHistory(userId) {
  try {
    const admin = getAdmin();
    const { data, error } = await admin
      .from("downloads")
      .select("*, files(*, categories(*))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(error.message || "Failed to fetch download history", 500);
    }

    return data || [];
  } catch (error) {
    console.error("[CRITICAL] getDownloadHistory Failure:", error);
    throw error;
  }
}

export async function getDailyMysteryReward(userId) {
  try {
    const admin = getAdmin();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: existingToday, error } = await admin
      .from("downloads")
      .select("*, files(*)")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new AppError(error.message || "Failed to fetch daily reward status", 500);
    }

    if (existingToday) {
      return {
        alreadyClaimed: true,
        file: existingToday.files
      };
    }

    return {
      alreadyClaimed: false,
      rewardHint: "Open your daily mystery box to keep the streak alive."
    };
  } catch (error) {
    console.error("[CRITICAL] getDailyMysteryReward Failure:", error);
    throw error;
  }
}
