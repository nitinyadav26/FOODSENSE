import Foundation
import SwiftUI
import Combine
import UIKit

@MainActor
final class MealViewModel: ObservableObject {
    @Published var capturedImage: UIImage?
    @Published var selectedMealType: MealType = .lunch
    @Published var notes: String = ""
    @Published var isAnalyzing: Bool = false
    @Published var errorMessage: String?
    @Published var result: NutritionResult?
    @Published private(set) var lastAnalyzedWeight: Int?

    let mealTypes: [MealType] = MealType.allCases

    func analyzeCurrentMeal(weight: Int) async {
        guard let image = capturedImage else {
            errorMessage = "Please capture an image first."
            return
        }

        isAnalyzing = true
        errorMessage = nil
        lastAnalyzedWeight = weight
        defer { isAnalyzing = false }

        do {
            let result = try await APIClient.shared.analyzeMeal(image: image, weightGrams: weight, mealType: selectedMealType.rawValue, userNotes: notes.isEmpty ? nil : notes)
            self.result = result
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }

    func resetAfterSuccess() {
        capturedImage = nil
        notes = ""
        result = nil
        lastAnalyzedWeight = nil
    }
}

enum MealType: String, CaseIterable, Identifiable {
    case breakfast
    case lunch
    case dinner
    case snack

    var id: String { rawValue }

    var displayName: String {
        rawValue.capitalized
    }
}
