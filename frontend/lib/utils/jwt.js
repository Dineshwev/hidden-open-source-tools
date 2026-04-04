import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

function signToken(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    jwtid: randomUUID()
  });
}

export function signAccessToken(payload) {
  return signToken(payload, process.env.JWT_EXPIRES_IN || '7d');
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function signMysteryAdChallengeToken(userId) {
  return signToken({ sub: userId, scope: "mystery-ad-challenge" }, "10m");
}

export function verifyMysteryAdChallengeToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (!decoded || decoded.scope !== "mystery-ad-challenge") {
    throw new Error("Invalid ad challenge token");
  }

  return decoded;
}

export function signMysteryUnlockToken(userId, challengeId) {
  return signToken({ sub: userId, scope: "mystery-unlock", challengeId }, "15m");
}

export function verifyMysteryUnlockToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (!decoded || decoded.scope !== "mystery-unlock") {
    throw new Error("Invalid ad unlock token");
  }

  return decoded;
}
