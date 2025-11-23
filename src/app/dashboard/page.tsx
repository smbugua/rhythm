"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { CycleEntry } from "@/lib/supabase";
import { calculateCycleStats, getCyclePhase } from "@/lib/cycle-utils";
import { Calendar } from "@/components/Calendar";
import { StatsPanel } from "@/components/StatsPanel";
import { EntryModal } from "@/components/EntryModal";
import { Header } from "@/components/Header";
import { DashboardGreeting } from "@/components/DashboardGreeting";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    setUser(authUser);

    const { data, error } = await supabase
      .from("cycle_entries")
      .select("*")
      .eq("user_id", authUser.id)
      .order("entry_date", { ascending: true });

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    setEntries(data || []);
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
        <Calendar
          entries={entries}
          stats={stats}
          onDateClick={(date) => setSelectedDate(date)}
        />
        <EntryModal
          date={selectedDate}
          entries={entries}
          onClose={() => setSelectedDate(null)}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
        />
      </main>
    </div>
  );
}
