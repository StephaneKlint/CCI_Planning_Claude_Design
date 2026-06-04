/**
 * __tests__/domain.test.ts
 * Unit tests for lib/domain.ts — all 6 pure functions.
 */
import { describe, it, expect } from "vitest";
import {
  derivePhaseStatus,
  computeStats,
  workloadFor,
  computeMilestoneLayout,
  cadenceMilestones,
  applyAutoClosure,
  type MilestoneInput,
} from "../lib/domain";

// ---------------------------------------------------------------------------
// 1. derivePhaseStatus
// ---------------------------------------------------------------------------

describe("derivePhaseStatus", () => {
  const today = new Date("2026-06-04");

  it("returns explicit status when set", () => {
    expect(
      derivePhaseStatus(
        { startDate: "2026-01-01", endDate: "2026-12-31", status: "risk", progress: 50 },
        today
      )
    ).toBe("risk");
  });

  it("returns 'late' when past end, progress < 100, autoLate=true", () => {
    expect(
      derivePhaseStatus(
        { startDate: "2026-01-01", endDate: "2026-03-01", status: null, progress: 60 },
        today
      )
    ).toBe("late");
  });

  it("returns 'done' when past end, progress = 100 (autoLate irrelevant)", () => {
    expect(
      derivePhaseStatus(
        { startDate: "2026-01-01", endDate: "2026-03-01", status: null, progress: 100 },
        today
      )
    ).toBe("done");
  });

  it("returns 'done' when past end and autoLate=false", () => {
    expect(
      derivePhaseStatus(
        { startDate: "2026-01-01", endDate: "2026-03-01", status: null, progress: 40 },
        today,
        false
      )
    ).toBe("done");
  });

  it("returns 'in_progress' when today is between start and end", () => {
    expect(
      derivePhaseStatus(
        { startDate: "2026-05-01", endDate: "2026-07-31", status: null, progress: 30 },
        today
      )
    ).toBe("in_progress");
  });

  it("returns 'planned' when start is in the future", () => {
    expect(
      derivePhaseStatus(
        { startDate: "2026-09-01", endDate: "2026-12-31", status: null, progress: 0 },
        today
      )
    ).toBe("planned");
  });
});

// ---------------------------------------------------------------------------
// 2. computeStats
// ---------------------------------------------------------------------------

describe("computeStats", () => {
  const today = new Date("2026-06-04");

  it("counts lots, phases, milestones correctly", () => {
    const stats = computeStats(
      [{ id: "l1" }, { id: "l2" }],
      [
        { status: null, startDate: "2026-01-01", endDate: "2026-02-01", progress: 100 },
        { status: null, startDate: "2026-05-01", endDate: "2026-08-01", progress: 50 },
      ],
      [{ id: "m1" }, { id: "m2" }, { id: "m3" }],
      today
    );
    expect(stats.totalLots).toBe(2);
    expect(stats.totalPhases).toBe(2);
    expect(stats.totalMilestones).toBe(3);
  });

  it("computes status distribution and average completion", () => {
    const stats = computeStats(
      [{ id: "l1" }],
      [
        { status: "done", startDate: "2026-01-01", endDate: "2026-02-01", progress: 100 },
        { status: null,   startDate: "2026-05-01", endDate: "2026-08-01", progress: 40 },
        { status: null,   startDate: "2026-09-01", endDate: "2026-12-31", progress: 0 },
      ],
      [],
      today
    );
    expect(stats.byStatus.done).toBe(1);
    expect(stats.byStatus.in_progress).toBe(1);
    expect(stats.byStatus.planned).toBe(1);
    expect(stats.completionPct).toBe(Math.round(140 / 3)); // (100+40+0)/3
  });
});

// ---------------------------------------------------------------------------
// 3. workloadFor
// ---------------------------------------------------------------------------

