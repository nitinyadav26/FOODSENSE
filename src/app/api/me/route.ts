import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { apiUtils } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { userId } = await apiUtils.getActorIds(request);
  if (!userId) {
    return apiUtils.error("Not authenticated", 401);
  }
  const user = store.findUserById(userId);
  if (!user) {
    return apiUtils.error("User not found", 404);
  }
  return apiUtils.success({ id: user.id, email: user.email, createdAt: user.createdAt });
}
