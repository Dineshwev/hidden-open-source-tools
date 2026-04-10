import { prisma } from "../backend_lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { pickWeightedFile } from "../utils/mysteryWeights.js";

export async function unlockMysteryFile(userId) {
  try {
    const previousDownloads = await prisma.download.findMany({
      where: { userId },
      select: { fileId: true }
    });

    const seenIds = previousDownloads.map((download) => download.fileId);
    let candidateFiles = await prisma.file.findMany({
      where: {
        status: "APPROVED",
        id: {
          notIn: seenIds.length ? seenIds : []
        }
      },
      include: {
        category: true,
        uploader: {
          select: { username: true }
        }
      }
    });

    // If the user has exhausted the pool, we recycle approved files instead of failing.
    if (!candidateFiles.length) {
      candidateFiles = await prisma.file.findMany({
        where: { status: "APPROVED" },
        include: {
          category: true,
          uploader: {
            select: { username: true }
          }
        }
      });
    }

    if (!candidateFiles.length) {
      let openSourceCandidates = [];

      try {
        openSourceCandidates = await prisma.$queryRaw`
          SELECT id, name, description, url, source_site, category, github_stars
          FROM open_source_tools
          WHERE LOWER(COALESCE(status, 'approved')) = 'approved'
          ORDER BY COALESCE(updated_at, created_at) DESC
          LIMIT 200
        `;
      } catch (openSourceError) {
        const message = String(openSourceError?.message || '').toLowerCase();

        // Legacy variants may not have a status column yet.
        if (message.includes('status') && message.includes('column')) {
          openSourceCandidates = await prisma.$queryRaw`
            SELECT id, name, description, url, source_site, category, github_stars
            FROM open_source_tools
            ORDER BY COALESCE(updated_at, created_at) DESC
            LIMIT 200
          `;
        } else {
          throw openSourceError;
        }
      }

      if (openSourceCandidates.length) {
        const selected = openSourceCandidates[Math.floor(Math.random() * openSourceCandidates.length)];

        await prisma.user.update({
          where: { id: userId },
          data: {
            streakDays: {
              increment: 1
            }
          }
        });

        return {
          id: selected.id,
          title: selected.name || 'Untitled',
          description: selected.description || 'Curated resource from open source tools.',
          rarity: 'COMMON',
          category: selected.category || 'other',
          uploader: selected.source_site || 'open-source',
          downloadUrl: selected.url,
          tags: [],
          license: 'Source site terms',
          mimeType: 'Link'
        };
      }

      const scrapedCandidates = await prisma.$queryRaw`
        SELECT id, title, description, webpage_url, category, source_site
        FROM scraped_tools
        WHERE LOWER(COALESCE(status, '')) = 'approved'
        ORDER BY scraped_at DESC
        LIMIT 200
      `;

      if (scrapedCandidates.length) {
        const selected = scrapedCandidates[Math.floor(Math.random() * scrapedCandidates.length)];

        await prisma.user.update({
          where: { id: userId },
          data: {
            streakDays: {
              increment: 1
            }
          }
        });

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

    const selected = pickWeightedFile(candidateFiles);

    await prisma.$transaction([
      prisma.download.create({
        data: {
          userId,
          fileId: selected.id,
          unlockMethod: "rewarded_ad"
        }
      }),
      prisma.file.update({
        where: { id: selected.id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          streakDays: {
            increment: 1
          }
        }
      })
    ]);

    // Handle relative storage paths for Supabase
    let downloadUrl = selected.storagePath;
    if (downloadUrl && !downloadUrl.startsWith('http')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        downloadUrl = `${supabaseUrl}/storage/v1/object/public/mystery-files/${selected.storagePath}`;
      }
    }

    return {
      id: selected.id,
      title: selected.title,
      description: selected.description,
      rarity: selected.rarity,
      category: selected.category?.name || "Uncategorized",
      uploader: selected.uploader?.username || "Anonymous",
      downloadUrl: downloadUrl,
      tags: selected.tags,
      license: selected.license
    };
  } catch (error) {
    console.error("[CRITICAL] unlockMysteryFile Failure:", error);
    throw error;
  }
}

export async function getDownloadHistory(userId) {
  return prisma.download.findMany({
    where: { userId },
    include: {
      file: {
        include: {
          category: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getDailyMysteryReward(userId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingToday = await prisma.download.findFirst({
    where: {
      userId,
      createdAt: {
        gte: todayStart
      }
    },
    include: {
      file: true
    }
  });

  if (existingToday) {
    return {
      alreadyClaimed: true,
      file: existingToday.file
    };
  }

  return {
    alreadyClaimed: false,
    rewardHint: "Open your daily mystery box to keep the streak alive."
  };
}
