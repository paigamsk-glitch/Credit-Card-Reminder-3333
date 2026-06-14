import React from "react";
import { Image, StyleSheet, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";

// ─── Sprite sheet layout ──────────────────────────────────────────────────────
// Both images are 1536×1024px, 3 columns wide.
// cards1.png: 4 rows → Kotak(row0), AMEX(row1), YES(row2), RBL(row3)
// cards2.png: 5 rows → HDFC(row0), ICICI(row1), SBI(row2), Axis(row3), IndusInd(row4)
//
// Each row has 3 network variants: col0=Visa, col1=RuPay, col2=Mastercard
// AMEX rows: col0=Green, col1=Gold, col2=Silver (all 3 are AMEX variants)

const CARDS1 = require("../assets/cards/cards1.png");
const CARDS2 = require("../assets/cards/cards2.png");

const IMAGE_W = 1536;
const IMAGE_H = 1024;
const TOTAL_COLS = 3;

interface SpriteInfo {
  img: 1 | 2;
  row: number;
  totalRows: number;
}

const SPRITE_MAP: Record<string, SpriteInfo> = {
  Kotak:    { img: 1, row: 0, totalRows: 4 },
  AMEX:     { img: 1, row: 1, totalRows: 4 },
  YES:      { img: 1, row: 2, totalRows: 4 },
  RBL:      { img: 1, row: 3, totalRows: 4 },
  HDFC:     { img: 2, row: 0, totalRows: 5 },
  ICICI:    { img: 2, row: 1, totalRows: 5 },
  SBI:      { img: 2, row: 2, totalRows: 5 },
  Axis:     { img: 2, row: 3, totalRows: 5 },
  IndusInd: { img: 2, row: 4, totalRows: 5 },
};

function networkToCol(network: string, bankName: string): number {
  if (bankName === "AMEX") {
    // AMEX: col0=Green, col1=Gold, col2=Silver — use gold (col1) as default
    return 1;
  }
  if (network === "visa") return 0;
  if (network === "rupay") return 1;
  return 2; // mastercard
}

export function hasSprite(bankName: string): boolean {
  return bankName in SPRITE_MAP;
}

interface CardSpriteProps {
  card: CreditCard;
  displayWidth: number;
  borderRadius?: number;
}

export function CardSprite({ card, displayWidth, borderRadius = 12 }: CardSpriteProps) {
  const info = SPRITE_MAP[card.bankName];
  if (!info) return null;

  const network = card.network ?? deriveNetwork(card.bankName, card.lastFourDigits);
  const col = networkToCol(network, card.bankName);

  // Scale: one column = displayWidth
  const renderW = displayWidth * TOTAL_COLS;
  const renderH = renderW * (IMAGE_H / IMAGE_W);
  const displayH = renderH / info.totalRows;

  const offsetX = -col * displayWidth;
  const offsetY = -info.row * displayH;

  const source = info.img === 1 ? CARDS1 : CARDS2;

  return (
    <View style={[styles.container, { width: displayWidth, height: displayH, borderRadius }]}>
      <Image
        source={source}
        style={[styles.image, { width: renderW, height: renderH, left: offsetX, top: offsetY }]}
        resizeMode="stretch"
      />
    </View>
  );
}

function deriveNetwork(bankName: string, lastFour: string): string {
  if (bankName === "AMEX") return "amex";
  const sum = lastFour.split("").reduce((a, c) => a + (parseInt(c) || 0), 0);
  const idx = sum % 3;
  if (bankName === "SBI" || bankName === "ONE") {
    return (["rupay", "visa", "mastercard"])[idx];
  }
  return (["visa", "mastercard", "rupay"])[idx];
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  image: { position: "absolute" },
});
