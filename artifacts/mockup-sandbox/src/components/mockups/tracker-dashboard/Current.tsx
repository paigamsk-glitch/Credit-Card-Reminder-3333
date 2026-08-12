import { useMemo, useState } from "react";
import { AlertTriangle, CheckSquare, Lock, Plus } from "lucide-react";

import "./_group.css";

type PaymentStatus = "Paid" | "Pending" | "Overdue";

type MockCard = {
  id: string;
  bankName: string;
  cardName: string;
  cardHolderName: string;
  lastFourDigits: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  isFrozen?: boolean;
};

const cards: MockCard[] = [
  { id: "hdfc-regalia", bankName: "HDFC", cardName: "Regalia Gold", cardHolderName: "Aarav Mehta", lastFourDigits: "4821", dueDate: "2026-08-14", paymentStatus: "Pending" },
  { id: "icici-coral", bankName: "ICICI", cardName: "Coral Credit Card", cardHolderName: "Aarav Mehta", lastFourDigits: "1934", dueDate: "2026-08-10", paymentStatus: "Overdue" },
  { id: "sbi-simplyclick", bankName: "SBI", cardName: "SimplyCLICK", cardHolderName: "Aarav Mehta", lastFourDigits: "7712", dueDate: "2026-08-18", paymentStatus: "Pending" },
  { id: "axis-vista", bankName: "Axis", cardName: "Axis Vistara", cardHolderName: "Aarav Mehta", lastFourDigits: "2449", dueDate: "2026-08-03", paymentStatus: "Paid" },
  { id: "kotak-white", bankName: "Kotak", cardName: "White Reserve", cardHolderName: "Aarav Mehta", lastFourDigits: "9086", dueDate: "2026-08-20", paymentStatus: "Pending", isFrozen: true },
];

const colors = {
  background: "#F0F4FB",
  foreground: "#0F1730",
  card: "#FFFFFF",
  muted: "#E4EBF8",
  mutedForeground: "#6B7A99",
  primary: "#1B2B5E",
  secondary: "#E4EBF8",
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF9C3",
  destructive: "#DC2626",
  dangerLight: "#FEE2E2",
  border: "#D6DFEE",
};

