import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
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
import { useNotifications } from "@/hooks/useNotifications";
import { useColors } from "@/hooks/useColors";
import {
  cancelAllNotifications,
  requestNotificationPermissions,
  scheduleAllCardNotifications,
} from "@/lib/notifications";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, destructive, rightElement }: SettingRowProps) {
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
        {rightElement ?? (
          <>
            {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
            {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
          </>
        )}
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

function NotificationStatusBadge({ status }: { status: string }) {
  const colors = useColors();
  const config =
    status === "granted"
      ? { bg: colors.successLight, text: colors.success, label: "Enabled" }
      : status === "denied"
      ? { bg: colors.dangerLight, text: colors.destructive, label: "Denied" }
      : status === "unavailable"
      ? { bg: colors.muted, text: colors.mutedForeground, label: "N/A" }
      : { bg: colors.warningLight, text: colors.warning, label: "Off" };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cards, stats, resetMonthlyStatuses } = useCards();
  const { permissionStatus, scheduledCount, requestPermissions, refresh } = useNotifications();
  const [twilioPhone, setTwilioPhone] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    refresh();
  }, []);

  const handleEnableNotifications = async () => {
    if (permissionStatus === "granted") {
      Alert.alert("Already Enabled", "Push notifications are already enabled for this app.");
      return;
    }
    if (permissionStatus === "denied") {
      Alert.alert(
        "Permission Denied",
        "Notifications have been denied. Please go to your device Settings > Apps > Credit Card Tracker and enable notifications."
      );
      return;
    }
    const granted = await requestPermissions();
    if (granted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await scheduleAllCardNotifications(cards);
      await refresh();
      Alert.alert("Notifications Enabled", `Reminders scheduled for ${cards.filter((c) => c.isActive && c.paymentStatus !== "Paid").length} cards.`);
    }
  };

  const handleReschedule = async () => {
    if (permissionStatus !== "granted") {
      Alert.alert("Notifications Disabled", "Enable notifications first to reschedule reminders.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await cancelAllNotifications();
    await scheduleAllCardNotifications(cards);
    await refresh();
    const count = await Notifications.getAllScheduledNotificationsAsync();
    Alert.alert("Reminders Updated", `${count.length} reminders scheduled for your active cards.`);
  };

  const handleSendTestNotification = async () => {
    if (permissionStatus !== "granted") {
      Alert.alert("Notifications Disabled", "Enable notifications first.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💳 Test Reminder",
        body: "This is a test payment reminder from Credit Card Tracker.",
        data: {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
    Alert.alert("Test Sent", "A test notification will appear in 3 seconds.");
  };

  const handleResetStatuses = () => {
    Alert.alert(
      "Reset Monthly Statuses",
      "This will mark all cards as Pending and reschedule all reminders. Use at the start of each month.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetMonthlyStatuses();
            await refresh();
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
          <Text style={styles.summaryTitle}>PORTFOLIO SUMMARY</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.total}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
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

        {/* Push Notifications */}
        <SectionCard title="PUSH NOTIFICATIONS">
          <SettingRow
            icon="bell"
            label="Notification status"
            rightElement={<NotificationStatusBadge status={permissionStatus} />}
          />
          <SettingRow
            icon="bell-off"
            label="Scheduled reminders"
            value={permissionStatus === "granted" ? `${scheduledCount} active` : "—"}
          />
          {permissionStatus !== "granted" && permissionStatus !== "loading" && permissionStatus !== "unavailable" && (
            <TouchableOpacity
              style={[styles.enableBtn, { backgroundColor: colors.primary, margin: 14, marginTop: 8 }]}
              onPress={handleEnableNotifications}
            >
              <Feather name="bell" size={16} color="#fff" />
              <Text style={styles.enableBtnText}>Enable Notifications</Text>
            </TouchableOpacity>
          )}
          {permissionStatus === "granted" && (
            <>
              <SettingRow
                icon="refresh-cw"
                label="Reschedule all reminders"
                onPress={handleReschedule}
              />
              <SettingRow
                icon="send"
                label="Send test notification"
                onPress={handleSendTestNotification}
              />
            </>
          )}
        </SectionCard>

        {/* Reminder Schedule */}
        <SectionCard title="REMINDER SCHEDULE">
          <SettingRow icon="clock" label="First reminder" value="5 days before due" />
          <SettingRow icon="bell" label="Second reminder" value="1 day before due" />
          <SettingRow icon="alert-triangle" label="Overdue alert" value="Day after due date" />
          <SettingRow icon="shield" label="Expiry alert" value="30 days before expiry" />
        </SectionCard>

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
            style={[styles.enableBtn, { backgroundColor: colors.primary, margin: 14, marginTop: 8 }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Saved", "Twilio settings saved (backend integration required for live reminders).");
            }}
          >
            <Text style={styles.enableBtnText}>Save Configuration</Text>
          </TouchableOpacity>
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
  summaryTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  enableBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  enableBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
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
});
