import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";

// ─── Clean, pre-cropped individual card images ───────────────────────────────
// Each image is a single, tightly-cropped bank+network card (512×256 or 512×205px).
const IMAGES: Record<string, ImageSourcePropType> = {
  kotak_visa: require("../assets/cards/singles/kotak_visa.png"),
  kotak_rupay: require("../assets/cards/singles/kotak_rupay.png"),
  kotak_mastercard: require("../assets/cards/singles/kotak_mastercard.png"),
  amex_green: require("../assets/cards/singles/amex_green.png"),
  amex_gold: require("../assets/cards/singles/amex_gold.png"),
  amex_silver: require("../assets/cards/singles/amex_silver.png"),
  yes_visa: require("../assets/cards/singles/yes_visa.png"),
  yes_rupay: require("../assets/cards/singles/yes_rupay.png"),
  yes_mastercard: require("../assets/cards/singles/yes_mastercard.png"),
  rbl_visa: require("../assets/cards/singles/rbl_visa.png"),
  rbl_rupay: require("../assets/cards/singles/rbl_rupay.png"),
  rbl_mastercard: require("../assets/cards/singles/rbl_mastercard.png"),
  hdfc_visa: require("../assets/cards/singles/hdfc_visa.png"),
  hdfc_rupay: require("../assets/cards/singles/hdfc_rupay.png"),
  hdfc_mastercard: require("../assets/cards/singles/hdfc_mastercard.png"),
  icici_visa: require("../assets/cards/singles/icici_visa.png"),
  icici_rupay: require("../assets/cards/singles/icici_rupay.png"),
  icici_mastercard: require("../assets/cards/singles/icici_mastercard.png"),
  sbi_visa: require("../assets/cards/singles/sbi_visa.png"),
  sbi_rupay: require("../assets/cards/singles/sbi_rupay.png"),
  sbi_mastercard: require("../assets/cards/singles/sbi_mastercard.png"),
  axis_visa: require("../assets/cards/singles/axis_visa.png"),
  axis_rupay: require("../assets/cards/singles/axis_rupay.png"),
  axis_mastercard: require("../assets/cards/singles/axis_mastercard.png"),
  indusind_visa: require("../assets/cards/singles/indusind_visa.png"),
  indusind_rupay: require("../assets/cards/singles/indusind_rupay.png"),
  indusind_mastercard: require("../assets/cards/singles/indusind_mastercard.png"),
};

const BANK_KEY: Record<string, string> = {
  Kotak: "kotak",
  AMEX: "amex",
  YES: "yes",
  RBL: "rbl",
  HDFC: "hdfc",
  ICICI: "icici",
  SBI: "sbi",
  Axis: "axis",
  IndusInd: "indusind",
};

const CARD_ASPECT: Record<string, number> = {
  kotak: 512 / 256,
  amex: 512 / 256,
  yes: 512 / 256,
  rbl: 512 / 256,
  hdfc: 512 / 205,
  icici: 512 / 205,
  sbi: 512 / 205,
  axis: 512 / 205,
  indusind: 512 / 205,
};

export function hasSprite(bankName: string): boolean {
  return bankName in BANK_KEY;
}

function deriveNetwork(bankName: string, lastFour: string): string {
  if (bankName === "AMEX") return "amex";
  const sum = lastFour.split("").reduce((a, c) => a + (parseInt(c) || 0), 0);
  const idx = sum % 3;
  if (bankName === "SBI") return (["rupay", "visa", "mastercard"])[idx];
  return (["visa", "mastercard", "rupay"])[idx];
}

function resolveImageKey(card: CreditCard): string | null {
  const bankKey = BANK_KEY[card.bankName];
  if (!bankKey) return null;

  if (bankKey === "amex") {
    // AMEX variants (green/gold/silver) aren't a "network" — default to gold.
    return "amex_gold";
  }

  const network = card.network ?? deriveNetwork(card.bankName, card.lastFourDigits);
  const normalized = network === "amex" ? "visa" : network;
  const key = `${bankKey}_${normalized}`;
  return IMAGES[key] ? key : `${bankKey}_visa`;
}

interface CardSpriteProps {
  card: CreditCard;
  displayWidth: number;
  borderRadius?: number;
}

export function CardSprite({ card, displayWidth, borderRadius = 12 }: CardSpriteProps) {
  const key = resolveImageKey(card);
  if (!key) return null;

  const bankKey = BANK_KEY[card.bankName];
  const aspect = CARD_ASPECT[bankKey] ?? 512 / 256;
  const displayHeight = displayWidth / aspect;

  return (
    <View style={[styles.container, { width: displayWidth, height: displayHeight, borderRadius }]}>
      <Image
        source={IMAGES[key]}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  image: { width: "100%", height: "100%" },
});
