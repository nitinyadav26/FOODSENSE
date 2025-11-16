import Foundation
import UIKit

struct APIError: LocalizedError {
    let message: String

    var errorDescription: String? { message }
}

final class APIClient {
    static let shared = APIClient()
    private init() {}

    private let baseURL = URL(string: "https://api.foodsense.example.com")!

    func analyzeMeal(image: UIImage, weightGrams: Int, mealType: String?, userNotes: String?) async throws -> NutritionResult {
        guard let imageData = image.jpegData(compressionQuality: 0.85) else {
            throw APIError(message: "Unable to encode image as JPEG")
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: baseURL.appendingPathComponent("/api/analyze_meal"))
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        func appendField(name: String, value: String) {
            if let data = "--\(boundary)\r\nContent-Disposition: form-data; name=\"\(name)\"\r\n\r\n\(value)\r\n".data(using: .utf8) {
                body.append(data)
            }
        }

        appendField(name: "weight_grams", value: String(weightGrams))
        if let mealType, !mealType.isEmpty {
            appendField(name: "meal_type", value: mealType)
        }
        if let userNotes, !userNotes.isEmpty {
            appendField(name: "user_notes", value: userNotes)
        }

        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"meal.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(message: "Invalid response from server")
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let serverMessage = String(data: data, encoding: .utf8) ?? "Unknown server error"
            throw APIError(message: "Server error (\(httpResponse.statusCode)): \(serverMessage)")
        }

        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(NutritionResult.self, from: data)
        } catch {
            throw APIError(message: "Failed to decode response: \(error.localizedDescription)")
        }
    }
}
