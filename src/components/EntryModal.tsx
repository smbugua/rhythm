"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CycleEntry, DailyLog } from "@/lib/supabase";
import { getEntriesForDate } from "@/lib/cycle-utils";
import { Trash2 } from "lucide-react";
import { MoodEnergySelector, SymptomSelector } from "./MoodEnergySelector";

interface EntryModalProps {
  date: Date | null;
  entries: CycleEntry[];
  dailyLogs: DailyLog[];
  onClose: () => void;
  onSave: (
    date: Date,
    entryType: "period_start" | "period_end",
    notes: string
  ) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onSaveDailyLog: (
    date: Date,
    mood: number | null,
    energy: number | null,
    symptoms: string[],
    notes: string
  ) => Promise<void>;
}

export function EntryModal({
  date,
  entries,
  dailyLogs,
  onClose,
  onSave,
  onDelete,
  onSaveDailyLog,
}: EntryModalProps) {
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const dayEntries = useMemo(
    () => (date ? getEntriesForDate(entries, date) : []),
    [date, entries]
  );

  const dayLog = useMemo(
    () => (date ? dailyLogs.find(log => log.log_date === format(date, "yyyy-MM-dd")) : undefined),
    [date, dailyLogs]
  );

  useEffect(() => {
    if (date) {
      // Pre-fill from existing daily log or entry
      if (dayLog) {
        setMood(dayLog.mood);
        setEnergy(dayLog.energy);
        setSymptoms(dayLog.symptoms || []);
        setNotes(dayLog.notes || "");
      } else {
        const existingNotes = dayEntries.find((e) => e.notes)?.notes || "";
        setNotes(existingNotes);
        setMood(null);
        setEnergy(null);
        setSymptoms([]);
      }
    }
  }, [date, dayEntries, dayLog]);

  const handleSave = async (entryType: "period_start" | "period_end") => {
    if (!date) return;
    setSaving(true);
    try {
      await onSave(date, entryType, notes);
      // Also save daily log if mood/energy/symptoms are set
      if (mood !== null || energy !== null || symptoms.length > 0) {
        await onSaveDailyLog(date, mood, energy, symptoms, notes);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save entry:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDailyLogOnly = async () => {
    if (!date) return;
    setSaving(true);
    try {
      await onSaveDailyLog(date, mood, energy, symptoms, notes);
      onClose();
    } catch (error) {
      console.error("Failed to save daily log:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    setDeleting(entryId);
    try {
      await onDelete(entryId);
    } catch (error) {
      console.error("Failed to delete entry:", error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {date ? format(date, "MMMM d, yyyy") : "Entry"}
          </DialogTitle>
          <DialogDescription>
            Mark this date or add notes about your cycle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Existing entries */}
          {dayEntries.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Existing entries</h4>
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 bg-secondary rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {entry.entry_type === "period_start"
                        ? "Period Start"
                        : "Period End"}
                    </span>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleting === entry.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Mood & Energy selector */}
          <MoodEnergySelector
            mood={mood}
            energy={energy}
            onMoodChange={setMood}
            onEnergyChange={setEnergy}
          />

          {/* Symptom selector */}
          <SymptomSelector
            selectedSymptoms={symptoms}
            onSymptomsChange={setSymptoms}
          />

          {/* Notes input */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            onClick={handleSaveDailyLogOnly}
            disabled={saving || (mood === null && energy === null && symptoms.length === 0 && !notes)}
            className="w-full sm:w-auto"
          >
            Save Log
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave("period_end")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Period End
          </Button>
          <Button
            onClick={() => handleSave("period_start")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Period Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
