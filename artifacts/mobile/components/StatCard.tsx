import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
  lightColor: string;
  onPress?: () => void;
}

export function StatCard({ label, value, color, lightColor, onPress }: StatCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: onPress ? color : colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.dot, { backgroundColor: lightColor }]}>
        <View style={[styles.innerDot, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  innerDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  value: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
