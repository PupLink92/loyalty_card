import Foundation
import SwiftData

enum CodeType: String, Codable, CaseIterable, Identifiable {
    case code128 = "CODE128"
    case qr = "QR"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .code128: return "Barcode (Code 128)"
        case .qr: return "QR Code"
        }
    }
}

@Model
final class LoyaltyCard {
    var name: String
    var codeValue: String
    var codeTypeRaw: String
    var colorHex: String
    var createdAt: Date
    var sortOrder: Int

    var codeType: CodeType {
        get { CodeType(rawValue: codeTypeRaw) ?? .code128 }
        set { codeTypeRaw = newValue.rawValue }
    }

    init(name: String, codeValue: String, codeType: CodeType, colorHex: String, sortOrder: Int = 0) {
        self.name = name
        self.codeValue = codeValue
        self.codeTypeRaw = codeType.rawValue
        self.colorHex = colorHex
        self.createdAt = .now
        self.sortOrder = sortOrder
    }
}
