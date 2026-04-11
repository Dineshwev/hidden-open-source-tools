import { getAdmin } from "../backend_lib/supabase-server.ts";
import { AppError } from "../utils/appError.js";
import { hashPassword } from "../utils/hash.js";
import { sanitizeText } from "../utils/sanitize.js";

function buildAuthResponse(user, token = null) {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      contributorPoints: user.contributor_points ?? user.contributorPoints ?? 0,
      streakDays: user.streak_days ?? user.streakDays ?? 0
    },
    token
  };
}

export async function createGuestUser(guestKey) {
  const normalizedKey = sanitizeText(String(guestKey || "")).toLowerCase();
  if (!normalizedKey) {
    throw new AppError("Missing guest session key", 400);
  }

  const username = `guest_${normalizedKey.slice(0, 24)}`;
  const email = `guest_${normalizedKey.slice(0, 24)}@guest.local`;
  const admin = getAdmin();

  const { data: existingUsers, error: existingError } = await admin
    .from("users")
    .select("*")
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(1);

  if (existingError) {
    throw new AppError(existingError.message || "Failed to check guest user", 500);
  }

  let user = existingUsers?.[0] || null;

  if (!user) {
    const { data: createdUser, error: createError } = await admin
      .from("users")
      .insert({
        username,
        email,
        password_hash: await hashPassword(normalizedKey),
        role: "USER"
      })
      .select("*")
      .single();

    if (createError) {
      throw new AppError(createError.message || "Failed to create guest user", 500);
    }

    user = createdUser;
  }

  return buildAuthResponse(user, `guest:${normalizedKey}`);
}

export async function getCurrentUser(userId) {
  const admin = getAdmin();
  const { data: user, error } = await admin
    .from("users")
    .select("id, username, email, role, contributor_points, streak_days, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message || "Failed to fetch current user", 500);
  }

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    contributorPoints: user.contributor_points,
    streakDays: user.streak_days,
    createdAt: user.created_at
  };
}
