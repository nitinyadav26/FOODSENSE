import { randomUUID } from "crypto";
import {
  AuthenticatedUser,
  MacroTotals,
  MealRecord,
  NutritionAnalysis,
  UserRecord,
} from "./types";

const users = new Map<string, UserRecord>();
const meals: MealRecord[] = [];
let latestScaleWeight = 0;

const baseTotals = (): MacroTotals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
});

export const store = {
  createUser(email: string, passwordHash: string): AuthenticatedUser {
    const id = randomUUID();
    const user: UserRecord = {
      id,
      email,
      passwordHash,
      createdAt: Date.now(),
    };
    users.set(id, user);
    return { id, email, createdAt: user.createdAt };
  },
  findUserByEmail(email: string) {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  },
  findUserById(id: string) {
    return users.get(id);
  },
  saveMeal(meal: Omit<MealRecord, "id">) {
    const record: MealRecord = { ...meal, id: randomUUID() };
    meals.unshift(record);
    return record;
  },
  listMeals({
    userId,
    guestId,
    date,
  }: {
    userId?: string;
    guestId?: string;
    date?: string;
  }) {
    const filtered = meals.filter((meal) => {
      if (userId && meal.userId !== userId) return false;
      if (!userId && guestId && meal.guestId !== guestId) return false;
      if (!userId && !guestId) return false;
      if (!date) return true;
      const mealDate = new Date(meal.timestamp).toISOString().slice(0, 10);
      return mealDate === date;
    });
    const totals = filtered.reduce<MacroTotals>((acc, meal) => {
      acc.calories += meal.analysis.totals.calories;
      acc.protein += meal.analysis.totals.protein;
      acc.carbs += meal.analysis.totals.carbs;
      acc.fat += meal.analysis.totals.fat;
      acc.fiber += meal.analysis.totals.fiber;
      return acc;
    }, baseTotals());
    return { meals: filtered, totals };
  },
  updateScaleWeight(weightGrams: number) {
    latestScaleWeight = weightGrams;
  },
  getScaleWeight() {
    return latestScaleWeight;
  },
};

export type AnalysisInput = {
  weightGrams: number;
  mealType?: string;
  notes?: string;
};

export const mockAnalyzeMeal = (
  input: AnalysisInput
): NutritionAnalysis => {
  const baseCalories = Math.max(20, Math.round(input.weightGrams * 1.1));
  return {
    id: randomUUID(),
    mealName: input.mealType ? `${input.mealType} plate` : "Smart meal",
    summary:
      input.notes?.slice(0, 80) ||
      "Balanced dish estimated from weight + visual cues (mocked Gemini output).",
    totals: {
      calories: baseCalories,
      protein: Math.round(baseCalories * 0.2),
      carbs: Math.round(baseCalories * 0.4),
      fat: Math.round(baseCalories * 0.25),
      fiber: Math.max(1, Math.round(input.weightGrams * 0.02)),
    },
    items: [
      {
        name: "Main",
        calories: Math.round(baseCalories * 0.7),
        protein: Math.round(baseCalories * 0.15),
        carbs: Math.round(baseCalories * 0.3),
        fat: Math.round(baseCalories * 0.2),
      },
      {
        name: "Sides",
        calories: Math.round(baseCalories * 0.3),
        protein: Math.round(baseCalories * 0.05),
        carbs: Math.round(baseCalories * 0.1),
        fat: Math.round(baseCalories * 0.05),
      },
    ],
  };
};
