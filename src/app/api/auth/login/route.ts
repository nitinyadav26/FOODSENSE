import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api-utils";
import { store } from "@/lib/store";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().toLowerCase();
  const password = body?.password?.toString();

  if (!email || !password) {
    return apiUtils.error("Email and password are required", 422);
  }

  const user = store.findUserByEmail(email);
  if (!user) {
    return apiUtils.error("Account not found", 401);
  }

  const isValid = await auth.verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return apiUtils.error("Invalid credentials", 401);
  }

  const safeUser = { id: user.id, email: user.email, createdAt: user.createdAt };
  const token = auth.signToken(user.id);
  await apiUtils.setAuthCookie(token);
  return apiUtils.success({ user: safeUser });
}
