"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { CycleEntry, DailyLog } from "@/lib/supabase";
import { calculateCycleStats, getCyclePhase } from "@/lib/cycle-utils";
import { Calendar } from "@/components/Calendar";
import { StatsPanel } from "@/components/StatsPanel";
import { EntryModal } from "@/components/EntryModal";
import { Header } from "@/components/Header";
import { DashboardGreeting } from "@/components/DashboardGreeting";
import { SymptomTrends } from "@/components/SymptomTrends";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    setUser(authUser);

    const [entriesResult, logsResult] = await Promise.all([
      supabase
        .from("cycle_entries")
        .select("*")
        .eq("user_id", authUser.id)
        .order("entry_date", { ascending: true }),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", authUser.id)
        .order("log_date", { ascending: true })
    ]);

    if (entriesResult.error) {
      console.error("Error fetching entries:", entriesResult.error);
    } else {
      setEntries(entriesResult.data || []);
    }

    if (logsResult.error) {
      console.error("Error fetching daily logs:", logsResult.error);
    } else {
      setDailyLogs(logsResult.data || []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveEntry = async (
    date: Date,
    entryType: "period_start" | "period_end",
    notes: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("cycle_entries").insert({
      user_id: user.id,
      entry_date: format(date, "yyyy-MM-dd"),
      entry_type: entryType,
      notes: notes || null,
    });

    if (error) {
      console.error("Error saving entry:", error);
      throw error;
    }

    await fetchEntries();
  };

  const handleDeleteEntry = async (entryId: string) => {
    const { error } = await supabase
      .from("cycle_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }

    await fetchEntries();
  };

  const handleSaveDailyLog = async (
    date: Date,
    mood: number | null,
    energy: number | null,
    symptoms: string[],
    notes: string
  ) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const logDate = format(date, "yyyy-MM-dd");

    // Upsert (insert or update if exists)
    const { error } = await supabase
      .from("daily_logs")
      .upsert({
        user_id: authUser.id,
        log_date: logDate,
        mood,
        energy,
        symptoms: symptoms.length > 0 ? symptoms : null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,log_date"
      });

    if (error) {
      console.error("Error saving daily log:", error);
      throw error;
    }

    await fetchEntries();
  };

  const stats = calculateCycleStats(entries);
  const phaseInfo = getCyclePhase(entries, stats);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
        <DashboardGreeting
          userName={user?.user_metadata?.full_name || user?.email || null}
          stats={stats}
          phaseInfo={phaseInfo}
        />
        <StatsPanel stats={stats} />
        <SymptomTrends dailyLogs={dailyLogs} />
        <Calendar
          entries={entries}
          stats={stats}
          onDateClick={(date) => setSelectedDate(date)}
        />
        <EntryModal
          date={selectedDate}
          entries={entries}
          dailyLogs={dailyLogs}
          onClose={() => setSelectedDate(null)}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          onSaveDailyLog={handleSaveDailyLog}
        />
      </main>
    </div>
  );
}
