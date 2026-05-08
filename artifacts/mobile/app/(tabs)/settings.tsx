import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingRow({ icon, label, value, onPress, destructive }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: destructive ? colors.dangerLight : colors.secondary }]}>
        <Feather name={icon} size={16} color={destructive ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
      </View>
    </TouchableOpacity>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cards, stats, resetMonthlyStatuses } = useCards();
  const [twilioPhone, setTwilioPhone] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleResetStatuses = () => {
    Alert.alert(
      "Reset Monthly Statuses",
      "This will mark all cards as Pending. Use at the start of each month. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetMonthlyStatuses();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryTitle}>Portfolio Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.total}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={[styles.summaryDivider]} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.paid}</Text>
              <Text style={styles.summaryLabel}>Paid</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.pending + stats.overdue}</Text>
              <Text style={styles.summaryLabel}>Unpaid</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.expiringSoon}</Text>
              <Text style={styles.summaryLabel}>Expiring</Text>
            </View>
          </View>
        </View>

        {/* WhatsApp/Twilio Section */}
        <SectionCard title="WHATSAPP REMINDERS (TWILIO)">
          <View style={styles.twilioHint}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.twilioHintText, { color: colors.mutedForeground }]}>
              Connect Twilio to send automatic WhatsApp payment reminders to card holders.
            </Text>
          </View>
          <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Account SID</Text>
            <TextInput
              style={[styles.inputField, { color: colors.foreground }]}
              placeholder="AC..."
              placeholderTextColor={colors.mutedForeground}
              value={twilioSid}
              onChangeText={setTwilioSid}
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>From Number</Text>
            <TextInput
              style={[styles.inputField, { color: colors.foreground }]}
              placeholder="+1415..."
              placeholderTextColor={colors.mutedForeground}
              value={twilioPhone}
              onChangeText={setTwilioPhone}
              keyboardType="phone-pad"
            />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, margin: 14, marginTop: 8, borderRadius: 10 }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Saved", "Twilio settings saved (backend integration required for live reminders).");
            }}
          >
            <Text style={styles.saveBtnText}>Save Configuration</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* Reminder Logic Info */}
        <SectionCard title="REMINDER SCHEDULE">
          <SettingRow icon="clock" label="First reminder" value="5 days before due" />
          <SettingRow icon="bell" label="Second reminder" value="1 day before due" />
          <SettingRow icon="alert-triangle" label="Overdue alert" value="Day after due date" />
          <SettingRow icon="shield" label="Expiry alert" value="30 days before expiry" />
        </SectionCard>

        {/* Data Management */}
        <SectionCard title="DATA MANAGEMENT">
          <SettingRow
            icon="refresh-cw"
            label="Reset monthly statuses"
            onPress={handleResetStatuses}
          />
          <SettingRow
            icon="database"
            label="Total cards stored"
            value={`${cards.length}`}
          />
        </SectionCard>

        {/* About */}
        <SectionCard title="ABOUT">
          <SettingRow icon="credit-card" label="App version" value="1.0.0" />
          <SettingRow icon="shield" label="Data stored" value="Locally on device" />
        </SectionCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  content: { padding: 16, gap: 4 },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 14,
  },
  summaryTitle: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 1 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryValue: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold" },
  summaryLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_500Medium" },
  summaryDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionWrap: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  twilioHint: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    paddingBottom: 10,
    alignItems: "flex-start",
  },
  twilioHintText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  inputLabel: { fontSize: 13, fontFamily: "Inter_500Medium", width: 100 },
  inputField: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", padding: 0 },
  saveBtn: { alignItems: "center", paddingVertical: 12 },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
