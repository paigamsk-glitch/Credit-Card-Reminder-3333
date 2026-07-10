import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";
import { getDaysUntilDue, isExpired, isExpiringSoon } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";
import { CardIcon, BANK_META, DEFAULT_META } from "./CardVisual";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface CardListItemProps {
  card: CreditCard;
}

export function CardListItem({ card }: CardListItemProps) {
  const colors = useColors();
  const daysUntil = getDaysUntilDue(card.dueDate);
  const expiring = isExpiringSoon(card);
  const expired = isExpired(card);

  const meta = BANK_META[card.bankName] ?? DEFAULT_META;
  const accentColor = meta.gradient[1];

  const dueLabel =
    card.paymentStatus === "Paid"
      ? "Paid"
      : daysUntil === 0
      ? "Due today"
      : daysUntil < 0
      ? `${Math.abs(daysUntil)}d overdue`
      : `Due in ${daysUntil}d`;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.selectionAsync();
        router.push(`/card/${card.id}` as any);
      }}
      activeOpacity={0.72}
    >
      {/* Compact card thumbnail */}
      <View style={styles.thumbnail}>
        <CardIcon card={card} size={80} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.bankLabel, { color: accentColor }]} numberOfLines={1}>
            {card.bankName}
          </Text>
          <PaymentStatusBadge status={card.paymentStatus} />
        </View>

        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
          {card.cardName || "Credit Card"}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.holder, { color: colors.mutedForeground }]} numberOfLines={1}>
            {card.cardHolderName} · ···· {card.lastFourDigits}
          </Text>
          <Text
            style={[
              styles.dueLabel,
              {
                color:
                  card.paymentStatus === "Overdue"
                    ? colors.destructive
                    : card.paymentStatus === "Paid"
                    ? colors.success
                    : daysUntil <= 3
                    ? colors.warning
                    : colors.mutedForeground,
              },
            ]}
          >
            {dueLabel}
          </Text>
        </View>

        {(expiring || expired) && (
          <View
            style={[
              styles.expiryAlert,
              { backgroundColor: expired ? colors.dangerLight : colors.warningLight },
            ]}
          >
            <Feather
              name="alert-triangle"
              size={10}
              color={expired ? colors.destructive : colors.warning}
            />
            <Text
              style={[
                styles.expiryText,
                { color: expired ? colors.destructive : colors.warning },
              ]}
            >
              {expired ? "Card expired" : "Expiring soon"}
            </Text>
          </View>
        )}
      </View>

      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    flex: 1,
    marginRight: 6,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  holder: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  dueLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  expiryAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  expiryText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
