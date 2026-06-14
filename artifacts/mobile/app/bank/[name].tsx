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

export default function BankCardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { activeCards } = useCards();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const bankName = decodeURIComponent(name ?? "");
  const bankCards = activeCards.filter((c) => c.bankName === bankName);

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

      {/* Count */}
      <View style={[styles.countRow, { paddingHorizontal: 16 }]}>
        <Text style={[styles.countNumber, { color: colors.primary }]}>{bankCards.length}</Text>
        <Text style={[styles.countLabel, { color: colors.foreground }]}>
          {" "}
          Active Credit {bankCards.length === 1 ? "Card" : "Cards"}
        </Text>
      </View>

      {/* Card List */}
      {bankCards.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="credit-card"
            title={`No cards for ${bankName}`}
            subtitle="Add a card from the dashboard to see it here"
          />
        </View>
      ) : (
        <FlatList
          data={bankCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardListItem card={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomPad + 40 },
          ]}
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
