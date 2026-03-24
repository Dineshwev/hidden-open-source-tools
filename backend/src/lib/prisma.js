import { PrismaClient } from "@prisma/client";

// Prisma client is created once so API handlers can share pooled connections.
export const prisma = new PrismaClient();
