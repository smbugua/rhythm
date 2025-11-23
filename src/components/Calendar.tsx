"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CycleEntry } from "@/lib/supabase";
import {
  isDateInPeriod,
  getEntriesForDate,
  isDateInFertileWindow,
  isOvulationDay,
  CycleStats
} from "@/lib/cycle-utils";

interface FertilityPopupProps {
  isOvulation: boolean;
  onClose: () => void;
}

function FertilityPopup({ isOvulation, onClose }: FertilityPopupProps) {
  return (
    <div
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xs font-semibold text-green-800 dark:text-green-200 text-center">
        {isOvulation ? "Ovulation Day" : "Fertile Window"}
      </div>
      <div className="text-xs text-green-700 dark:text-green-300 text-center mt-1">
        High likelihood of pregnancy
      </div>
      <button
        onClick={onClose}
        className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-green-700"
      >
        ×
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-green-300 dark:border-t-green-700" />
    </div>
  );
}

interface CalendarProps {
  entries: CycleEntry[];
  stats: CycleStats;
  onDateClick: (date: Date) => void;
}

export function Calendar({ entries, stats, onDateClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [fertilityPopupDate, setFertilityPopupDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayStatus = (date: Date) => {
    const dayEntries = getEntriesForDate(entries, date);
    const isPeriod = isDateInPeriod(entries, date);
    const hasStart = dayEntries.some((e) => e.entry_type === "period_start");
    const hasEnd = dayEntries.some((e) => e.entry_type === "period_end");
    const hasNotes = dayEntries.some((e) => e.notes);
    const isFertile = isDateInFertileWindow(
      date,
      stats.fertileWindowStart,
      stats.fertileWindowEnd
    );
    const isOvulation = isOvulationDay(date, stats.predictedOvulationDate);

    return { isPeriod, hasStart, hasEnd, hasNotes, isFertile, isOvulation };
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const { isPeriod, hasStart, hasEnd, hasNotes, isFertile, isOvulation } = getDayStatus(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          const showFertilityPopup = fertilityPopupDate && isSameDay(day, fertilityPopupDate);

          return (
            <div key={day.toISOString()} className="relative">
              <button
                onClick={() => {
                  if (isFertile && !isPeriod) {
                    setFertilityPopupDate(showFertilityPopup ? null : day);
                  } else {
                    setFertilityPopupDate(null);
                    onDateClick(day);
                  }
                }}
                className={cn(
                  "aspect-square p-1 text-sm rounded-md transition-colors relative w-full",
                  "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday && "font-bold",
                  // Fertile window (green) - check before period to allow period to override
                  isFertile && !isPeriod && "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50",
                  // Ovulation day gets a special border
                  isOvulation && !isPeriod && "ring-2 ring-green-500 ring-inset",
                  // Period days (pink/red)
                  isPeriod && "bg-primary/20 hover:bg-primary/30",
                  hasStart && "ring-2 ring-primary ring-inset",
                  hasEnd && "ring-2 ring-primary/50 ring-inset"
                )}
              >
                <span>{format(day, "d")}</span>
                {hasNotes && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
              {showFertilityPopup && (
                <FertilityPopup
                  isOvulation={isOvulation}
                  onClose={() => setFertilityPopupDate(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary/20 rounded" />
          <span>Period</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded" />
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-green-500 rounded" />
          <span>Ovulation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-primary rounded-full" />
          <span>Notes</span>
        </div>
      </div>
    </div>
  );
}
