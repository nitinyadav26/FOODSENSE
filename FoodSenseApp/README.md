# FoodSense iOS App

This SwiftUI-based iOS 17 application pairs with the FoodSense smart scale over Bluetooth LE, captures a photo of the meal, and sends the weight plus image to the FoodSense backend for nutrition analysis.

## Architecture Overview
- **BLE Layer**: `BLEManager` (CoreBluetooth) scans for the ESP32 service `0000FFF0-0000-1000-8000-00805F9B34FB`, subscribes to weight notifications on characteristic `0000FFF1-0000-1000-8000-00805F9B34FB`, and exposes connection state/weight via `@Published` properties.
- **Networking Layer**: `APIClient` builds a multipart `POST /api/analyze_meal` request and decodes the nutrition response into strongly typed `Codable` models.
- **Models**: `NutritionResult` and related structs represent backend data. `MealEntry` stores previously analyzed meals.
- **View Models**: `MealViewModel` orchestrates capture + API calls, while `MealLogViewModel` persists historical entries to disk.
- **Views**:
  - `ContentView` hosts a `NavigationStack` with `MainScaleView` as the landing screen.
  - `MainScaleView` displays live weight and a CTA to log a meal.
  - `CaptureMealView` handles the capture form, camera integration, and triggers `ResultView` navigation upon success.
  - `ResultView` renders calories, macros, detected items, and warnings.
  - `MealLogView` shows prior meals and allows clearing the log.
- **Utilities**: `ImagePicker` wraps `UIImagePickerController` for SwiftUI camera usage.

## Backend Contract
- Base URL: `https://api.foodsense.example.com`
- Endpoint: `POST /api/analyze_meal`
- Multipart fields:
  - `weight_grams` (Int)
  - `meal_type` (String, optional)
  - `user_notes` (String, optional)
  - `image` (JPEG)

## Permissions
Update `Info.plist` with the keys listed in `InfoPlistAdditions.md`. The app requires Bluetooth, camera, and optional photo library access.

## Build & Run Commands
After cloning the repository to your Mac (with Xcode 15+ and iOS 17 SDK installed), run the following commands in **Terminal** to compile and deploy the app to an iPhone:

```bash
# 1. Ensure Xcode command-line tools exist (no-op if already installed)
xcode-select --install

# 2. Navigate into the project folder and open it in Xcode
cd /path/to/FOODSENSE/FoodSenseApp
xed .    # opens the folder in Xcode; create a FoodSense SwiftUI project if prompted

# 3. Select your Apple ID team for signing (Xcode > target > Signing & Capabilities)

# 4. Optional: run a clean simulator build from Terminal
xcodebuild \
  -scheme FoodSenseApp \
  -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.5' \
  clean build

# 5. Build for the connected iPhone (replace YOUR_DEVICE_NAME with the device's name)
xcodebuild \
  -scheme FoodSenseApp \
  -destination 'platform=iOS,name="YOUR_DEVICE_NAME"' \
  -allowProvisioningUpdates \
  clean build

# 6. Deploy from Xcode (easiest way)
# Select your iPhone as the run destination and press Cmd+R.
```

> **Tip:** If Xcode reports that the `FoodSenseApp` scheme does not exist after `xed .`, create a new SwiftUI iOS App target named **FoodSense** inside this folder, add the provided Swift files to it, then rerun the `xcodebuild` commands.
