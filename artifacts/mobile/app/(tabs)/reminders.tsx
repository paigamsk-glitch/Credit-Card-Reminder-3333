import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import type { CreditCard } from "@/context/CardsContext";
import { getDaysUntilDue, useCards } from "@/context/CardsContext";
import { parseDueDate } from "@/lib/cardUtils";
import { useColors } from "@/hooks/useColors";

function dueDateLeftColumn(dueDate: string): { main: string; sub: string } {
  const parsed = parseDueDate(dueDate);
  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (parsed.type === "specific" && parsed.month) {
    return { main: String(parsed.startDay), sub: MONTH_SHORT[parsed.month - 1] ?? "" };
  }
  if (parsed.type === "range") {
    return { main: `${parsed.startDay}-${parsed.endDay}`, sub: "range" };
  }
  return { main: String(parsed.startDay), sub: "of month" };
}

interface ReminderGroup {
  title: string;
  subtitle: string;
  cards: CreditCard[];
  urgent?: boolean;
}

function groupReminders(cards: CreditCard[]): ReminderGroup[] {
  const unpaid = cards.filter((c) => c.paymentStatus !== "Paid");
  const overdue = unpaid.filter((c) => c.paymentStatus === "Overdue");
  const today = unpaid.filter((c) => c.paymentStatus !== "Overdue" && getDaysUntilDue(c.dueDate) === 0);
  const tomorrow = unpaid.filter((c) => getDaysUntilDue(c.dueDate) === 1);
  const threeDays = unpaid.filter((c) => {
    const d = getDaysUntilDue(c.dueDate);
    return d >= 2 && d <= 3;
  });
  const week = unpaid.filter((c) => {
    const d = getDaysUntilDue(c.dueDate);
    return d >= 4 && d <= 7;
  });
  const later = unpaid.filter((c) => getDaysUntilDue(c.dueDate) > 7);

  const groups: ReminderGroup[] = [];
  if (overdue.length > 0) groups.push({ title: "Overdue", subtitle: "Immediate payment needed", cards: overdue, urgent: true });
  if (today.length > 0) groups.push({ title: "Due Today", subtitle: "Pay before midnight", cards: today, urgent: true });
  if (tomorrow.length > 0) groups.push({ title: "Due Tomorrow", subtitle: "Second reminder", cards: tomorrow });
  if (threeDays.length > 0) groups.push({ title: "Due in 2–3 Days", subtitle: "First reminder window", cards: threeDays });
  if (week.length > 0) groups.push({ title: "Due This Week", subtitle: "Upcoming payments", cards: week });
  if (later.length > 0) groups.push({ title: "Later This Month", subtitle: "Scheduled ahead", cards: later });
  return groups;
}

function ReminderCard({ card }: { card: CreditCard }) {
  const colors = useColors();
  const days = getDaysUntilDue(card.dueDate);
  const { main: dueDateMain, sub: dueDateSub } = dueDateLeftColumn(card.dueDate);
  const dayLabel =
    card.paymentStatus === "Overdue"
      ? `Overdue ${Math.abs(days)}d`
      : days === 0
      ? "Due today"
      : days === 1
      ? "Due tomorrow"
      : `Due in ${days}d`;

  return (
    <TouchableOpacity
      style={[styles.reminderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.selectionAsync();
        router.push(`/card/${card.id}` as any);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.reminderLeft, { width: dueDateSub === "range" ? 52 : 36 }]}>
        <Text style={[styles.reminderDueDay, { color: colors.primary, fontSize: dueDateSub === "range" ? 14 : 22 }]}>
          {dueDateMain}
        </Text>
        <Text style={[styles.reminderDueLabel, { color: colors.mutedForeground }]}>
          {dueDateSub}
        </Text>
      </View>
      <View style={styles.reminderMid}>
        <Text style={[styles.reminderCardName, { color: colors.foreground }]} numberOfLines={1}>
          {card.cardName}
        </Text>
        <Text style={[styles.reminderHolder, { color: colors.mutedForeground }]} numberOfLines={1}>
          {card.bankName} · {card.cardHolderName} · ···{card.lastFourDigits}
        </Text>
        <Text style={[styles.reminderDayLabel, {
          color: card.paymentStatus === "Overdue"
            ? colors.destructive
            : days <= 1
            ? colors.warning
            : colors.mutedForeground
        }]}>
          {dayLabel}
        </Text>
      </View>
      <PaymentStatusBadge status={card.paymentStatus} />
    </TouchableOpacity>
  );
}

export default function RemindersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeCards } = useCards();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const groups = groupReminders(activeCards);
  const allPaid = activeCards.length > 0 && activeCards.every((c) => c.paymentStatus === "Paid");

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Reminders</Text>
      </View>

      {allPaid ? (
        <View style={styles.allPaidWrap}>
          <View style={[styles.allPaidBubble, { backgroundColor: colors.successLight }]}>
            <Feather name="check-circle" size={40} color={colors.success} />
            <Text style={[styles.allPaidTitle, { color: colors.success }]}>
              All paid!
            </Text>
            <Text style={[styles.allPaidSub, { color: colors.success }]}>
              Every card for this month is cleared.
            </Text>
          </View>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.allPaidWrap}>
          <View style={[styles.allPaidBubble, { backgroundColor: colors.muted }]}>
            <Feather name="bell-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.allPaidTitle, { color: colors.foreground }]}>
              No reminders
            </Text>
            <Text style={[styles.allPaidSub, { color: colors.mutedForeground }]}>
              Add cards to track payment due dates
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.title}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <View style={[styles.groupHeader, group.urgent && { backgroundColor: group.title === "Overdue" ? colors.dangerLight : colors.warningLight }]}>
                {group.urgent && (
                  <Feather
                    name="alert-circle"
                    size={14}
                    color={group.title === "Overdue" ? colors.destructive : colors.warning}
                  />
                )}
                <View>
                  <Text
                    style={[
                      styles.groupTitle,
                      {
                        color: group.urgent
                          ? group.title === "Overdue"
                            ? colors.destructive
                            : colors.warning
                          : colors.foreground,
                      },
                    ]}
                  >
                    {group.title}
                  </Text>
                  <Text style={[styles.groupSub, { color: colors.mutedForeground }]}>
                    {group.subtitle} · {group.cards.length} card{group.cards.length > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
              {group.cards.map((card) => (
                <ReminderCard key={card.id} card={card} />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  group: { marginBottom: 20 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  groupTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  groupSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  reminderLeft: { alignItems: "center", width: 36 },
  reminderDueDay: { fontSize: 22, fontFamily: "Inter_700Bold" },
  reminderDueLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  reminderMid: { flex: 1, gap: 2 },
  reminderCardName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reminderHolder: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reminderDayLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  allPaidWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  allPaidBubble: { borderRadius: 24, padding: 32, alignItems: "center", gap: 12, width: "100%" },
  allPaidTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  allPaidSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
