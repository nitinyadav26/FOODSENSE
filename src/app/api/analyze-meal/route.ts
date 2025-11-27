import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api-utils";
import { mockAnalyzeMeal } from "@/lib/store";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const weight = Number(formData.get("weight_grams"));
  const mealType = formData.get("meal_type")?.toString();
  const notes = formData.get("notes")?.toString();
  const file = formData.get("image");

  if (!weight || Number.isNaN(weight)) {
    return apiUtils.error("Weight is required", 422);
  }

  let imageUrl: string | undefined;
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = (file as File).type || "image/jpeg";
    imageUrl = `data:${mime};base64,${buffer.toString("base64")}`;
  }

  const analysis = mockAnalyzeMeal({
    weightGrams: weight,
    mealType,
    notes,
  });

  return apiUtils.success({ analysis, weightGrams: weight, mealType, notes, imageUrl });
}
