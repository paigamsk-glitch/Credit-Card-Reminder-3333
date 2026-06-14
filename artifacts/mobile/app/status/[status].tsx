import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

import { CardListItem } from "@/components/CardListItem";
import { EmptyState } from "@/components/EmptyState";
import { useCards } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";

const STATUS_META: Record<string, { label: string; color: string; icon: string; emptyTitle: string; emptySubtitle: string }> = {
  Paid: {
    label: "Paid Cards",
    color: "#16A34A",
    icon: "check-circle",
    emptyTitle: "No paid cards yet",
    emptySubtitle: "Mark cards as paid from the card detail screen",
  },
  Pending: {
    label: "Pending Cards",
    color: "#D97706",
    icon: "clock",
    emptyTitle: "No pending cards",
    emptySubtitle: "All your cards are either paid or overdue",
  },
  Overdue: {
    label: "Overdue Cards",
    color: "#DC2626",
    icon: "alert-circle",
    emptyTitle: "No overdue cards",
    emptySubtitle: "Great job! All your payments are up to date",
  },
};

export default function StatusCardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status } = useLocalSearchParams<{ status: string }>();
  const { activeCards } = useCards();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const statusKey = status as "Paid" | "Pending" | "Overdue";
  const meta = STATUS_META[statusKey] ?? STATUS_META["Pending"];

  const filteredCards = activeCards.filter((c) => c.paymentStatus === statusKey);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Feather name={meta.icon as any} size={22} color={meta.color} />
        <Text style={[styles.title, { color: colors.foreground }]}>{meta.label}</Text>
      </View>

      {/* Count badge */}
      <View style={[styles.countRow, { paddingHorizontal: 16 }]}>
        <Text style={[styles.countNumber, { color: meta.color }]}>{filteredCards.length}</Text>
        <Text style={[styles.countLabel, { color: colors.foreground }]}>
          {" "}{filteredCards.length === 1 ? "Card" : "Cards"}
        </Text>
      </View>

      {filteredCards.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={meta.icon as any}
            title={meta.emptyTitle}
            subtitle={meta.emptySubtitle}
          />
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardListItem card={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 40 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 16,
    paddingBottom: 8,
  },
  countNumber: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  countLabel: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  emptyWrap: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
});