function Current() {
  const [markingAll] = useState(false);
  const stats = useMemo(() => {
    const paid = cards.filter((card) => card.paymentStatus === "Paid").length;
    const pending = cards.filter((card) => card.paymentStatus === "Pending").length;
    const overdue = cards.filter((card) => card.paymentStatus === "Overdue").length;
    return { total: cards.length, paid, pending, overdue };
  }, []);
  const unpaidCount = cards.filter((card) => card.paymentStatus !== "Paid").length;
  const expiringCards = cards.filter((card) => card.paymentStatus !== "Paid");
  const attentionCards = cards.filter((card) => card.paymentStatus !== "Paid").slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col px-4 py-4">
        <div className="flex min-h-[844px] flex-1 flex-col rounded-[28px] border border-border bg-background px-4 py-5 shadow-[0_20px_60px_rgba(15,23,48,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-[#6B7A99]">Good afternoon</div>
              <div className="mt-0.5 text-[20px] font-bold tracking-[-0.02em] text-foreground">Tue, 12 August 2026</div>
            </div>
            <button className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_10px_22px_rgba(27,43,94,0.24)]" aria-label="Add card">
              <Plus size={22} />
            </button>
          </div>

          <div className="mb-3 grid gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Total Cards" value={stats.total} color={colors.primary} lightColor={colors.secondary} />
              <StatCard label="Paid" value={stats.paid} color={colors.success} lightColor={colors.successLight} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Pending" value={stats.pending} color={colors.warning} lightColor={colors.warningLight} />
              <StatCard label="Overdue" value={stats.overdue} color={colors.destructive} lightColor={colors.dangerLight} />
            </div>
          </div>

          {unpaidCount > 0 && (
            <button className="mb-3 flex items-center justify-center gap-2.5 rounded-[14px] bg-success px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(22,163,74,0.18)] disabled:opacity-70" disabled={markingAll}>
              <CheckSquare size={18} />
              Mark All as Paid ({unpaidCount} cards)
            </button>
          )}

          {expiringCards.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-[#F3D36B] bg-[#FEF9C3] px-3 py-3 text-[13px] font-medium text-[#D97706]">
              <AlertTriangle size={16} color={colors.warning} />
              {expiringCards.length} cards expiring or expired — update soon
            </div>
          )}

          <section className="mb-4">
            <h2 className="mb-3 text-[17px] font-bold text-foreground">Needs attention</h2>
            <div className="space-y-2.5">
              {attentionCards.map((card) => (
                <CardRow key={card.id} card={card} />
              ))}
            </div>
          </section>

          <section className="mb-5 rounded-[14px] border border-border bg-card p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="text-[15px] font-semibold text-foreground">This month's payments</div>
              <div className="text-[14px] font-medium text-[#6B7A99]">{stats.paid}/{stats.total}</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-2 rounded-full bg-success" style={{ width: `${Math.round((stats.paid / stats.total) * 100)}%` }} />
            </div>
            <div className="mt-2.5 text-[12px] text-[#6B7A99]">{stats.pending} pending · {stats.overdue} overdue</div>
          </section>

          <section className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-foreground">All cards</h2>
              <button className="text-[14px] font-semibold text-primary">See all</button>
            </div>
            <div className="space-y-2.5">
              {cards.map((card) => (
                <CardRow key={card.id} card={card} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, lightColor }: { label: string; value: number | string; color: string; lightColor: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: lightColor }}>
        <div className="h-3.5 w-3.5 rounded-[4px]" style={{ backgroundColor: color }} />
      </div>
      <div className="text-[28px] font-bold leading-8" style={{ color }}>{value}</div>
      <div className="mt-1 text-[12px] font-medium text-[#6B7A99]">{label}</div>
    </div>
  );
}

function CardRow({ card }: { card: MockCard }) {
  const dueLabel = card.paymentStatus === "Paid" ? "Paid" : card.paymentStatus === "Overdue" ? "2d overdue" : "Due in 5d";
  const statusColor = card.paymentStatus === "Overdue" ? colors.destructive : card.paymentStatus === "Paid" ? colors.success : colors.warning;
  const statusBg = card.paymentStatus === "Overdue" ? colors.dangerLight : card.paymentStatus === "Paid" ? colors.successLight : colors.warningLight;

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-3">
      <div className="flex h-[52px] w-[80px] shrink-0 flex-col justify-between overflow-hidden rounded-[10px] bg-gradient-to-br from-[#0A1535] via-[#1B2B5E] to-[#0A1535] p-2.5 text-white shadow-[0_6px_14px_rgba(10,21,53,0.24)]">
        <div className="flex items-center justify-between text-[8px] font-bold tracking-[0.08em]">
          <span>{card.bankName}</span>
          <span className="rounded bg-white/15 px-1 py-0.5 text-[7px]">VISA</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="grid grid-cols-3 gap-0.5">
            <span className="h-1 w-1 rounded-full bg-white/85" /><span className="h-1 w-1 rounded-full bg-white/85" /><span className="h-1 w-1 rounded-full bg-white/85" />
          </div>
          <span className="text-[8px] font-medium tracking-[0.08em]">{card.lastFourDigits}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-[#5F6F95]">{card.bankName}</div>
          <div className="flex items-center gap-1.5">
            {card.isFrozen && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FEE2E2]"><Lock size={10} color={colors.destructive} /></div>}
            <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ backgroundColor: statusBg, color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {card.paymentStatus}
            </div>
          </div>
        </div>
        <div className="truncate text-[15px] font-semibold text-foreground">{card.cardName}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="truncate text-[12px] text-[#6B7A99]">{card.cardHolderName} · ···· {card.lastFourDigits}</div>
          <div className="text-[11px] font-medium" style={{ color: statusColor }}>{dueLabel}</div>
        </div>
      </div>
    </div>
  );
}

export { Current };