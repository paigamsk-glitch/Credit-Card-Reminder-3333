import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../middlewares/auth";

const router = Router();

router.post("/auth/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body as {
      email?: string;
      name?: string;
      password?: string;
    };

    if (!email?.trim() || !name?.trim() || !password) {
      res.status(400).json({ error: "Name, email and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ email: email.toLowerCase().trim(), name: name.trim(), passwordHash })
      .returning();

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "No account found with this email" });
      return;
    }

    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db
      .update(usersTable)
      .set({ resetToken: resetCode, resetTokenExpiresAt: expiresAt })
      .where(eq(usersTable.id, user.id));

    res.json({ resetCode });
  } catch (err) {
    req.log.error({ err }, "Forgot password error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body as {
      email?: string;
      resetCode?: string;
      newPassword?: string;
    };

    if (!email?.trim() || !resetCode?.trim() || !newPassword) {
      res.status(400).json({ error: "Email, reset code, and new password are required" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const now = new Date();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, email.toLowerCase().trim()),
          eq(usersTable.resetToken, resetCode.trim()),
          gt(usersTable.resetTokenExpiresAt, now)
        )
      )
      .limit(1);

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset code" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(usersTable)
      .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
      .where(eq(usersTable.id, user.id));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Reset password error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
