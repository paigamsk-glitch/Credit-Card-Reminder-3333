import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

import { useCards } from "@/context/CardsContext";
import { useColors } from "@/hooks/useColors";

const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "ONE", "AMEX", "YES", "RBL", "IndusInd", "Other"];
const NETWORKS = ["visa", "mastercard", "rupay", "amex"] as const;
type Network = typeof NETWORKS[number];

const NETWORK_LABELS: Record<Network, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  rupay: "RuPay",
  amex: "Amex",
};

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
  maxLength?: number;
  optional?: boolean;
}

function Field({ label, value, onChangeText, placeholder, keyboardType = "default", maxLength, optional }: FieldProps) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        {label}
        {optional && <Text style={{ fontFamily: "Inter_400Regular" }}> (optional)</Text>}
      </Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={keyboardType === "default" ? "words" : "none"}
      />
    </View>
  );
}

// Try to extract card fields from image filename/path (basic pattern matching)
function extractCardDataFromText(text: string): { lastFour?: string; expiry?: string; bank?: string } {
  const result: { lastFour?: string; expiry?: string; bank?: string } = {};
  // 4-digit groups
  const fourDigit = text.match(/\b\d{4}\b/g);
  if (fourDigit && fourDigit.length >= 4) {
    result.lastFour = fourDigit[fourDigit.length - 1];
  }
  // Expiry MM/YY or MM/YYYY
  const expMatch = text.match(/\b(0[1-9]|1[0-2])\/(\d{2,4})\b/);
  if (expMatch) result.expiry = expMatch[0];
  return result;
}

