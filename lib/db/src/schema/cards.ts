import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";

export const creditCardsTable = pgTable("credit_cards", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  cardHolderName: text("card_holder_name").notNull(),
  cardName: text("card_name").notNull(),
  lastFourDigits: text("last_four_digits").notNull(),
  bankName: text("bank_name").notNull(),
  dueDate: text("due_date").notNull(),
  paymentStatus: text("payment_status").notNull().default("Pending"),
  paidDate: text("paid_date"),
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  phoneNumber: text("phone_number"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCardSchema = createInsertSchema(creditCardsTable).omit({
  createdAt: true,
});

export type InsertCard = z.infer<typeof insertCardSchema>;
export type CreditCardRow = typeof creditCardsTable.$inferSelect;
