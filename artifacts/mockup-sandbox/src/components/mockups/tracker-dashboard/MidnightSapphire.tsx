import { useMemo, useState } from "react";
import { AlertTriangle, Check, CheckSquare, ChevronDown, Lock, Plus, ShieldCheck, X } from "lucide-react";

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

const initialCards: MockCard[] = [
  { id: "hdfc-regalia", bankName: "HDFC", cardName: "Regalia Gold", cardHolderName: "Aarav Mehta", lastFourDigits: "4821", dueDate: "2026-08-14", paymentStatus: "Pending" },
  { id: "icici-coral", bankName: "ICICI", cardName: "Coral Credit Card", cardHolderName: "Aarav Mehta", lastFourDigits: "1934", dueDate: "2026-08-10", paymentStatus: "Overdue" },
  { id: "sbi-simplyclick", bankName: "SBI", cardName: "SimplyCLICK", cardHolderName: "Aarav Mehta", lastFourDigits: "7712", dueDate: "2026-08-18", paymentStatus: "Pending" },
  { id: "axis-vista", bankName: "Axis", cardName: "Axis Vistara", cardHolderName: "Aarav Mehta", lastFourDigits: "2449", dueDate: "2026-08-03", paymentStatus: "Paid" },
  { id: "kotak-white", bankName: "Kotak", cardName: "White Reserve", cardHolderName: "Aarav Mehta", lastFourDigits: "9086", dueDate: "2026-08-20", paymentStatus: "Pending", isFrozen: true },
];

const colors = {
  ink: "#07101f",
  panel: "#0d192d",
  raised: "#12213a",
  border: "#263b5d",
  borderSoft: "#1d304d",
  text: "#edf4ff",
  muted: "#8da1c1",
  sapphire: "#6fa9ff",
  sapphireDeep: "#2f6ed8",
  champagne: "#d8bd83",
  paid: "#70d2b0",
  pending: "#e4b96d",
  overdue: "#f28a88",
};

