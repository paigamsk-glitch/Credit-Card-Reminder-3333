import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";

// ─── Bank config ─────────────────────────────────────────────────────────────
// All cards share one flat, dark navy-style visual language (see reference
// design): a dark badge with the bank's short code, gold chip, dotted number
// groups, and a network pill — regardless of bank, for a consistent look.
export const BANK_META: Record<string, { gradient: readonly [string, string, string]; logo: string | null }> = {
  HDFC:     { gradient: ["#0A3D91", "#1565C0", "#0A3D91"], logo: null },
  ICICI:    { gradient: ["#9B1C1C", "#C62828", "#9B1C1C"], logo: null },
  SBI:      { gradient: ["#0D3F7C", "#1976D2", "#0D3F7C"], logo: null },
  Axis:     { gradient: ["#4A0E80", "#7B1FA2", "#4A0E80"], logo: null },
  Kotak:    { gradient: ["#7B3200", "#C05621", "#7B3200"], logo: null },
  ONE:      { gradient: ["#062535", "#0D4F6B", "#062535"], logo: null },
  AMEX:     { gradient: ["#0D4A25", "#1A7340", "#0D4A25"], logo: null },
  YES:      { gradient: ["#4A0072", "#7B1FA2", "#4A0072"], logo: null },
  RBL:      { gradient: ["#8B0000", "#C62828", "#8B0000"], logo: null },
  IndusInd: { gradient: ["#003D33", "#00695C", "#003D33"], logo: null },
};

export const DEFAULT_META = {
  gradient: ["#0A1535", "#1B2B5E", "#0A1535"] as const,
  logo: null as string | null,
};

// ─── Network detection ───────────────────────────────────────────────────────
export function getCardNetwork(
  bankName: string,
  lastFourDigits: string
): "visa" | "mastercard" | "rupay" | "amex" {
  if (bankName === "AMEX") return "amex";
  const sum = lastFourDigits
    .split("")
    .reduce((acc, c) => acc + (parseInt(c) || 0), 0);
  const index = sum % 3;
  if (bankName === "SBI" || bankName === "ONE") {
    return (["rupay", "visa", "mastercard"] as const)[index];
  }
  return (["visa", "mastercard", "rupay"] as const)[index];
}

export function resolveNetwork(card: CreditCard): "visa" | "mastercard" | "rupay" | "amex" {
  if (card.network) return card.network as "visa" | "mastercard" | "rupay" | "amex";
  return getCardNetwork(card.bankName, card.lastFourDigits);
}

// ─── Network logo ─────────────────────────────────────────────────────────────
export function NetworkLogo({
  network,
  compact = false,
}: {
  network: "visa" | "mastercard" | "rupay" | "amex";
  compact?: boolean;
}) {
  const h = compact ? 20 : 28;

  if (network === "visa") {
    return (
      <View style={[nStyles.visaBg, { paddingHorizontal: compact ? 5 : 7, paddingVertical: compact ? 2 : 3, borderRadius: compact ? 3 : 4 }]}>
        <Text style={[nStyles.visaText, { fontSize: compact ? 11 : 15 }]}>VISA</Text>
      </View>
    );
  }

  if (network === "mastercard") {
    const r = h * 0.52;
    return (
      <View style={{ width: h * 1.5, height: h, justifyContent: "center" }}>
        <View style={[nStyles.mcRed, { width: r * 2, height: r * 2, borderRadius: r, top: (h - r * 2) / 2 }]} />
        <View style={[nStyles.mcYellow, { width: r * 2, height: r * 2, borderRadius: r, top: (h - r * 2) / 2, left: h * 0.6 }]} />
      </View>
    );
  }

  if (network === "rupay") {
    return (
      <View style={[nStyles.rupayBg, { paddingHorizontal: compact ? 4 : 6, paddingVertical: compact ? 1 : 2, borderRadius: compact ? 3 : 4 }]}>
        <Text style={[nStyles.rupayText, { fontSize: compact ? 9 : 12 }]}>RuPay</Text>
      </View>
    );
  }

  if (network === "amex") {
    return (
      <View style={[nStyles.amexBg, { paddingHorizontal: compact ? 4 : 6, paddingVertical: compact ? 1 : 2, borderRadius: compact ? 3 : 4 }]}>
        <Text style={[nStyles.amexText, { fontSize: compact ? 9 : 11 }]}>AMEX</Text>
      </View>
    );
  }

  return null;
}

