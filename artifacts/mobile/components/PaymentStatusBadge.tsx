import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { PaymentStatus } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const colors = useColors();

  const config = {
    Paid: { bg: colors.successLight, text: colors.success, label: "Paid" },
    Pending: { bg: colors.warningLight, text: colors.warning, label: "Pending" },
    Overdue: { bg: colors.dangerLight, text: colors.destructive, label: "Overdue" },
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
