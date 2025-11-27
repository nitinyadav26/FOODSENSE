export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type NutritionItem = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
};

export type NutritionAnalysis = {
  id: string;
  mealName: string;
  summary: string;
  totals: MacroTotals;
  items: NutritionItem[];
};

export type MealRecord = {
  id: string;
  userId?: string;
  guestId?: string;
  timestamp: number;
  weightGrams: number;
  mealType?: string;
  notes?: string;
  imageUrl?: string;
  analysis: NutritionAnalysis;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
};

export type AuthenticatedUser = Pick<UserRecord, "id" | "email" | "createdAt">;
