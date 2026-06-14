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

export default function BankCardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { activeCards } = useCards();
  const [query, setQuery] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const bankName = decodeURIComponent(name ?? "");
  const bankCards = activeCards.filter((c) => c.bankName === bankName);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? bankCards.filter(
        (c) =>
          c.cardName.toLowerCase().includes(q) ||
          c.cardHolderName.toLowerCase().includes(q) ||
          c.lastFourDigits.includes(q)
      )
    : bankCards;

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
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {bankName}
        </Text>
      </View>

      {/* Count + Search */}
      <View style={[styles.subHeader, { paddingHorizontal: 16 }]}>
        <View style={styles.countRow}>
          <Text style={[styles.countNumber, { color: colors.primary }]}>{bankCards.length}</Text>
          <Text style={[styles.countLabel, { color: colors.foreground }]}>
            {" "}Active Credit {bankCards.length === 1 ? "Card" : "Cards"}
          </Text>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, holder or digits…"
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

      {/* Card List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="search"
            title={query ? "No cards match your search" : `No cards for ${bankName}`}
            subtitle={query ? "Try a different keyword" : "Add a card from the dashboard to see it here"}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
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
    gap: 12,
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
