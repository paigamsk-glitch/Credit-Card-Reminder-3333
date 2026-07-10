import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { parseDueDate } from "@/lib/cardUtils";
import {
  cancelCardNotifications,
  scheduleAllCardNotifications,
  scheduleCardNotifications,
  scheduleNextCycleNotification,
} from "@/lib/notifications";

export type PaymentStatus = "Pending" | "Paid" | "Overdue";

export interface CreditCard {
  id: string;
  userId?: number;
  cardHolderName: string;
  cardName: string;
  lastFourDigits: string;
  bankName: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  paidDate?: string | null;
  expiryMonth: number;
  expiryYear: number;
  phoneNumber?: string | null;
  isActive: boolean;
  createdAt?: string;
  notes?: string | null;
  network?: string | null;
  isFrozen?: boolean;
}

export interface CardStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  expiringSoon: number;
  expired: number;
}

interface CardsContextValue {
  cards: CreditCard[];
  activeCards: CreditCard[];
  stats: CardStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCard: (card: Omit<CreditCard, "id" | "createdAt" | "paymentStatus" | "userId">) => Promise<void>;
  updateCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  markAsPending: (id: string) => Promise<void>;
  markAllAsPaid: () => Promise<void>;
  resetMonthlyStatuses: () => Promise<void>;
  getCard: (id: string) => CreditCard | undefined;
}

export function getNextDueDate(dueDate: string): Date {
  const parsed = parseDueDate(dueDate);
  const now = new Date();
  if (parsed.type === "specific" && parsed.month) {
    const thisYear = now.getFullYear();
    const target = new Date(thisYear, parsed.month - 1, parsed.startDay);
    if (now > target) return new Date(thisYear + 1, parsed.month - 1, parsed.startDay);
    return target;
  }
  const day = parsed.effectiveDay;
  if (now.getDate() > day) return new Date(now.getFullYear(), now.getMonth() + 1, day);
  return new Date(now.getFullYear(), now.getMonth(), day);
}

