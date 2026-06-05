"use server";
/**
 * lib/actions/plannings.ts
 * Server actions for planning management (create, archive).
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  plannings, planningSettings, phaseTypes, milestoneTypes, statuses, domains,
} from "@/lib/db/schema";

const CreatePlanningSchema = z.object({
  name: z.string().min(1).max(200),
  year: z.coerce.number().int().min(2020).max(2040),
  viewStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  viewEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500).optional(),
});

export async function createPlanning(formData: FormData) {
  const raw = {
    name:        formData.get("name"),
    year:        formData.get("year"),
    viewStart:   formData.get("viewStart"),
    viewEnd:     formData.get("viewEnd"),
    description: formData.get("description") ?? undefined,
  };

  const data = CreatePlanningSchema.parse(raw);

  // Create planning
  const [planning] = await db.insert(plannings).values({
    name:        data.name,
    year:        data.year,
    viewStart:   data.viewStart,
    viewEnd:     data.viewEnd,
    description: data.description ?? null,
    referenceDate: new Date().toISOString().split("T")[0],
  }).returning({ id: plannings.id });

  // Default settings
  await db.insert(planningSettings).values({
    planningId: planning.id,
    autoLate: true,
    autoCloseAfterMepDays: 30,
    notifyOnLate: true,
  });

  // Default phase types
  await db.insert(phaseTypes).values([
    { planningId: planning.id, code: "cadrage",   label: "Cadrage",        sortOrder: 0 },
    { planningId: planning.id, code: "dev",        label: "Développement",  sortOrder: 1 },
    { planningId: planning.id, code: "recette",    label: "Recette",        sortOrder: 2 },
    { planningId: planning.id, code: "formation",  label: "Formation",      sortOrder: 3 },
    { planningId: planning.id, code: "custom",     label: "Personnalisé",   sortOrder: 4 },
  ]);

  // Default milestone types
  await db.insert(milestoneTypes).values([
    { planningId: planning.id, code: "livraison", label: "Livraison REC3",  color: "#0D9488", sortOrder: 0 },
    { planningId: planning.id, code: "pmep",      label: "Pré-MEP",        color: "#312E81", sortOrder: 1 },
    { planningId: planning.id, code: "cab",       label: "CAB",            color: "#65A30D", sortOrder: 2 },
    { planningId: planning.id, code: "mep",       label: "Mise en prod.",  color: "#1E3A8A", sortOrder: 3 },
    { planningId: planning.id, code: "custom",    label: "Jalon libre",    color: "#7C3AED", sortOrder: 4 },
  ]);

  // Default statuses
  await db.insert(statuses).values([
    { planningId: planning.id, code: "planned",     label: "Planifiée",  color: "#94A3B8", bg: "#F1F5F9", sortOrder: 0 },
    { planningId: planning.id, code: "in_progress", label: "En cours",   color: "#3B82F6", bg: "#E0EBFE", sortOrder: 1 },
    { planningId: planning.id, code: "review",      label: "En revue",   color: "#EAB308", bg: "#FEF3C7", sortOrder: 2 },
    { planningId: planning.id, code: "done",        label: "Terminée",   color: "#16A34A", bg: "#DCFCE7", sortOrder: 3 },
    { planningId: planning.id, code: "risk",        label: "À risque",   color: "#F59E0B", bg: "#FEF3C7", sortOrder: 4 },
    { planningId: planning.id, code: "late",        label: "En retard",  color: "#DC2626", bg: "#FEE2E2", sortOrder: 5 },
  ]);

  revalidatePath("/p");
  redirect(`/p/${planning.id}`);
}
