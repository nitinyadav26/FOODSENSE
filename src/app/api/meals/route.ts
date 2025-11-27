import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { apiUtils } from "@/lib/api-utils";
import { NutritionAnalysis } from "@/lib/types";

const ensureActor = async (request: NextRequest) => {
  const { userId, guestId } = await apiUtils.getActorIds(request);
  if (!userId && !guestId) {
    throw apiUtils.error("Guest session or auth required", 401);
  }
  return { userId: userId ?? undefined, guestId: userId ? undefined : guestId };
};

export async function GET(request: NextRequest) {
  try {
    const { userId, guestId } = await ensureActor(request);
    const today = new Date().toISOString().slice(0, 10);
    const date = request.nextUrl.searchParams.get("date") || today;
    const payload = store.listMeals({ userId, guestId, date });
    return apiUtils.success({ ...payload, date });
  } catch (response) {
    if (response instanceof Response) return response;
    return apiUtils.error("Unexpected error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, guestId } = await ensureActor(request);
    const body = await request.json().catch(() => null);
    const weightGrams = Number(body?.weightGrams);
    const mealType = body?.mealType?.toString();
    const notes = body?.notes?.toString();
    const analysis = body?.analysis as NutritionAnalysis | undefined;
    const imageUrl = body?.imageUrl?.toString();

    if (!analysis) {
      return apiUtils.error("Analysis payload required", 422);
    }
    if (!weightGrams || Number.isNaN(weightGrams)) {
      return apiUtils.error("Weight is required", 422);
    }

    const meal = store.saveMeal({
      guestId,
      userId,
      timestamp: Date.now(),
      weightGrams,
      mealType,
      notes,
      imageUrl,
      analysis,
    });
    return apiUtils.success({ meal });
  } catch (response) {
    if (response instanceof Response) return response;
    return apiUtils.error("Unexpected error", 500);
  }
}
