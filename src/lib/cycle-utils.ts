import { differenceInDays, addDays, format } from "date-fns";
import { CycleEntry } from "./supabase";

export interface CycleStats {
  averageCycleLength: number | null;
  averagePeriodDuration: number | null;
  predictedNextPeriod: string | null;
}

export function calculateCycleStats(entries: CycleEntry[]): CycleStats {
  const periodStarts = entries
    .filter((e) => e.entry_type === "period_start")
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  const periodEnds = entries
    .filter((e) => e.entry_type === "period_end")
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  // Calculate average cycle length (last 3 cycles)
  let averageCycleLength: number | null = null;
  if (periodStarts.length >= 2) {
    const cycleLengths: number[] = [];
    const recentStarts = periodStarts.slice(-4); // Need 4 starts to get 3 cycles

    for (let i = 1; i < recentStarts.length; i++) {
      const days = differenceInDays(
        new Date(recentStarts[i].entry_date),
        new Date(recentStarts[i - 1].entry_date)
      );
      if (days > 0 && days < 60) { // Sanity check
        cycleLengths.push(days);
      }
    }

    if (cycleLengths.length > 0) {
      averageCycleLength = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
    }
  }

  // Calculate average period duration
  let averagePeriodDuration: number | null = null;
  const durations: number[] = [];

  for (const start of periodStarts) {
    const matchingEnd = periodEnds.find(
      (end) =>
        new Date(end.entry_date) >= new Date(start.entry_date) &&
        differenceInDays(new Date(end.entry_date), new Date(start.entry_date)) <= 10
    );

    if (matchingEnd) {
      const duration = differenceInDays(
        new Date(matchingEnd.entry_date),
        new Date(start.entry_date)
      ) + 1; // Include both start and end day
      durations.push(duration);
    }
  }

  if (durations.length > 0) {
    const recentDurations = durations.slice(-3);
    averagePeriodDuration = Math.round(
      recentDurations.reduce((a, b) => a + b, 0) / recentDurations.length
    );
  }

  // Predict next period
  let predictedNextPeriod: string | null = null;
  if (periodStarts.length > 0 && averageCycleLength) {
    const lastStart = new Date(periodStarts[periodStarts.length - 1].entry_date);
    const predicted = addDays(lastStart, averageCycleLength);
    predictedNextPeriod = format(predicted, "MMM d, yyyy");
  }

  return {
    averageCycleLength,
    averagePeriodDuration,
    predictedNextPeriod,
  };
}

export function getEntriesForDate(entries: CycleEntry[], date: Date): CycleEntry[] {
  const dateStr = format(date, "yyyy-MM-dd");
  return entries.filter((e) => e.entry_date === dateStr);
}

export function isDateInPeriod(entries: CycleEntry[], date: Date): boolean {
  const dateTime = date.getTime();
  const periodStarts = entries
    .filter((e) => e.entry_type === "period_start")
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
  const periodEnds = entries
    .filter((e) => e.entry_type === "period_end")
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  for (let i = 0; i < periodStarts.length; i++) {
    const startDate = new Date(periodStarts[i].entry_date).getTime();

    // Find the matching end date
    const matchingEnd = periodEnds.find(
      (end) => new Date(end.entry_date).getTime() >= startDate
    );

    if (matchingEnd) {
      const endDate = new Date(matchingEnd.entry_date).getTime();
      if (dateTime >= startDate && dateTime <= endDate) {
        return true;
      }
    } else {
      // No end date yet, check if date is on or after start
      if (dateTime >= startDate) {
        return true;
      }
    }
  }

  return false;
}
