import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { DueSummaryWidget, WidgetSummary } from "./DueSummaryWidget";

export const WIDGET_STORAGE_KEY = "cardtracker_widget_summary";
export const WIDGET_NAME = "DueSummary";

const DEFAULT_SUMMARY: WidgetSummary = {
  overdueCount: 0,
  nextDueLabel: "No cards yet",
  nextDueBank: null,
};

async function readSummary(): Promise<WidgetSummary> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
    if (!raw) return DEFAULT_SUMMARY;
    return JSON.parse(raw) as WidgetSummary;
  } catch {
    return DEFAULT_SUMMARY;
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const summary = await readSummary();

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(<DueSummaryWidget {...summary} />);
      break;
    default:
      break;
  }
}
