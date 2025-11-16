import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var bleManager: BLEManager

    var body: some View {
        NavigationStack {
            MainScaleView()
                .navigationTitle("FoodSense Scale")
                .toolbar {
                    NavigationLink(destination: MealLogView()) {
                        Image(systemName: "list.bullet")
                    }
                }
        }
        .environmentObject(bleManager)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(BLEManager())
            .environmentObject(MealLogViewModel())
    }
}
