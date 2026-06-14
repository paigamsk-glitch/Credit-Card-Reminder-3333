import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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
  const [query, setQuery] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const statusKey = status as "Paid" | "Pending" | "Overdue";
  const meta = STATUS_META[statusKey] ?? STATUS_META["Pending"];

  const statusCards = activeCards.filter((c) => c.paymentStatus === statusKey);
  const q = query.trim().toLowerCase();
  const filteredCards = q
    ? statusCards.filter(
        (c) =>
          c.cardName.toLowerCase().includes(q) ||
          c.cardHolderName.toLowerCase().includes(q) ||
          c.bankName.toLowerCase().includes(q) ||
          c.lastFourDigits.includes(q)
      )
    : statusCards;

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

      {/* Count + Search */}
      <View style={[styles.subHeader, { paddingHorizontal: 16 }]}>
        <View style={styles.countRow}>
          <Text style={[styles.countNumber, { color: meta.color }]}>{statusCards.length}</Text>
          <Text style={[styles.countLabel, { color: colors.foreground }]}>
            {" "}{statusCards.length === 1 ? "Card" : "Cards"}
          </Text>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, bank or digits…"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredCards.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={query ? "search" : (meta.icon as any)}
            title={query ? "No cards match your search" : meta.emptyTitle}
            subtitle={query ? "Try a different keyword" : meta.emptySubtitle}
          />
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardListItem card={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  subHeader: {
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  countNumber: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  countLabel: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  emptyWrap: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
});
