export interface CardExpiry {
  expiryMonth: number;
  expiryYear: number;
}

export function isExpiringSoon(card: CardExpiry): boolean {
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  const days = Math.ceil((expiryEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
}

export function isExpired(card: CardExpiry): boolean {
  const now = new Date();
  const expiryEnd = new Date(card.expiryYear, card.expiryMonth, 0);
  return now > expiryEnd;
}

export function getNextDueDate(dueDate: number): Date {
  const now = new Date();
  if (now.getDate() > dueDate) {
    return new Date(now.getFullYear(), now.getMonth() + 1, dueDate);
  }
  return new Date(now.getFullYear(), now.getMonth(), dueDate);
}

export function getDaysUntilDue(dueDate: number): number {
  const nextDue = getNextDueDate(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  nextDue.setHours(0, 0, 0, 0);
  return Math.round((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
