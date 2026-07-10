import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardVisual } from "@/components/CardVisual";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { getDaysUntilDue, isExpired, isExpiringSoon, useCards } from "@/context/CardsContext";
import { parseDueDate } from "@/lib/cardUtils";
import { useColors } from "@/hooks/useColors";

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CardDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCard, markAsPaid, markAsPending, deleteCard, updateCard } = useCards();
  const [loading, setLoading] = useState(false);
  const card = getCard(id);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!card) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Card not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysUntil = getDaysUntilDue(card.dueDate);
  const expiring = isExpiringSoon(card);
  const expired = isExpired(card);

  const handleMarkPaid = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    await markAsPaid(card.id);
    setLoading(false);
  };

  const handleMarkPending = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await markAsPending(card.id);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Card",
      `Remove ${card.cardName} from your tracker?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteCard(card.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDeactivate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateCard(card.id, { isActive: !card.isActive });
  };

  const handleToggleFrozen = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateCard(card.id, { isFrozen: !card.isFrozen });
  };

  const paidDateFormatted = card.paidDate
    ? new Date(card.paidDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const createdFormatted = card.createdAt
    ? new Date(card.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Card Visual */}
      <View style={styles.cardWrap}>
        <CardVisual card={card} />
        {card.isFrozen && (
          <View style={[styles.frozenOverlay, { backgroundColor: "rgba(15,25,50,0.45)" }]}>
            <Feather name="lock" size={28} color="#fff" />
            <Text style={styles.frozenOverlayText}>Card Frozen</Text>
          </View>
        )}
      </View>

      {/* Status & Due */}
      <View style={[styles.statusRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusMeta, { color: colors.mutedForeground }]}>Status</Text>
          <PaymentStatusBadge status={card.paymentStatus} />
        </View>
        <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statusItem}>
          <Text style={[styles.statusMeta, { color: colors.mutedForeground }]}>Due date</Text>
          <Text style={[styles.statusValue, { color: colors.foreground }]}>
            {card.dueDate}
          </Text>
        </View>
        <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statusItem}>
          <Text style={[styles.statusMeta, { color: colors.mutedForeground }]}>
            {card.paymentStatus === "Paid" ? "Paid on" : "Days left"}
          </Text>
          <Text
            style={[
              styles.statusValue,
              {
                color:
                  card.paymentStatus === "Paid"
                    ? colors.success
                    : card.paymentStatus === "Overdue"
                    ? colors.destructive
                    : daysUntil <= 3
                    ? colors.warning
                    : colors.foreground,
              },
            ]}
          >
            {card.paymentStatus === "Paid"
              ? paidDateFormatted
              : card.paymentStatus === "Overdue"
              ? `${Math.abs(daysUntil)}d overdue`
              : daysUntil === 0
              ? "Today!"
              : `${daysUntil} days`}
          </Text>
        </View>
      </View>

      {/* Expiry Warning */}
      {(expiring || expired) && (
        <View
          style={[
            styles.expiryBanner,
            { backgroundColor: expired ? colors.dangerLight : colors.warningLight, borderColor: expired ? colors.destructive : colors.warning },
          ]}
        >
          <Feather name="alert-triangle" size={16} color={expired ? colors.destructive : colors.warning} />
          <View>
            <Text style={[styles.expiryBannerTitle, { color: expired ? colors.destructive : colors.warning }]}>
              {expired ? "Card Expired" : "Expiring Soon"}
            </Text>
            <Text style={[styles.expiryBannerSub, { color: expired ? colors.destructive : colors.warning }]}>
              {expired
                ? "This card has expired. Update with new card details."
                : `Expires ${MONTHS[card.expiryMonth - 1]} ${card.expiryYear} — less than 30 days away`}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {card.paymentStatus !== "Paid" ? (
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.success }]}
            onPress={handleMarkPaid}
            disabled={loading}
          >
            <Feather name="check-circle" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>Mark as Paid</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.muted }]}
            onPress={handleMarkPending}
            disabled={loading}
          >
            <Feather name="rotate-ccw" size={18} color={colors.foreground} />
            <Text style={[styles.primaryActionText, { color: colors.foreground }]}>Undo Payment</Text>
          </TouchableOpacity>
        )}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/card/edit/${card.id}` as any)}
          >
            <Feather name="edit-2" size={18} color={colors.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.dangerLight, borderColor: colors.destructive }]}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
            <Text style={[styles.secondaryBtnText, { color: colors.destructive }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Toggle */}
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detailSectionTitle, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleIcon}>
            <Feather
              name={card.isActive ? "bell" : "bell-off"}
              size={20}
              color={card.isActive ? "#1B2B5E" : colors.mutedForeground}
            />
          </View>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
              {card.isActive ? "Reminders enabled" : "Reminders paused"}
            </Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
              {card.isActive
                ? "You'll receive payment notifications for this card"
                : "No reminders will be sent until re-enabled"}
            </Text>
          </View>
          <Switch
            value={card.isActive}
            onValueChange={() => handleDeactivate()}
            trackColor={{ false: colors.muted, true: "#1B2B5E" }}
            thumbColor={card.isActive ? "#F0A500" : "#ccc"}
          />
        </View>
      </View>

      {/* Freeze Toggle */}
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detailSectionTitle, { color: colors.mutedForeground }]}>CARD STATUS</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleIcon}>
            <Feather
              name={card.isFrozen ? "lock" : "unlock"}
              size={20}
              color={card.isFrozen ? colors.destructive : colors.mutedForeground}
            />
          </View>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
              {card.isFrozen ? "Card marked frozen" : "Card active"}
            </Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
              {card.isFrozen
                ? "Reminder that you froze this card with the bank"
                : "This is a reference note only — it doesn't freeze the card with your bank"}
            </Text>
          </View>
          <Switch
            value={!!card.isFrozen}
            onValueChange={handleToggleFrozen}
            trackColor={{ false: colors.muted, true: colors.destructive }}
            thumbColor={card.isFrozen ? "#fff" : "#ccc"}
          />
        </View>
      </View>

      {/* Card Details */}
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detailSectionTitle, { color: colors.mutedForeground }]}>CARD DETAILS</Text>
        <InfoRow label="Card Name" value={card.cardName} />
        <InfoRow label="Card Holder" value={card.cardHolderName} />
        <InfoRow label="Bank" value={card.bankName} />
        <InfoRow label="Last 4 Digits" value={`···· ${card.lastFourDigits}`} />
        <InfoRow
          label="Expiry"
          value={`${MONTHS[card.expiryMonth - 1]} ${card.expiryYear}`}
          valueColor={expired ? colors.destructive : expiring ? colors.warning : undefined}
        />
        <InfoRow label="Phone" value={card.phoneNumber || "—"} />
        {card.notes && <InfoRow label="Notes" value={card.notes} />}
      </View>

      {/* Reminder Info */}
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detailSectionTitle, { color: colors.mutedForeground }]}>REMINDER SCHEDULE</Text>
        {(() => {
          const { effectiveDay } = parseDueDate(card.dueDate);
          const d1 = effectiveDay - 5 < 1 ? effectiveDay - 5 + 31 : effectiveDay - 5;
          const d2 = effectiveDay - 1 < 1 ? effectiveDay - 1 + 31 : effectiveDay - 1;
          return (
            <>
              <InfoRow label="First reminder" value={`${d1}th (5 days before)`} />
              <InfoRow label="Second reminder" value={`${d2}th (1 day before)`} />
            </>
          );
        })()}
        <InfoRow label="Overdue alert" value="Day after due date" />
        <InfoRow label="Added on" value={createdFormatted} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  cardWrap: { marginBottom: 4, position: "relative" },
  frozenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  frozenOverlayText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  statusRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusItem: { flex: 1, alignItems: "center", gap: 6 },
  statusMeta: { fontSize: 11, fontFamily: "Inter_500Medium" },
  statusValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  statusDivider: { width: 1, height: 32 },
  expiryBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  expiryBannerTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  expiryBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  actions: { gap: 10 },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  primaryActionText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  secondaryActions: { flexDirection: "row", gap: 10 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
    gap: 4,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 16,
  },
  infoLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right", flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(27,43,94,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleInfo: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
});
