import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardListItem } from "@/components/CardListItem";
import { EmptyState } from "@/components/EmptyState";
import type { PaymentStatus } from "@/context/CardsContext";
import { useCards } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";

type FilterType = "All" | PaymentStatus | "Frozen";
const FILTERS: FilterType[] = ["All", "Pending", "Paid", "Overdue", "Frozen"];

export default function CardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeCards } = useCards();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = useMemo(() => {
    return activeCards.filter((card) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Frozen" ? !!card.isFrozen : card.paymentStatus === filter);
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        card.cardHolderName.toLowerCase().includes(q) ||
        card.cardName.toLowerCase().includes(q) ||
        card.bankName.toLowerCase().includes(q) ||
        card.lastFourDigits.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [activeCards, filter, search]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = {
      All: activeCards.length,
      Pending: 0,
      Paid: 0,
      Overdue: 0,
      Frozen: 0,
    };
    activeCards.forEach((c) => {
      counts[c.paymentStatus]++;
      if (c.isFrozen) counts.Frozen++;
    });
    return counts;
  }, [activeCards]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: topPad + 16,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>My Cards</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/card/add" as any);
          }}
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { paddingHorizontal: 16, paddingTop: 12 }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search cards, banks, holders..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersWrap}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          const isFrozenFilter = f === "Frozen";
          const activeBg = isFrozenFilter ? colors.destructive : colors.primary;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? activeBg : colors.card,
                  borderColor: active ? activeBg : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f);
              }}
            >
              {isFrozenFilter && (
                <Feather
                  name="lock"
                  size={11}
                  color={active ? "#fff" : colors.mutedForeground}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  { color: active ? "#fff" : colors.mutedForeground },
                ]}
              >
                {f} {filterCounts[f] > 0 ? `(${filterCounts[f]})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardListItem card={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <EmptyState
            icon="credit-card"
            title={search ? "No cards found" : "No cards yet"}
            subtitle={
              search
                ? "Try a different search term"
                : 'Tap the "+" button to add your first card'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: { marginBottom: 8 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  filtersWrap: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
});
