import { creditCardsTable, db } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { Router } from "express";

import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

function isDueDatePassed(dueDate: string): boolean {
  const str = String(dueDate).trim();
  const now = new Date();
  if (str.includes("/")) {
    const [dayStr, monthStr] = str.split("/");
    const day = parseInt(dayStr ?? "1", 10) || 1;
    const month = parseInt(monthStr ?? "1", 10) || 1;
    const due = new Date(now.getFullYear(), month - 1, day);
    due.setHours(23, 59, 59, 999);
    return now > due;
  }
  const day = parseInt(str, 10) || 1;
  const due = new Date(now.getFullYear(), now.getMonth(), day);
  due.setHours(23, 59, 59, 999);
  return now > due;
}

function isNewBillingCycle(dueDate: string, paidDate: string): boolean {
  const paid = new Date(paidDate);
  const now = new Date();
  if (String(dueDate).includes("/")) {
    return paid.getFullYear() < now.getFullYear();
  }
  const paidYM = paid.getFullYear() * 12 + paid.getMonth();
  const nowYM = now.getFullYear() * 12 + now.getMonth();
  return paidYM < nowYM;
}

router.get("/cards", async (req: AuthRequest, res) => {
  try {
    let cards = await db
      .select()
      .from(creditCardsTable)
      .where(eq(creditCardsTable.userId, req.userId!));

    const toOverdue: string[] = [];
    const toPending: string[] = [];

    for (const card of cards) {
      if (card.paymentStatus !== "Paid" && isDueDatePassed(card.dueDate)) {
        toOverdue.push(card.id);
      } else if (card.paymentStatus === "Paid" && card.paidDate && isNewBillingCycle(card.dueDate, card.paidDate)) {
        toPending.push(card.id);
      }
    }

    if (toOverdue.length > 0) {
      await db.update(creditCardsTable)
        .set({ paymentStatus: "Overdue" })
        .where(and(eq(creditCardsTable.userId, req.userId!), inArray(creditCardsTable.id, toOverdue)));
    }
    if (toPending.length > 0) {
      await db.update(creditCardsTable)
        .set({ paymentStatus: "Pending", paidDate: null })
        .where(and(eq(creditCardsTable.userId, req.userId!), inArray(creditCardsTable.id, toPending)));
    }

    if (toOverdue.length > 0 || toPending.length > 0) {
      cards = await db.select().from(creditCardsTable).where(eq(creditCardsTable.userId, req.userId!));
    }

    res.json(cards);
  } catch (err) {
    req.log.error({ err }, "Get cards error");
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

router.post("/cards", async (req: AuthRequest, res) => {
  try {
    const {
      id,
      cardHolderName,
      cardName,
      lastFourDigits,
      bankName,
      dueDate,
      paymentStatus,
      paidDate,
      expiryMonth,
      expiryYear,
      phoneNumber,
      isActive,
      notes,
    } = req.body;

    const [card] = await db
      .insert(creditCardsTable)
      .values({
        id,
        userId: req.userId!,
        cardHolderName,
        cardName,
        lastFourDigits,
        bankName,
        dueDate,
        paymentStatus: paymentStatus ?? "Pending",
        paidDate: paidDate ?? null,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
        phoneNumber: phoneNumber ?? null,
        isActive: isActive ?? true,
        notes: notes ?? null,
      })
      .returning();

    res.status(201).json(card);
  } catch (err) {
    req.log.error({ err }, "Create card error");
    res.status(500).json({ error: "Failed to create card" });
  }
});

router.put("/cards/:id", async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const [card] = await db
      .update(creditCardsTable)
      .set(updates)
      .where(and(eq(creditCardsTable.id, id), eq(creditCardsTable.userId, req.userId!)))
      .returning();

    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json(card);
  } catch (err) {
    req.log.error({ err }, "Update card error");
    res.status(500).json({ error: "Failed to update card" });
  }
});

router.delete("/cards/:id", async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    await db
      .delete(creditCardsTable)
      .where(and(eq(creditCardsTable.id, id), eq(creditCardsTable.userId, req.userId!)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete card error");
    res.status(500).json({ error: "Failed to delete card" });
  }
});

export default router;
