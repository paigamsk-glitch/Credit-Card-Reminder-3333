import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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

export default function EditCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCard, updateCard } = useCards();
  const card = getCard(id);
  const [saving, setSaving] = useState(false);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isKnownBank = (name: string) => BANKS.slice(0, -1).includes(name);

  const [cardHolderName, setCardHolderName] = useState(card?.cardHolderName ?? "");
  const [cardName, setCardName] = useState(card?.cardName ?? "");
  const [lastFourDigits, setLastFourDigits] = useState(card?.lastFourDigits ?? "");
  const [selectedBank, setSelectedBank] = useState(
    card ? (isKnownBank(card.bankName) ? card.bankName : "Other") : ""
  );
  const [customBankName, setCustomBankName] = useState(
    card && !isKnownBank(card.bankName) ? card.bankName : ""
  );
  const [dueDate, setDueDate] = useState(card?.dueDate ?? "");
  const [expiryMonth, setExpiryMonth] = useState(card?.expiryMonth && card.expiryMonth > 0 ? card.expiryMonth.toString() : "");
  const [expiryYear, setExpiryYear] = useState(card?.expiryYear && card.expiryYear > 0 ? card.expiryYear.toString() : "");
  const [phoneNumber, setPhoneNumber] = useState(card?.phoneNumber ?? "");
  const [notes, setNotes] = useState(card?.notes ?? "");

  if (!card) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 16 }}>Card not found</Text>
      </View>
    );
  }

  const actualBankName = selectedBank === "Other" ? customBankName.trim() : selectedBank;

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
    await updateCard(card.id, {
      cardHolderName: cardHolderName.trim(),
      cardName: cardName.trim(),
      lastFourDigits: lastFourDigits.trim(),
      bankName: actualBankName,
      dueDate,
      expiryMonth: expiryMonth ? parseInt(expiryMonth) : 0,
      expiryYear: expiryYear ? parseInt(expiryYear) : 0,
      phoneNumber: phoneNumber.trim(),
      notes: notes.trim() || undefined,
    });
    setSaving(false);
    router.back();
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
        <Field label="Card Holder Name" value={cardHolderName} onChangeText={setCardHolderName} placeholder="e.g., Rahul Sharma" />
        <Field label="Card Name / Type" value={cardName} onChangeText={setCardName} placeholder="e.g., Millennia Credit Card" optional />
        <Field label="Last 4 Digits" value={lastFourDigits} onChangeText={(v) => setLastFourDigits(v.replace(/\D/g, ""))} placeholder="4521" keyboardType="numeric" maxLength={4} />

        {/* Bank Selector */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Bank Name</Text>
          <View style={styles.bankGrid}>
            {BANKS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[
                  styles.bankChip,
                  {
                    backgroundColor: selectedBank === b ? colors.primary : colors.card,
                    borderColor: selectedBank === b ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setSelectedBank(b);
                  if (b !== "Other") setCustomBankName("");
                }}
              >
                <Text style={[styles.bankChipText, { color: selectedBank === b ? "#fff" : colors.foreground }]}>
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
            />
          )}
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
              <Feather name="save" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 4 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" },
  fieldInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  customBankInput: {
    marginTop: 10,
    borderWidth: 2,
  },
  bankGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bankChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  bankChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
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
