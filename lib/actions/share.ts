"use server";

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shareTokens } from "@/lib/db/schema";
import { auth } from "@/auth";

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

export async function getOrCreateShareToken(planningId: string): Promise<{ token: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const [existing] = await db
    .select()
    .from(shareTokens)
    .where(eq(shareTokens.planningId, planningId))
    .limit(1);

  if (existing) {
    if (existing.expiresAt && existing.expiresAt < new Date()) {
      await db.delete(shareTokens).where(eq(shareTokens.id, existing.id));
    } else {
      return { token: existing.token };
    }
  }

  const token = generateToken();
  await db.insert(shareTokens).values({ planningId, token });
  return { token };
}

export async function revokeShareToken(planningId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");
  await db.delete(shareTokens).where(eq(shareTokens.planningId, planningId));
}
