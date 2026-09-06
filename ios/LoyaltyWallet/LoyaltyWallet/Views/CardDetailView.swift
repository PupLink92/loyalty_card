import SwiftUI
import UIKit

struct CardDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var card: LoyaltyCard
    @State private var showingEdit = false
    @State private var originalBrightness: CGFloat = UIScreen.main.brightness

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 16) {
                HStack {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.85))
                    }
                    Spacer()
                    Button {
                        showingEdit = true
                    } label: {
                        Image(systemName: "pencil.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.85))
                    }
                }
                .padding()

                Text(card.name)
                    .font(.title3.bold())
                    .foregroundStyle(.white)

                Text(card.codeType.label)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.6))
                    .textCase(.uppercase)

                if let uiImage = CodeGenerator.image(for: card.codeValue, type: card.codeType) {
                    Image(uiImage: uiImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(maxWidth: 320, maxHeight: 320)
                        .padding(20)
                        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                        .padding(.horizontal, 30)
                } else {
                    Text("Impossibile generare il codice")
                        .foregroundStyle(.white)
                }

                Text(card.codeValue)
                    .font(.system(.footnote, design: .monospaced))
                    .foregroundStyle(.white.opacity(0.8))

                Spacer()
            }
        }
        .onAppear {
            UIApplication.shared.isIdleTimerDisabled = true
            originalBrightness = UIScreen.main.brightness
            UIScreen.main.brightness = 1.0
        }
        .onDisappear {
            UIApplication.shared.isIdleTimerDisabled = false
            UIScreen.main.brightness = originalBrightness
        }
        .sheet(isPresented: $showingEdit) {
            AddCardView(cardToEdit: card)
        }
    }
}
