"use server";
/**
 * lib/actions/members.ts
 * Gestion des responsables d'un planning (add, update, remove).
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, planningMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ── Ajouter un responsable ────────────────────────────────────────────────────

const AddMemberSchema = z.object({
  planningId: z.string().uuid(),
  name:       z.string().min(1).max(160),
  email:      z.string().email().max(255),
  initials:   z.string().min(1).max(3),
  color:      z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function addMember(input: z.infer<typeof AddMemberSchema>) {
  const data = AddMemberSchema.parse(input);

  // Upsert user by email
  const existingUsers = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  let userId: string;
  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    const [newUser] = await db.insert(users).values({
      name:  data.name,
      email: data.email,
    }).returning({ id: users.id });
    userId = newUser.id;
  }

  // Check if already a member
  const existing = await db.select({ id: planningMembers.id })
    .from(planningMembers)
    .where(and(eq(planningMembers.planningId, data.planningId), eq(planningMembers.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Ce membre appartient déjà à ce planning.");
  }

  const [member] = await db.insert(planningMembers).values({
    planningId: data.planningId,
    userId,
    initials:   data.initials.slice(0, 3).toUpperCase(),
    color:      data.color,
    permission: "editor",
  }).returning({ id: planningMembers.id });

  revalidatePath("/ressources");
  return member;
}

// ── Modifier un responsable ───────────────────────────────────────────────────

const UpdateMemberSchema = z.object({
  memberId:   z.string().uuid(),
  planningId: z.string().uuid(),
  name:       z.string().min(1).max(160),
  initials:   z.string().min(1).max(3),
  color:      z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function updateMember(input: z.infer<typeof UpdateMemberSchema>) {
  const data = UpdateMemberSchema.parse(input);

  // Update member display data
  await db.update(planningMembers)
    .set({ initials: data.initials.slice(0, 3).toUpperCase(), color: data.color })
    .where(and(eq(planningMembers.id, data.memberId), eq(planningMembers.planningId, data.planningId)));

  // Update user display name
  const [member] = await db.select({ userId: planningMembers.userId })
    .from(planningMembers)
    .where(eq(planningMembers.id, data.memberId));

  if (member) {
    await db.update(users)
      .set({ name: data.name })
      .where(eq(users.id, member.userId));
  }

  revalidatePath("/ressources");
}

// ── Supprimer un responsable ──────────────────────────────────────────────────

export async function removeMember(memberId: string, planningId: string) {
  await db.delete(planningMembers)
    .where(and(eq(planningMembers.id, memberId), eq(planningMembers.planningId, planningId)));

  revalidatePath("/ressources");
}
