export interface CardExpiry {
  expiryMonth: number;
  expiryYear: number;
}

export function isExpiringSoon(card: CardExpiry): boolean {
  if (!card.expiryMonth || !card.expiryYear) return false;
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  const days = Math.ceil((expiryEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
}

export function isExpired(card: CardExpiry): boolean {
  if (!card.expiryMonth || !card.expiryYear) return false;
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  return now > expiryEnd;
}

/**
 * Supported due-date formats:
 *   "15"    — 15th of every month           (type: simple,   effectiveDay: 15)
 *   "5/12"  — 5th of December, annually     (type: specific, effectiveDay: 5, month: 12)
 */
export interface ParsedDueDate {
  type: "simple" | "specific";
  startDay: number;
  month?: number;
  effectiveDay: number;
}

export function parseDueDate(dueDate: string): ParsedDueDate {
  const str = String(dueDate).trim();

  if (str.includes("/")) {
    const [dayStr, monthStr] = str.split("/");
    const startDay = parseInt(dayStr ?? "1", 10) || 1;
    const month = parseInt(monthStr ?? "1", 10) || 1;
    return { type: "specific", startDay, month, effectiveDay: startDay };
  }

  // Handle legacy range format gracefully — use start day as effective day
  if (str.includes("-")) {
    const [startStr] = str.split("-");
    const startDay = parseInt(startStr ?? "1", 10) || 1;
    return { type: "simple", startDay, effectiveDay: startDay };
  }

  const startDay = parseInt(str, 10) || 1;
  return { type: "simple", startDay, effectiveDay: startDay };
}

export function getNextDueDate(dueDate: string): Date {
  const parsed = parseDueDate(dueDate);
  const now = new Date();

  if (parsed.type === "specific" && parsed.month) {
    const thisYear = now.getFullYear();
    const target = new Date(thisYear, parsed.month - 1, parsed.startDay);
    if (now > target) {
      return new Date(thisYear + 1, parsed.month - 1, parsed.startDay);
    }
    return target;
  }

  const day = parsed.effectiveDay;
  if (now.getDate() > day) {
    return new Date(now.getFullYear(), now.getMonth() + 1, day);
  }
  return new Date(now.getFullYear(), now.getMonth(), day);
}

export function getDaysUntilDue(dueDate: string): number {
  const nextDue = getNextDueDate(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  nextDue.setHours(0, 0, 0, 0);
  return Math.round((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
