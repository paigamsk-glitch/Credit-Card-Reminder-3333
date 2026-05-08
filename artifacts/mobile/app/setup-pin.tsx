import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function SetupPinScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setPin, user } = useAuth();
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [error, setError] = useState("");

  const current = step === "create" ? pin : confirm;
  const setCurrent = step === "create" ? setPinValue : setConfirm;

  const handleKey = (key: string) => {
    if (key === "⌫") {
      setCurrent((v) => v.slice(0, -1));
      setError("");
      return;
    }
    if (key === "") return;
    if (current.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = current + key;
    setCurrent(next);

    if (next.length === 4) {
      if (step === "create") {
        setTimeout(() => setStep("confirm"), 300);
      } else {
        setTimeout(() => {
          if (next === pin) {
            handleSavePin(next);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError("PINs do not match. Try again.");
            setConfirm("");
            setStep("create");
            setPinValue("");
          }
        }, 300);
      }
    }
  };

  const handleSavePin = async (confirmedPin: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setPin(confirmedPin);
    router.replace("/(tabs)" as any);
  };

  const handleSkip = () => {
    router.replace("/(tabs)" as any);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: "#1B2B5E",
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      <View style={styles.topSection}>
        <View style={styles.iconWrap}>
          <Feather name="shield" size={32} color="#F0A500" />
        </View>
        <Text style={styles.title}>
          {step === "create" ? "Create your PIN" : "Confirm your PIN"}
        </Text>
        <Text style={styles.subtitle}>
          {step === "create"
            ? `Welcome, ${user?.name}! Set a 4-digit PIN to protect your app.`
            : "Enter the same PIN again to confirm."}
        </Text>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i < current.length ? "#F0A500" : "rgba(255,255,255,0.2)",
                  borderColor:
                    i < current.length ? "#F0A500" : "rgba(255,255,255,0.4)",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((key, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.key,
              {
                backgroundColor:
                  key === "" ? "transparent" : "rgba(255,255,255,0.08)",
                borderColor:
                  key === "" ? "transparent" : "rgba(255,255,255,0.12)",
              },
            ]}
            onPress={() => handleKey(key)}
            disabled={key === ""}
            activeOpacity={0.6}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "space-between" },
  topSection: { alignItems: "center", gap: 12, paddingHorizontal: 32 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(240,165,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(240,165,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  errorWrap: {
    backgroundColor: "rgba(220,38,38,0.2)",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  errorText: { color: "#FCA5A5", fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 16, marginTop: 8 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  keypad: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 32,
    gap: 12,
    justifyContent: "center",
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { color: "#fff", fontSize: 26, fontFamily: "Inter_600SemiBold" },
  skipBtn: { paddingVertical: 12 },
  skipText: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular" },
});
