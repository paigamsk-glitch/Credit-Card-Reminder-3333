import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ResetPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { email, code: prefillCode } = useLocalSearchParams<{ email: string; code: string }>();

  const [code, setCode] = useState(prefillCode ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    if (!code.trim()) { setError("Enter the reset code"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode: code.trim(), newPassword }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/(auth)/login" as any);
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
          <Feather name="shield" size={32} color="#F0A500" />
        </View>
        <Text style={styles.appName}>New Password</Text>
        <Text style={styles.appTagline}>Enter your reset code and new password</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.form, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Set new password</Text>
        {email ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Reset code for <Text style={{ fontFamily: "Inter_600SemiBold" }}>{email}</Text>
          </Text>
        ) : null}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        {prefillCode ? (
          <View style={[styles.codeBox, { backgroundColor: "#F0A50015", borderColor: "#F0A50040" }]}>
            <Feather name="info" size={14} color="#F0A500" />
            <Text style={[styles.codeBoxText, { color: colors.foreground }]}>
              Your reset code is: <Text style={styles.codeValue}>{prefillCode}</Text>
            </Text>
          </View>
        ) : null}

        <View style={styles.fields}>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="hash" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="6-digit reset code"
              placeholderTextColor={colors.mutedForeground}
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="New password"
              placeholderTextColor={colors.mutedForeground}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Feather name={showPw ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="check-circle" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: loading ? colors.muted : "#1B2B5E" }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.btnText}>Resetting...</Text>
          ) : (
            <>
              <Text style={styles.btnText}>Reset Password</Text>
              <Feather name="check" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backRow} onPress={() => router.replace("/(auth)/login" as any)}>
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
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  codeBoxText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  codeValue: { fontFamily: "Inter_700Bold", fontSize: 15, letterSpacing: 2 },
  fields: { gap: 12 },
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
