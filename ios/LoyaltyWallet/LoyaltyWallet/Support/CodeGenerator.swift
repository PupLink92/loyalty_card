import UIKit
import CoreImage.CIFilterBuiltins

enum CodeGenerator {
    static func image(for value: String, type: CodeType, scale: CGFloat = 10) -> UIImage? {
        let context = CIContext()
        let data = Data(value.utf8)
        let outputImage: CIImage?

        switch type {
        case .qr:
            let filter = CIFilter.qrCodeGenerator()
            filter.message = data
            filter.correctionLevel = "M"
            outputImage = filter.outputImage
        case .code128:
            let filter = CIFilter.code128BarcodeGenerator()
            filter.message = data
            outputImage = filter.outputImage
        }

        guard let ciImage = outputImage else { return nil }
        let scaled = ciImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        guard let cgImage = context.createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
