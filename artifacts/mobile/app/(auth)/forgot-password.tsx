import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json() as { resetCode?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.push({
        pathname: "/(auth)/reset-password" as any,
        params: { email: email.trim().toLowerCase(), code: data.resetCode ?? "" },
      });
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#1B2B5E", "#0A1535"]}
        style={[styles.topSection, { paddingTop: insets.top + 40 }]}
      >
        <View style={styles.logoWrap}>
          <Feather name="key" size={32} color="#F0A500" />
        </View>
        <Text style={styles.appName}>Reset Password</Text>
        <Text style={styles.appTagline}>We'll send you a reset code</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.form, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Forgot password?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter the email linked to your account and we'll generate a reset code.
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Email address"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: loading ? colors.muted : "#1B2B5E" }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.btnText}>Sending...</Text>
          ) : (
            <>
              <Text style={styles.btnText}>Send Reset Code</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color={colors.mutedForeground} />
          <Text style={[styles.backText, { color: colors.mutedForeground }]}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topSection: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(240,165,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(240,165,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  appTagline: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  form: { flex: 1 },
  formContent: { padding: 24, gap: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8, lineHeight: 20 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  btnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  backText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
