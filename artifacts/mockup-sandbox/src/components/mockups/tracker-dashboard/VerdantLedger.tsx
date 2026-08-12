import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckSquare,
  ChevronDown,
  CreditCard,
  Lock,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

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

const tone = {
  ink: "#173D31",
  forest: "#1F5943",
  forestDeep: "#123B2D",
  sage: "#E7F0E7",
  sageDark: "#D3E3D5",
  paper: "#F5F7F0",
  brass: "#B98942",
  brassLight: "#F4E9D1",
  moss: "#4E8762",
  mossLight: "#DDEBDD",
  amber: "#A5662A",
  amberLight: "#F6E9D2",
  red: "#B85249",
  redLight: "#F5DFDA",
  line: "#D6E1D5",
  quiet: "#6B7F73",
};

function formatDueDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VerdantLedger() {
  const [cards, setCards] = useState<MockCard[]>(initialCards);
  const [isAdding, setIsAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [newBank, setNewBank] = useState("");
  const [newCardName, setNewCardName] = useState("");

  const stats = useMemo(() => {
    const paid = cards.filter((card) => card.paymentStatus === "Paid").length;
    const pending = cards.filter((card) => card.paymentStatus === "Pending").length;
    const overdue = cards.filter((card) => card.paymentStatus === "Overdue").length;
    return { total: cards.length, paid, pending, overdue };
  }, [cards]);

  const unpaidCards = cards.filter((card) => card.paymentStatus !== "Paid");
  const attentionCards = unpaidCards.slice(0, 5);
  const visibleCards = showAll ? cards : cards.slice(0, 4);
  const progress = Math.round((stats.paid / stats.total) * 100);

  const handleAddCard = () => {
    if (!newBank.trim() || !newCardName.trim()) return;
    setCards((current) => [
      ...current,
      {
        id: `${newBank.toLowerCase()}-${Date.now()}`,
        bankName: newBank.trim(),
        cardName: newCardName.trim(),
        cardHolderName: "Aarav Mehta",
        lastFourDigits: "6628",
        dueDate: "2026-08-24",
        paymentStatus: "Pending",
      },
    ]);
    setNewBank("");
    setNewCardName("");
    setIsAdding(false);
  };

  return (
    <div className="min-h-[100dvh] px-3 py-3 sm:px-5 sm:py-5" style={{ background: tone.forestDeep, color: tone.ink }}>
      <main
        className="mx-auto flex min-h-[calc(100dvh-24px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[30px] border shadow-[0_24px_70px_rgba(11,42,30,0.28)]"
        style={{ background: tone.paper, borderColor: "rgba(255,255,255,0.16)" }}
      >
        <header className="relative overflow-hidden px-5 pb-5 pt-6" style={{ background: tone.forest }}>
          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full border-[18px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BCD4C0]">
                <ShieldCheck size={14} strokeWidth={1.8} />
                Verdant Ledger
              </div>
              <p className="text-[13px] font-medium text-[#C9DCCB]">Good afternoon, Aarav</p>
              <h1 className="mt-1 font-['Instrument_Serif'] text-[28px] leading-none tracking-[-0.02em] text-[#F5F7F0]">
                Tue, 12 August 2026
              </h1>
            </div>
            <button
              type="button"
              aria-label="Add card"
              onClick={() => setIsAdding(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-[#DAB875]/50 bg-[#C99A4F] text-[#173D31] shadow-[0_8px_18px_rgba(13,45,32,0.25)] transition-transform active:scale-95"
            >
              <Plus size={21} strokeWidth={2.4} />
            </button>
          </div>
          <div className="relative mt-5 flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.09] px-3.5 py-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFCAB3]">Payment health</div>
              <div className="mt-1 text-[14px] font-semibold text-[#F5F7F0]">{progress}% of this month is clear</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DAB875] text-[11px] font-bold text-[#F4E9D1]">
              {progress}%
            </div>
          </div>
        </header>

        <div className="flex-1 px-5 pb-7 pt-4">
          <section aria-label="Payment stats" className="grid grid-cols-2 gap-2.5">
            <StatCard label="Total cards" value={stats.total} accent={tone.forest} icon={<CreditCard size={15} />} />
            <StatCard label="Paid" value={stats.paid} accent={tone.moss} icon={<Check size={16} />} />
            <StatCard label="Pending" value={stats.pending} accent={tone.brass} icon={<span className="text-[15px] leading-none">/</span>} />
            <StatCard label="Overdue" value={stats.overdue} accent={tone.red} icon={<AlertTriangle size={15} />} />
          </section>

          {unpaidCards.length > 0 && (
            <button
              type="button"
              onClick={() => setCards((current) => current.map((card) => ({ ...card, paymentStatus: "Paid" })))}
              className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#174A37] bg-[#1F5943] px-4 py-3 text-[14px] font-bold text-[#F5F7F0] shadow-[0_8px_16px_rgba(31,89,67,0.16)] transition-transform active:scale-[0.99]"
            >
              <CheckSquare size={17} strokeWidth={2} />
              Mark all as paid <span className="font-medium text-[#BFD6C2]">({unpaidCards.length} cards)</span>
            </button>
          )}

          {unpaidCards.length > 0 && (
            <div className="mt-3 flex items-start gap-2.5 rounded-[13px] border px-3.5 py-3" style={{ background: tone.amberLight, borderColor: "#E7C992", color: tone.amber }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p className="text-[12px] font-semibold leading-[1.35]">{unpaidCards.length} cards expiring or expired — update soon</p>
            </div>
          )}

          <section className="mt-5">
            <SectionHeading eyebrow="Priority queue" title="Needs attention" count={attentionCards.length} />
            <div className="mt-3 space-y-2.5">
              {attentionCards.map((card) => <CardRow key={card.id} card={card} />)}
            </div>
          </section>

          <section className="mt-5 rounded-[17px] border p-4" style={{ borderColor: tone.line, background: tone.sage }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: tone.moss }}>Monthly progress</div>
                <div className="mt-1 text-[16px] font-bold" style={{ color: tone.ink }}>Payments in order</div>
              </div>
              <div className="font-['Space_Mono'] text-[13px] font-bold" style={{ color: tone.forest }}>{stats.paid}/{stats.total}</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#C6D9C8]">
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${progress}%`, background: tone.brass }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium" style={{ color: tone.quiet }}>
              <span>{stats.pending} pending</span>
              <span>{stats.overdue} overdue</span>
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between">
              <SectionHeading eyebrow="Your wallet" title="All cards" count={cards.length} />
              <button type="button" onClick={() => setShowAll((value) => !value)} className="flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-[12px] font-bold" style={{ color: tone.forest }}>
                {showAll ? "Show less" : "See all"} <ChevronDown size={14} className={showAll ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
            </div>
            <div className="space-y-2.5">
              {visibleCards.map((card) => <CardRow key={card.id} card={card} />)}
            </div>
          </section>
        </div>
      </main>

      {isAdding && (
        <div className="fixed inset-0 z-10 flex items-end justify-center bg-[#0C2A20]/40 px-3 pb-3 backdrop-blur-[2px] sm:items-center sm:pb-0">
          <div className="w-full max-w-[390px] rounded-[24px] border p-5 shadow-2xl" style={{ background: tone.paper, borderColor: tone.line }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: tone.moss }}>New account</div>
                <h2 className="mt-1 font-['Instrument_Serif'] text-[27px]" style={{ color: tone.ink }}>Add a card</h2>
              </div>
              <button type="button" aria-label="Close add card form" onClick={() => setIsAdding(false)} className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: tone.sage, color: tone.forest }}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <label className="block text-[12px] font-bold" style={{ color: tone.quiet }}>
                Bank
                <input value={newBank} onChange={(event) => setNewBank(event.target.value)} placeholder="e.g. HDFC" className="mt-1.5 h-12 w-full rounded-[12px] border bg-[#FBFCF8] px-3 text-[14px] font-semibold outline-none placeholder:text-[#A1B0A5] focus:border-[#B98942]" style={{ borderColor: tone.line }} />
              </label>
              <label className="block text-[12px] font-bold" style={{ color: tone.quiet }}>
                Card name
                <input value={newCardName} onChange={(event) => setNewCardName(event.target.value)} placeholder="e.g. Regalia Gold" className="mt-1.5 h-12 w-full rounded-[12px] border bg-[#FBFCF8] px-3 text-[14px] font-semibold outline-none placeholder:text-[#A1B0A5] focus:border-[#B98942]" style={{ borderColor: tone.line }} />
              </label>
              <button type="button" disabled={!newBank.trim() || !newCardName.trim()} onClick={handleAddCard} className="mt-1 flex h-12 w-full items-center justify-center rounded-[12px] text-[14px] font-bold text-[#F5F7F0] disabled:cursor-not-allowed disabled:opacity-45" style={{ background: tone.forest }}>
                Add card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border p-3.5" style={{ borderColor: tone.line, background: "#FBFCF8" }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ background: `${accent}16`, color: accent }}>{icon}</div>
      <div className="mt-3 font-['Space_Mono'] text-[24px] font-bold leading-none" style={{ color: accent }}>{value}</div>
      <div className="mt-2 text-[11px] font-semibold" style={{ color: tone.quiet }}>{label}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, count }: { eyebrow: string; title: string; count: number }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.17em]" style={{ color: tone.moss }}>{eyebrow}</div>
      <div className="mt-1 flex items-center gap-2">
        <h2 className="font-['Instrument_Serif'] text-[25px] leading-none" style={{ color: tone.ink }}>{title}</h2>
        <span className="rounded-full px-2 py-0.5 font-['Space_Mono'] text-[10px] font-bold" style={{ background: tone.sageDark, color: tone.forest }}>{count}</span>
      </div>
    </div>
  );
}

function CardRow({ card }: { card: MockCard }) {
  const isPaid = card.paymentStatus === "Paid";
  const isOverdue = card.paymentStatus === "Overdue";
  const statusColor = isPaid ? tone.moss : isOverdue ? tone.red : tone.brass;
  const statusBg = isPaid ? tone.mossLight : isOverdue ? tone.redLight : tone.amberLight;
  const dueLabel = isPaid ? "Settled" : isOverdue ? "2d overdue" : "Due in 5d";

  return (
    <div className="flex min-h-[76px] items-center gap-3 rounded-[15px] border p-3" style={{ borderColor: tone.line, background: "#FBFCF8" }}>
      <div className="flex h-[52px] w-[80px] shrink-0 flex-col justify-between overflow-hidden rounded-[10px] p-2.5 text-[#F7F4E9] shadow-[0_5px_12px_rgba(18,59,45,0.2)]" style={{ background: `linear-gradient(135deg, ${tone.forestDeep}, ${tone.forest}, #3D7754)` }}>
        <div className="flex items-center justify-between text-[8px] font-bold tracking-[0.08em]">
          <span>{card.bankName}</span>
          <span className="rounded bg-[#DAB875]/85 px-1 py-0.5 text-[7px] text-[#173D31]">VISA</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex gap-0.5">
            <span className="h-1 w-1 rounded-full bg-[#F7F4E9]/85" />
            <span className="h-1 w-1 rounded-full bg-[#F7F4E9]/85" />
            <span className="h-1 w-1 rounded-full bg-[#F7F4E9]/85" />
          </div>
          <span className="font-['Space_Mono'] text-[8px] tracking-[0.08em]">{card.lastFourDigits}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: tone.quiet }}>{card.bankName}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            {card.isFrozen && <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: tone.redLight, color: tone.red }}><Lock size={10} /></div>}
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: statusBg, color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
              {card.paymentStatus}
            </div>
          </div>
        </div>
        <div className="truncate text-[14px] font-bold" style={{ color: tone.ink }}>{card.cardName}</div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="truncate text-[11px]" style={{ color: tone.quiet }}>{card.cardHolderName} · ···· {card.lastFourDigits}</div>
          <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold" style={{ color: statusColor }}>
            {dueLabel}
            {!isPaid && <ArrowUpRight size={11} />}
          </div>
        </div>
        <div className="mt-1 text-[10px] font-medium" style={{ color: tone.quiet }}>Statement date {formatDueDate(card.dueDate)}</div>
      </div>
    </div>
  );
}