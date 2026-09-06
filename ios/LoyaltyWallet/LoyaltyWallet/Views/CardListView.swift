import SwiftUI
import SwiftData

struct CardListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \LoyaltyCard.sortOrder) private var cards: [LoyaltyCard]

    @State private var showingAdd = false
    @State private var selectedCard: LoyaltyCard?

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 14)]

    var body: some View {
        NavigationStack {
            Group {
                if cards.isEmpty {
                    ContentUnavailableView(
                        "Ancora nessuna carta",
                        systemImage: "creditcard",
                        description: Text("Aggiungi la prima carta fedeltà per iniziare.")
                    )
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 14) {
                            ForEach(cards) { card in
                                CardTileView(card: card)
                                    .onTapGesture { selectedCard = card }
                                    .contextMenu {
                                        Button(role: .destructive) {
                                            modelContext.delete(card)
                                        } label: {
                                            Label("Elimina", systemImage: "trash")
                                        }
                                    }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Portacarte")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAdd = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
            }
            .sheet(isPresented: $showingAdd) {
                AddCardView()
            }
            .fullScreenCover(item: $selectedCard) { card in
                CardDetailView(card: card)
            }
        }
    }
}

private struct CardTileView: View {
    let card: LoyaltyCard

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(String(card.name.prefix(2)).uppercased())
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .frame(width: 30, height: 30)
                    .background(.white.opacity(0.25), in: Circle())
                Spacer()
            }
            Spacer()
            VStack(alignment: .leading, spacing: 2) {
                Text(card.name)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .lineLimit(2)
                Text(card.codeType.label)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.85))
            }
        }
        .padding(16)
        .frame(height: 110)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Color(hex: card.colorHex), Color(hex: card.colorHex).opacity(0.75)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 20, style: .continuous)
        )
    }
}
