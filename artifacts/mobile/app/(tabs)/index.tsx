import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardListItem } from "@/components/CardListItem";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import {
  getDaysUntilDue,
  isExpired,
  isExpiringSoon,
  useCards,
} from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeCards, stats, loading, markAllAsPaid } = useCards();
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const urgentCards = activeCards.filter(
    (c) => c.paymentStatus !== "Paid" && getDaysUntilDue(c.dueDate) <= 3
  );
  const overdueCards = activeCards.filter((c) => c.paymentStatus === "Overdue");
  const expiringCards = activeCards.filter((c) => isExpiringSoon(c) || isExpired(c));

  const attentionCards = [
    ...overdueCards,
    ...urgentCards.filter((c) => c.paymentStatus !== "Overdue"),
  ].slice(0, 5);

  const unpaidCount = activeCards.filter((c) => c.paymentStatus !== "Paid").length;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  };

  const handleMarkAllPaid = () => {
    if (unpaidCount === 0) return;
    Alert.alert(
      "Mark All as Paid",
      `This will mark all ${unpaidCount} unpaid card${unpaidCount === 1 ? "" : "s"} as paid for this month. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All Paid",
          style: "default",
          onPress: async () => {
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setMarkingAll(true);
            await markAllAsPaid();
            setMarkingAll(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.date, { color: colors.foreground }]}>
            {formatDate(new Date())}
          </Text>
        </View>
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

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Cards"
            value={stats.total}
            color={colors.primary}
            lightColor={colors.secondary}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/overview" as any);
            }}
          />
          <StatCard
            label="Paid"
            value={stats.paid}
            color={colors.success}
            lightColor={colors.successLight}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/status/Paid" as any);
            }}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="Pending"
            value={stats.pending}
            color={colors.warning}
            lightColor={colors.warningLight}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/status/Pending" as any);
            }}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            color={colors.destructive}
            lightColor={colors.dangerLight}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/status/Overdue" as any);
            }}
          />
        </View>
      </View>

      {/* Mark All as Paid */}
      {unpaidCount > 0 && (
        <TouchableOpacity
          style={[styles.markAllBtn, { backgroundColor: markingAll ? colors.muted : colors.success, opacity: markingAll ? 0.7 : 1 }]}
          onPress={handleMarkAllPaid}
          disabled={markingAll || loading}
          activeOpacity={0.8}
        >
          <Feather name={markingAll ? "loader" : "check-square"} size={18} color="#fff" />
          <Text style={styles.markAllText}>
            {markingAll ? "Marking all paid…" : `Mark All as Paid (${unpaidCount} card${unpaidCount === 1 ? "" : "s"})`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Expiry Alert */}
      {expiringCards.length > 0 && (
        <View style={[styles.alertBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
          <Feather name="alert-triangle" size={16} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.warning }]}>
            {expiringCards.length} card{expiringCards.length > 1 ? "s" : ""} expiring or expired — update soon
          </Text>
        </View>
      )}

      {/* Attention Needed */}
      {attentionCards.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Needs attention
          </Text>
          {attentionCards.map((card) => (
            <CardListItem key={card.id} card={card} />
          ))}
        </View>
      )}

      {/* Progress Bar */}
      {stats.total > 0 && (
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              This month's payments
            </Text>
            <Text style={[styles.progressCount, { color: colors.mutedForeground }]}>
              {stats.paid}/{stats.total}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.success,
                  width: `${Math.round((stats.paid / stats.total) * 100)}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
            {stats.pending} pending · {stats.overdue} overdue
          </Text>
        </View>
      )}

      {/* All Cards */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            All cards
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/cards" as any)}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {activeCards.length === 0 ? (
          <EmptyState
            icon="credit-card"
            title="No cards yet"
            subtitle="Tap the + button to add your first credit card"
          />
        ) : (
          activeCards
            .slice(0, 3)
            .map((card) => <CardListItem key={card.id} card={card} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  date: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: { gap: 10, marginBottom: 14 },
  statsRow: { flexDirection: "row", gap: 10 },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 14,
  },
  markAllText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  progressCount: { fontSize: 14, fontFamily: "Inter_500Medium" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  progressSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
