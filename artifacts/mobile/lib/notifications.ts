import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { isExpired, isExpiringSoon } from "@/lib/cardUtils";

export interface NotificationCard {
  id: string;
  cardName: string;
  bankName: string;
  lastFourDigits: string;
  dueDate: number;
  expiryMonth: number;
  expiryYear: number;
  isActive: boolean;
  paymentStatus: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getPermissionStatus(): Promise<"granted" | "denied" | "undetermined" | "unavailable"> {
  if (Platform.OS === "web") return "unavailable";
  const { status } = await Notifications.getPermissionsAsync();
  return status as "granted" | "denied" | "undetermined";
}

function getTargetDate(dueDay: number, offsetDays: number, hour: number): Date {
  const now = new Date();
  const thisDueDate = new Date(now.getFullYear(), now.getMonth(), dueDay, hour, 0, 0);
  const target = new Date(thisDueDate.getTime() - offsetDays * 24 * 60 * 60 * 1000);
  if (target > now) return target;
  const nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay, hour, 0, 0);
  return new Date(nextDueDate.getTime() - offsetDays * 24 * 60 * 60 * 1000);
}

export async function cancelCardNotifications(cardId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Promise.all(
    ["first", "second", "due", "overdue", "expiry"].map((t) =>
      Notifications.cancelScheduledNotificationAsync(`card-${cardId}-${t}`).catch(() => {})
    )
  );
}

export async function scheduleCardNotifications(card: NotificationCard): Promise<void> {
  if (Platform.OS === "web") return;
  await cancelCardNotifications(card.id);
  if (!card.isActive || card.paymentStatus === "Paid") return;

  const status = await getPermissionStatus();
  if (status !== "granted") return;

  const cardLabel = `${card.cardName} (${card.bankName} ····${card.lastFourDigits})`;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `card-${card.id}-first`,
      content: {
        title: "💳 Payment Reminder",
        body: `${cardLabel} is due in 5 days. Don't forget to pay!`,
        data: { cardId: card.id, type: "first" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getTargetDate(card.dueDate, 5, 9),
      },
    });

    await Notifications.scheduleNotificationAsync({
      identifier: `card-${card.id}-second`,
      content: {
        title: "⚠️ Payment Due Tomorrow",
        body: `${cardLabel} payment is due tomorrow. Pay now to avoid overdue charges.`,
        data: { cardId: card.id, type: "second" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getTargetDate(card.dueDate, 1, 9),
      },
    });

    await Notifications.scheduleNotificationAsync({
      identifier: `card-${card.id}-due`,
      content: {
        title: "🔴 Payment Due Today",
        body: `${cardLabel} payment is due today! Tap to mark as paid.`,
        data: { cardId: card.id, type: "due" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getTargetDate(card.dueDate, 0, 9),
      },
    });

    if (isExpiringSoon(card) && !isExpired(card)) {
      const expiryAlert = new Date();
      expiryAlert.setDate(expiryAlert.getDate() + 1);
      expiryAlert.setHours(10, 0, 0, 0);
      await Notifications.scheduleNotificationAsync({
        identifier: `card-${card.id}-expiry`,
        content: {
          title: "⏰ Card Expiring Soon",
          body: `${cardLabel} expires ${String(card.expiryMonth).padStart(2, "0")}/${card.expiryYear}. Request a replacement card.`,
          data: { cardId: card.id, type: "expiry" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: expiryAlert,
        },
      });
    }
  } catch {
  }
}

export async function scheduleAllCardNotifications(cards: NotificationCard[]): Promise<void> {
  if (Platform.OS === "web") return;
  await Promise.all(cards.map((c) => scheduleCardNotifications(c)));
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledCount(): Promise<number> {
  if (Platform.OS === "web") return 0;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}
