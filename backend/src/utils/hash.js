import bcrypt from "bcryptjs";

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