function MidnightSapphire() {
  const [cards, setCards] = useState(initialCards);
  const [showAdd, setShowAdd] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const stats = useMemo(() => {
    const paid = cards.filter((card) => card.paymentStatus === "Paid").length;
    const pending = cards.filter((card) => card.paymentStatus === "Pending").length;
    const overdue = cards.filter((card) => card.paymentStatus === "Overdue").length;
    return { total: cards.length, paid, pending, overdue };
  }, [cards]);

  const unpaidCount = cards.filter((card) => card.paymentStatus !== "Paid").length;
  const attentionCards = cards.filter((card) => card.paymentStatus !== "Paid").slice(0, 5);
  const visibleCards = showAll ? cards : cards.slice(0, 4);

  const markAllPaid = () => {
    if (markingAll || unpaidCount === 0) return;
    setMarkingAll(true);
    window.setTimeout(() => {
      setCards((current) => current.map((card) => ({ ...card, paymentStatus: "Paid" })));
      setMarkingAll(false);
    }, 280);
  };

  const addSampleCard = () => {
    setCards((current) => [
      ...current,
      {
        id: "new-sapphire",
        bankName: "IndusInd",
        cardName: "Pinnacle Reserve",
        cardHolderName: "Aarav Mehta",
        lastFourDigits: "6307",
        dueDate: "2026-08-24",
        paymentStatus: "Pending",
      },
    ]);
    setShowAdd(false);
    setShowAll(true);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-[#edf4ff]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col px-3 py-3">
        <main
          className="relative min-h-[844px] flex-1 overflow-hidden rounded-[30px] border px-4 py-5 shadow-[0_28px_80px_rgba(0,0,0,0.5)]"
          style={{ background: `linear-gradient(155deg, ${colors.ink} 0%, #09182d 55%, #0a1426 100%)`, borderColor: colors.borderSoft }}
        >
          <div className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-[#17498e]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#0b3c75]/20 blur-3xl" />

          <header className="relative mb-6 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[12px] font-medium tracking-[0.04em]" style={{ color: colors.muted }}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#70d2b0]" />
                PRIVATE VIEW
              </div>
              <div className="text-[13px] font-medium" style={{ color: colors.muted }}>Good afternoon, Aarav</div>
              <div className="mt-1 text-[21px] font-semibold tracking-[-0.03em] text-[#f3f7ff]">Tue, 12 August 2026</div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdd((visible) => !visible)}
              className="flex h-11 w-11 items-center justify-center rounded-[14px] border text-[#eff6ff] transition-transform active:scale-95"
              style={{ backgroundColor: colors.sapphireDeep, borderColor: "#659ef1", boxShadow: "0 10px 24px rgba(47,110,216,0.32)" }}
              aria-label={showAdd ? "Close add card" : "Add card"}
            >
              {showAdd ? <X size={20} /> : <Plus size={21} />}
            </button>
          </header>

          {showAdd && (
            <div className="relative mb-3 rounded-[16px] border p-3.5" style={{ backgroundColor: "#102543", borderColor: "#315584" }}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#1b4276] text-[#9bc2ff]">
                  <Plus size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-[#f2f6ff]">Add a new card</div>
                  <div className="mt-0.5 text-[12px] leading-5" style={{ color: colors.muted }}>Use a saved sample to preview the tracker.</div>
                </div>
                <button type="button" onClick={addSampleCard} className="rounded-[9px] bg-[#d8bd83] px-3 py-2 text-[11px] font-bold text-[#161b24]">
                  Add
                </button>
              </div>
            </div>
          )}

          <section className="relative mb-3 grid gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Total cards" value={stats.total} accent={colors.sapphire} iconTone="#1a417b" />
              <StatCard label="Paid" value={stats.paid} accent={colors.paid} iconTone="#194d4d" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Pending" value={stats.pending} accent={colors.pending} iconTone="#554323" />
              <StatCard label="Overdue" value={stats.overdue} accent={colors.overdue} iconTone="#5c2b39" />
            </div>
          </section>

          {unpaidCount > 0 && (
            <button
              type="button"
              onClick={markAllPaid}
              disabled={markingAll}
              className="relative mb-3 flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-[14px] border text-[14px] font-bold text-[#07151b] transition-transform active:scale-[0.99] disabled:opacity-70"
              style={{ backgroundColor: colors.paid, borderColor: "#a2ebd0", boxShadow: "0 12px 26px rgba(42,157,125,0.2)" }}
            >
              {markingAll ? <Check size={18} /> : <CheckSquare size={18} />}
              {markingAll ? "Updating payments…" : `Mark all as paid (${unpaidCount} cards)`}
            </button>
          )}

          {unpaidCount > 0 && (
            <div className="relative mb-5 flex items-start gap-2.5 rounded-[13px] border px-3 py-3" style={{ backgroundColor: "#272117", borderColor: "#715d32", color: colors.pending }}>
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <div className="text-[12px] font-semibold leading-[18px]">{unpaidCount} cards expiring or expired <span className="font-normal text-[#c7ad78]">— update soon</span></div>
            </div>
          )}

          <section className="relative mb-5">
            <SectionHeading eyebrow="ACTION QUEUE" title="Needs attention" />
            <div className="mt-3 space-y-2.5">
              {attentionCards.map((card) => <CardRow key={card.id} card={card} />)}
            </div>
          </section>

          <section className="relative mb-6 rounded-[16px] border p-4" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold tracking-[0.12em] text-[#8195b5]">MONTHLY RHYTHM</div>
                <div className="mt-1 text-[15px] font-semibold text-[#eef4ff]">This month&apos;s payments</div>
              </div>
              <div className="text-[15px] font-semibold" style={{ color: colors.champagne }}>{stats.paid}/{stats.total}</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1b2d48]">
              <div className="h-2 rounded-full bg-[#70d2b0] transition-[width] duration-300" style={{ width: `${Math.round((stats.paid / stats.total) * 100)}%` }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[12px]" style={{ color: colors.muted }}>
              <span>{Math.round((stats.paid / stats.total) * 100)}% reconciled</span>
              <span>{stats.pending} pending · {stats.overdue} overdue</span>
            </div>
          </section>

          <section className="relative">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="text-[12px] font-bold tracking-[0.12em] text-[#8195b5]">PORTFOLIO</div>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#eef4ff]">All cards</h2>
              </div>
              <button type="button" onClick={() => setShowAll((visible) => !visible)} className="flex items-center gap-1 text-[13px] font-semibold text-[#86b5ff]">
                {showAll ? "Collapse" : "See all"} <ChevronDown className={showAll ? "rotate-180 transition-transform" : "transition-transform"} size={15} />
              </button>
            </div>
            <div className="space-y-2.5">
              {visibleCards.map((card) => <CardRow key={card.id} card={card} />)}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.05em] text-[#6f85a8]">
              <ShieldCheck size={14} className="text-[#6da6f8]" /> ENCRYPTED LOCALLY
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[0.14em] text-[#7890b5]">{eyebrow}</div>
      <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#eef4ff]">{title}</h2>
    </div>
  );
}

function StatCard({ label, value, accent, iconTone }: { label: string; value: number; accent: string; iconTone: string }) {
  return (
    <div className="rounded-[16px] border p-3.5" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: iconTone }}>
        <div className="h-3.5 w-3.5 rounded-[4px]" style={{ backgroundColor: accent }} />
      </div>
      <div className="text-[27px] font-semibold leading-8 tracking-[-0.04em]" style={{ color: accent }}>{value}</div>
      <div className="mt-1 text-[11px] font-medium tracking-[0.02em]" style={{ color: colors.muted }}>{label}</div>
    </div>
  );
}

function CardRow({ card }: { card: MockCard }) {
  const isPaid = card.paymentStatus === "Paid";
  const isOverdue = card.paymentStatus === "Overdue";
  const statusColor = isOverdue ? colors.overdue : isPaid ? colors.paid : colors.pending;
  const statusBg = isOverdue ? "#4b2535" : isPaid ? "#164641" : "#514222";
  const dueLabel = isPaid ? "Paid" : isOverdue ? "2d overdue" : "Due in 5d";

  return (
    <div className="flex min-h-[78px] items-center gap-3 rounded-[15px] border p-3" style={{ backgroundColor: colors.raised, borderColor: colors.borderSoft }}>
      <div className="flex h-[52px] w-[80px] shrink-0 flex-col justify-between overflow-hidden rounded-[10px] border p-2.5 text-[#f4f7fd]" style={{ background: "linear-gradient(145deg, #183d7a, #0a1730 74%)", borderColor: "#315995", boxShadow: "0 6px 15px rgba(0,0,0,0.28)" }}>
        <div className="flex items-center justify-between text-[8px] font-bold tracking-[0.08em]">
          <span>{card.bankName}</span>
          <span className="rounded border border-[#a5c4f3]/30 px-1 py-0.5 text-[7px] text-[#b6cdf2]">VISA</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="grid grid-cols-3 gap-0.5">
            <span className="h-1 w-1 rounded-full bg-[#d8e6ff]/90" /><span className="h-1 w-1 rounded-full bg-[#d8e6ff]/90" /><span className="h-1 w-1 rounded-full bg-[#d8e6ff]/90" />
          </div>
          <span className="text-[8px] font-medium tracking-[0.08em]">{card.lastFourDigits}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.11em] text-[#91a6c7]">{card.bankName}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            {card.isFrozen && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4b2535]"><Lock size={10} color={colors.overdue} /></div>}
            <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: statusBg, color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {card.paymentStatus}
            </div>
          </div>
        </div>
        <div className="truncate text-[14px] font-semibold text-[#eef4ff]">{card.cardName}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="truncate text-[11px]" style={{ color: colors.muted }}>{card.cardHolderName} · ···· {card.lastFourDigits}</div>
          <div className="shrink-0 text-[10px] font-semibold" style={{ color: statusColor }}>{dueLabel}</div>
        </div>
      </div>
    </div>
  );
}

export { MidnightSapphire };