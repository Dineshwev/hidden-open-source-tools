import path from "path";
import slugify from "slugify";
import { prisma } from "../backend_lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { hashFile } from "../utils/fileHasher.js";
import { simulateMalwareScan } from "../utils/fileScanner.js";
import { sanitizeText } from "../utils/sanitize.js";
import { uploadSchema } from "../validators/fileValidators.js";

export async function getApprovedFiles() {
  try {
    const files = await prisma.file.findMany({
      where: { status: "APPROVED" },
      include: {
        category: true,
        uploader: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return files.map(file => ({
      ...file,
      category: file.category || { name: "Other" },
      uploader: file.uploader || { username: "Anonymous" }
    }));
  } catch (err) {
    console.error("[FILE SERVICE] getApprovedFiles failed:", err);
    // Return empty array instead of throwing to avoid 500
    return [];
  }
}

export async function getTrendingFiles() {
  return prisma.file.findMany({
    where: { status: "APPROVED" },
    include: {
      category: true,
      uploader: {
        select: { username: true, contributorPoints: true }
      }
    },
    orderBy: [{ downloadCount: "desc" }, { createdAt: "desc" }],
    take: 6
  });
}

export async function getUserSubmissions(userId) {
  return prisma.upload.findMany({
    where: { userId },
    include: {
      file: {
        include: {
          category: true
        }
      }
    },
    orderBy: { submittedAt: "desc" }
  });
}

export async function createUpload({ userId, body, file }) {
  if (!file) {
    throw new AppError("Please attach a file", 400);
  }

  const parsed = uploadSchema.parse(body);
  const checksum = await hashFile(file.path);
  const duplicate = await prisma.file.findUnique({ where: { checksum } });

  if (duplicate) {
    throw new AppError("This file was already uploaded", 409);
  }

  const scanResult = await simulateMalwareScan(file);

  if (!scanResult.safe) {
    throw new AppError("File failed malware simulation checks", 400);
  }

  const title = sanitizeText(parsed.title);
  const fileRecord = await prisma.file.create({
    data: {
      uploaderId: userId,
      categoryId: parsed.categoryId,
      title,
      slug: `${slugify(title, { lower: true, strict: true })}-${Date.now()}`,
      description: sanitizeText(parsed.description),
      tags: parsed.tags.split(",").map((tag) => sanitizeText(tag)).filter(Boolean),
      license: sanitizeText(parsed.license),
      previewImageUrl: parsed.previewImageUrl || null,
      storagePath: normalizeAssetPath(file.filename),
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      checksum,
      fileSize: file.size,
      rarity: parsed.rarity
    }
  });

  await prisma.upload.create({
    data: {
      userId,
      fileId: fileRecord.id,
      status: "PENDING"
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      contributorPoints: {
        increment: 5
      }
    }
  });

  return fileRecord;
}

export async function createServerlessUpload({ userId, body, fileMeta }) {
  const parsed = uploadSchema.parse(body);

  const duplicate = await prisma.file.findUnique({ where: { checksum: fileMeta.checksum } });
  if (duplicate) {
    throw new AppError("This file was already uploaded", 409);
  }

  const title = sanitizeText(parsed.title);
  const fileRecord = await prisma.file.create({
    data: {
      uploaderId: userId,
      categoryId: parsed.categoryId,
      title,
      slug: `${slugify(title, { lower: true, strict: true })}-${Date.now()}`,
      description: sanitizeText(parsed.description),
      tags: parsed.tags.split(",").map((tag) => sanitizeText(tag)).filter(Boolean),
      license: sanitizeText(parsed.license),
      previewImageUrl: parsed.previewImageUrl || null,
      storagePath: fileMeta.storagePath,
      originalFileName: fileMeta.originalname,
      mimeType: fileMeta.mimetype,
      checksum: fileMeta.checksum,
      fileSize: fileMeta.size,
      rarity: parsed.rarity
    }
  });

  await prisma.upload.create({
    data: {
      userId,
      fileId: fileRecord.id,
      status: "PENDING"
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { contributorPoints: { increment: 5 } }
  });

  return fileRecord;
}

function normalizeAssetPath(fileName) {
  return path.posix.join("/assets/uploads", fileName.replace(/\\/g, "/"));
}
