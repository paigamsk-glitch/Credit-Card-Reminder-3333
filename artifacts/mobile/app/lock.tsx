import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
const MAX_ATTEMPTS = 5;

export default function LockScreen() {
  const insets = useSafeAreaInsets();
  const { unlock, logout, user } = useAuth();
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleKey = (key: string) => {
    if (key === "⌫") {
      setPin((v) => v.slice(0, -1));
      setError("");
      return;
    }
    if (key === "") return;
    if (pin.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = pin + key;
    setPin(next);

    if (next.length === 4) {
      setTimeout(() => {
        const success = unlock(next);
        if (success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/(tabs)" as any);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setPin("");
          if (newAttempts >= MAX_ATTEMPTS) {
            setError(`Too many attempts. Please log in again.`);
          } else {
            setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`);
          }
        }
      }, 300);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login" as any);
  };

  const tooManyAttempts = attempts >= MAX_ATTEMPTS;

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>

        {error ? (
          <View style={styles.errorWrap}>
            <Feather name="alert-circle" size={14} color="#FCA5A5" />
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
                    i < pin.length ? "#F0A500" : "rgba(255,255,255,0.2)",
                  borderColor:
                    i < pin.length ? "#F0A500" : "rgba(255,255,255,0.4)",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Keypad */}
      {!tooManyAttempts ? (
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
      ) : (
        <View style={styles.lockedWrap}>
          <Feather name="lock" size={40} color="rgba(255,255,255,0.3)" />
          <Text style={styles.lockedText}>Account temporarily locked</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={14} color="rgba(255,255,255,0.4)" />
        <Text style={styles.logoutText}>Sign in with a different account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "space-between" },
  topSection: { alignItems: "center", gap: 8, paddingHorizontal: 32 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(240,165,0,0.2)",
    borderWidth: 2,
    borderColor: "rgba(240,165,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { color: "#F0A500", fontSize: 28, fontFamily: "Inter_700Bold" },
  greeting: { color: "rgba(255,255,255,0.55)", fontSize: 14, fontFamily: "Inter_400Regular" },
  name: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(220,38,38,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  errorText: { color: "#FCA5A5", fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  dotsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
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
  lockedWrap: { alignItems: "center", gap: 12 },
  lockedText: { color: "rgba(255,255,255,0.4)", fontSize: 16, fontFamily: "Inter_500Medium" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  logoutText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular" },
});
