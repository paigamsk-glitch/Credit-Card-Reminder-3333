import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import type { CreditCard } from "@/context/CardsContext";
import { getDaysUntilDue, getNextDueDate } from "@/context/CardsContext";

export interface WidgetSummary {
  overdueCount: number;
  nextDueLabel: string;
  nextDueBank: string | null;
}

const WIDGET_STORAGE_KEY = "cardtracker_widget_summary";
const IOS_APP_GROUP = "group.com.cardtracker.widget";

function buildSummary(cards: CreditCard[]): WidgetSummary {
  const active = cards.filter((c) => c.isActive);
  const overdueCount = active.filter((c) => c.paymentStatus === "Overdue").length;

  const upcoming = active
    .filter((c) => c.paymentStatus !== "Paid")
    .sort((a, b) => getNextDueDate(a.dueDate).getTime() - getNextDueDate(b.dueDate).getTime())[0];

  if (!upcoming) {
    return { overdueCount, nextDueLabel: "All caught up", nextDueBank: null };
  }

  const daysUntil = getDaysUntilDue(upcoming.dueDate);
  const nextDueLabel =
    upcoming.paymentStatus === "Overdue"
      ? `${Math.abs(daysUntil)}d overdue`
      : daysUntil === 0
      ? "Due today"
      : daysUntil === 1
      ? "Due tomorrow"
      : `Due in ${daysUntil}d`;

  return { overdueCount, nextDueLabel, nextDueBank: upcoming.bankName };
}

// Pushes the latest "next due / overdue count" summary to the native home
// screen widgets. Android reads this from AsyncStorage inside its widget
// task handler; iOS reads it from a shared App Group via UserDefaults.
// Both widgets only take effect in a custom dev/EAS build — Expo Go cannot
// host native home screen widgets.
export async function syncWidgetSummary(cards: CreditCard[]): Promise<void> {
  const summary = buildSummary(cards);

  try {
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(summary));
  } catch {
    // Non-fatal: widget will just show stale data until next successful sync.
  }

  if (Platform.OS === "android") {
    try {
      const { requestWidgetUpdate } = await import("react-native-android-widget");
      const { DueSummaryWidget } = await import("@/widgets/DueSummaryWidget");
      const React = await import("react");
      await requestWidgetUpdate({
        widgetName: "DueSummary",
        renderWidget: () => React.createElement(DueSummaryWidget, summary),
        widgetNotFound: () => {},
      });
    } catch {
      // Widget module isn't available in this build (e.g. Expo Go) — ignore.
    }
  }

  if (Platform.OS === "ios") {
    try {
      const SharedGroupPreferences = (await import("react-native-shared-group-preferences")).default;
      await SharedGroupPreferences.setItem("widgetSummary", summary, IOS_APP_GROUP);
    } catch {
      // Widget module isn't available in this build (e.g. Expo Go) — ignore.
    }
  }
}
