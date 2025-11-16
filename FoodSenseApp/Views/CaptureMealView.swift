import SwiftUI

struct CaptureMealView: View {
    @EnvironmentObject private var bleManager: BLEManager
    @EnvironmentObject private var mealLogViewModel: MealLogViewModel
    @StateObject private var viewModel = MealViewModel()

    @State private var isShowingCamera = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                weightSection
                imageSection
                mealTypeSection
                notesSection
                analyzeButton
            }
            .padding()
        }
        .navigationTitle("Log Meal")
        .sheet(isPresented: $isShowingCamera) {
            ImagePicker(sourceType: .camera) { image in
                viewModel.capturedImage = image
            }
        }
        .alert(isPresented: Binding<Bool>(
            get: { viewModel.errorMessage != nil },
            set: { _ in viewModel.errorMessage = nil }
        )) {
            Alert(title: Text("Error"), message: Text(viewModel.errorMessage ?? "Unknown error"), dismissButton: .default(Text("OK")))
        }
        .navigationDestination(item: $viewModel.result) { result in
            let analyzedWeight = viewModel.lastAnalyzedWeight ?? bleManager.currentWeightGrams
            ResultView(result: result, weightGrams: analyzedWeight) {
                mealLogViewModel.addEntry(from: result, weight: analyzedWeight, mealType: viewModel.selectedMealType.rawValue, notes: viewModel.notes)
                viewModel.resetAfterSuccess()
            }
        }
    }

    private var weightSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Current Weight")
                .font(.headline)
            Text("\(bleManager.currentWeightGrams) g")
                .font(.system(size: 36, weight: .bold))
                .monospacedDigit()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var imageSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Photo")
                .font(.headline)
            if let image = viewModel.capturedImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 220)
                    .clipped()
                    .cornerRadius(12)
            } else {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6]))
                        .frame(height: 220)
                    Text("Tap to capture meal")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .contentShape(Rectangle())
        .onTapGesture {
            isShowingCamera = true
        }
    }

    private var mealTypeSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Meal Type")
                .font(.headline)
            Picker("Meal Type", selection: $viewModel.selectedMealType) {
                ForEach(viewModel.mealTypes) { type in
                    Text(type.displayName).tag(type)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Notes")
                .font(.headline)
            TextEditor(text: $viewModel.notes)
                .frame(height: 100)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.3)))
        }
    }

    private var analyzeButton: some View {
        Button(action: {
            Task {
                await viewModel.analyzeCurrentMeal(weight: bleManager.currentWeightGrams)
            }
        }) {
            if viewModel.isAnalyzing {
                ProgressView()
                    .progressViewStyle(.circular)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                Text("Analyze & Save")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
            }
        }
        .buttonStyle(.borderedProminent)
        .disabled(viewModel.capturedImage == nil || viewModel.isAnalyzing)
    }
}

struct CaptureMealView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            CaptureMealView()
                .environmentObject(BLEManager())
                .environmentObject(MealLogViewModel())
        }
    }
}