export default function AddCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addCard } = useCards();
  const [saving, setSaving] = useState(false);

  const [cardHolderName, setCardHolderName] = useState("");
  const [cardName, setCardName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<Network | "">("");
  const [dueDate, setDueDate] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const actualBankName = selectedBank === "Other" ? customBankName.trim() : selectedBank;

  // Auto-set network when bank is AMEX
  const effectiveNetwork: Network | "" =
    selectedBank === "AMEX" ? "amex" : selectedNetwork;

  const validateDueDate = (val: string): string | null => {
    if (!val.trim()) return "Due date is required";
    if (val.includes("/")) {
      const [d, m] = val.split("/");
      const day = parseInt(d ?? "", 10);
      const month = parseInt(m ?? "", 10);
      if (!d || isNaN(day) || day < 1 || day > 31) return "Invalid day (1–31)";
      if (!m || isNaN(month) || month < 1 || month > 12) return "Invalid month (1–12)";
    } else {
      const day = parseInt(val, 10);
      if (isNaN(day) || day < 1 || day > 31) return "Enter a valid day (1–31)";
    }
    return null;
  };

  const validate = () => {
    if (!cardHolderName.trim()) return "Card holder name is required";
    if (!lastFourDigits.trim() || lastFourDigits.length !== 4) return "Enter the last 4 digits of the card";
    if (!selectedBank) return "Please select a bank";
    if (selectedBank === "Other" && !customBankName.trim()) return "Please enter the bank name";
    const dueDateErr = validateDueDate(dueDate);
    if (dueDateErr) return dueDateErr;
    if (expiryMonth || expiryYear) {
      const mo = parseInt(expiryMonth);
      const yr = parseInt(expiryYear);
      if (isNaN(mo) || mo < 1 || mo > 12) return "Enter a valid expiry month (1–12)";
      if (isNaN(yr) || yr < 2024) return "Enter a valid expiry year (e.g., 2026)";
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await addCard({
      cardHolderName: cardHolderName.trim(),
      cardName: cardName.trim(),
      lastFourDigits: lastFourDigits.trim(),
      bankName: actualBankName,
      dueDate,
      expiryMonth: expiryMonth ? parseInt(expiryMonth) : 0,
      expiryYear: expiryYear ? parseInt(expiryYear) : 0,
      phoneNumber: phoneNumber.trim(),
      isActive: true,
      notes: notes.trim() || undefined,
      network: effectiveNetwork || undefined,
    });
    setSaving(false);
    router.back();
  };

  const handleScanCard = async () => {
    setScanLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Camera Access", "Please allow camera access to scan your card.");
        setScanLoading(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        base64: false,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        Alert.alert(
          "Card Scanned",
          "We captured your card image. Please fill in the card details manually — last 4 digits, expiry, bank name, and cardholder name from your card.",
          [{ text: "OK" }]
        );
      }
    } catch {
      Alert.alert("Error", "Could not open camera. Please enter card details manually.");
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Scan Card Button */}
        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
            onPress={handleScanCard}
            disabled={scanLoading}
            activeOpacity={0.8}
          >
            <Feather name="camera" size={20} color={colors.primary} />
            <View style={styles.scanBtnText}>
              <Text style={[styles.scanTitle, { color: colors.primary }]}>
                {scanLoading ? "Opening camera…" : "Scan Card"}
              </Text>
              <Text style={[styles.scanSub, { color: colors.mutedForeground }]}>
                Photo your card as a reference
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Field label="Card Holder Name" value={cardHolderName} onChangeText={setCardHolderName} placeholder="e.g., Rahul Sharma" />
        <Field label="Card Name / Type" value={cardName} onChangeText={setCardName} placeholder="e.g., Millennia Credit Card" optional />
        <Field label="Last 4 Digits" value={lastFourDigits} onChangeText={(v) => setLastFourDigits(v.replace(/\D/g, ""))} placeholder="4521" keyboardType="numeric" maxLength={4} />

        {/* Bank Selector */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Bank Name</Text>
          <View style={styles.chipGrid}>
            {BANKS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedBank === b ? colors.primary : colors.card,
                    borderColor: selectedBank === b ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setSelectedBank(b);
                  if (b !== "Other") setCustomBankName("");
                  if (b === "AMEX") setSelectedNetwork("amex");
                }}
              >
                <Text style={[styles.chipText, { color: selectedBank === b ? "#fff" : colors.foreground }]}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedBank === "Other" && (
            <TextInput
              style={[
                styles.fieldInput,
                styles.customBankInput,
                { backgroundColor: colors.card, borderColor: colors.primary, color: colors.foreground },
              ]}
              value={customBankName}
              onChangeText={setCustomBankName}
              placeholder="Type bank name…"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              autoFocus
            />
          )}
        </View>

        {/* Network Selector */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            Card Network <Text style={{ fontFamily: "Inter_400Regular" }}>(optional)</Text>
          </Text>
          <View style={styles.chipGrid}>
            {NETWORKS.map((n) => {
              const isDisabled = selectedBank === "AMEX" && n !== "amex";
              const isSelected = effectiveNetwork === n;
              return (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.card,
                      borderColor: isSelected ? colors.accent : colors.border,
                      opacity: isDisabled ? 0.4 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (isDisabled) return;
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setSelectedNetwork(n === effectiveNetwork ? "" : n);
                  }}
                  disabled={isDisabled}
                >
                  <Text style={[styles.chipText, { color: isSelected ? "#fff" : colors.foreground }]}>
                    {NETWORK_LABELS[n]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.networkHint, { color: colors.mutedForeground }]}>
            Affects which card design is shown. Leave blank for auto.
          </Text>
        </View>

        <Field label="Due Date" value={dueDate} onChangeText={(v) => setDueDate(v.replace(/[^\d\/]/g, ""))} placeholder="e.g., 15  or  5/12" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Expiry Month" value={expiryMonth} onChangeText={(v) => setExpiryMonth(v.replace(/\D/g, ""))} placeholder="MM" keyboardType="numeric" maxLength={2} optional />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Expiry Year" value={expiryYear} onChangeText={(v) => setExpiryYear(v.replace(/\D/g, ""))} placeholder="YYYY" keyboardType="numeric" maxLength={4} optional />
          </View>
        </View>

        <Field label="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="+919876543210" keyboardType="phone-pad" optional />
        <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional notes..." optional />

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.muted : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Feather name="loader" size={20} color={colors.mutedForeground} />
          ) : (
            <>
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Add Card</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 4 },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: 16,
  },
  scanBtnText: { flex: 1, gap: 2 },
  scanTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  scanSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  fieldInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  customBankInput: { marginTop: 10, borderWidth: 2 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  networkHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 8 },
  row: { flexDirection: "row", gap: 12 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
});
