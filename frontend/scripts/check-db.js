const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking DB connection...");
    await prisma.$connect();
    console.log("DB connected!");
    
    const count = await prisma.file.count();
    console.log("Approved files count:", count);
  } catch (err) {
    console.error("DB check failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
