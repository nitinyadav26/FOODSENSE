import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "foodsense-dev-secret";

export const auth = {
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  },
  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },
  signToken(userId: string) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
  },
  verifyToken(token?: string | null) {
    if (!token) return null;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
      return payload.sub;
    } catch {
      return null;
    }
  },
};
