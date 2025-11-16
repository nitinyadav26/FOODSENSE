import Foundation

@MainActor
final class MealLogViewModel: ObservableObject {
    @Published private(set) var entries: [MealEntry] = []

    private let storageURL: URL

    init() {
        let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first ?? URL(fileURLWithPath: NSTemporaryDirectory())
        storageURL = directory.appendingPathComponent("meal_log.json")
        loadEntries()
    }

    func addEntry(from result: NutritionResult, weight: Int, mealType: String?, notes: String?) {
        let calories = result.totals.caloriesKcal ?? 0
        let primaryLabel = result.detectedItems.first?.label ?? "Meal"
        let entry = MealEntry(weightGrams: weight, calories: calories, primaryLabel: primaryLabel, mealType: mealType, notes: notes)
        entries.insert(entry, at: 0)
        saveEntries()
    }

    func clearLog() {
        entries.removeAll()
        saveEntries()
    }

    func remove(at offsets: IndexSet) {
        entries.remove(atOffsets: offsets)
        saveEntries()
    }

    private func loadEntries() {
        guard FileManager.default.fileExists(atPath: storageURL.path) else { return }
        do {
            let data = try Data(contentsOf: storageURL)
            entries = try JSONDecoder().decode([MealEntry].self, from: data)
        } catch {
            entries = []
        }
    }

    private func saveEntries() {
        do {
            let data = try JSONEncoder().encode(entries)
            try data.write(to: storageURL)
        } catch {
            print("Failed to persist meal log: \(error.localizedDescription)")
        }
    }
}
