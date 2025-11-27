import { apiUtils } from "@/lib/api-utils";

export async function POST() {
  await apiUtils.clearAuthCookie();
  return apiUtils.success({ success: true });
}