const nStyles = StyleSheet.create({
  visaBg: { backgroundColor: "rgba(0,0,0,0.35)" },
  visaText: { color: "#fff", fontFamily: "Inter_700Bold", fontStyle: "italic", letterSpacing: 1 },
  mcRed: { position: "absolute", backgroundColor: "#EB001B", left: 0 },
  mcYellow: { position: "absolute", backgroundColor: "#F79E1B", opacity: 0.9 },
  rupayBg: { backgroundColor: "rgba(0,100,180,0.6)" },
  rupayText: { color: "#fff", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  amexBg: { backgroundColor: "rgba(255,255,255,0.25)" },
  amexText: { color: "#fff", fontFamily: "Inter_700Bold", letterSpacing: 1 },
});

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ compact = false }: { compact?: boolean }) {
  const w = compact ? 28 : 42;
  const h = compact ? 20 : 30;
  return (
    <View style={[chipStyles.outer, { width: w, height: h, borderRadius: w * 0.14 }]}>
      <View style={[chipStyles.center, { width: w * 0.54, height: h * 0.54, borderRadius: w * 0.08 }]} />
      <View style={[chipStyles.lineH, { top: h * 0.47, width: w }]} />
      <View style={[chipStyles.lineV, { left: w * 0.47, height: h }]} />
    </View>
  );
}

const chipStyles = StyleSheet.create({
  outer: {
    backgroundColor: "#D4AF37",
    borderWidth: 1,
    borderColor: "#C09B20",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    backgroundColor: "#B8960C",
    borderWidth: 0.5,
    borderColor: "#9A7A00",
  },
  lineH: { position: "absolute", height: 0.5, backgroundColor: "#9A7A00", opacity: 0.6 },
  lineV: { position: "absolute", width: 0.5, backgroundColor: "#9A7A00", opacity: 0.6 },
});

// ─── Bank badge (flat dark square with bank code, matches reference design) ──
function BankLogo({ bankName, compact }: { bankName: string; compact: boolean }) {
  const size = compact ? 22 : 32;
  const code = bankName.length <= 4 ? bankName.toUpperCase() : bankName.slice(0, 3).toUpperCase();

  return (
    <View style={[bStyles.badge, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Text style={[bStyles.badgeText, { fontSize: compact ? 8 : 10 }]} numberOfLines={1}>
        {code}
      </Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});

// ─── Dotted card number groups (matches reference: dots + visible last four) ─
function CardNumberDots({ lastFour, compact = false }: { lastFour: string; compact?: boolean }) {
  const dotSize = compact ? 5 : 8;
  const groups = compact ? 2 : 3;

  return (
    <View style={[dotStyles.row, { gap: compact ? 6 : 10 }]}>
      {Array.from({ length: groups }).map((_, g) => (
        <View key={g} style={[dotStyles.group, { gap: compact ? 2 : 4 }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              style={[
                dotStyles.dot,
                { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
              ]}
            />
          ))}
        </View>
      ))}
      <Text style={compact ? dotStyles.digitsCompact : dotStyles.digits}>{lastFour}</Text>
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  group: { flexDirection: "row" },
  dot: { backgroundColor: "rgba(255,255,255,0.85)" },
  digits: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 17,
    letterSpacing: 2,
    fontFamily: "Inter_500Medium",
    marginLeft: 4,
  },
  digitsCompact: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 8,
    letterSpacing: 0.5,
    fontFamily: "Inter_500Medium",
    marginLeft: 2,
  },
});

