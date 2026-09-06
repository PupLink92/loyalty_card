import SwiftUI
import SwiftData

struct AddCardView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var existingCards: [LoyaltyCard]

    var cardToEdit: LoyaltyCard?

    @State private var name: String
    @State private var codeValue: String
    @State private var codeType: CodeType
    @State private var colorHex: String
    @State private var showingScanner = false

    static let palette = [
        "4F46E5", "7C3AED", "DB2777", "DC2626",
        "EA580C", "D97706", "16A34A", "0891B2",
        "2563EB", "525252",
    ]

    init(cardToEdit: LoyaltyCard? = nil) {
        self.cardToEdit = cardToEdit
        _name = State(initialValue: cardToEdit?.name ?? "")
        _codeValue = State(initialValue: cardToEdit?.codeValue ?? "")
        _codeType = State(initialValue: cardToEdit?.codeType ?? .code128)
        _colorHex = State(initialValue: cardToEdit?.colorHex ?? Self.palette[0])
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Button {
                        showingScanner = true
                    } label: {
                        Label("Scansiona codice", systemImage: "camera.viewfinder")
                    }
                }

                Section("Dettagli") {
                    TextField("Nome negozio / carta", text: $name)
                    Picker("Tipo di codice", selection: $codeType) {
                        ForEach(CodeType.allCases) { type in
                            Text(type.label).tag(type)
                        }
                    }
                    TextField("Codice", text: $codeValue)
                        .textInputAutocapitalization(.characters)
                }

                Section("Colore") {
                    let columns = [GridItem(.adaptive(minimum: 34))]
                    LazyVGrid(columns: columns, spacing: 10) {
                        ForEach(Self.palette, id: \.self) { hex in
                            Circle()
                                .fill(Color(hex: hex))
                                .frame(width: 34, height: 34)
                                .overlay(
                                    Circle().stroke(Color.primary, lineWidth: colorHex == hex ? 2 : 0)
                                )
                                .onTapGesture { colorHex = hex }
                        }
                    }
                    .padding(.vertical, 4)
                }

                if cardToEdit != nil {
                    Section {
                        Button("Elimina carta", role: .destructive) {
                            if let card = cardToEdit {
                                modelContext.delete(card)
                            }
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle(cardToEdit == nil ? "Nuova carta" : "Modifica carta")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || codeValue.isEmpty)
                }
            }
            .sheet(isPresented: $showingScanner) {
                BarcodeScannerView { value, type in
                    codeValue = value
                    if let type {
                        codeType = type
                    }
                    showingScanner = false
                }
            }
        }
    }

    private func save() {
        if let card = cardToEdit {
            card.name = name
            card.codeValue = codeValue
            card.codeType = codeType
            card.colorHex = colorHex
        } else {
            let card = LoyaltyCard(
                name: name, codeValue: codeValue, codeType: codeType,
                colorHex: colorHex, sortOrder: existingCards.count
            )
            modelContext.insert(card)
        }
        dismiss()
    }
}
