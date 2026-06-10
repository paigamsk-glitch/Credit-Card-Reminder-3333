import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";
import { getDaysUntilDue, isExpired, isExpiringSoon } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface CardListItemProps {
  card: CreditCard;
}

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

export function CardListItem({ card }: CardListItemProps) {
  const colors = useColors();
  const daysUntil = getDaysUntilDue(card.dueDate);
  const expiring = isExpiringSoon(card);
  const expired = isExpired(card);
  const bankColor = BANK_COLORS[card.bankName] ?? colors.primary;

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
        Haptics.selectionAsync();
        router.push(`/card/${card.id}` as any);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.bankBar, { backgroundColor: bankColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            <Text style={[styles.bankName, { color: bankColor }]}>{card.bankName}</Text>
            <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
              {card.cardName}
            </Text>
            <Text style={[styles.holder, { color: colors.mutedForeground }]} numberOfLines={1}>
              {card.cardHolderName} · ···· {card.lastFourDigits}
            </Text>
          </View>
          <View style={styles.rightGroup}>
            <PaymentStatusBadge status={card.paymentStatus} />
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
        </View>

        {(expiring || expired) && (
          <View style={[styles.expiryAlert, { backgroundColor: expired ? colors.dangerLight : colors.warningLight }]}>
            <Feather name="alert-triangle" size={11} color={expired ? colors.destructive : colors.warning} />
            <Text style={[styles.expiryText, { color: expired ? colors.destructive : colors.warning }]}>
              {expired ? "Card expired" : "Expiring soon"}
            </Text>
          </View>
        )}
      </View>

      <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={styles.chevron} />
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
    overflow: "hidden",
  },
  bankBar: {
    width: 4,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  bankName: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  holder: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  rightGroup: {
    alignItems: "flex-end",
    gap: 5,
  },
  dueLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  expiryAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  expiryText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  chevron: {
    marginRight: 12,
  },
});
