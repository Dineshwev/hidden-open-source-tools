import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { signAccessToken } from "../utils/jwt.js";
import { sanitizeText } from "../utils/sanitize.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";

export async function registerUser(payload) {
  const parsed = registerSchema.parse(payload);
  const username = sanitizeText(parsed.username);
  const email = sanitizeText(parsed.email).toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw new AppError("User with that email or username already exists", 409);
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: await hashPassword(parsed.password)
    }
  });

  return buildAuthResponse(user);
}

export async function loginUser(payload) {
  const parsed = loginSchema.parse(payload);
  const email = sanitizeText(parsed.email).toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !(await comparePassword(parsed.password, user.passwordHash))) {
    throw new AppError("Invalid credentials", 401);
  }

  return buildAuthResponse(user);
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      contributorPoints: true,
      streakDays: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

function buildAuthResponse(user) {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      contributorPoints: user.contributorPoints,
      streakDays: user.streakDays
    },
    token: signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
  };
}
