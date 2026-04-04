import { prisma } from "../backend_lib/prisma.js";
import { AppError } from "../utils/appError.js";

export async function getPendingUploads() {
  return prisma.file.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      uploader: {
        select: { id: true, username: true, email: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function moderateUpload({ adminId, fileId, status }) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  const updatedFile = await prisma.$transaction(async (tx) => {
    const nextFile = await tx.file.update({
      where: { id: fileId },
      data: {
        status,
        reviewedAt: new Date()
      }
    });

    await tx.upload.updateMany({
      where: { fileId },
      data: {
        status
      }
    });

    await tx.adminLog.create({
      data: {
        adminId,
        action: status === "APPROVED" ? "approve_upload" : "reject_upload",
        entityType: "file",
        entityId: fileId,
        metadata: {
          previousStatus: file.status,
          nextStatus: status
        }
      }
    });

    return nextFile;
  });

  return updatedFile;
}

export async function getAnalyticsSnapshot() {
  const [users, approvedFiles, pendingFiles, downloads, topContributors] = await Promise.all([
    prisma.user.count(),
    prisma.file.count({ where: { status: "APPROVED" } }),
    prisma.file.count({ where: { status: "PENDING" } }),
    prisma.download.count(),
    prisma.user.findMany({
      orderBy: [{ contributorPoints: "desc" }, { createdAt: "asc" }],
      take: 5,
      select: {
        id: true,
        username: true,
        contributorPoints: true,
        streakDays: true
      }
    })
  ]);

  return {
    metrics: {
      users,
      approvedFiles,
      pendingFiles,
      downloads
    },
    topContributors
  };
}
