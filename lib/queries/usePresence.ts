"use client";
/**
 * lib/queries/usePresence.ts
 * Polling-based presence via Neon — zéro service externe.
 * Heartbeat 30s → last_seen_at en DB → query 30s → PresenceStack.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getActiveMembers, heartbeat } from "@/lib/actions/planning";
import type { ActiveMember } from "@/lib/actions/planning";

export const presenceQueryKey = (planningId: string) =>
  ["presence", planningId] as const;

export function usePresence(planningId: string, memberId?: string): ActiveMember[] {
  const qc = useQueryClient();

  // Query — refetch toutes les 30s
  const { data } = useQuery({
    queryKey: presenceQueryKey(planningId),
    queryFn: () => getActiveMembers(planningId),
    refetchInterval: 30_000,
    staleTime: 0,
    initialData: [] as ActiveMember[],
    initialDataUpdatedAt: 0,
  });

  // Heartbeat — séquence : heartbeat → invalidate → query re-fetch immédiat
  // Élimine la race condition (query ne lit plus avant que le heartbeat ait écrit)
  useEffect(() => {
    if (!memberId || !planningId) return;

    async function beat() {
      await heartbeat(planningId, memberId!).catch(() => {});
      // Re-fetch la présence dès que le heartbeat a écrit en DB
      qc.invalidateQueries({ queryKey: presenceQueryKey(planningId) });
    }

    beat(); // premier battement au mount

    const interval = setInterval(beat, 30_000);
    return () => clearInterval(interval);
  }, [planningId, memberId, qc]);

  return data ?? [];
}