// ─── Gradient fallback card (when no sprite) ──────────────────────────────────
function GradientCard({ card, compact }: { card: CreditCard; compact: boolean }) {
  const meta = BANK_META[card.bankName] ?? DEFAULT_META;
  const network = resolveNetwork(card);

  const expiryStr =
    card.expiryMonth && card.expiryYear
      ? `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`
      : "••/••";

  if (compact) {
    return (
      <LinearGradient
        colors={meta.gradient as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.compact}
      >
        <View style={styles.compactCircle1} />
        <View style={styles.compactCircle2} />
        <View style={styles.compactTop}>
          <BankLogo bankName={card.bankName} compact />
          <NetworkLogo network={network} compact />
        </View>
        <View style={styles.compactBottom}>
          <Chip compact />
          <CardNumberDots lastFour={card.lastFourDigits} compact />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={meta.gradient as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.topRow}>
        <View style={styles.logoGroup}>
          <BankLogo bankName={card.bankName} compact={false} />
          <View style={styles.bankTextGroup}>
            <Text style={styles.bankNameText}>{card.bankName}</Text>
            {card.cardName ? (
              <Text style={styles.cardNameText} numberOfLines={1}>{card.cardName}</Text>
            ) : null}
          </View>
        </View>
        <Feather name="wifi" size={22} color="rgba(255,255,255,0.75)" style={{ transform: [{ rotate: "90deg" }] }} />
      </View>
      <View style={styles.chipRow}><Chip /></View>
      <CardNumberDots lastFour={card.lastFourDigits} />
      <View style={styles.bottomRow}>
        <View style={styles.holderGroup}>
          <Text style={styles.fieldLabel}>CARD HOLDER</Text>
          <Text style={styles.holderName} numberOfLines={1}>{card.cardHolderName.toUpperCase()}</Text>
        </View>
        <View style={styles.expiryGroup}>
          <Text style={styles.fieldLabel}>EXPIRES</Text>
          <Text style={styles.expiryText}>{expiryStr}</Text>
        </View>
        <NetworkLogo network={network} />
      </View>
    </LinearGradient>
  );
}

// ─── Compact icon thumbnail (used in list/reminders/overview) ────────────────
// Simple flat-color rounded-square icon with chip + network badge — same style
// used for banks without a real sprite, applied consistently to every card.
export function CardIcon({ card, size = 80 }: { card: CreditCard; size?: number }) {
  const meta = BANK_META[card.bankName] ?? DEFAULT_META;
  const network = resolveNetwork(card);
  const w = size;
  const h = size * 0.65;

  return (
    <LinearGradient
      colors={meta.gradient as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.compact, { width: w, height: h, borderRadius: w * 0.1, padding: w * 0.09 }]}
    >
      <View style={styles.compactCircle1} />
      <View style={styles.compactCircle2} />
      <View style={styles.compactTop}>
        <BankLogo bankName={card.bankName} compact />
        <NetworkLogo network={network} compact />
      </View>
      <View style={styles.compactBottom}>
        <Chip compact />
        <CardNumberDots lastFour={card.lastFourDigits} compact />
      </View>
    </LinearGradient>
  );
}

// ─── Main CardVisual ──────────────────────────────────────────────────────────
// All cards use the same flat gradient design (see reference image) for a
// consistent, clean look regardless of bank.
interface CardVisualProps {
  card: CreditCard;
  compact?: boolean;
  width?: number;
}

export function CardVisual({ card, compact = false }: CardVisualProps) {
  return <GradientCard card={card} compact={compact} />;
}

const styles = StyleSheet.create({
  spriteFullWrap: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: 20,
    padding: 22,
    justifyContent: "space-between",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  circle1: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.06)", top: -80, right: -60,
  },
  circle2: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.04)", bottom: -50, left: -30,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  bankTextGroup: { gap: 1 },
  bankNameText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  cardNameText: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular", maxWidth: 150 },
  chipRow: { marginTop: -6 },
  cardNumber: { color: "rgba(255,255,255,0.92)", fontSize: 17, letterSpacing: 3, fontFamily: "Inter_500Medium" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  holderGroup: { flex: 1, gap: 3 },
  expiryGroup: { marginRight: 14, gap: 3 },
  fieldLabel: { color: "rgba(255,255,255,0.55)", fontSize: 8, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  holderName: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, maxWidth: 160 },
  expiryText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  compact: {
    width: 80, height: 52, borderRadius: 8, padding: 7,
    justifyContent: "space-between", overflow: "hidden",
  },
  compactCircle1: {
    position: "absolute", width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)", top: -20, right: -15,
  },
  compactCircle2: {
    position: "absolute", width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -15, left: -10,
  },
  compactTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  compactBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  compactDigits: { color: "rgba(255,255,255,0.85)", fontSize: 8, fontFamily: "Inter_500Medium", letterSpacing: 1 },
});
