import WidgetKit
import SwiftUI

struct DueSummaryEntry: TimelineEntry {
    let date: Date
    let overdueCount: Int
    let nextDueLabel: String
    let nextDueBank: String?
}

struct DueSummaryProvider: TimelineProvider {
    let appGroup = "group.com.cardtracker.widget"

    func placeholder(in context: Context) -> DueSummaryEntry {
        DueSummaryEntry(date: Date(), overdueCount: 0, nextDueLabel: "Due in 3d", nextDueBank: "HDFC")
    }

    func getSnapshot(in context: Context, completion: @escaping (DueSummaryEntry) -> Void) {
        completion(readEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DueSummaryEntry>) -> Void) {
        let entry = readEntry()
        // Widget re-reads shared storage every 30 minutes so it stays fresh
        // without requiring the app to explicitly trigger a reload.
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }

    private func readEntry() -> DueSummaryEntry {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let raw = defaults.string(forKey: "widgetSummary"),
            let data = raw.data(using: .utf8),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return DueSummaryEntry(date: Date(), overdueCount: 0, nextDueLabel: "Open app to sync", nextDueBank: nil)
        }

        return DueSummaryEntry(
            date: Date(),
            overdueCount: json["overdueCount"] as? Int ?? 0,
            nextDueLabel: json["nextDueLabel"] as? String ?? "No cards yet",
            nextDueBank: json["nextDueBank"] as? String
        )
    }
}

struct DueSummaryWidgetView: View {
    var entry: DueSummaryProvider.Entry

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.10, blue: 0.20)

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("CARD TRACKER")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white.opacity(0.55))
                    Spacer()
                    if entry.overdueCount > 0 {
                        Text("\(entry.overdueCount) overdue")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color(red: 0.90, green: 0.28, blue: 0.29))
                            .clipShape(Capsule())
                    }
                }

                Spacer()

                Text(entry.overdueCount > 0 ? "Payment overdue" : "Next due")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                Text(entry.nextDueLabel)
                    .font(.system(size: 22, weight: .heavy))
                    .foregroundColor(.white)
                if let bank = entry.nextDueBank {
                    Text(bank)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(Color(red: 0.94, green: 0.65, blue: 0.0))
                }
            }
            .padding(16)
        }
    }
}

struct DueSummaryWidget: Widget {
    let kind: String = "DueSummaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DueSummaryProvider()) { entry in
            DueSummaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Next Due")
        .description("Shows your next payment due date or overdue count.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
