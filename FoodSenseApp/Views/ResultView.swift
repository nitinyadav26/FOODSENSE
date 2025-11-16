import SwiftUI

struct ResultView: View {
    let result: NutritionResult
    let weightGrams: Int
    let onDone: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header
                macroSummary
                detectedItemsSection
                warningsSection
                Button("Done", action: onDone)
                    .buttonStyle(.borderedProminent)
            }
            .padding()
        }
        .navigationTitle("Results")
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Total Weight: \(weightGrams) g")
                .font(.headline)
            if let mealType = result.metadata.mealType {
                Text(mealType.capitalized)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var macroSummary: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Totals")
                .font(.headline)
            Grid(alignment: .leading, horizontalSpacing: 12, verticalSpacing: 12) {
                gridRow(label: "Calories", value: formatted(result.totals.caloriesKcal, suffix: "kcal"))
                gridRow(label: "Protein", value: formatted(result.totals.proteinG, suffix: "g"))
                gridRow(label: "Carbs", value: formatted(result.totals.carbsG, suffix: "g"))
                gridRow(label: "Fat", value: formatted(result.totals.fatG, suffix: "g"))
                gridRow(label: "Fiber", value: formatted(result.totals.fiberG, suffix: "g"))
            }
        }
    }

    private func gridRow(label: String, value: String) -> some View {
        GridRow {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.headline)
        }
    }

    private var detectedItemsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Detected Items")
                .font(.headline)
            ForEach(result.detectedItems) { item in
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.label)
                        .font(.title3)
                    if let confidence = item.confidence {
                        Text("Confidence: \(confidence)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let weight = item.estimatedWeightGrams {
                        Text("Weight: \(Int(weight)) g")
                            .font(.subheadline)
                    }
                    if let calories = item.nutrition.caloriesKcal {
                        Text("Calories: \(Int(calories)) kcal")
                            .font(.subheadline)
                    }
                    if !item.assumptions.isEmpty {
                        Text("Assumptions: \(item.assumptions.joined(separator: ", "))")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
                .background(RoundedRectangle(cornerRadius: 12).fill(Color(.secondarySystemBackground)))
            }
        }
    }

    private var warningsSection: some View {
        Group {
            if !result.warnings.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Warnings")
                        .font(.headline)
                        .foregroundStyle(.orange)
                    ForEach(result.warnings, id: \.self) { warning in
                        Text(warning)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }

    private func formatted(_ value: Double?, suffix: String) -> String {
        guard let value else { return "-" }
        if value.rounded() == value {
            return "\(Int(value)) \(suffix)"
        }
        return String(format: "%.1f %@", value, suffix)
    }
}

struct ResultView_Previews: PreviewProvider {
    static var previews: some View {
        let totals = NutritionTotals(totalEstimatedWeightGrams: 200, caloriesKcal: 520, proteinG: 22, carbsG: 60, fatG: 18, fiberG: 4, micronutrients: [])
        let item = DetectedItem(id: "1", label: "Paneer Curry", category: "Protein", confidence: "Medium", estimatedWeightGrams: 120, nutrition: NutritionInfo(caloriesKcal: 320, proteinG: 18, carbsG: 12, fatG: 20, fiberG: 2, micronutrients: []), assumptions: ["Assuming cooked with oil"])
        let metadata = MealMetadata(totalInputWeightGrams: 200, mealType: "lunch", regionOrCuisine: "Indian", userDescription: "Paneer", estimatedConfidenceOverall: "Medium")
        let result = NutritionResult(metadata: metadata, detectedItems: [item], totals: totals, warnings: [])
        ResultView(result: result, weightGrams: 200) {}
    }
}
