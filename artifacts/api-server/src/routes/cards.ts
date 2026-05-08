import { creditCardsTable, db } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { Router } from "express";

import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/cards", async (req: AuthRequest, res) => {
  try {
    const cards = await db
      .select()
      .from(creditCardsTable)
      .where(eq(creditCardsTable.userId, req.userId!));
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
        dueDate: Number(dueDate),
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
