import SwiftUI

@main
struct FoodSenseApp: App {
    @StateObject private var bleManager = BLEManager()
    @StateObject private var mealLogViewModel = MealLogViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(bleManager)
                .environmentObject(mealLogViewModel)
        }
    }
}
