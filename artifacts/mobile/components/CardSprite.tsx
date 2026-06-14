import React from "react";
import { Image, StyleSheet, View } from "react-native";

import type { CreditCard } from "@/context/CardsContext";
import { getCardNetwork } from "./CardVisual";

const CARDS1 = require("../assets/cards/cards1.png");
const CARDS2 = require("../assets/cards/cards2.png");

// Source image: 1536×1024 for both
// cards1: 3 cols × 4 rows → cell = 512×256
// cards2: 3 cols × 5 rows → cell = 512×204.8

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

const TOTAL_COLS = 3;
const IMAGE_W = 1536;
const IMAGE_H = 1024;

function networkToCol(network: string, bankName: string, last4: string): number {
  if (bankName === "AMEX") {
    const sum = last4.split("").reduce((a, c) => a + (parseInt(c) || 0), 0);
    return sum % 3;
  }
  if (network === "visa") return 0;
  if (network === "rupay") return 1;
  return 2;
}

interface CardSpriteProps {
  card: CreditCard;
  displayWidth: number;
  borderRadius?: number;
}

export function CardSprite({ card, displayWidth, borderRadius = 12 }: CardSpriteProps) {
  const info = SPRITE_MAP[card.bankName];
  if (!info) return null;

  const network = card.network ?? getCardNetwork(card.bankName, card.lastFourDigits);
  const col = networkToCol(network, card.bankName, card.lastFourDigits);

  // Scale the full image so that 1 column fills displayWidth
  // renderW = displayWidth * totalCols
  // renderH = renderW * (IMAGE_H / IMAGE_W)
  const renderW = displayWidth * TOTAL_COLS;
  const renderH = renderW * (IMAGE_H / IMAGE_W);

  // Display height = one row of the scaled image
  const displayH = renderH / info.totalRows;

  // Offset to show the correct cell
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

export function hasSprite(bankName: string): boolean {
  return bankName in SPRITE_MAP;
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    position: "absolute",
  },
});
