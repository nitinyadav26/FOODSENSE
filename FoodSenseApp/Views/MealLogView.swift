import SwiftUI

struct MealLogView: View {
    @EnvironmentObject private var mealLogViewModel: MealLogViewModel

    var body: some View {
        List {
            if mealLogViewModel.entries.isEmpty {
                ContentUnavailableView("No meals yet", systemImage: "fork.knife", description: Text("Log a meal to see it here."))
            } else {
                ForEach(mealLogViewModel.entries) { entry in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(entry.primaryLabel)
                            .font(.headline)
                        Text("\(Int(entry.calories)) kcal • \(entry.weightGrams) g")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(entry.timestamp.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
                .onDelete(perform: mealLogViewModel.remove)
            }
        }
        .navigationTitle("Meal Log")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if !mealLogViewModel.entries.isEmpty {
                    Button("Clear") {
                        mealLogViewModel.clearLog()
                    }
                }
            }
        }
    }
}

struct MealLogView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            MealLogView()
                .environmentObject(MealLogViewModel())
        }
    }
}
