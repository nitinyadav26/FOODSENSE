import { apiUtils } from "@/lib/api-utils";
import { store } from "@/lib/store";

export async function GET() {
  const base = store.getScaleWeight();
  const noise = Math.round((Math.random() - 0.5) * 6);
  const weightGrams = Math.max(0, base + noise);
  store.updateScaleWeight(weightGrams);
  return apiUtils.success({ weightGrams, updatedAt: Date.now() });
}
