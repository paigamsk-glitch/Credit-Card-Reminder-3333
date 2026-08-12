import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckSquare2,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  Plus,
  Sparkles,
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

const startingCards: MockCard[] = [
  { id: "hdfc-regalia", bankName: "HDFC", cardName: "Regalia Gold", cardHolderName: "Aarav Mehta", lastFourDigits: "4821", dueDate: "2026-08-14", paymentStatus: "Pending" },
  { id: "icici-coral", bankName: "ICICI", cardName: "Coral Credit Card", cardHolderName: "Aarav Mehta", lastFourDigits: "1934", dueDate: "2026-08-10", paymentStatus: "Overdue" },
  { id: "sbi-simplyclick", bankName: "SBI", cardName: "SimplyCLICK", cardHolderName: "Aarav Mehta", lastFourDigits: "7712", dueDate: "2026-08-18", paymentStatus: "Pending" },
  { id: "axis-vista", bankName: "Axis", cardName: "Axis Vistara", cardHolderName: "Aarav Mehta", lastFourDigits: "2449", dueDate: "2026-08-03", paymentStatus: "Paid" },
  { id: "kotak-white", bankName: "Kotak", cardName: "White Reserve", cardHolderName: "Aarav Mehta", lastFourDigits: "9086", dueDate: "2026-08-20", paymentStatus: "Pending", isFrozen: true },
];

const palette = {
  parchment: "#F3EBDD",
  ink: "#2D211B",
  inkSoft: "#735F50",
  paper: "#FFF9F0",
  paperDeep: "#F7EFE2",
  line: "#E1D2BE",
  terracotta: "#B75D45",
  terracottaSoft: "#F1DCD1",
  amber: "#A97029",
  amberSoft: "#F4E6BF",
  sage: "#4E765D",
  sageSoft: "#DCE9D8",
  crimson: "#A7473D",
  crimsonSoft: "#F2D8D3",
};

