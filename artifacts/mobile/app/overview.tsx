import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCards } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";

const BANK_COLORS: Record<string, string> = {
  HDFC: "#0058A2",
  ICICI: "#B22222",
  SBI: "#1565C0",
  Axis: "#6B21A8",
  Kotak: "#C05621",
  ONE: "#0D4F6B",
  AMEX: "#1A7340",
  YES: "#7B1FA2",
  RBL: "#C62828",
  IndusInd: "#00695C",
};

function getBankColor(bank: string, idx: number): string {
  if (BANK_COLORS[bank]) return BANK_COLORS[bank];
  const palette = ["#2563EB", "#D97706", "#059669", "#DC2626", "#7C3AED", "#0891B2"];
  return palette[idx % palette.length];
}

interface BarData {
  label: string;
  count: number;
  color: string;
  isOthers?: boolean;
}

function BarChart({ data, colors }: { data: BarData[]; colors: ReturnType<typeof useColors> }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const MAX_H = 110;

  return (
    <View style={barStyles.wrapper}>
      <View style={barStyles.yAxis}>
        {[maxVal, Math.round(maxVal * 0.5), 0].map((v, i) => (
          <Text key={i} style={[barStyles.yLabel, { color: colors.mutedForeground }]}>
            {v}
          </Text>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={barStyles.barsRow}>
          {data.map((item, i) => (
            <View key={i} style={barStyles.barCol}>
              <Text style={[barStyles.countLabel, { color: item.color }]}>{item.count}</Text>
              <View style={barStyles.barTrack}>
                <View
                  style={[
                    barStyles.bar,
                    {
                      height: Math.max(Math.round((item.count / maxVal) * MAX_H), 4),
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[barStyles.bankLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeCards } = useCards();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const bankCountMap: Record<string, number> = {};
  for (const card of activeCards) {
    bankCountMap[card.bankName] = (bankCountMap[card.bankName] ?? 0) + 1;
  }

  const sortedBanks = Object.entries(bankCountMap).sort((a, b) => b[1] - a[1]);

  const TOP_N = 5;
  const topBanks = sortedBanks.slice(0, TOP_N);
  const otherBanks = sortedBanks.slice(TOP_N);
  const othersCount = otherBanks.reduce((s, [, c]) => s + c, 0);

  const barData: BarData[] = topBanks.map(([name, count], idx) => ({
    label: name,
    count,
    color: getBankColor(name, idx),
  }));

  if (othersCount > 0) {
    barData.push({ label: "Others", count: othersCount, color: "#94A3B8", isOthers: true });
  }

  const summaryBanks: { name: string; count: number; color: string }[] = sortedBanks.map(
    ([name, count], idx) => ({ name, count, color: getBankColor(name, idx) })
  );

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>My Credit Cards Overview</Text>
      </View>

      {/* Bar Chart Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Credit Cards by Bank (Top {Math.min(sortedBanks.length, TOP_N)})
        </Text>
        {activeCards.length === 0 ? (
          <View style={styles.emptyChart}>
            <Feather name="bar-chart-2" size={36} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No cards to display</Text>
          </View>
        ) : (
          <BarChart data={barData} colors={colors} />
        )}
      </View>

      {/* Bank Summary */}
      {summaryBanks.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bank Summary</Text>
          {summaryBanks.map((bank) => (
            <TouchableOpacity
              key={bank.name}
              style={[styles.bankRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                router.push(`/bank/${encodeURIComponent(bank.name)}` as any);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.bankIcon, { backgroundColor: bank.color + "22" }]}>
                <Text style={[styles.bankInitial, { color: bank.color }]}>
                  {bank.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.bankInfo}>
                <Text style={[styles.bankName, { color: colors.foreground }]}>{bank.name}</Text>
                <Text style={[styles.bankCount, { color: colors.mutedForeground }]}>
                  {bank.count} {bank.count === 1 ? "card" : "cards"}
                </Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: bank.color + "18" }]}>
                <Text style={[styles.countBadgeText, { color: bank.color }]}>{bank.count}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const barStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    height: 170,
  },
  yAxis: {
    width: 28,
    height: 130,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 6,
    paddingBottom: 22,
  },
  yLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 4,
    height: 150,
  },
  barCol: {
    alignItems: "center",
    width: 48,
  },
  countLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  barTrack: {
    justifyContent: "flex-end",
    height: 110,
  },
  bar: {
    width: 36,
    borderRadius: 6,
  },
  bankLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginTop: 6,
    textAlign: "center",
    width: 48,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
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
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  emptyChart: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bankIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bankInitial: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  bankInfo: { flex: 1 },
  bankName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bankCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
