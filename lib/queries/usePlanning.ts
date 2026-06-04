"use client";
/**
 * lib/queries/usePlanning.ts
 * TanStack Query hook for planning data with optimistic updates.
 *
 * IMPORTANT: Do NOT import from lib/db/* here — this is a client module.
 * Use Server Actions (lib/actions/) as the boundary between client and server.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GanttData } from "@/lib/db/queries";
import { fetchPlanningData } from "@/lib/actions/planning";

export const planningQueryKey = (id: string) => ["planning", id] as const;

export function usePlanning(planningId: string, initialData: GanttData) {
  return useQuery({
    queryKey: planningQueryKey(planningId),
    // Server Action — Next.js keeps DB code server-side, client gets RPC reference only
    queryFn: () => fetchPlanningData(planningId),
    initialData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useOptimisticPhase() {
  const qc = useQueryClient();

  return function patchPhase(
    planningId: string,
    phaseId: string,
    patch: Partial<GanttData["phases"][0]>
  ) {
    qc.setQueryData<GanttData>(planningQueryKey(planningId), (old) => {
      if (!old) return old;
      return {
        ...old,
        phases: old.phases.map((p) =>
          p.id === phaseId ? { ...p, ...patch } : p
        ),
      };
    });
  };
}
