import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type PaymentStatus = "Pending" | "Paid" | "Overdue";

export interface CreditCard {
  id: string;
  cardHolderName: string;
  cardName: string;
  lastFourDigits: string;
  bankName: string;
  dueDate: number;
  paymentStatus: PaymentStatus;
  paidDate?: string;
  expiryMonth: number;
  expiryYear: number;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  notes?: string;
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
  addCard: (card: Omit<CreditCard, "id" | "createdAt" | "paymentStatus">) => Promise<void>;
  updateCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  markAsPending: (id: string) => Promise<void>;
  resetMonthlyStatuses: () => Promise<void>;
  getCard: (id: string) => CreditCard | undefined;
}

const STORAGE_KEY = "@credit_cards_v1";

const SAMPLE_CARDS: CreditCard[] = [
  {
    id: "1",
    cardHolderName: "Rahul Sharma",
    cardName: "Millennia Credit Card",
    lastFourDigits: "4521",
    bankName: "HDFC",
    dueDate: 12,
    paymentStatus: "Paid",
    paidDate: new Date().toISOString(),
    expiryMonth: 8,
    expiryYear: 2027,
    phoneNumber: "+919876543210",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    cardHolderName: "Priya Mehta",
    cardName: "Amazon Pay Card",
    lastFourDigits: "7834",
    bankName: "ICICI",
    dueDate: 18,
    paymentStatus: "Pending",
    expiryMonth: 3,
    expiryYear: 2026,
    phoneNumber: "+919876543211",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    cardHolderName: "Arjun Patel",
    cardName: "SimplySave Card",
    lastFourDigits: "2290",
    bankName: "SBI",
    dueDate: 5,
    paymentStatus: "Overdue",
    expiryMonth: 11,
    expiryYear: 2025,
    phoneNumber: "+919876543212",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    cardHolderName: "Sneha Kapoor",
    cardName: "Magnus Credit Card",
    lastFourDigits: "6612",
    bankName: "Axis",
    dueDate: 25,
    paymentStatus: "Pending",
    expiryMonth: 6,
    expiryYear: 2028,
    phoneNumber: "+919876543213",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    cardHolderName: "Karan Singh",
    cardName: "811 Dream Different",
    lastFourDigits: "9001",
    bankName: "Kotak",
    dueDate: 20,
    paymentStatus: "Pending",
    expiryMonth: 1,
    expiryYear: 2026,
    phoneNumber: "+919876543214",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getNextDueDate(dueDate: number): Date {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDate);
  if (now.getDate() > dueDate) {
    return new Date(now.getFullYear(), now.getMonth() + 1, dueDate);
  }
  return thisMonth;
}

export function getDaysUntilDue(dueDate: number): number {
  const nextDue = getNextDueDate(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  nextDue.setHours(0, 0, 0, 0);
  const diff = nextDue.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(card: CreditCard): boolean {
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  const days = Math.ceil((expiryEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
}

export function isExpired(card: CreditCard): boolean {
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  return now > expiryEnd;
}

export function computeStatus(card: CreditCard): PaymentStatus {
  if (card.paymentStatus === "Paid") return "Paid";
  const now = new Date();
  const thisMonthDue = new Date(now.getFullYear(), now.getMonth(), card.dueDate);
  thisMonthDue.setHours(23, 59, 59, 999);
  if (now > thisMonthDue) return "Overdue";
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

const CardsContext = createContext<CardsContextValue | null>(null);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CreditCard[] = JSON.parse(raw);
        const updated = parsed.map((c) => ({ ...c, paymentStatus: computeStatus(c) }));
        setCards(updated);
      } else {
        const withStatus = SAMPLE_CARDS.map((c) => ({ ...c, paymentStatus: computeStatus(c) }));
        setCards(withStatus);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withStatus));
      }
    } catch {
      setCards(SAMPLE_CARDS);
    } finally {
      setLoading(false);
    }
  };

  const saveCards = async (updated: CreditCard[]) => {
    setCards(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addCard = useCallback(
    async (cardData: Omit<CreditCard, "id" | "createdAt" | "paymentStatus">) => {
      const newCard: CreditCard = {
        ...cardData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        createdAt: new Date().toISOString(),
        paymentStatus: "Pending",
      };
      newCard.paymentStatus = computeStatus(newCard);
      await saveCards([...cards, newCard]);
    },
    [cards]
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<CreditCard>) => {
      const updated = cards.map((c) => {
        if (c.id !== id) return c;
        const merged = { ...c, ...updates };
        merged.paymentStatus = computeStatus(merged);
        return merged;
      });
      await saveCards(updated);
    },
    [cards]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await saveCards(cards.filter((c) => c.id !== id));
    },
    [cards]
  );

  const markAsPaid = useCallback(
    async (id: string) => {
      const updated = cards.map((c) =>
        c.id === id ? { ...c, paymentStatus: "Paid" as PaymentStatus, paidDate: new Date().toISOString() } : c
      );
      await saveCards(updated);
    },
    [cards]
  );

  const markAsPending = useCallback(
    async (id: string) => {
      const updated = cards.map((c) =>
        c.id === id ? { ...c, paymentStatus: "Pending" as PaymentStatus, paidDate: undefined } : c
      );
      await saveCards(updated);
    },
    [cards]
  );

  const resetMonthlyStatuses = useCallback(async () => {
    const updated = cards.map((c) => ({
      ...c,
      paymentStatus: "Pending" as PaymentStatus,
      paidDate: undefined,
    }));
    await saveCards(updated);
  }, [cards]);

  const getCard = useCallback((id: string) => cards.find((c) => c.id === id), [cards]);

  const activeCards = cards.filter((c) => c.isActive);
  const stats = computeStats(cards);

  return (
    <CardsContext.Provider
      value={{ cards, activeCards, stats, loading, addCard, updateCard, deleteCard, markAsPaid, markAsPending, resetMonthlyStatuses, getCard }}
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
