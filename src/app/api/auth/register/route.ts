import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api-utils";
import { store } from "@/lib/store";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().toLowerCase();
  const password = body?.password?.toString();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiUtils.error("Valid email is required", 422);
  }
  if (!password || password.length < 6) {
    return apiUtils.error("Password must be at least 6 characters", 422);
  }

  const existing = store.findUserByEmail(email);
  if (existing) {
    return apiUtils.error("Account already exists", 409);
  }

  const passwordHash = await auth.hashPassword(password);
  const user = store.createUser(email, passwordHash);
  const token = auth.signToken(user.id);
  await apiUtils.setAuthCookie(token);

  return apiUtils.success({ user });
}
