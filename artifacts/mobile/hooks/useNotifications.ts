import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import {
  getPermissionStatus,
  getScheduledCount,
  requestNotificationPermissions,
} from "@/lib/notifications";

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "undetermined" | "unavailable" | "loading"
  >("loading");
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      setPermissionStatus("unavailable");
      return;
    }
    getPermissionStatus().then(setPermissionStatus);
    getScheduledCount().then(setScheduledCount);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { cardId?: string };
      if (data?.cardId) {
        router.push(`/card/${data.cardId}` as any);
      }
    });
    return () => sub.remove();
  }, []);

  const requestPermissions = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setPermissionStatus(granted ? "granted" : "denied");
    if (granted) {
      const count = await getScheduledCount();
      setScheduledCount(count);
    }
    return granted;
  }, []);

  const refresh = useCallback(async () => {
    if (Platform.OS === "web") return;
    const [status, count] = await Promise.all([getPermissionStatus(), getScheduledCount()]);
    setPermissionStatus(status);
    setScheduledCount(count);
  }, []);

  return { permissionStatus, scheduledCount, requestPermissions, refresh };
}
