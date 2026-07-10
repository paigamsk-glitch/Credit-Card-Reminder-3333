import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export interface WidgetSummary {
  overdueCount: number;
  nextDueLabel: string;
  nextDueBank: string | null;
}

const NAVY = "#0F1932";
const GOLD = "#F0A500";
const RED = "#E5484D";
const MUTED = "#9AA4C4";

export function DueSummaryWidget({ overdueCount, nextDueLabel, nextDueBank }: WidgetSummary) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: NAVY,
        borderRadius: 20,
        padding: 16,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <TextWidget
          text="CARD TRACKER"
          style={{ fontSize: 11, color: MUTED, fontWeight: "600", letterSpacing: 1 }}
        />
        {overdueCount > 0 && (
          <FlexWidget
            style={{ backgroundColor: RED, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}
          >
            <TextWidget
              text={`${overdueCount} overdue`}
              style={{ fontSize: 11, color: "#ffffff", fontWeight: "700" }}
            />
          </FlexWidget>
        )}
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "column" }}>
        <TextWidget
          text={overdueCount > 0 ? "Payment overdue" : "Next due"}
          style={{ fontSize: 12, color: MUTED, fontWeight: "500" }}
        />
        <TextWidget
          text={nextDueLabel}
          style={{ fontSize: 22, color: "#ffffff", fontWeight: "800", marginTop: 2 }}
        />
        {nextDueBank && (
          <TextWidget
            text={nextDueBank}
            style={{ fontSize: 13, color: GOLD, fontWeight: "600", marginTop: 2 }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  );
}
