import Foundation
import UIKit

struct NutritionResult: Codable, Identifiable {
    let id = UUID()
    let metadata: MealMetadata
    let detectedItems: [DetectedItem]
    let totals: NutritionTotals
    let warnings: [String]

    enum CodingKeys: String, CodingKey {
        case metadata
        case detectedItems = "detected_items"
        case totals
        case warnings
    }
}

struct MealMetadata: Codable {
    let totalInputWeightGrams: Int
    let mealType: String?
    let regionOrCuisine: String?
    let userDescription: String?
    let estimatedConfidenceOverall: String?

    enum CodingKeys: String, CodingKey {
        case totalInputWeightGrams = "total_input_weight_grams"
        case mealType = "meal_type"
        case regionOrCuisine = "region_or_cuisine"
        case userDescription = "user_description"
        case estimatedConfidenceOverall = "estimated_confidence_overall"
    }
}

struct DetectedItem: Codable, Identifiable {
    let id: String
    let label: String
    let category: String?
    let confidence: String?
    let estimatedWeightGrams: Double?
    let nutrition: NutritionInfo
    let assumptions: [String]

    enum CodingKeys: String, CodingKey {
        case id
        case label
        case category
        case confidence
        case estimatedWeightGrams = "estimated_weight_grams"
        case nutrition
        case assumptions
    }
}

struct NutritionInfo: Codable {
    let caloriesKcal: Double?
    let proteinG: Double?
    let carbsG: Double?
    let fatG: Double?
    let fiberG: Double?
    let micronutrients: [String]

    enum CodingKeys: String, CodingKey {
        case caloriesKcal = "calories_kcal"
        case proteinG = "protein_g"
        case carbsG = "carbs_g"
        case fatG = "fat_g"
        case fiberG = "fiber_g"
        case micronutrients
    }
}

struct NutritionTotals: Codable {
    let totalEstimatedWeightGrams: Double?
    let caloriesKcal: Double?
    let proteinG: Double?
    let carbsG: Double?
    let fatG: Double?
    let fiberG: Double?
    let micronutrients: [String]

    enum CodingKeys: String, CodingKey {
        case totalEstimatedWeightGrams = "total_estimated_weight_grams"
        case caloriesKcal = "calories_kcal"
        case proteinG = "protein_g"
        case carbsG = "carbs_g"
        case fatG = "fat_g"
        case fiberG = "fiber_g"
        case micronutrients
    }
}

struct MealEntry: Identifiable, Codable {
    let id: UUID
    let timestamp: Date
    let weightGrams: Int
    let calories: Double
    let primaryLabel: String
    let mealType: String?
    let notes: String?

    init(id: UUID = UUID(), timestamp: Date = Date(), weightGrams: Int, calories: Double, primaryLabel: String, mealType: String?, notes: String?) {
        self.id = id
        self.timestamp = timestamp
        self.weightGrams = weightGrams
        self.calories = calories
        self.primaryLabel = primaryLabel
        self.mealType = mealType
        self.notes = notes
    }
}