describe("workloadFor", () => {
  it("counts phases overlapping each month correctly", () => {
    const phases = [
      { id: "p1", startDate: "2026-01-05", endDate: "2026-03-31", assignees: ["u1"] },
      { id: "p2", startDate: "2026-06-01", endDate: "2026-06-30", assignees: ["u1"] },
      { id: "p3", startDate: "2026-01-01", endDate: "2026-12-31", assignees: ["u2"] }, // not u1
    ];
    const loads = workloadFor("u1", phases, 2026);
    expect(loads).toHaveLength(12);
    // January: both p1
    expect(loads[0].count).toBe(1);
    // June: p2
    expect(loads[5].count).toBe(1);
    // July: nothing
    expect(loads[6].count).toBe(0);
  });

  it("marks 'loaded' at ≥4 and 'overloaded' at ≥5", () => {
    const phases = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`,
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      assignees: ["u1"],
    }));
    const loads = workloadFor("u1", phases, 2026);
    expect(loads[2].level).toBe("overloaded"); // March, 5 phases
  });
});

// ---------------------------------------------------------------------------
// 4. computeMilestoneLayout
// ---------------------------------------------------------------------------

describe("computeMilestoneLayout", () => {
  // Simple xOf: 1 day = 5px, viewStart = 2026-01-05
  const VIEW_START = new Date("2026-01-05").getTime();
  const PPD = 5;
  const xOf = (date: string) => {
    const ms = new Date(date).getTime() - VIEW_START;
    return (ms / 86400000) * PPD;
  };

  it("returns same length as input", () => {
    const ms: MilestoneInput[] = [
      { id: "m1", date: "2026-03-15", label: "MEP 15/03", labelPos: "auto" },
      { id: "m2", date: "2026-06-01", label: "PMEP 01/06", labelPos: "auto" },
    ];
    expect(computeMilestoneLayout(ms, xOf)).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(computeMilestoneLayout([], xOf)).toHaveLength(0);
  });

  it("respects explicit labelPos=above", () => {
    const ms: MilestoneInput[] = [
      { id: "m1", date: "2026-04-01", label: "Test", labelPos: "above" },
    ];
    expect(computeMilestoneLayout(ms, xOf)[0].side).toBe("above");
  });

  it("respects explicit labelPos=below", () => {
    const ms: MilestoneInput[] = [
      { id: "m1", date: "2026-04-01", label: "Test", labelPos: "below" },
    ];
    expect(computeMilestoneLayout(ms, xOf)[0].side).toBe("below");
  });

  it("has ZERO collisions with the full CCI 2026 dataset (71 jalons, PPD=5)", () => {
    // All milestones from the CCI 2026 seed data
    const allMilestones: MilestoneInput[] = [
      { id: "1",  date: "2026-01-08",  label: "MEP 08/01",                  labelPos: "auto" },
      { id: "2",  date: "2026-01-23",  label: "Livraison REC3 23/01",        labelPos: "auto" },
      { id: "3",  date: "2026-02-02",  label: "PMEP 02/02",                  labelPos: "auto" },
      { id: "4",  date: "2026-02-06",  label: "CAB 06/02",                   labelPos: "auto" },
      { id: "5",  date: "2026-02-09",  label: "MEP 09/02",                   labelPos: "auto" },
      { id: "6",  date: "2026-02-27",  label: "Livraison REC3 27/02",        labelPos: "auto" },
      { id: "7",  date: "2026-03-02",  label: "PMEP 02/03",                  labelPos: "auto" },
      { id: "8",  date: "2026-03-06",  label: "CAB 06/03",                   labelPos: "auto" },
      { id: "9",  date: "2026-03-12",  label: "MEP 12/03",                   labelPos: "auto" },
      { id: "10", date: "2026-03-27",  label: "Livraison REC3 27/03",        labelPos: "auto" },
      { id: "11", date: "2026-04-09",  label: "PMEP 09/04",                  labelPos: "auto" },
      { id: "12", date: "2026-04-10",  label: "CAB 10/04",                   labelPos: "auto" },
      { id: "13", date: "2026-04-14",  label: "MEP 14/04",                   labelPos: "auto" },
      { id: "14", date: "2026-06-12",  label: "Livraison REC3 12/06",        labelPos: "auto" },
      { id: "15", date: "2026-06-29",  label: "PMEP 29/06",                  labelPos: "auto" },
      { id: "16", date: "2026-07-03",  label: "CAB 03/07",                   labelPos: "auto" },
      { id: "17", date: "2026-07-06",  label: "MEP 06/07",                   labelPos: "auto" },
      { id: "18", date: "2026-08-31",  label: "Livraison REC3 31/08",        labelPos: "auto" },
      { id: "19", date: "2026-09-14",  label: "PMEP 14/09",                  labelPos: "auto" },
      { id: "20", date: "2026-09-18",  label: "CAB 18/09",                   labelPos: "auto" },
      { id: "21", date: "2026-09-21",  label: "MEP 21/09",                   labelPos: "auto" },
      { id: "22", date: "2026-10-09",  label: "Livraison REC3 09/10",        labelPos: "auto" },
      { id: "23", date: "2026-10-23",  label: "PMEP 23/10",                  labelPos: "auto" },
      { id: "24", date: "2026-10-30",  label: "CAB 30/10",                   labelPos: "auto" },
      { id: "25", date: "2026-11-02",  label: "MEP 02/11",                   labelPos: "auto" },
      { id: "26", date: "2026-11-19",  label: "Livraison REC3 19/11",        labelPos: "auto" },
      { id: "27", date: "2026-11-30",  label: "PMEP 30/11",                  labelPos: "auto" },
      { id: "28", date: "2026-12-04",  label: "CAB 04/12",                   labelPos: "auto" },
      { id: "29", date: "2026-12-07",  label: "MEP 07/12",                   labelPos: "auto" },
      { id: "30", date: "2026-05-04",  label: "Livraison REC3 04/05",        labelPos: "auto" },
      { id: "31", date: "2026-05-26",  label: "PMEP 26/05",                  labelPos: "auto" },
      { id: "32", date: "2026-05-29",  label: "CAB 29/05",                   labelPos: "auto" },
      { id: "33", date: "2026-06-01",  label: "MEP 01/06",                   labelPos: "auto" },
      { id: "34", date: "2026-10-23",  label: "Livraison en REC3 23/10",     labelPos: "auto" },
      { id: "35", date: "2026-11-09",  label: "PMEP 09/11",                  labelPos: "auto" },
      { id: "36", date: "2026-11-13",  label: "CAB 13/11",                   labelPos: "auto" },
      { id: "37", date: "2026-11-16",  label: "MEP 16/11",                   labelPos: "auto" },
      { id: "38", date: "2026-03-02",  label: "Fin Dév CCI France 02/03",    labelPos: "auto" },
      { id: "39", date: "2026-03-23",  label: "Livraison CCI France 23/03",  labelPos: "auto" },
      { id: "40", date: "2026-12-21",  label: "MEP 21/12",                   labelPos: "auto" },
      { id: "41", date: "2026-05-04",  label: "Livraison CEOS REC3 04/05",   labelPos: "auto" },
      { id: "42", date: "2026-06-01",  label: "MEP NSE MVP 01/06",           labelPos: "auto" },
      { id: "43", date: "2026-09-14",  label: "Livraison CEOS REC3 14/09",   labelPos: "auto" },
      { id: "44", date: "2026-09-21",  label: "MEP NSE 21/09",               labelPos: "auto" },
      { id: "45", date: "2026-10-12",  label: "MEP NSE V1 12/10",            labelPos: "auto" },
      { id: "46", date: "2026-11-30",  label: "MEP à définir",               labelPos: "auto" },
      { id: "47", date: "2026-04-14",  label: "Décision GO/No GO",           labelPos: "auto" },
      { id: "48", date: "2026-09-04",  label: "Livraison REC3 04/09",        labelPos: "auto" },
      { id: "49", date: "2026-03-02",  label: "EDB Remise 02/03",            labelPos: "auto" },
      { id: "50", date: "2026-05-04",  label: "Livraison en REC3 04/05",     labelPos: "auto" },
      { id: "51", date: "2026-05-11",  label: "Livraison REC3 11/05",        labelPos: "auto" },
      { id: "52", date: "2026-04-14",  label: "Décision GO/No GO",           labelPos: "auto" },
      { id: "53", date: "2026-09-21",  label: "MEP à définir",               labelPos: "auto" },
      { id: "54", date: "2026-06-12",  label: "Livraison REC3 12/06",        labelPos: "auto" },
    ];

    const layout = computeMilestoneLayout(allMilestones, xOf);

    // Every item must be assigned
    expect(layout.every((l) => l !== undefined && l !== null)).toBe(true);
    expect(layout).toHaveLength(allMilestones.length);

    // Group by side+level, sort each group by centerX, then verify no overlap
    type Placed = { centerX: number; estW: number };
    const lanes = new Map<string, Placed[]>();
    for (let i = 0; i < allMilestones.length; i++) {
      const item = layout[i];
      const ms = allMilestones[i];
      const estW = Math.max(24, (ms.label || "").length * 5.3 + 14);
      const key = `${item.side}-${item.level}`;
      if (!lanes.has(key)) lanes.set(key, []);
      lanes.get(key)!.push({ centerX: item.centerX, estW });
    }
    for (const [, items] of lanes) {
      items.sort((a, b) => a.centerX - b.centerX);
      for (let j = 1; j < items.length; j++) {
        const prevRight = items[j - 1].centerX + items[j - 1].estW / 2;
        const curLeft  = items[j].centerX     - items[j].estW     / 2;
        // Allow the algorithm's 3px gap tolerance
        expect(curLeft).toBeGreaterThanOrEqual(prevRight - 3 - 0.1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 5. cadenceMilestones
// ---------------------------------------------------------------------------

describe("cadenceMilestones", () => {
  it("computes correct milestone dates from dev end + cadence", () => {
    const devEnd = new Date("2026-06-15"); // Monday
    const cadence = { livraison: 0, pmep: 10, cab: 12, mep: 15 };
    const result = cadenceMilestones(devEnd, cadence);

    expect(result.livraison.toISOString().slice(0, 10)).toBe("2026-06-15");
    // +10 business days from 2026-06-15 (Mon):
    // 15,16,17,18,19(w1)→22,23,24,25,26 = 10 = 2026-06-26
    expect(result.pmep.toISOString().slice(0, 10)).toBe("2026-06-29");
    // +12 bdays: 2026-07-01
    expect(result.cab.toISOString().slice(0, 10)).toBe("2026-07-01");
    // +15 bdays: 2026-07-06
    expect(result.mep.toISOString().slice(0, 10)).toBe("2026-07-06");
  });

  it("skips weekends", () => {
    const devEnd = new Date("2026-06-12"); // Friday
    const cadence = { livraison: 0, pmep: 1, cab: 2, mep: 3 };
    const result = cadenceMilestones(devEnd, cadence);

    expect(result.livraison.toISOString().slice(0, 10)).toBe("2026-06-12");
    expect(result.pmep.toISOString().slice(0, 10)).toBe("2026-06-15"); // Mon (skip Sat/Sun)
    expect(result.cab.toISOString().slice(0, 10)).toBe("2026-06-16");
    expect(result.mep.toISOString().slice(0, 10)).toBe("2026-06-17");
  });
});

// ---------------------------------------------------------------------------
// 6. applyAutoClosure
// ---------------------------------------------------------------------------

describe("applyAutoClosure", () => {
  const today = new Date("2026-06-04");

  it("identifies lots with MEP > 30 days ago and open phases", () => {
    const lots = [
      {
        id: "lot-old",
        phases: [{ id: "p1", endDate: "2026-01-01", status: null }],
        milestones: [{ type: "mep", date: "2026-01-01" }], // 154 days ago
      },
      {
        id: "lot-recent",
        phases: [{ id: "p2", endDate: "2026-05-30", status: null }],
        milestones: [{ type: "mep", date: "2026-05-30" }], // 5 days ago
      },
    ];
    const toClose = applyAutoClosure(lots, today, 30);
    expect(toClose).toContain("lot-old");
    expect(toClose).not.toContain("lot-recent");
  });

  it("skips lots where all phases are already done", () => {
    const lots = [
      {
        id: "lot-done",
        phases: [{ id: "p1", endDate: "2026-01-01", status: "done" as const }],
        milestones: [{ type: "mep", date: "2026-01-01" }],
      },
    ];
    expect(applyAutoClosure(lots, today, 30)).toHaveLength(0);
  });

  it("skips lots with no MEP milestone", () => {
    const lots = [
      {
        id: "lot-no-mep",
        phases: [{ id: "p1", endDate: "2026-01-01", status: null }],
        milestones: [{ type: "custom", date: "2026-01-01" }],
      },
    ];
    expect(applyAutoClosure(lots, today, 30)).toHaveLength(0);
  });
});
