import SwiftUI
import SwiftData

@main
struct LoyaltyWalletApp: App {
    var body: some Scene {
        WindowGroup {
            CardListView()
        }
        .modelContainer(for: LoyaltyCard.self)
    }
}