function WarmMineral() {
  const [cards, setCards] = useState(startingCards);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [newLastFour, setNewLastFour] = useState("");

  const stats = useMemo(() => {
    const paid = cards.filter((card) => card.paymentStatus === "Paid").length;
    const pending = cards.filter((card) => card.paymentStatus === "Pending").length;
    const overdue = cards.filter((card) => card.paymentStatus === "Overdue").length;
    return { total: cards.length, paid, pending, overdue };
  }, [cards]);

  const unpaidCount = stats.pending + stats.overdue;
  const attentionCards = cards.filter((card) => card.paymentStatus !== "Paid").slice(0, 5);
  const visibleCards = showAllCards ? cards : cards.slice(0, 4);

  function markAllPaid() {
    setCards((currentCards) =>
      currentCards.map((card) => ({ ...card, paymentStatus: "Paid" as PaymentStatus })),
    );
  }

  function addCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCardName.trim() || !newBankName.trim() || newLastFour.trim().length !== 4) return;

    setCards((currentCards) => [
      ...currentCards,
      {
        id: `new-card-${Date.now()}`,
        bankName: newBankName.trim().toUpperCase(),
        cardName: newCardName.trim(),
        cardHolderName: "Aarav Mehta",
        lastFourDigits: newLastFour.trim(),
        dueDate: "2026-08-25",
        paymentStatus: "Pending",
      },
    ]);
    setNewCardName("");
    setNewBankName("");
    setNewLastFour("");
    setShowAddCard(false);
  }

  return (
    <div
      className="min-h-[100dvh] px-3 py-3 text-[#2D211B] sm:px-5 sm:py-5"
      style={{
        backgroundColor: palette.parchment,
        backgroundImage:
          "radial-gradient(circle at 12% 8%, rgba(183,93,69,0.08), transparent 28%), radial-gradient(circle at 92% 32%, rgba(196,138,57,0.08), transparent 32%)",
        fontFamily: "'DM Sans', ui-sans-serif, sans-serif",
      }}
    >
      <main
        className="mx-auto min-h-[calc(100dvh-24px)] max-w-[430px] overflow-hidden rounded-[30px] border shadow-[0_22px_70px_rgba(88,59,38,0.14)] sm:min-h-[844px]"
        style={{ backgroundColor: palette.paperDeep, borderColor: palette.line }}
      >
        <div className="px-5 pb-8 pt-6 sm:px-6">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.terracotta }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.terracotta }} />
                Money, in order
              </div>
              <p className="text-[13px] font-medium" style={{ color: palette.inkSoft }}>Good afternoon, Aarav</p>
              <h1
                className="mt-1 text-[28px] font-semibold leading-[1.04] tracking-[-0.045em]"
                style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink }}
              >
                Tuesday, 12 August
                <span className="mt-1 block text-[17px] font-medium tracking-[-0.02em]" style={{ color: palette.inkSoft }}>
                  2026
                </span>
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCard((isOpen) => !isOpen)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-white transition-transform active:scale-95"
              style={{ backgroundColor: palette.ink, boxShadow: "0 9px 18px rgba(45,33,27,0.18)" }}
              aria-label={showAddCard ? "Close add card form" : "Add card"}
            >
              {showAddCard ? <X size={20} strokeWidth={2.2} /> : <Plus size={21} strokeWidth={2.2} />}
            </button>
          </header>

          {showAddCard && (
            <form
              onSubmit={addCard}
              className="mb-5 rounded-[20px] border p-4 shadow-[0_10px_24px_rgba(88,59,38,0.08)]"
              style={{ backgroundColor: palette.paper, borderColor: palette.line }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: palette.terracottaSoft, color: palette.terracotta }}>
                  <CreditCard size={16} />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold">Add a card</h2>
                  <p className="text-[11px]" style={{ color: palette.inkSoft }}>Keep the essentials close.</p>
                </div>
              </div>
              <div className="grid grid-cols-[1.25fr_0.75fr] gap-2">
                <input
                  value={newCardName}
                  onChange={(event) => setNewCardName(event.target.value)}
                  placeholder="Card name"
                  className="h-11 min-w-0 rounded-[11px] border bg-transparent px-3 text-[13px] outline-none placeholder:text-[#A99380] focus:ring-2"
                  style={{ borderColor: palette.line, outlineColor: palette.terracotta }}
                  aria-label="Card name"
                />
                <input
                  value={newBankName}
                  onChange={(event) => setNewBankName(event.target.value)}
                  placeholder="Bank"
                  className="h-11 min-w-0 rounded-[11px] border bg-transparent px-3 text-[13px] outline-none placeholder:text-[#A99380] focus:ring-2"
                  style={{ borderColor: palette.line, outlineColor: palette.terracotta }}
                  aria-label="Bank name"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={newLastFour}
                  onChange={(event) => setNewLastFour(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Last 4 digits"
                  inputMode="numeric"
                  className="h-11 min-w-0 flex-1 rounded-[11px] border bg-transparent px-3 text-[13px] outline-none placeholder:text-[#A99380] focus:ring-2"
                  style={{ borderColor: palette.line, outlineColor: palette.terracotta }}
                  aria-label="Last four card digits"
                />
                <button
                  type="submit"
                  className="h-11 rounded-[11px] px-4 text-[13px] font-bold text-white transition-transform active:scale-95"
                  style={{ backgroundColor: palette.terracotta }}
                >
                  Save card
                </button>
              </div>
            </form>
          )}

          <section aria-label="Payment overview" className="mb-4 grid grid-cols-2 gap-2.5">
            <StatCard label="Total cards" value={stats.total} accent={palette.ink} tint="#EDE2D3" />
            <StatCard label="Paid" value={stats.paid} accent={palette.sage} tint={palette.sageSoft} />
            <StatCard label="Pending" value={stats.pending} accent={palette.amber} tint={palette.amberSoft} />
            <StatCard label="Overdue" value={stats.overdue} accent={palette.crimson} tint={palette.crimsonSoft} />
          </section>

          {unpaidCount > 0 ? (
            <button
              type="button"
              onClick={markAllPaid}
              className="mb-3.5 flex min-h-[52px] w-full items-center justify-between rounded-[16px] px-4 text-left transition-transform active:scale-[0.99]"
              style={{ backgroundColor: palette.sage, boxShadow: "0 10px 22px rgba(78,118,93,0.18)" }}
            >
              <span className="flex items-center gap-2.5 text-[14px] font-bold text-white">
                <CheckSquare2 size={18} />
                Mark all as paid
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-bold text-white">
                {unpaidCount} cards
              </span>
            </button>
          ) : (
            <div className="mb-3.5 flex min-h-[52px] items-center gap-2.5 rounded-[16px] px-4 text-[14px] font-bold" style={{ backgroundColor: palette.sageSoft, color: palette.sage }}>
              <Check size={18} />
              All payments are up to date
            </div>
          )}

          {unpaidCount > 0 && (
            <div
              className="mb-5 flex items-start gap-2.5 rounded-[15px] border px-3.5 py-3"
              style={{ backgroundColor: palette.amberSoft, borderColor: "#E6CC91", color: "#85561E" }}
              role="status"
            >
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <span className="text-[12px] font-semibold leading-[1.35]">
                {unpaidCount} cards expiring or expired — update soon
              </span>
            </div>
          )}

          <section className="mb-5" aria-labelledby="attention-heading">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.terracotta }}>Next up</div>
                <h2 id="attention-heading" className="text-[21px] font-semibold tracking-[-0.035em]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  Needs attention
                </h2>
              </div>
              <span className="mb-0.5 text-[12px] font-semibold" style={{ color: palette.inkSoft }}>{attentionCards.length} to review</span>
            </div>
            <div className="space-y-2.5">
              {attentionCards.length > 0 ? (
                attentionCards.map((card) => <CardRow key={card.id} card={card} />)
              ) : (
                <div className="rounded-[16px] border border-dashed p-5 text-center text-[13px]" style={{ borderColor: palette.line, color: palette.inkSoft }}>
                  Nothing needs your attention today.
                </div>
              )}
            </div>
          </section>

          <section
            className="relative mb-6 overflow-hidden rounded-[20px] border p-4"
            style={{ backgroundColor: palette.paper, borderColor: palette.line, boxShadow: "0 9px 22px rgba(88,59,38,0.06)" }}
            aria-labelledby="progress-heading"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[12px] opacity-50" style={{ borderColor: palette.terracottaSoft }} />
            <div className="relative">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: palette.terracotta }}>
                    <Sparkles size={12} />
                    Monthly rhythm
                  </div>
                  <h2 id="progress-heading" className="text-[16px] font-bold">This month&apos;s payments</h2>
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-semibold leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{stats.paid}/{stats.total}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: palette.inkSoft }}>paid</div>
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "#EDE2D3" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round((stats.paid / stats.total) * 100)}%`, backgroundColor: palette.sage }} />
              </div>
              <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold" style={{ color: palette.inkSoft }}>
                <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.amber }} />{stats.pending} pending</span>
                <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.crimson }} />{stats.overdue} overdue</span>
              </div>
            </div>
          </section>

          <section aria-labelledby="all-cards-heading">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.terracotta }}>Your wallet</div>
                <h2 id="all-cards-heading" className="text-[21px] font-semibold tracking-[-0.035em]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>All cards</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCards((isShowing) => !isShowing)}
                className="flex min-h-[40px] items-center gap-1 rounded-full px-2 text-[12px] font-bold"
                style={{ color: palette.terracotta }}
              >
                {showAllCards ? "Show less" : "See all"}
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="space-y-2.5">
              {visibleCards.map((card) => <CardRow key={card.id} card={card} />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent, tint }: { label: string; value: number; accent: string; tint: string }) {
  return (
    <div className="rounded-[17px] border p-3.5" style={{ backgroundColor: palette.paper, borderColor: palette.line, boxShadow: "0 7px 15px rgba(88,59,38,0.045)" }}>
      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-[9px]" style={{ backgroundColor: tint }}>
        <div className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: accent }} />
      </div>
      <div className="text-[27px] font-semibold leading-none tracking-[-0.045em]" style={{ fontFamily: "'Fraunces', Georgia, serif", color: accent }}>{value}</div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: palette.inkSoft }}>{label}</div>
    </div>
  );
}

function CardRow({ card }: { card: MockCard }) {
  const isPaid = card.paymentStatus === "Paid";
  const isOverdue = card.paymentStatus === "Overdue";
  const statusColor = isOverdue ? palette.crimson : isPaid ? palette.sage : palette.amber;
  const statusBg = isOverdue ? palette.crimsonSoft : isPaid ? palette.sageSoft : palette.amberSoft;
  const dueLabel = isPaid ? "Paid" : isOverdue ? "2d overdue" : "Due in 5d";

  return (
    <div className="flex min-h-[76px] items-center gap-3 rounded-[17px] border p-2.5" style={{ backgroundColor: palette.paper, borderColor: palette.line }}>
      <div
        className="relative flex h-[55px] w-[82px] shrink-0 flex-col justify-between overflow-hidden rounded-[11px] p-2.5 text-[#FFF9F0] shadow-[0_6px_12px_rgba(88,59,38,0.18)]"
        style={{ background: `linear-gradient(135deg, ${palette.ink} 0%, #634639 100%)` }}
      >
        <div className="absolute -right-4 -top-5 h-14 w-14 rounded-full border-[7px] border-white/10" />
        <div className="relative flex items-center justify-between text-[8px] font-bold tracking-[0.08em]">
          <span>{card.bankName}</span>
          <span className="rounded bg-white/15 px-1 py-0.5 text-[7px]">VISA</span>
        </div>
        <div className="relative flex items-end justify-between">
          <div className="grid grid-cols-3 gap-0.5">
            <span className="h-1 w-1 rounded-full bg-[#FFF9F0]/85" />
            <span className="h-1 w-1 rounded-full bg-[#FFF9F0]/85" />
            <span className="h-1 w-1 rounded-full bg-[#FFF9F0]/85" />
          </div>
          <span className="text-[8px] font-medium tracking-[0.08em]">{card.lastFourDigits}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <div className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: palette.inkSoft }}>{card.bankName}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            {card.isFrozen && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: palette.crimsonSoft, color: palette.crimson }} title="Card is frozen">
                <LockKeyhole size={10} />
              </div>
            )}
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: statusBg, color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {card.paymentStatus}
            </div>
          </div>
        </div>
        <div className="truncate text-[14px] font-bold tracking-[-0.02em]">{card.cardName}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="truncate text-[11px]" style={{ color: palette.inkSoft }}>{card.cardHolderName} · ···· {card.lastFourDigits}</div>
          <div className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold" style={{ color: statusColor }}>
            {dueLabel}
            <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

export { WarmMineral };