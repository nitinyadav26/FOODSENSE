import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "./auth";

const AUTH_COOKIE = "foodsense_token";

export const apiUtils = {
  authCookieName: AUTH_COOKIE,
  success<T>(data: T, init?: ResponseInit) {
    return NextResponse.json(data, init);
  },
  error(message: string, status = 400) {
    return NextResponse.json({ message }, { status });
  },
  async getActorIds(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const userId = auth.verifyToken(token);
    const guestId =
      request.headers.get("x-guest-id") ||
      cookieStore.get("foodsense_guest_id")?.value ||
      undefined;
    return { userId, guestId };
  },
  async setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  },
  async clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
  },
};
