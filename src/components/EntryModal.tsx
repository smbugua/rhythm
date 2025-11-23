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
import { CycleEntry } from "@/lib/supabase";
import { getEntriesForDate } from "@/lib/cycle-utils";
import { Trash2 } from "lucide-react";

interface EntryModalProps {
  date: Date | null;
  entries: CycleEntry[];
  onClose: () => void;
  onSave: (
    date: Date,
    entryType: "period_start" | "period_end",
    notes: string
  ) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
}

export function EntryModal({
  date,
  entries,
  onClose,
  onSave,
  onDelete,
}: EntryModalProps) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const dayEntries = useMemo(
    () => (date ? getEntriesForDate(entries, date) : []),
    [date, entries]
  );

  useEffect(() => {
    if (date) {
      // Pre-fill notes if there's an existing entry
      const existingNotes = dayEntries.find((e) => e.notes)?.notes || "";
      setNotes(existingNotes);
    }
  }, [date, dayEntries]);

  const handleSave = async (entryType: "period_start" | "period_end") => {
    if (!date) return;
    setSaving(true);
    try {
      await onSave(date, entryType, notes);
      onClose();
    } catch (error) {
      console.error("Failed to save entry:", error);
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

        <div className="space-y-4 py-4">
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

          {/* Notes input */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Symptoms, mood, flow intensity..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => handleSave("period_end")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Mark Period End
          </Button>
          <Button
            onClick={() => handleSave("period_start")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Mark Period Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
