import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  CreditCard,
  LockKeyhole,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Status = "Paid" | "Pending" | "Overdue";
type Card = {
  id: string;
  bank: string;
  name: string;
  last4: string;
  date: string;
  status: Status;
  amount: string;
  frozen?: boolean;
};

const palette = {
  navy: "#172B3A",
  navy2: "#223C4D",
  ink: "#20343C",
  paper: "#F8F4EA",
  cream: "#FFFDF8",
  line: "#DFE3D8",
  teal: "#4A8B83",
  tealPale: "#DDEDE7",
  coral: "#C86F58",
  coralPale: "#F7E1D8",
  ochre: "#B88A43",
  ochrePale: "#F1E7CC",
  quiet: "#738178",
};

const initialCards: Card[] = [
  { id: "icici", bank: "ICICI", name: "Coral Credit Card", last4: "1934", date: "Aug 10", status: "Overdue", amount: "₹8,420" },
  { id: "hdfc", bank: "HDFC", name: "Regalia Gold", last4: "4821", date: "Aug 14", status: "Pending", amount: "₹12,640" },
  { id: "sbi", bank: "SBI", name: "SimplyCLICK", last4: "7712", date: "Aug 18", status: "Pending", amount: "₹4,870" },
  { id: "kotak", bank: "Kotak", name: "White Reserve", last4: "9086", date: "Aug 20", status: "Pending", amount: "₹2,180", frozen: true },
  { id: "axis", bank: "Axis", name: "Axis Vistara", last4: "2449", date: "Aug 03", status: "Paid", amount: "₹6,240" },
];

