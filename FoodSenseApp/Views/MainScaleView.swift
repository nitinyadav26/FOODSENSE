import SwiftUI

struct MainScaleView: View {
    @EnvironmentObject private var bleManager: BLEManager

    var body: some View {
        VStack(spacing: 32) {
            VStack(spacing: 8) {
                Text(bleManager.statusMessage)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("\(bleManager.currentWeightGrams) g")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .monospacedDigit()
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(RoundedRectangle(cornerRadius: 16).fill(Color(.secondarySystemBackground)))

            NavigationLink(destination: CaptureMealView()) {
                Label("Log Meal", systemImage: "camera.fill")
                    .font(.title2)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(bleManager.isConnected ? Color.accentColor : Color.gray)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .disabled(!bleManager.isConnected)

            Spacer()
        }
        .padding()
        .navigationDestination(isPresented: .constant(false)) {
            EmptyView()
        }
    }
}

struct MainScaleView_Previews: PreviewProvider {
    static var previews: some View {
        MainScaleView()
            .environmentObject(BLEManager())
    }
}
