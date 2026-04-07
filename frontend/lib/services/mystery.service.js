import { prisma } from "../backend_lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { pickWeightedFile } from "../utils/mysteryWeights.js";

export async function unlockMysteryFile(userId) {
  const previousDownloads = await prisma.download.findMany({
    where: { userId },
    select: { fileId: true }
  });

  const seenIds = previousDownloads.map((download) => download.fileId);
  let candidateFiles = await prisma.file.findMany({
    where: {
      status: "APPROVED",
      id: {
        notIn: seenIds.length ? seenIds : undefined
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
    const scrapedCandidates = await prisma.scrapedTool.findMany({
      where: {
        OR: [{ status: "approved" }, { status: "APPROVED" }]
      },
      orderBy: { scraped_at: "desc" },
      take: 200
    });

    if (scrapedCandidates.length) {
      const selected = scrapedCandidates[Math.floor(Math.random() * scrapedCandidates.length)] || scrapedCandidates[0];

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

  return {
    id: selected.id,
    title: selected.title,
    description: selected.description,
    rarity: selected.rarity,
    category: selected.category.name,
    uploader: selected.uploader.username,
    downloadUrl: selected.storagePath,
    tags: selected.tags,
    license: selected.license
  };
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