export function PaymentCalendar() {
  const [cards, setCards] = useState(initialCards);
  const [selectedDay, setSelectedDay] = useState("14");
  const [expanded, setExpanded] = useState<string | null>("hdfc");
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newBank, setNewBank] = useState("");
  const [newName, setNewName] = useState("");

  const filtered = useMemo(() => {
    const visible = cards.filter((card) => card.bank.toLowerCase().includes(query.toLowerCase()) || card.name.toLowerCase().includes(query.toLowerCase()));
    return visible.filter((card) => selectedDay === "all" || card.date.endsWith(selectedDay));
  }, [cards, query, selectedDay]);
  const openCount = cards.filter((card) => card.status !== "Paid").length;
  const total = cards.length;

  const markPaid = (id: string) => setCards((current) => current.map((card) => card.id === id ? { ...card, status: "Paid" } : card));
  const addCard = () => {
    if (!newBank.trim() || !newName.trim()) return;
    setCards((current) => [...current, { id: `new-${Date.now()}`, bank: newBank.trim(), name: newName.trim(), last4: "6628", date: "Aug 24", status: "Pending", amount: "₹3,250" }]);
    setNewBank("");
    setNewName("");
    setIsAdding(false);
    setSelectedDay("all");
  };

  return (
    <div className="min-h-[100dvh] px-3 py-3 sm:px-5 sm:py-5" style={{ background: palette.navy }}>
      <main className="mx-auto min-h-[calc(100dvh-24px)] w-full max-w-[420px] overflow-hidden rounded-[28px] shadow-[0_25px_70px_rgba(8,25,35,.35)]" style={{ background: palette.paper, color: palette.ink }}>
        <header className="px-5 pb-5 pt-6" style={{ background: palette.paper }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em]" style={{ color: palette.teal }}>
              <CalendarDays size={15} /> Payment calendar
            </div>
            <button type="button" aria-label="Add card" onClick={() => setIsAdding(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-[#FFFDF8] transition-transform active:scale-95" style={{ background: palette.coral }}><Plus size={19} /></button>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-[12px] font-semibold" style={{ color: palette.quiet }}>Tuesday, 12 August 2026</p>
              <h1 className="mt-1 font-['Instrument_Serif'] text-[34px] leading-none tracking-[-.03em]" style={{ color: palette.navy }}>Your month, in view.</h1>
            </div>
            <div className="text-right"><div className="font-['Space_Mono'] text-[25px] font-bold" style={{ color: palette.teal }}>{openCount}</div><div className="text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: palette.quiet }}>to settle</div></div>
          </div>
        </header>

        <section className="border-y px-5 py-4" style={{ borderColor: palette.line, background: palette.cream }}>
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[.15em]" style={{ color: palette.quiet }}>August 2026</div>
            <button type="button" onClick={() => setSelectedDay("all")} className="text-[11px] font-bold" style={{ color: palette.coral }}>All dates</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {["10", "11", "12", "13", "14", "15", "16", "17", "18", "20"].map((day) => (
              <button type="button" key={day} onClick={() => setSelectedDay(day)} className="flex h-[59px] min-w-[45px] flex-col items-center justify-center rounded-[13px] border transition-transform active:scale-95" style={{ background: selectedDay === day ? palette.navy : palette.cream, borderColor: selectedDay === day ? palette.navy : palette.line, color: selectedDay === day ? palette.paper : palette.quiet }}>
                <span className="text-[10px] font-bold uppercase">{day === "12" ? "today" : "wed"}</span><span className="mt-1 font-['Space_Mono'] text-[14px] font-bold">{day}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="px-5 pb-7 pt-5">
          <div className="flex items-center gap-2 rounded-[12px] border px-3 py-2.5" style={{ background: palette.cream, borderColor: palette.line }}>
            <Search size={16} style={{ color: palette.quiet }} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a card or bank" className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#9AA49D]" /><SlidersHorizontal size={15} style={{ color: palette.teal }} />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div><div className="text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: palette.teal }}>Upcoming payments</div><h2 className="mt-1 font-['Instrument_Serif'] text-[26px] leading-none" style={{ color: palette.navy }}>{selectedDay === "all" ? "Every account" : `Due on August ${selectedDay}`}</h2></div>
            <div className="rounded-full px-2.5 py-1 font-['Space_Mono'] text-[10px] font-bold" style={{ background: palette.tealPale, color: palette.teal }}>{filtered.length} shown</div>
          </div>

          <div className="mt-4 space-y-2.5">
            {filtered.length === 0 ? <div className="rounded-[16px] border border-dashed p-7 text-center" style={{ borderColor: palette.line, color: palette.quiet }}>No payments on this date.<br /><button type="button" onClick={() => setSelectedDay("all")} className="mt-2 font-bold" style={{ color: palette.coral }}>View the full month</button></div> : filtered.map((card) => <PaymentRow key={card.id} card={card} expanded={expanded === card.id} onExpand={() => setExpanded(expanded === card.id ? null : card.id)} onPaid={() => markPaid(card.id)} />)}
          </div>

          <div className="mt-5 rounded-[17px] p-4" style={{ background: palette.navy, color: palette.paper }}>
            <div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[.15em]" style={{ color: "#A8C9C1" }}>Month at a glance</div><div className="mt-1 text-[15px] font-bold">You’ve cleared {total - openCount} of {total} accounts</div></div><Check size={18} style={{ color: "#D9B36B" }} /></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${total ? ((total - openCount) / total) * 100 : 0}%`, background: "#D9B36B" }} /></div>
          </div>
        </div>
      </main>

      {isAdding && <div className="fixed inset-0 z-10 flex items-end justify-center bg-[#0D2029]/45 px-3 pb-3 backdrop-blur-[2px] sm:items-center sm:pb-0"><div className="w-full max-w-[390px] rounded-[24px] border p-5 shadow-2xl" style={{ background: palette.paper, borderColor: palette.line }}><div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: palette.teal }}>New account</div><h2 className="mt-1 font-['Instrument_Serif'] text-[28px]" style={{ color: palette.navy }}>Add to the calendar</h2></div><button type="button" aria-label="Close" onClick={() => setIsAdding(false)} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: palette.tealPale, color: palette.navy }}><X size={17} /></button></div><div className="mt-5 space-y-3"><Field label="Bank" value={newBank} setValue={setNewBank} placeholder="e.g. HDFC" /><Field label="Card name" value={newName} setValue={setNewName} placeholder="e.g. Regalia Gold" /><button type="button" disabled={!newBank.trim() || !newName.trim()} onClick={addCard} className="h-12 w-full rounded-[12px] text-[14px] font-bold text-[#FFFDF8] disabled:opacity-40" style={{ background: palette.navy }}>Add account</button></div></div></div>}
    </div>
  );
}

function Field({ label, value, setValue, placeholder }: { label: string; value: string; setValue: (value: string) => void; placeholder: string }) {
  return <label className="block text-[12px] font-bold" style={{ color: palette.quiet }}>{label}<input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="mt-1.5 h-12 w-full rounded-[12px] border bg-[#FFFDF8] px-3 text-[14px] font-semibold outline-none placeholder:text-[#A2AAA3] focus:border-[#4A8B83]" style={{ borderColor: palette.line }} /></label>;
}

function PaymentRow({ card, expanded, onExpand, onPaid }: { card: Card; expanded: boolean; onExpand: () => void; onPaid: () => void }) {
  const paid = card.status === "Paid";
  const overdue = card.status === "Overdue";
  const accent = paid ? palette.teal : overdue ? palette.coral : palette.ochre;
  const pale = paid ? palette.tealPale : overdue ? palette.coralPale : palette.ochrePale;
  return <div className="overflow-hidden rounded-[16px] border" style={{ background: palette.cream, borderColor: palette.line }}>
    <button type="button" onClick={onExpand} className="flex w-full items-center gap-3 p-3 text-left">
      <div className="flex h-[48px] w-[70px] shrink-0 flex-col justify-between rounded-[10px] p-2.5 text-[#F8F4EA]" style={{ background: palette.navy2 }}><span className="text-[8px] font-bold tracking-[.1em]">{card.bank}</span><span className="font-['Space_Mono'] text-[8px]">•••• {card.last4}</span></div>
      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-[14px] font-bold" style={{ color: palette.ink }}>{card.name}</span><span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: pale, color: accent }}>{card.status}</span></div><div className="mt-1 flex items-center justify-between text-[11px] font-semibold" style={{ color: palette.quiet }}><span>{card.date} · {card.amount}</span>{card.frozen ? <LockKeyhole size={13} /> : <ChevronDown size={14} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />}</div></div>
    </button>
    {expanded && <div className="border-t px-3 pb-3 pt-2.5" style={{ borderColor: palette.line }}><div className="flex items-center justify-between text-[11px]" style={{ color: palette.quiet }}><span>{card.frozen ? "This card is frozen" : overdue ? "Payment needs immediate attention" : "Statement reminder set"}</span>{overdue && <CircleAlert size={14} style={{ color: palette.coral }} />}</div>{!paid && <button type="button" onClick={onPaid} className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] text-[12px] font-bold text-[#FFFDF8]" style={{ background: palette.teal }}>Mark payment received <ArrowRight size={14} /></button>}</div>}
  </div>;
}