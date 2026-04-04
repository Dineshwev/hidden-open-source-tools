import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'development-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
}
