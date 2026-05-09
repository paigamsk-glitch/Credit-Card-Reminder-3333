import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";

const BANK_GRADIENTS: Record<string, readonly [string, string]> = {
  HDFC: ["#0058A2", "#003270"],
  ICICI: ["#B22222", "#7B0000"],
  SBI: ["#1565C0", "#0D3F7C"],
  Axis: ["#6B21A8", "#4A0E80"],
  Kotak: ["#C05621", "#7B3200"],
  ONE: ["#0D4F6B", "#062535"],
  AMEX: ["#1A7340", "#0D4A25"],
  YES: ["#7B1FA2", "#4A0072"],
  RBL: ["#C62828", "#8B0000"],
  IndusInd: ["#00695C", "#003D33"],
};

const DEFAULT_GRADIENT: readonly [string, string] = ["#1B2B5E", "#0A1535"];

interface CardVisualProps {
  card: CreditCard;
  compact?: boolean;
}

export function CardVisual({ card, compact = false }: CardVisualProps) {
  const gradient = BANK_GRADIENTS[card.bankName] ?? DEFAULT_GRADIENT;

  return (
    <LinearGradient
      colors={gradient as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <View style={styles.topRow}>
        <Text style={styles.bankName}>{card.bankName}</Text>
        <View style={styles.chip} />
      </View>

      <Text style={styles.cardNumber}>
        •••• •••• •••• {card.lastFourDigits}
      </Text>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.label}>CARD HOLDER</Text>
          <Text style={styles.holderName} numberOfLines={1}>
            {card.cardHolderName.toUpperCase()}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.label}>EXPIRES</Text>
          <Text style={styles.expiry}>
            {card.expiryMonth && card.expiryYear
              ? `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`
              : "——"}
          </Text>
        </View>
      </View>

      <View style={styles.shimmer} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: 18,
    padding: 22,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardCompact: {
    aspectRatio: 2.1,
    padding: 16,
    borderRadius: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  cardNumber: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    letterSpacing: 4,
    fontFamily: "Inter_500Medium",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  holderName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    maxWidth: 180,
  },
  expiry: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  shimmer: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