export function getDaysUntilDue(dueDate: string): number {
  const nextDue = getNextDueDate(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  nextDue.setHours(0, 0, 0, 0);
  return Math.round((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(card: CreditCard): boolean {
  if (!card.expiryMonth || !card.expiryYear) return false;
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  const days = Math.ceil((expiryEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
}

export function isExpired(card: CreditCard): boolean {
  if (!card.expiryMonth || !card.expiryYear) return false;
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  return now > expiryEnd;
}

export function computeStatus(card: CreditCard): PaymentStatus {
  if (card.paymentStatus === "Paid") return "Paid";
  const parsed = parseDueDate(card.dueDate);
  const now = new Date();
  let thisDue: Date;
  if (parsed.type === "specific" && parsed.month) {
    thisDue = new Date(now.getFullYear(), parsed.month - 1, parsed.startDay);
  } else {
    thisDue = new Date(now.getFullYear(), now.getMonth(), parsed.effectiveDay);
  }
  thisDue.setHours(23, 59, 59, 999);
  if (now > thisDue) return "Overdue";
  return "Pending";
}

function computeStats(cards: CreditCard[]): CardStats {
  const active = cards.filter((c) => c.isActive);
  return {
    total: active.length,
    paid: active.filter((c) => c.paymentStatus === "Paid").length,
    pending: active.filter((c) => c.paymentStatus === "Pending").length,
    overdue: active.filter((c) => c.paymentStatus === "Overdue").length,
    expiringSoon: active.filter((c) => isExpiringSoon(c) && !isExpired(c)).length,
    expired: active.filter((c) => isExpired(c)).length,
  };
}

function normalizeCard(raw: Record<string, unknown>): CreditCard {
  const card = {
    id: raw.id as string,
    userId: raw.userId as number | undefined,
    cardHolderName: (raw.cardHolderName ?? raw.card_holder_name) as string,
    cardName: (raw.cardName ?? raw.card_name) as string,
    lastFourDigits: (raw.lastFourDigits ?? raw.last_four_digits) as string,
    bankName: (raw.bankName ?? raw.bank_name) as string,
    dueDate: String(raw.dueDate ?? raw.due_date ?? ""),
    paymentStatus: ((raw.paymentStatus ?? raw.payment_status) as PaymentStatus) ?? "Pending",
    paidDate: (raw.paidDate ?? raw.paid_date) as string | null | undefined,
    expiryMonth: Number(raw.expiryMonth ?? raw.expiry_month),
    expiryYear: Number(raw.expiryYear ?? raw.expiry_year),
    phoneNumber: (raw.phoneNumber ?? raw.phone_number) as string | null | undefined,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: (raw.createdAt ?? raw.created_at) as string | undefined,
    notes: raw.notes as string | null | undefined,
    network: raw.network as string | null | undefined,
    isFrozen: Boolean(raw.isFrozen ?? raw.is_frozen ?? false),
  };
  card.paymentStatus = computeStatus(card);
  return card;
}

const CardsContext = createContext<CardsContextValue | null>(null);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) { setCards([]); return; }
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet<Record<string, unknown>[]>("/cards", token);
      const normalized = raw.map(normalizeCard);
      setCards(normalized);
      scheduleAllCardNotifications(normalized).catch(() => {});
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCard = useCallback(
    async (cardData: Omit<CreditCard, "id" | "createdAt" | "paymentStatus" | "userId">) => {
      if (!token) return;
      const newCard: CreditCard = {
        ...cardData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        paymentStatus: "Pending",
      };
      newCard.paymentStatus = computeStatus(newCard);
      const raw = await apiPost<Record<string, unknown>>("/cards", newCard, token);
      const saved = normalizeCard(raw);
      setCards((prev) => [...prev, saved]);
      scheduleCardNotifications(saved).catch(() => {});
    },
    [token]
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<CreditCard>) => {
      if (!token) return;
      const current = cards.find((c) => c.id === id);
      if (!current) return;
      const merged = { ...current, ...updates };
      merged.paymentStatus = computeStatus(merged);
      const raw = await apiPut<Record<string, unknown>>(`/cards/${id}`, merged, token);
      const saved = normalizeCard(raw);
      setCards((prev) => prev.map((c) => (c.id === id ? saved : c)));
      scheduleCardNotifications(saved).catch(() => {});
    },
    [token, cards]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      if (!token) return;
      await apiDelete(`/cards/${id}`, token);
      setCards((prev) => prev.filter((c) => c.id !== id));
      cancelCardNotifications(id).catch(() => {});
    },
    [token]
  );

  const markAsPaid = useCallback(
    async (id: string) => {
      if (!token) return;
      const current = cards.find((c) => c.id === id);
      if (!current) return;
      const updates = { paymentStatus: "Paid" as PaymentStatus, paidDate: new Date().toISOString() };
      const raw = await apiPut<Record<string, unknown>>(`/cards/${id}`, { ...current, ...updates }, token);
      const saved = normalizeCard(raw);
      setCards((prev) => prev.map((c) => (c.id === id ? saved : c)));
      cancelCardNotifications(id).catch(() => {});
      scheduleNextCycleNotification(saved).catch(() => {});
    },
    [token, cards]
  );

  const markAsPending = useCallback(
    async (id: string) => {
      if (!token) return;
      const current = cards.find((c) => c.id === id);
      if (!current) return;
      const updates = { paymentStatus: "Pending" as PaymentStatus, paidDate: null };
      const raw = await apiPut<Record<string, unknown>>(`/cards/${id}`, { ...current, ...updates }, token);
      const saved = normalizeCard(raw);
      setCards((prev) => prev.map((c) => (c.id === id ? saved : c)));
      scheduleCardNotifications(saved).catch(() => {});
    },
    [token, cards]
  );

  const markAllAsPaid = useCallback(async () => {
    if (!token) return;
    const unpaid = cards.filter((c) => c.isActive && c.paymentStatus !== "Paid");
    if (unpaid.length === 0) return;
    const now = new Date().toISOString();
    const updatedAll = await Promise.all(
      unpaid.map(async (c) => {
        const updates = { paymentStatus: "Paid" as PaymentStatus, paidDate: now };
        const raw = await apiPut<Record<string, unknown>>(`/cards/${c.id}`, { ...c, ...updates }, token);
        return normalizeCard(raw);
      })
    );
    setCards((prev) =>
      prev.map((c) => updatedAll.find((u) => u.id === c.id) ?? c)
    );
    for (const c of updatedAll) {
      cancelCardNotifications(c.id).catch(() => {});
      scheduleNextCycleNotification(c).catch(() => {});
    }
  }, [token, cards]);

  const resetMonthlyStatuses = useCallback(async () => {
    if (!token) return;
    const updatedAll = await Promise.all(
      cards.map(async (c) => {
        const updates = { paymentStatus: "Pending" as PaymentStatus, paidDate: null };
        const raw = await apiPut<Record<string, unknown>>(`/cards/${c.id}`, { ...c, ...updates }, token);
        return normalizeCard(raw);
      })
    );
    setCards(updatedAll);
    scheduleAllCardNotifications(updatedAll).catch(() => {});
  }, [token, cards]);

  const getCard = useCallback((id: string) => cards.find((c) => c.id === id), [cards]);

  const activeCards = cards.filter((c) => c.isActive);
  const stats = computeStats(cards);

  return (
    <CardsContext.Provider
      value={{
        cards,
        activeCards,
        stats,
        loading,
        error,
        refresh,
        addCard,
        updateCard,
        deleteCard,
        markAsPaid,
        markAsPending,
        markAllAsPaid,
        resetMonthlyStatuses,
        getCard,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error("useCards must be used inside CardsProvider");
  return ctx;
}
